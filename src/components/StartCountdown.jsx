import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCountdownSound, triggerVibration } from '../utils/soundUtils'

export default function StartCountdown({ onComplete }) {
  const steps = ['3️⃣', '2️⃣', '1️⃣', 'GO! 🚀']
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    playCountdownSound(steps[stepIndex])
    triggerVibration([50])

    if (stepIndex >= steps.length - 1) {
      const timer = setTimeout(() => {
        onComplete()
      }, 700)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setStepIndex((prev) => prev + 1)
    }, 850)

    return () => clearTimeout(timer)
  }, [stepIndex])

  return (
    <div className="countdown-overlay">
      <AnimatePresence mode="wait">
        <motion.div
          key={steps[stepIndex]}
          className="countdown-card"
          initial={{ opacity: 0, scale: 0.2, rotate: -15 }}
          animate={{ opacity: 1, scale: 1.2, rotate: 0 }}
          exit={{ opacity: 0, scale: 2.2, rotate: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span className="countdown-text">{steps[stepIndex]}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
