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
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0)
    }
    // 2. Highest Correct Answers
    if ((b.correctCount || 0) !== (a.correctCount || 0)) {
      return (b.correctCount || 0) - (a.correctCount || 0)
    }
    // 3. Lowest Wrong Clicks
    if ((a.wrongClicks || 0) !== (b.wrongClicks || 0)) {
      return (a.wrongClicks || 0) - (b.wrongClicks || 0)
    }
    // 4. Lowest Total Time Used
    if ((a.totalTimeUsed || 0) !== (b.totalTimeUsed || 0)) {
      return (a.totalTimeUsed || 0) - (b.totalTimeUsed || 0)
    }
    // 5. Earliest Timestamp
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

// Bulletproof Top 5 fetch engine (merges Cloud & Local entries smoothly without composite index errors)
export const fetchTopLeaderboard = async () => {
  const localEntries = readStoredScores()

  if (!db) {
    const sorted = sortLeaderboardEntries(localEntries)
    return sorted.slice(0, 5)
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
    const sorted = sortLeaderboardEntries(combined)
    return sorted.slice(0, 5)
  } catch (err) {
    console.warn('Firestore fetch top leaderboard fallback:', err)
    const sorted = sortLeaderboardEntries(localEntries)
    return sorted.slice(0, 5)
  }
}