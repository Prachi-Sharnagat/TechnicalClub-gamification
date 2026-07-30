import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Question from './Question'
import GameImage from './GameImage'
import SkipModal from './SkipModal'

export default function ImageScene({
  level,
  onFound,
  onWrongClick,
  onSkip,
  levelSolved,
  disabled,
}) {
  const [showSkipModal, setShowSkipModal] = useState(false)
  const imageSrc = level?.sceneImage || level?.image

  return (
    <div className="scene-wrap hero-layout-container">
      {/* Hero Section: Question */}
      <section className="hero-question-section">
        {level?.question ? (
          <Question questionNumber={level?.id}>
            {level.question}
          </Question>
        ) : null}
      </section>

      {/* Game Image */}
      <section className="game-image-section">
        <GameImage
          src={imageSrc}
          level={level}
          onFound={onFound}
          onWrongClick={onWrongClick}
          levelSolved={levelSolved}
          disabled={disabled}
        />
      </section>

      {/* Dynamic Hint / Status Feedback */}
      <div className="scene-hint-wrap">
        <p className="scene-hint">
          {levelSolved
            ? '🎯 Target Discovered! +100 Points'
            : 'Tap the hidden answer object in the image above!'}
        </p>
      </div>

      {/* Skip Button */}
      {!levelSolved && !disabled && (
        <div className="skip-bar">
          <motion.button
            type="button"
            className="btn btn-ghost btn-skip"
            onClick={() => setShowSkipModal(true)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip ⏭
          </motion.button>
        </div>
      )}

      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipModal && (
          <SkipModal
            onConfirm={() => {
              setShowSkipModal(false)
              onSkip()
            }}
            onCancel={() => setShowSkipModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
