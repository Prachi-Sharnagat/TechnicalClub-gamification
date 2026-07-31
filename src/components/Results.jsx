import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'
import { playTrophySound } from '../utils/soundUtils'

// const confettiPieces = ['✦', '✿', '⬢', '✧', '❋', '✺', '🏆', '⭐']

const formatTimer = (totalSec) => {
  const safeSec = Math.max(0, totalSec || 0)
  const mins = Math.floor(safeSec / 60)
  const secs = safeSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Results({
  totalScore,
  correctCount,
  wrongClicks,
  skippedCount,
  totalTimeUsed,
  remainingSeconds = 0,
  submissionResult,
  onViewLeaderboard,
  onTimerExpired,
}) {
  const [displayScore, setDisplayScore] = useState(0)
  const [countdown, setCountdown] = useState(() => Math.max(0, remainingSeconds))
  const [isTimerEnded, setIsTimerEnded] = useState(() => Math.max(0, remainingSeconds) <= 0)
  const autoOpenRef = useRef(false)

  // Play fanfare audio on launch
  useEffect(() => {
    playTrophySound()
  }, [])

  // Score counter counting upward
  useEffect(() => {
    if (displayScore >= totalScore) return undefined
    const step = Math.max(10, Math.ceil(totalScore / 25))
    const timer = setTimeout(() => {
      setDisplayScore((prev) => Math.min(totalScore, prev + step))
    }, 40)
    return () => clearTimeout(timer)
  }, [displayScore, totalScore])

  // Competition timer countdown & unlock logic
  useEffect(() => {
    if (countdown <= 0) {
      setIsTimerEnded(true)
      onTimerExpired?.()

      // Automatically open leaderboard after a short delay once timer expires
      if (!autoOpenRef.current) {
        autoOpenRef.current = true
        const openTimer = setTimeout(() => {
          onViewLeaderboard?.()
        }, 1500)
        return () => clearTimeout(openTimer)
      }
      return undefined
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsTimerEnded(true)
          onTimerExpired?.()

          if (!autoOpenRef.current) {
            autoOpenRef.current = true
            setTimeout(() => {
              onViewLeaderboard?.()
            }, 1500)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, onViewLeaderboard, onTimerExpired])

  return (
    <div className="results-screen">
      {/* <div className="confetti-layer" aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <motion.span
            key={`${piece}-${index}`}
            className="confetti-piece"
            initial={{ opacity: 0, y: -20, x: (index - 4) * 40 }}
            animate={{ opacity: 1, y: 160, rotate: 360 }}
            transition={{ duration: 1.4, delay: index * 0.05 }}
          >
            {piece}
          </motion.span>
        ))}
      </div> */}

      <motion.div
        className="results-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="results-hero-header">
          {/* <HeaderLogo size="large" /> */}

          <div className="trophy-wrap">
            <motion.div
              className="trophy-icon"
              initial={{ scale: 0.2, rotate: -20 }}
              animate={{ scale: [0.2, 1.35, 1], rotate: [-20, 10, 0] }}
              transition={{ duration: 0.7, ease: 'backOut' }}
            >
              🏆
            </motion.div>
          </div>

          <span className="eyebrow">Technical Club Flagship</span>
          <h1 className="results-title">Competition Complete</h1>

          {submissionResult?.duplicate ? (
            <div className="duplicate-warning">
              ⚠️ Your score has already been submitted.
            </div>
          ) : (
            <p className="results-copy">Great effort in the 5-Minute Competition!</p>
          )}
        </div>

        <div className="results-stats-grid">
          <div className="results-stat-box">
            <span className="results-stat-label">⭐ Final Score</span>
            <span className="results-stat-val text-gold">{displayScore}</span>
          </div>

          <div className="results-stat-box">
            <span className="results-stat-label">✅ Correct Answers</span>
            <span className="results-stat-val text-green">{correctCount}</span>
          </div>

          <div className="results-stat-box">
            <span className="results-stat-label">❌ Wrong Clicks</span>
            <span className="results-stat-val text-red">{wrongClicks}</span>
          </div>

          <div className="results-stat-box">
            <span className="results-stat-label">⏱ Total Time Used</span>
            <span className="results-stat-val topbar-mono">{formatTimer(totalTimeUsed)}</span>
          </div>

          <div className="results-stat-box full-width">
            <span className="results-stat-label">⏭ Skipped Questions</span>
            <span className="results-stat-val">{skippedCount}</span>
          </div>
        </div>

        {/* Competition Timer Status Banner */}
        {!isTimerEnded ? (
          <div className="auto-redirect-note">
            Leaderboard will be available when the competition timer ends.
            <strong className="topbar-mono auto-redirect-timer" style={{ marginTop: '0.4rem' }}>
              ⏱ {formatTimer(countdown)}
            </strong>
          </div>
        ) : (
          <div className="auto-redirect-note" style={{ color: '#16a34a' }}>
            🎉 Competition timer ended! Leaderboard is now available.
          </div>
        )}

        {/* View Leaderboard Button - ONLY shown when timer reaches 00:00 */}
        {isTimerEnded ? (
          <div className="results-actions">
            <motion.button
              className="btn btn-gradient-blue results-button"
              onClick={onViewLeaderboard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              View Leaderboard 🏆
            </motion.button>
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}
