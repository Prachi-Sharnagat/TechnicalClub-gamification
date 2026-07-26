import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const USERS_COLLECTION = 'users'

const fallbackProfile = (uid, profileData = {}) => ({
  uid,
  name: profileData.name?.trim() || '',
  email: profileData.email?.trim().toLowerCase() || '',
  admin: false,
  createdAt: new Date().toISOString(),
})

export const getUserProfile = async (uid) => {
  if (!uid || !db) return null

  const ref = doc(db, USERS_COLLECTION, uid)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) return null
  return { uid: snapshot.id, ...snapshot.data() }
}

export const ensureUserProfile = async (uid, profileData = {}) => {
  if (!uid) return null

  if (!db) {
    return fallbackProfile(uid, profileData)
  }

  const ref = doc(db, USERS_COLLECTION, uid)
  const existingSnapshot = await getDoc(ref)
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {}

  const nextProfile = {
    uid,
    name: profileData.name?.trim() || existingData.name || '',
    email: profileData.email?.trim().toLowerCase() || existingData.email || '',
    admin: existingData.admin ?? false,
    createdAt: existingData.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(ref, nextProfile, { merge: true })

  const refreshed = await getDoc(ref)
  return { uid: refreshed.id, ...refreshed.data() }
}
