import { addDoc, collection, getDocs, serverTimestamp, where, query } from 'firebase/firestore'
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
    // 1. Highest Score
    const scoreA = Number(a.score) || 0
    const scoreB = Number(b.score) || 0
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }

    // 2. Lowest Completion Time
    const timeA = Number(a.totalTimeUsed) || 0
    const timeB = Number(b.totalTimeUsed) || 0
    if (timeA !== timeB) {
      return timeA - timeB
    }

    // 3. Lowest Wrong Clicks
    const wrongA = Number(a.wrongClicks) || 0
    const wrongB = Number(b.wrongClicks) || 0
    if (wrongA !== wrongB) {
      return wrongA - wrongB
    }

    // 4. Earliest Completion Timestamp
    return new Date(a.completedAt || 0) - new Date(b.completedAt || 0)
  })
}

// Single write operation with duplicate email check & local storage mirror
export const submitScore = async (payload) => {
  const normalizedEmail = (payload.email || '').trim().toLowerCase()

  // 1. Check local storage duplicate
  const localEntries = readStoredScores()
  const duplicateLocal = localEntries.find(
    (e) => (e.email || '').trim().toLowerCase() === normalizedEmail
  )

  if (duplicateLocal) {
    return { duplicate: true, message: 'Your score has already been submitted.' }
  }

  // 2. Check Firestore duplicate if db connected
  if (db && normalizedEmail) {
    try {
      const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        where('email', '==', normalizedEmail)
      )
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        return { duplicate: true, message: 'Your score has already been submitted.' }
      }
    } catch (err) {
      console.warn('Firestore duplicate check fallback:', err)
    }
  }

  const scoreDoc = {
    ...payload,
    email: normalizedEmail,
    completedAt: new Date().toISOString(),
  }

  // Always write to local storage as local mirror
  const nextEntries = sortLeaderboardEntries([
    ...localEntries,
    { id: `local-${Date.now()}`, ...scoreDoc },
  ])
  writeStoredScores(nextEntries)

  if (db) {
    try {
      await addDoc(collection(db, LEADERBOARD_COLLECTION), {
        ...scoreDoc,
        serverCompletedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Firestore addDoc fallback to localStorage:', err)
    }
  }

  return { success: true }
}

// Fetch ALL participant documents from Firestore collection without filtering by current user
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

    // Combine local and cloud entries, deduplicating by email
    const emailMap = new Map()

    firestoreEntries.forEach((e) => {
      const key = (e.email || '').trim().toLowerCase() || e.id
      emailMap.set(key, e)
    })

    localEntries.forEach((e) => {
      const key = (e.email || '').trim().toLowerCase() || e.id
      if (!emailMap.has(key)) {
        emailMap.set(key, e)
      }
    })

    const combined = Array.from(emailMap.values())
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