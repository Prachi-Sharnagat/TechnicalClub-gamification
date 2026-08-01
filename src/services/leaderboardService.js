import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

const LEADERBOARD_COLLECTION = 'leaderboard'

const readStoredScores = () => {
  try {
    const stored = localStorage.getItem('tc-flagship-scores')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const writeStoredScores = (entries) => {
  try {
    localStorage.setItem('tc-flagship-scores', JSON.stringify(entries))
  } catch (err) {
    console.warn('LocalStorage write failed', err)
  }
}

export const sortLeaderboardEntries = (entries) => {
  return [...entries].sort((a, b) => {
    // 1. Highest Score (descending)
    const scoreA = Number(a.score) || 0
    const scoreB = Number(b.score) || 0
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }

    // 2. Lowest wrongClicks (ascending)
    const wrongA = Number(a.wrongClicks) || 0
    const wrongB = Number(b.wrongClicks) || 0
    if (wrongA !== wrongB) {
      return wrongA - wrongB
    }

    // 3. Lowest Completion Time (ascending)
    const timeA = Number(a.totalTimeUsed ?? a.timeUsed) || 0
    const timeB = Number(b.totalTimeUsed ?? b.timeUsed) || 0
    if (timeA !== timeB) {
      return timeA - timeB
    }

    // 4. Earliest Completion Timestamp or ID tie-breaker
    const timeStampA = new Date(a.completedAt || a.serverCompletedAt?.toDate?.() || 0).getTime()
    const timeStampB = new Date(b.completedAt || b.serverCompletedAt?.toDate?.() || 0).getTime()
    if (timeStampA !== timeStampB) {
      return timeStampA - timeStampB
    }

    return String(a.id || '').localeCompare(String(b.id || ''))
  })
}

const isBetterScore = (newDoc, existingDoc) => {
  if (!existingDoc) return true
  const newScore = Number(newDoc.score) || 0
  const oldScore = Number(existingDoc.score) || 0
  if (newScore !== oldScore) return newScore > oldScore

  const newWrong = Number(newDoc.wrongClicks) || 0
  const oldWrong = Number(existingDoc.wrongClicks) || 0
  if (newWrong !== oldWrong) return newWrong < oldWrong

  const newTime = Number(newDoc.totalTimeUsed ?? newDoc.timeUsed) || 0
  const oldTime = Number(existingDoc.totalTimeUsed ?? existingDoc.timeUsed) || 0
  if (newTime !== oldTime) return newTime < oldTime

  return true
}

// Write/Update score operation with duplicate prevention & best-score mirror
export const submitScore = async (payload) => {
  const normalizedEmail = (payload.email || '').trim().toLowerCase()
  const uid = payload.uid || ''

  const scoreDoc = {
    ...payload,
    email: normalizedEmail,
    uid: uid,
    completedAt: new Date().toISOString(),
  }

  // 1. Update/Add in Local Storage with Best-Score preservation
  const localEntries = readStoredScores()
  const existingLocalIdx = localEntries.findIndex(
    (e) =>
      (normalizedEmail && (e.email || '').trim().toLowerCase() === normalizedEmail) ||
      (uid && e.uid === uid)
  )

  let nextLocalEntries = [...localEntries]
  if (existingLocalIdx >= 0) {
    const existing = nextLocalEntries[existingLocalIdx]
    if (isBetterScore(scoreDoc, existing)) {
      nextLocalEntries[existingLocalIdx] = {
        ...existing,
        ...scoreDoc,
      }
    }
  } else {
    nextLocalEntries.push({
      id: `local-${Date.now()}`,
      ...scoreDoc,
    })
  }

  const sortedLocal = sortLeaderboardEntries(nextLocalEntries)
  writeStoredScores(sortedLocal)

  // 2. Update/Add in Firestore
  if (db && (normalizedEmail || uid)) {
    try {
      const docId = normalizedEmail
        ? normalizedEmail.replace(/[^a-z0-9]/g, '_')
        : uid
        ? uid.replace(/[^a-z0-9]/g, '_')
        : `user_${Date.now()}`

      const targetDocRef = doc(db, LEADERBOARD_COLLECTION, docId)

      // Fetch existing document to verify best-score condition
      const colRef = collection(db, LEADERBOARD_COLLECTION)
      let existingFirestoreDoc = null

      try {
        const q = query(colRef, where('email', '==', normalizedEmail))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          existingFirestoreDoc = querySnapshot.docs[0].data()
        }
      } catch {
        // Fallback to docRef fetch if query is restricted
      }

      if (!existingFirestoreDoc || isBetterScore(scoreDoc, existingFirestoreDoc)) {
        const firestoreData = {
          ...scoreDoc,
          serverCompletedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        }
        await setDoc(targetDocRef, firestoreData, { merge: true })
      }
    } catch (err) {
      console.warn('Firestore write/update failed:', err)
    }
  }

  return { success: true }
}

const getEntryKey = (e) => {
  const email = (e.email || '').trim().toLowerCase()
  if (email) return `email:${email}`
  const uid = (e.uid || '').trim()
  if (uid && !uid.startsWith('local-')) return `uid:${uid}`
  const name = (e.name || '').trim().toLowerCase()
  if (name) return `name:${name}`
  return `id:${e.id || Math.random()}`
}

// Real-time Firestore subscription to ALL leaderboard documents (onSnapshot)
export const subscribeLeaderboard = (onUpdate) => {
  const localEntries = readStoredScores()

  if (!db) {
    onUpdate(sortLeaderboardEntries(localEntries))
    return () => {}
  }

  try {
    const colRef = collection(db, LEADERBOARD_COLLECTION)
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const firestoreEntries = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }))

        // Deduplicate entries by normalized email, uid, or name keeping best score
        const entryMap = new Map()

        firestoreEntries.forEach((e) => {
          const key = getEntryKey(e)
          if (!entryMap.has(key) || isBetterScore(e, entryMap.get(key))) {
            entryMap.set(key, e)
          }
        })

        localEntries.forEach((e) => {
          const key = getEntryKey(e)
          if (!entryMap.has(key) || isBetterScore(e, entryMap.get(key))) {
            entryMap.set(key, e)
          }
        })

        const combined = Array.from(entryMap.values())
        const sorted = sortLeaderboardEntries(combined)
        onUpdate(sorted)
      },
      (err) => {
        console.warn('Firestore onSnapshot listener error:', err)
        const sorted = sortLeaderboardEntries(readStoredScores())
        onUpdate(sorted)
      }
    )

    return unsubscribe
  } catch (err) {
    console.warn('Firestore subscribe error fallback:', err)
    onUpdate(sortLeaderboardEntries(localEntries))
    return () => {}
  }
}

// Fetch ALL participant documents from Firestore collection
export const fetchAllLeaderboard = async () => {
  const localEntries = readStoredScores()

  if (!db) {
    return sortLeaderboardEntries(localEntries)
  }

  try {
    const colRef = collection(db, LEADERBOARD_COLLECTION)
    const snapshot = await getDocs(colRef)
    const firestoreEntries = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }))

    const entryMap = new Map()

    firestoreEntries.forEach((e) => {
      const key = getEntryKey(e)
      if (!entryMap.has(key) || isBetterScore(e, entryMap.get(key))) {
        entryMap.set(key, e)
      }
    })

    localEntries.forEach((e) => {
      const key = getEntryKey(e)
      if (!entryMap.has(key) || isBetterScore(e, entryMap.get(key))) {
        entryMap.set(key, e)
      }
    })

    const combined = Array.from(entryMap.values())
    return sortLeaderboardEntries(combined)
  } catch (err) {
    console.warn('Firestore fetch all leaderboard fallback:', err)
    return sortLeaderboardEntries(localEntries)
  }
}

// Top 5 convenience export
export const fetchTopLeaderboard = async () => {
  const all = await fetchAllLeaderboard()
  return all.slice(0, 5)
}