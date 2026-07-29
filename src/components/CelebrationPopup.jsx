import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'

export default function CelebrationPopup({ totalScore, isFinalLevel, onNext }) {
  return (
    <motion.div
      className="popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="popup-card celebration-card card-glass"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      >
        <HeaderLogo size="small" />

        <div className="celebration-header">
          <span className="celebration-emoji">🎉</span>
          <h2 className="celebration-title">Target Discovered!</h2>
        </div>

        <div className="celebration-points">
          +100 Points
        </div>

        <div className="celebration-stats">
          <div className="celebration-stat">
            <span className="celebration-stat-label">⭐ TOTAL SCORE</span>
            <span className="celebration-stat-value">{totalScore}</span>
          </div>
        </div>

        <motion.button
          className="btn btn-success celebration-next"
          onClick={onNext}
          whileTap={{ scale: 0.96 }}
        >
          {isFinalLevel ? 'See Final Results' : 'Next Level ➡'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
