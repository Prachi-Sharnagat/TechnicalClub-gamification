import { motion } from 'framer-motion'

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function Leaderboard({ entries = [], onClose }) {
  return (
    <div className="leaderboard-screen">
      <motion.div
        className="leaderboard-card card-torn"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="leaderboard-header">
          <div>
            <p className="eyebrow">Live results</p>
            <h2 className="leaderboard-title">Leaderboard</h2>
          </div>
          <button className="btn btn-ghost leaderboard-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="leaderboard-list">
          {entries.length === 0 ? (
            <div className="leaderboard-empty">No scores yet. Be the first to complete the mission.</div>
          ) : (
            entries.map((entry, index) => (
              <div className="leaderboard-row" key={entry.id}>
                <div className="leaderboard-rank">{index + 1}</div>
                <div className="leaderboard-main">
                  <div className="leaderboard-name">{entry.name}</div>
                  <div className="leaderboard-meta">
                    <span>{formatTime(entry.time)}</span>
                    <span>•</span>
                    <span>Accuracy {entry.accuracy}%</span>
                    <span>•</span>
                    <span>Wrong {entry.wrongClicks}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
