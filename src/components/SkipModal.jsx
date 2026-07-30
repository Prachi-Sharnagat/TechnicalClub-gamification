import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SkipModal({ onConfirm, onCancel }) {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <motion.div
      className="popup-overlay skip-modal-overlay"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="skip-modal-card card-glass"
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      >
        <h3 className="skip-modal-title">
          <span className="skip-modal-icon">⏭️</span> Skip this level?
        </h3>

        {/* <p className="skip-modal-copy"> */}
        {/* You'll receive 0 points and move to the next challenge. */}
        {/* </p> */}

        <div className="skip-modal-actions">
          <motion.button
            type="button"
            className="btn-skip-cancel"
            onClick={onCancel}
            whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.96 }}
          >
            Cancel
          </motion.button>

          <motion.button
            type="button"
            className="btn-skip-confirm-gradient"
            onClick={onConfirm}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            Skip Level <span className="skip-btn-arrow">➔</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
