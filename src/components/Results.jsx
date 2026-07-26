import { motion } from 'framer-motion'
import { formatTime } from '../utils/format'

const confettiPieces = ['✦', '✿', '⬢', '✧', '❋', '✺']

export default function Results({ playerName, seconds, wrongClicks, correctClicks, onPlayAgain, onRestart, onViewLeaderboard }) {
  const totalClicks = correctClicks + wrongClicks
  const accuracy = totalClicks === 0 ? 100 : Math.round((correctClicks / totalClicks) * 100)

  return (
    <div className="results-screen">
      <div className="confetti-layer" aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <motion.span
            key={`${piece}-${index}`}
            className="confetti-piece"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 42, rotate: 360 }}
            transition={{ duration: 1.1, delay: index * 0.04 }}
          >
            {piece}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="results-card card-torn"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <span className="eyebrow">Mission complete</span>
        <h1 className="results-title">Congratulations, {playerName}!</h1>
        <p className="results-copy">Every hidden club member has been spotted and your score is now in the leaderboard.</p>

        <div className="results-stats">
          <div className="results-stat">
            <span className="results-stat-value topbar-mono">{formatTime(seconds)}</span>
            <span className="results-stat-label">Time</span>
          </div>
          <div className="results-stat">
            <span className="results-stat-value topbar-mono">{wrongClicks}</span>
            <span className="results-stat-label">Wrong Clicks</span>
          </div>
          <div className="results-stat">
            <span className="results-stat-value topbar-mono">{accuracy}%</span>
            <span className="results-stat-label">Accuracy</span>
          </div>
        </div>

        <div className="results-actions">
          <motion.button className="btn btn-primary" onClick={onPlayAgain} whileTap={{ scale: 0.96 }}>
            Play Again
          </motion.button>
          <motion.button className="btn btn-ghost" onClick={onRestart} whileTap={{ scale: 0.96 }}>
            Restart
          </motion.button>
          <motion.button className="btn btn-ghost" onClick={onViewLeaderboard} whileTap={{ scale: 0.96 }}>
            View Leaderboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
