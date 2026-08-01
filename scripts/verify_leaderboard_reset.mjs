import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

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

async function verifyResetAndSubmission() {
  console.log('--- Step 1: Verifying collection is empty ---')
  const colRef = collection(db, 'leaderboard')
  let snapshot = await getDocs(colRef)
  console.log(`Current document count: ${snapshot.docs.length}`)
  if (snapshot.docs.length !== 0) {
    throw new Error('Expected 0 documents after reset!')
  }
  console.log('✅ Leaderboard collection is completely empty.')

  console.log('--- Step 2: Simulating new score submission ---')
  const testDocId = 'test_player_rank1'
  const testDocRef = doc(db, 'leaderboard', testDocId)
  await setDoc(testDocRef, {
    name: 'First Player',
    email: 'firstplayer@example.com',
    score: 150,
    wrongClicks: 1,
    totalTimeUsed: 45,
    completedAt: new Date().toISOString(),
    serverCompletedAt: serverTimestamp(),
  })
  console.log('✅ Submitted new score for First Player.')

  console.log('--- Step 3: Verifying new submission becomes Rank #1 ---')
  snapshot = await getDocs(colRef)
  console.log(`Document count after submission: ${snapshot.docs.length}`)
  if (snapshot.docs.length !== 1) {
    throw new Error(`Expected 1 document, found ${snapshot.docs.length}`)
  }
  const submittedData = snapshot.docs[0].data()
  console.log('Rank #1 player details:', submittedData.name, 'Score:', submittedData.score)
  if (submittedData.name !== 'First Player' || submittedData.score !== 150) {
    throw new Error('Submitted player data does not match!')
  }
  console.log('✅ First submission successfully created Rank #1.')

  console.log('--- Step 4: Cleaning up test submission ---')
  await deleteDoc(testDocRef)
  snapshot = await getDocs(colRef)
  console.log(`Final document count: ${snapshot.docs.length}`)
  if (snapshot.docs.length !== 0) {
    throw new Error('Failed to clean up test submission!')
  }
  console.log('✅ Final state clean! Leaderboard collection has 0 documents.')
  
  process.exit(0)
}

verifyResetAndSubmission().catch((err) => {
  console.error('Verification failed:', err)
  process.exit(1)
})
