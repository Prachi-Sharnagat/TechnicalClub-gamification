import { useState } from 'react'
import { motion } from 'framer-motion'

const KiteMark = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <polygon points="50,4 90,46 50,96 10,46" fill="none" stroke="currentColor" strokeWidth="3" />
    <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    <line x1="10" y1="46" x2="90" y2="46" stroke="currentColor" strokeWidth="2" opacity="0.5" />
  </svg>
)

export default function StartScreen({ onStart, levelCount }) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!trimmed) return
    onStart(trimmed)
  }

  return (
    <div className="start-screen">
      <motion.div
        className="start-card card-torn"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <KiteMark className="start-kite start-kite--one" />
        <KiteMark className="start-kite start-kite--two" />

        <span className="eyebrow">Hidden Object Quiz</span>
        <h1 className="start-title">
          Spot the
          <br />
          Hidden
          <br />
          Object
        </h1>
        <p className="start-copy">
          Each scene hides a specific object in plain sight. Study the image, choose the answer, or tap the hotspot — {levelCount} scenes are waiting.
        </p>

        <form className="start-form" onSubmit={handleSubmit}>
          <label className="start-label" htmlFor="player-name">
            Enter your name
          </label>
          <input
            id="player-name"
            className="start-input"
            type="text"
            placeholder="e.g. Priya Nair"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <motion.button
            type="submit"
            className="btn btn-primary start-button"
            disabled={!trimmed}
            whileTap={{ scale: 0.96 }}
          >
            Start Game
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
