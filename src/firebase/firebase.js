import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAmRSvh6Nv3Q_6ZlYmX8AILopoCe0GhLAo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'technicalclub-game.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'technicalclub-game',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'technicalclub-game.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '15614536087',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:15614536087:web:30339188623e87ada77cd2',
}


const hasConfig = Object.values(firebaseConfig).every((value) => Boolean(value))

let app
let auth
let db

if (hasConfig) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} else {
  app = null
  auth = null
  db = null
}

export const isFirestoreConfigured = () => Boolean(db)

export { auth, db }

