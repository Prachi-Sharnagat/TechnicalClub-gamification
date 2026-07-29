import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import LoadingScreen from './components/LoadingScreen'
import SignIn from './components/SignIn'
import HitboxEditor from './components/HitboxEditor'
import { levels as baseLevels } from './data/levels'
import { listenToAuth, signInGuest } from './services/authService'
import { fetchTopLeaderboard, submitScore } from './services/leaderboardService'

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [sessionLevels, setSessionLevels] = useState([])
  const [sessionKey, setSessionKey] = useState(0)
  const [leaderboardEntries, setLeaderboardEntries] = useState([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showHitboxEditor, setShowHitboxEditor] = useState(false)

  useEffect(() => {
    const unsubscribeAuth = listenToAuth(() => {
      setAuthReady(true)
    })
    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    if (!profile?.uid) return
    setSessionLevels(baseLevels)
  }, [profile?.uid])

  const handleOpenLeaderboard = async () => {
    const top5 = await fetchTopLeaderboard()
    setLeaderboardEntries(top5)
    setShowLeaderboard(true)
  }

  const handleContinue = async ({ name, email }) => {
    setLoading(true)

    try {
      const user = await signInGuest({ name, email })
      const nextProfile = {
        uid: user?.uid || `local-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      }

      setProfile(nextProfile)
      setSessionLevels(baseLevels)
      setSessionKey((value) => value + 1)
      setShowLeaderboard(false)
    } catch (error) {
      console.error('App handleContinue failed', error)
      const nextProfile = {
        uid: `local-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      }
      setProfile(nextProfile)
      setSessionLevels(baseLevels)
      setSessionKey((value) => value + 1)
      setShowLeaderboard(false)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (result) => {
    const payload = {
      uid: profile?.uid || `local-${Date.now()}`,
      name: profile?.name || result.name || 'Player',
      email: profile?.email || result.email || '',
      score: result.score || 0,
      correctCount: result.correctCount || 0,
      wrongClicks: result.wrongClicks || 0,
      skippedCount: result.skippedCount || 0,
      totalTimeUsed: result.totalTimeUsed || 0,
      completedAt: new Date().toISOString(),
    }

    return await submitScore(payload)
  }

  if (!authReady) {
    return <LoadingScreen message="Preparing competition..." />
  }

  if (!profile) {
    return <SignIn onContinue={handleContinue} loading={loading} />
  }

  if (showHitboxEditor) {
    return <HitboxEditor onBack={() => setShowHitboxEditor(false)} />
  }

  return (
    <div className="app-shell">
      <Game
        key={sessionKey}
        playerName={profile.name}
        email={profile.email}
        levels={sessionLevels}
        onComplete={handleComplete}
        onViewLeaderboard={handleOpenLeaderboard}
      />

      <AnimatePresence>
        {showLeaderboard ? (
          <Leaderboard
            entries={leaderboardEntries}
            onClose={() => setShowLeaderboard(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}