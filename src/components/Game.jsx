import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TopBar from './TopBar'
import ImageScene from './ImageScene'
import Results from './Results'
import CelebrationPopup from './CelebrationPopup'
import StartCountdown from './StartCountdown'

const COMPETITION_DURATION_SECONDS = 300 // 5 Minutes

const confettiPieces = ['✦', '✿', '⬢', '✧', '❋', '✺', '🎉', '⭐']

export default function Game({ playerName, email, levels, onComplete, onViewLeaderboard }) {
  const [gameStarted, setGameStarted] = useState(false)
  const [levelIndex, setLevelIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(COMPETITION_DURATION_SECONDS)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongClicks, setWrongClicks] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [submissionResult, setSubmissionResult] = useState(null)

  const [levelSolved, setLevelSolved] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [finished, setFinished] = useState(false)

  const completedRef = useRef(false)
  const startTimeRef = useRef(null)
  const timerIntervalRef = useRef(null)

  const safeLevels = Array.isArray(levels) ? levels : []
  const currentLevel = safeLevels[levelIndex] || safeLevels[0]
  const isFinalLevel = safeLevels.length > 0 && levelIndex === safeLevels.length - 1

  // Preload all 15 question images into memory for 60fps instant level switching
  useEffect(() => {
    safeLevels.forEach((lvl) => {
      const src = lvl.sceneImage || lvl.image
      if (src) {
        const img = new Image()
        img.src = src
      }
    })
  }, [safeLevels])

  // Start global 5-minute timer only AFTER countdown overlay completes
  const handleCountdownComplete = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setRemainingSeconds(COMPETITION_DURATION_SECONDS)

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)

    timerIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current
      const elapsedSec = Math.floor(elapsedMs / 1000)
      const remaining = Math.max(0, COMPETITION_DURATION_SECONDS - elapsedSec)

      setRemainingSeconds(remaining)

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
        setFinished(true)
      }
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [])

  // Auto-submit score on completion (single write operation)
  useEffect(() => {
    if (!finished || completedRef.current) return
    completedRef.current = true

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    const totalTimeUsed = startTimeRef.current
      ? Math.min(COMPETITION_DURATION_SECONDS, Math.floor((Date.now() - startTimeRef.current) / 1000))
      : 0

    const doSubmit = async () => {
      if (onComplete) {
        const res = await onComplete({
          name: playerName,
          email,
          score,
          correctCount,
          wrongClicks,
          skippedCount,
          totalTimeUsed,
        })
        setSubmissionResult(res)
      }
    }

    doSubmit()
  }, [correctCount, email, finished, onComplete, playerName, score, skippedCount, wrongClicks])

  const handleWrongClick = () => {
    if (finished || !gameStarted) return
    setWrongClicks((prev) => prev + 1)
  }

  const handleFound = () => {
    if (levelSolved || showSuccess || finished || !gameStarted) return

    setScore((prev) => prev + 100)
    setCorrectCount((prev) => prev + 1)

    setLevelSolved(true)
    setShowSuccess(true)
  }

  const handleSkip = () => {
    if (finished || !gameStarted) return
    setSkippedCount((prev) => prev + 1)

    if (isFinalLevel) {
      setFinished(true)
    } else {
      setLevelIndex((prev) => prev + 1)
      setLevelSolved(false)
      setShowSuccess(false)
    }
  }

  const handleNext = () => {
    setShowSuccess(false)
    setLevelSolved(false)

    if (isFinalLevel) {
      setFinished(true)
    } else {
      setLevelIndex((prev) => prev + 1)
    }
  }

  if (!gameStarted && !finished) {
    return <StartCountdown onComplete={handleCountdownComplete} />
  }

  if (finished) {
    const totalTimeUsed = startTimeRef.current
      ? Math.min(COMPETITION_DURATION_SECONDS, Math.floor((Date.now() - startTimeRef.current) / 1000))
      : 0
    const remTime = Math.max(0, COMPETITION_DURATION_SECONDS - totalTimeUsed)

    return (
      <Results
        totalScore={score}
        correctCount={correctCount}
        wrongClicks={wrongClicks}
        skippedCount={skippedCount}
        totalTimeUsed={totalTimeUsed}
        remainingSeconds={remTime}
        submissionResult={submissionResult}
        onViewLeaderboard={onViewLeaderboard}
      />
    )
  }


  return (
    <div className={`game-screen ${remainingSeconds <= 10 ? 'screen-last10-pulse' : ''}`}>
      <TopBar
        levelIndex={levelIndex}
        levelCount={safeLevels.length}
        score={score}
        remainingSeconds={remainingSeconds}
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
            <ImageScene
              level={currentLevel}
              onFound={handleFound}
              onWrongClick={handleWrongClick}
              onSkip={handleSkip}
              levelSolved={levelSolved}
              disabled={remainingSeconds <= 0}
            />
          ) : (
            <div className="game-placeholder">Loading next scene...</div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <>
            <div className="confetti-layer" aria-hidden="true">
              {confettiPieces.map((piece, index) => (
                <motion.span
                  key={`${piece}-${index}`}
                  className="confetti-piece"
                  initial={{ opacity: 0, y: -20, x: (index - 3) * 30 }}
                  animate={{ opacity: 1, y: 120, rotate: 360 }}
                  transition={{ duration: 1.2, delay: index * 0.05 }}
                >
                  {piece}
                </motion.span>
              ))}
            </div>

            <CelebrationPopup
              score={100}
              totalScore={score}
              isFinalLevel={isFinalLevel}
              onNext={handleNext}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
