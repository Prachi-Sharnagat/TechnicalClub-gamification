import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TopBar from './TopBar'
import ImageScene from './ImageScene'
import MemberPopup from './MemberPopup'
import Results from './Results'

const WRONG_CLICK_PENALTY_SECONDS = 3

export default function Game({ playerName, levels, onRestart, onComplete, onViewLeaderboard }) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [wrongClicks, setWrongClicks] = useState(0)
  const [correctClicks, setCorrectClicks] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [finished, setFinished] = useState(false)
  const completedRef = useRef(false)

  const running = !showPopup && !finished
  const safeLevels = Array.isArray(levels) ? levels : []
  const currentLevel = safeLevels[levelIndex] || safeLevels[0]
  const isFinalLevel = safeLevels.length > 0 && levelIndex === safeLevels.length - 1

  useEffect(() => {
    if (!running) return undefined
    const interval = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [running])

  useEffect(() => {
    if (!finished || completedRef.current) return
    completedRef.current = true

    onComplete?.({
      seconds,
      wrongClicks,
      correctClicks,
      accuracy: Math.round((correctClicks / Math.max(1, correctClicks + wrongClicks)) * 100),
    })
  }, [correctClicks, finished, onComplete, seconds, wrongClicks])

  const handleWrongClick = () => {
    setWrongClicks((n) => n + 1)
    setSeconds((s) => s + WRONG_CLICK_PENALTY_SECONDS)
  }

  const handleFound = () => {
    setCorrectClicks((n) => n + 1)
    setShowPopup(true)
  }

  const handleNext = () => {
    setShowPopup(false)
    if (isFinalLevel) {
      setFinished(true)
    } else {
      setLevelIndex((i) => i + 1)
    }
  }

  const resetProgress = () => {
    setLevelIndex(0)
    setSeconds(0)
    setWrongClicks(0)
    setCorrectClicks(0)
    setShowPopup(false)
    setFinished(false)
    completedRef.current = false
  }

  if (finished) {
    return (
      <Results
        playerName={playerName}
        seconds={seconds}
        wrongClicks={wrongClicks}
        correctClicks={correctClicks}
        onPlayAgain={resetProgress}
        onRestart={onRestart}
        onViewLeaderboard={onViewLeaderboard}
      />
    )
  }

  return (
    <div className="game-screen">
      <TopBar
        playerName={playerName}
        levelIndex={levelIndex}
        levelCount={safeLevels.length}
        seconds={seconds}
        wrongClicks={wrongClicks}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevel?.id || 'level'}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="game-scene-wrap"
        >
          {currentLevel ? (
            <ImageScene level={currentLevel} onFound={handleFound} onWrongClick={handleWrongClick} />
          ) : (
            <div className="game-placeholder">Loading the next scene...</div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showPopup && currentLevel ? (
          <MemberPopup member={currentLevel.member} isFinalLevel={isFinalLevel} onNext={handleNext} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
