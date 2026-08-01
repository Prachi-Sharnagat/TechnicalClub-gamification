import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import LoadingScreen from './components/LoadingScreen'
import SignIn from './components/SignIn'
import HitboxEditor from './components/HitboxEditor'
import { levels as baseLevels } from './data/levels'
import { listenToAuth, signInGuest } from './services/authService'
import { fetchAllLeaderboard, submitScore } from './services/leaderboardService'

const getSavedProfile = () => {
  try {
    const stored = localStorage.getItem('tc-flagship-profile')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const isLeaderboardPath = () => {
  const path = (window.location.pathname || '').toLowerCase()
  return path === '/leaderboard' || path === '/leaderboard/'
}

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(getSavedProfile)
  const [sessionLevels, setSessionLevels] = useState([])
  const [sessionKey, setSessionKey] = useState(0)
  const [leaderboardEntries, setLeaderboardEntries] = useState([])
  const [showLeaderboard, setShowLeaderboard] = useState(isLeaderboardPath)
  const [isGameFinished, setIsGameFinished] = useState(() => {
    return localStorage.getItem('tc-flagship-finished') === 'true'
  })
  const [canAccessLeaderboard, setCanAccessLeaderboard] = useState(() => {
    if (isLeaderboardPath()) return true
    return localStorage.getItem('tc-flagship-can-access-lb') === 'true'
  })
  const [showHitboxEditor, setShowHitboxEditor] = useState(
    window.location.pathname === '/hitbox' || window.location.pathname === '/hitbox/'
  )

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

  const handleOpenLeaderboard = useCallback(async () => {
    // GUARD: The leaderboard must NEVER open before the competition timer reaches 00:00
    if (!canAccessLeaderboard && !isLeaderboardPath()) {
      console.warn('Leaderboard access blocked: Competition timer has not reached 00:00 yet.')
      setShowLeaderboard(false)
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/')
      }
      return
    }

    try {
      const allEntries = await fetchAllLeaderboard()
      setLeaderboardEntries(allEntries)
      setShowLeaderboard(true)
      if (window.location.pathname !== '/leaderboard') {
        window.history.pushState({}, '', '/leaderboard')
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }, [canAccessLeaderboard])

  // Route protection listener
  useEffect(() => {
    const checkRouteProtection = () => {
      if (isLeaderboardPath()) {
        setShowLeaderboard(true)
        setCanAccessLeaderboard(true)
        handleOpenLeaderboard()
      }
    }

    checkRouteProtection()
    window.addEventListener('popstate', checkRouteProtection)
    return () => window.removeEventListener('popstate', checkRouteProtection)
  }, [handleOpenLeaderboard])

  const handleContinue = async ({ name, email }) => {
    setLoading(true)

    try {
      const user = await signInGuest({ name, email })
      const nextProfile = {
        uid: user?.uid || `local-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      }

      try {
        localStorage.setItem('tc-flagship-profile', JSON.stringify(nextProfile))
      } catch (e) {
        console.warn('Profile save failed', e)
      }

      setProfile(nextProfile)
      setSessionLevels(baseLevels)
      setSessionKey((value) => value + 1)
      setIsGameFinished(false)
      setCanAccessLeaderboard(false)
      setShowLeaderboard(false)
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/')
      }
    } catch (error) {
      console.error('App handleContinue failed', error)
      const nextProfile = {
        uid: `local-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      }

      try {
        localStorage.setItem('tc-flagship-profile', JSON.stringify(nextProfile))
      } catch (e) {
        console.warn('Profile save failed', e)
      }

      setProfile(nextProfile)
      setSessionLevels(baseLevels)
      setSessionKey((value) => value + 1)
      setIsGameFinished(false)
      setCanAccessLeaderboard(false)
      setShowLeaderboard(false)
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (result) => {
    setIsGameFinished(true)
    try {
      localStorage.setItem('tc-flagship-finished', 'true')
    } catch {
      // ignore
    }

    if (result.remainingSeconds === 0) {
      setCanAccessLeaderboard(true)
      try {
        localStorage.setItem('tc-flagship-can-access-lb', 'true')
      } catch {
        // ignore
      }
    }

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

  const handleTimerExpired = () => {
    setCanAccessLeaderboard(true)
    try {
      localStorage.setItem('tc-flagship-can-access-lb', 'true')
    } catch {
      // ignore
    }
  }

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false)
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/')
    }
  }

  if (showHitboxEditor) {
    return (
      <HitboxEditor
        onBack={() => {
          window.history.pushState({}, '', '/')
          setShowHitboxEditor(false)
        }}
      />
    )
  }

  if (!authReady) {
    return <LoadingScreen message="Preparing competition..." />
  }

  if (showLeaderboard) {
    return (
      <Leaderboard
        entries={leaderboardEntries}
        currentEmail={profile?.email || ''}
        currentName={profile?.name || ''}
        onClose={handleCloseLeaderboard}
      />
    )
  }

  if (!profile) {
    return <SignIn onContinue={handleContinue} loading={loading} />
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
        onTimerExpired={handleTimerExpired}
      />
    </div>
  )
}