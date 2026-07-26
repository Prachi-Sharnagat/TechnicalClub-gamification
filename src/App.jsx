import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import LoadingScreen from './components/LoadingScreen'
import SignIn from './components/SignIn'
import { levels as baseLevels } from './data/levels'
import { listenToAuth, signInGuest } from './services/authService'
import { listenGameStatus } from './services/gameService'
import { listenToLeaderboard, submitScore } from './services/leaderboardService'

const shuffleLevels = (items) => {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [sessionLevels, setSessionLevels] = useState([])
  const [sessionKey, setSessionKey] = useState(0)
  const [leaderboardEntries, setLeaderboardEntries] = useState([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [gameStatus, setGameStatus] = useState({ started: false })

  useEffect(() => {
    const unsubscribeAuth = listenToAuth((user) => {
      setAuthReady(true)

      if (!user) {
        setProfile(null)
        return
      }

      setProfile((previous) => {
        if (previous) return previous
        return {
          uid: user.uid,
          name: user.displayName || '',
          email: '',
          admin: false,
        }
      })
    })

    const unsubscribeGameStatus = listenGameStatus((status) => setGameStatus(status || { started: false }))

    return () => {
      unsubscribeAuth()
      unsubscribeGameStatus()
    }
  }, [])

  useEffect(() => {
    if (!profile?.uid) return undefined

    const unsubscribe = listenToLeaderboard((entries) => setLeaderboardEntries(entries))
    return () => unsubscribe?.()
  }, [profile?.uid])

  const handleContinue = async ({ name, email }) => {
    console.log('App handleContinue start', { name, email })
    setLoading(true)

    try {
      const user = await signInGuest({ name, email })
      console.log('App received signInGuest result', user)
      const nextProfile = {
        uid: user?.uid || `local-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        admin: false,
      }

      setProfile(nextProfile)
      setSessionLevels(shuffleLevels(baseLevels))
      setSessionKey((value) => value + 1)
      setShowLeaderboard(false)
      console.log('App profile set and navigation should proceed')
    } catch (error) {
      console.error('App handleContinue failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setSessionLevels(shuffleLevels(baseLevels))
    setSessionKey((value) => value + 1)
    setShowLeaderboard(false)
  }

  const handleComplete = async (result) => {
    const payload = {
      uid: profile?.uid || `local-${Date.now()}`,
      name: profile?.name || 'Player',
      email: profile?.email,
      time: result.seconds,
      wrongClicks: result.wrongClicks,
      accuracy: result.accuracy,
      completedAt: new Date().toISOString(),
    }

    await submitScore(payload)
    setShowLeaderboard(true)
  }

  if (!authReady) {
    return <LoadingScreen message="Connecting to your mission..." />
  }

  if (!profile) {
    return <SignIn onContinue={handleContinue} loading={loading} />
  }

  return (
    <div className="app-shell">
      <div className="mission-banner">
        <div>
          <p className="eyebrow">Mission Status</p>
          <strong>{gameStatus.started ? 'Live' : 'Preparing'}</strong>
        </div>
        <span className="banner-pill">{profile.name}</span>
      </div>

      {/* <Game
        key={sessionKey}
        playerName={profile.name}
        levels={sessionLevels}
        onRestart={handleRestart}
        onComplete={handleComplete}
        onViewLeaderboard={() => setShowLeaderboard(true)}
      />

      <AnimatePresence>
        {showLeaderboard ? (
          <Leaderboard entries={leaderboardEntries} onClose={() => setShowLeaderboard(false)} />

        ) : null}
      </AnimatePresence> */}
      <Game
  key={sessionKey}
  playerName={profile.name}
  levels={sessionLevels}
  onRestart={handleRestart}
  onComplete={handleComplete}
  onViewLeaderboard={() => setShowLeaderboard(true)}
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
