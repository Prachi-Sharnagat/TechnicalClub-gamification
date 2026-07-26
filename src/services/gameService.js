import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const GAME_STATUS_DOC = 'current'

export const isAdmin = (userProfile = {}) => Boolean(userProfile?.admin)

export const startGame = async () => {
  if (!db) return { started: true }

  const ref = doc(db, 'gameStatus', GAME_STATUS_DOC)
  await setDoc(ref, { started: true, updatedAt: serverTimestamp() }, { merge: true })
}

export const stopGame = async () => {
  if (!db) return { started: false }

  const ref = doc(db, 'gameStatus', GAME_STATUS_DOC)
  await setDoc(ref, { started: false, updatedAt: serverTimestamp() }, { merge: true })
}

export const listenGameStatus = (callback) => {
  if (!db) {
    callback({ started: false })
    return () => {}
  }

  const ref = doc(db, 'gameStatus', GAME_STATUS_DOC)

  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data())
      return
    }

    callback({ started: false })
  })
}
