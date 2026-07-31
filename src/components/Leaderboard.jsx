import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'

const formatTimer = (totalSec) => {
  const safeSec = Math.max(0, totalSec || 0)
  const mins = Math.floor(safeSec / 60)
  const secs = safeSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Leaderboard({ entries = [], currentEmail, currentName, onClose }) {
  const normalizedCurrentEmail = (currentEmail || '').trim().toLowerCase()
  const normalizedCurrentName = (currentName || '').trim().toLowerCase()

  // Find 0-indexed position of current player in full sorted entries
  const playerIndex = entries.findIndex((e) => {
    const emailMatch = normalizedCurrentEmail && (e.email || '').trim().toLowerCase() === normalizedCurrentEmail
    const nameMatch = normalizedCurrentName && (e.name || '').trim().toLowerCase() === normalizedCurrentName
    return emailMatch || nameMatch
  })

  const top5Entries = entries.slice(0, 5)
  const isPlayerOutsideTop5 = playerIndex >= 5
  const playerOutsideEntry = isPlayerOutsideTop5 ? entries[playerIndex] : null

  return (
    <div className="start-screen leaderboard-page">
      <motion.div
        className="start-container leaderboard-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="start-hero-header">
          <HeaderLogo size="large" />
          <span className="eyebrow">TECHNICAL CLUB FLAGSHIP</span>
          <h1 className="start-title" style={{ margin: '0.4rem 0 0.2rem' }}>
            Top 5 Leaderboard 🏆
          </h1>
          <p className="start-copy" style={{ margin: '0 0 1rem' }}>
            Official Competition Rankings
          </p>
        </div>

        {/* Single Full-Page Leaderboard Card (Matches Login Page Styling, No Double-Cards) */}
        <div className="leaderboard-card-wrap card-glass">
          {entries.length === 0 ? (
            <div className="leaderboard-empty">
              No scores submitted yet. Be the first to compete!
            </div>
          ) : (
            <div className="leaderboard-table-responsive">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="th-rank">🥇 Rank</th>
                    <th className="th-name">👤 Name</th>
                    <th className="th-score">⭐ Score</th>
                    <th className="th-time">⏱ Time</th>
                  </tr>
                </thead>
                <tbody>
                  {top5Entries.map((entry, index) => {
                    const isYou =
                      (normalizedCurrentEmail && (entry.email || '').trim().toLowerCase() === normalizedCurrentEmail) ||
                      (normalizedCurrentName && (entry.name || '').trim().toLowerCase() === normalizedCurrentName)

                    return (
                      <tr
                        key={entry.id || `top-${index}`}
                        className={`lb-row ${isYou ? 'lb-row-you' : ''} ${index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : ''
                          }`}
                      >
                        <td className="lb-rank">
                          {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                        </td>
                        <td className="lb-name">
                          <span className="player-name-text">{entry.name || 'Player'}</span>
                          {isYou && <span className="you-badge">You</span>}
                        </td>
                        <td className="lb-score">⭐ {entry.score ?? 0}</td>
                        <td className="lb-time">⏱ {formatTimer(entry.totalTimeUsed)}</td>
                      </tr>
                    )
                  })}

                  {isPlayerOutsideTop5 && playerOutsideEntry && (
                    <>
                      <tr className="lb-separator-row">
                        <td colSpan="4">•••</td>
                      </tr>
                      <tr className="lb-row lb-row-you">
                        <td className="lb-rank">#{playerIndex + 1}</td>
                        <td className="lb-name">
                          <span className="player-name-text">{playerOutsideEntry.name || 'Player'}</span>
                          <span className="you-badge">You</span>
                        </td>
                        <td className="lb-score">⭐ {playerOutsideEntry.score ?? 0}</td>
                        <td className="lb-time">⏱ {formatTimer(playerOutsideEntry.totalTimeUsed)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="leaderboard-actions">
          <motion.button
            type="button"
            className="btn btn-gradient-blue start-button"
            onClick={onClose}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            Back to Home 🏠
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
