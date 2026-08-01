import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAmRSvh6Nv3Q_6ZlYmX8AILopoCe0GhLAo',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'technicalclub-game.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'technicalclub-game',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'technicalclub-game.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '15614536087',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:15614536087:web:30339188623e87ada77cd2',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function resetLeaderboard() {
  console.log('Fetching documents from Firestore "leaderboard" collection...')
  const colRef = collection(db, 'leaderboard')
  const snapshot = await getDocs(colRef)
  
  console.log(`Found ${snapshot.docs.length} document(s) in "leaderboard" collection.`)
  
  for (const docSnapshot of snapshot.docs) {
    console.log(`Deleting document ID: ${docSnapshot.id}`)
    await deleteDoc(doc(db, 'leaderboard', docSnapshot.id))
  }
  
  console.log('Successfully deleted all documents from "leaderboard" collection.')
  process.exit(0)
}

resetLeaderboard().catch((err) => {
  console.error('Error resetting leaderboard collection:', err)
  process.exit(1)
})
