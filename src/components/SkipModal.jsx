import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'

export default function SkipModal({ onConfirm, onCancel }) {
  return (
    <motion.div
      className="popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="skip-modal-card card-glass"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <HeaderLogo size="small" />
        <h3 className="skip-modal-title">Skip this question?</h3>
        <p className="skip-modal-copy">You will receive 0 points for this level.</p>

        <div className="skip-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-skip-confirm" onClick={onConfirm}>
            Skip
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
