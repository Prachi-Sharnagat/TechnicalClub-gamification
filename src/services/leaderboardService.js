import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const LEADERBOARD_COLLECTION = 'leaderboard'

const readStoredScores = () => {
  try {
    const stored = localStorage.getItem('campus-hide-and-seek-scores')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const writeStoredScores = (entries) => {
  localStorage.setItem('campus-hide-and-seek-scores', JSON.stringify(entries))
}

export const submitScore = async (payload) => {
  const scoreDoc = {
    ...payload,
    completedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
  }

  if (!db) {
    const entries = readStoredScores()
    const nextEntries = [...entries, { id: `local-${Date.now()}`, ...payload, completedAt: new Date().toISOString() }]
      .sort((a, b) => a.time - b.time || a.wrongClicks - b.wrongClicks)
    writeStoredScores(nextEntries)
    return nextEntries
  }

  return addDoc(collection(db, LEADERBOARD_COLLECTION), scoreDoc)
}
export const listenToLeaderboard = (callback) => {
  if (!db) {
    const fallbackEntries = readStoredScores();
    callback(fallbackEntries);
    return () => {};
  }

  const q = query(
    collection(db, LEADERBOARD_COLLECTION),
    orderBy("time", "asc"),
    orderBy("wrongClicks", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      console.log("Leaderboard docs:", snapshot.size);

      const entries = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));

      console.log("Entries:", entries);

      callback(entries);
    },
    (error) => {
      console.error("Leaderboard listener error:", error);
    }
  );
};