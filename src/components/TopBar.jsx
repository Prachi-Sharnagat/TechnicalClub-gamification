import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import HeaderLogo from './HeaderLogo'
import { playTickSound, triggerVibration } from '../utils/soundUtils'

export default function TopBar({
  levelIndex,
  levelCount,
  score,
  remainingSeconds,
  wrongClicks,
}) {
  const [displayScore, setDisplayScore] = useState(score)
  const wrongControls = useAnimation()
  const prevWrongClicksRef = useRef(wrongClicks)

  // Animated Score counter
  useEffect(() => {
    if (displayScore === score) return undefined

    const diff = score - displayScore
    const step = Math.ceil(diff / 5)

    const timer = setTimeout(() => {
      setDisplayScore((prev) => Math.min(score, prev + step))
    }, 40)

    return () => clearTimeout(timer)
  }, [displayScore, score])

  // Wrong Clicks shake effect on change
  useEffect(() => {
    if (wrongClicks > prevWrongClicksRef.current) {
      prevWrongClicksRef.current = wrongClicks
      wrongControls.start({
        x: [-6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.4 },
      })
    }
  }, [wrongClicks, wrongControls])

  // Last 10 seconds tick & haptics
  useEffect(() => {
    if (remainingSeconds > 0 && remainingSeconds <= 10) {
      playTickSound()
      triggerVibration([40])
    }
  }, [remainingSeconds])

  const formatTimer = (totalSec) => {
    const safeSec = Math.max(0, totalSec)
    const mins = Math.floor(safeSec / 60)
    const secs = safeSec % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Header class based on remaining time
  const getTimerHeaderClass = () => {
    if (remainingSeconds <= 10) return 'header-timer-last10'
    if (remainingSeconds <= 30) return 'header-timer-red'
    if (remainingSeconds <= 60) return 'header-timer-orange'
    return ''
  }

  return (
    <header className={`topbar card-glass ${getTimerHeaderClass()}`}>
      <div className="topbar-container">
        <HeaderLogo size="small" className="topbar-logo" />

        <div className="hud-row">
          <div className="hud-item">
            <span className="hud-label">LEVEL</span>
            <span className="hud-value">{levelIndex + 1}/{levelCount}</span>
          </div>

          <div className="hud-item">
            <span className="hud-label">SCORE</span>
            <motion.span
              className="hud-value hud-gold"
              animate={{ scale: displayScore !== score ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              ⭐ {displayScore}
            </motion.span>
          </div>

          <div className="hud-item">
            <span className="hud-label">TIME</span>
            <motion.span
              className={`hud-value topbar-mono ${
                remainingSeconds <= 30 ? 'hud-danger' : ''
              }`}
              animate={
                remainingSeconds <= 10
                  ? { scale: [1, 1.15, 1] }
                  : {}
              }
              transition={{ duration: 1, repeat: remainingSeconds <= 10 ? Infinity : 0 }}
            >
              ⏱ {formatTimer(remainingSeconds)}
            </motion.span>
          </div>

          <div className="hud-item">
            <span className="hud-label">WRONG</span>
            <motion.span className="hud-value hud-wrong" animate={wrongControls}>
              ❌ {wrongClicks}
            </motion.span>
          </div>
        </div>
      </div>
    </header>
  )
}
