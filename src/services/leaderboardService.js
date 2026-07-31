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

// Write/Update score operation with duplicate prevention & local storage mirror
export const submitScore = async (payload) => {
  const normalizedEmail = (payload.email || '').trim().toLowerCase()
  const uid = payload.uid || ''

  const scoreDoc = {
    ...payload,
    email: normalizedEmail,
    uid: uid,
    completedAt: new Date().toISOString(),
  }

  // 1. Update/Add in Local Storage
  const localEntries = readStoredScores()
  const existingLocalIdx = localEntries.findIndex(
    (e) =>
      (normalizedEmail && (e.email || '').trim().toLowerCase() === normalizedEmail) ||
      (uid && e.uid === uid)
  )

  let nextLocalEntries = [...localEntries]
  if (existingLocalIdx >= 0) {
    nextLocalEntries[existingLocalIdx] = {
      ...nextLocalEntries[existingLocalIdx],
      ...scoreDoc,
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
      const colRef = collection(db, LEADERBOARD_COLLECTION)
      let docIdToUpdate = null

      if (normalizedEmail) {
        const q = query(colRef, where('email', '==', normalizedEmail))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          docIdToUpdate = querySnapshot.docs[0].id
        }
      }

      if (!docIdToUpdate && uid) {
        const q = query(colRef, where('uid', '==', uid))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          docIdToUpdate = querySnapshot.docs[0].id
        }
      }

      const firestoreData = {
        ...scoreDoc,
        serverCompletedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
      }

      if (docIdToUpdate) {
        // Update existing document instead of creating duplicate
        await setDoc(doc(db, LEADERBOARD_COLLECTION, docIdToUpdate), firestoreData, { merge: true })
      } else {
        // Create new document with sanitized email or uid as doc ID
        const docId = normalizedEmail
          ? normalizedEmail.replace(/[^a-z0-9]/g, '_')
          : `user_${uid || Date.now()}`
        await setDoc(doc(db, LEADERBOARD_COLLECTION, docId), firestoreData, { merge: true })
      }
    } catch (err) {
      console.warn('Firestore write/update failed:', err)
    }
  }

  return { success: true }
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

        // Deduplicate entries by normalized email or uid
        const entryMap = new Map()

        firestoreEntries.forEach((e) => {
          const key = (e.email || '').trim().toLowerCase() || e.uid || e.id
          entryMap.set(key, e)
        })

        localEntries.forEach((e) => {
          const key = (e.email || '').trim().toLowerCase() || e.uid || e.id
          if (!entryMap.has(key)) {
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
      const key = (e.email || '').trim().toLowerCase() || e.uid || e.id
      entryMap.set(key, e)
    })

    localEntries.forEach((e) => {
      const key = (e.email || '').trim().toLowerCase() || e.uid || e.id
      if (!entryMap.has(key)) {
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