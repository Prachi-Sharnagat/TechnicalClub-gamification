import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'

const formatTimer = (totalSec) => {
  const safeSec = Math.max(0, totalSec || 0)
  const mins = Math.floor(safeSec / 60)
  const secs = safeSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Leaderboard({ entries = [], onClose }) {
  // Top 5 entries strictly
  const top5Entries = entries.slice(0, 5)

  return (
    <div className="leaderboard-screen">
      <motion.div
        className="leaderboard-card card-glass"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HeaderLogo size="medium" />

        <div className="leaderboard-header">
          <div>
            <p className="eyebrow">Technical Club 5-Min Competition</p>
            <h2 className="leaderboard-title">Top 5 Leaderboard 🏆</h2>
          </div>
          {onClose ? (
            <button type="button" className="btn btn-ghost leaderboard-close" onClick={onClose}>
              Close
            </button>
          ) : null}
        </div>

        <div className="leaderboard-table-wrap">
          {top5Entries.length === 0 ? (
            <div className="leaderboard-empty">No scores submitted yet. Be the first to compete!</div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Wrong Clicks</th>
                  <th>Time Used</th>
                </tr>
              </thead>
              <tbody>
                {top5Entries.map((entry, index) => (
                  <motion.tr
                    key={entry.id || index}
                    className={`lb-row ${
                      index === 0 ? 'rank-gold rank-gold-halo' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="lb-rank">
                      {index < 3 ? (
                        <motion.span
                          className="medal-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.3, 1] }}
                          transition={{ duration: 0.4, delay: index * 0.08 + 0.1 }}
                        >
                          {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : '🥉 3'}
                        </motion.span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="lb-name">{entry.name || 'Player'}</td>
                    <td className="lb-score">⭐ {entry.score ?? 0}</td>
                    <td className="lb-correct">✅ {entry.correctCount ?? 0}</td>
                    <td className="lb-wrong">❌ {entry.wrongClicks ?? 0}</td>
                    <td className="lb-time">⏱ {formatTimer(entry.totalTimeUsed)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}
