import { onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { ensureUserProfile } from './userService'

const fallbackUser = () => ({
  uid: `local-${Date.now()}`,
  displayName: '',
})

export const listenToAuth = (callback) => {
  if (!auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

export const signInGuest = async (profileData = {}) => {
  console.log('authService signInGuest start', profileData)
  if (!auth) {
    console.log('authService auth is not initialized')
    const mockUser = fallbackUser()
    await ensureUserProfile(mockUser.uid, profileData)
    return mockUser
  }

  if (auth.currentUser) {
    if (profileData.name || profileData.email) {
      await ensureUserProfile(auth.currentUser.uid, profileData)
    }
    return auth.currentUser
  }

  try {
    const result = await signInAnonymously(auth)
    console.log('authService anonymous sign-in success', result.user.uid)

    if (profileData.name || profileData.email) {
      await ensureUserProfile(result.user.uid, profileData)
    }

    return result.user
  } catch (error) {
    console.error('authService signInAnonymously failed', error)
    throw error
  }
}

export const signOutUser = async () => {
  if (!auth) return
  return firebaseSignOut(auth)
}

export const getCurrentUser = () => (auth ? auth.currentUser : null)
