import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'
import { subscribeLeaderboard } from '../services/leaderboardService'

const formatTimer = (totalSec) => {
  const safeSec = Math.max(0, totalSec || 0)
  const mins = Math.floor(safeSec / 60)
  const secs = safeSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Leaderboard({ entries: initialEntries = [], currentEmail, currentName, onClose }) {
  const [entries, setEntries] = useState(initialEntries)
  const userRowRef = useRef(null)

  const normalizedCurrentEmail = (currentEmail || '').trim().toLowerCase()
  const normalizedCurrentName = (currentName || '').trim().toLowerCase()

  // Real-time Firestore subscription (onSnapshot)
  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((updatedEntries) => {
      setEntries(updatedEntries)
    })
    return () => unsubscribe()
  }, [])

  // Find 0-indexed position of current player in full sorted entries
  const playerIndex = entries.findIndex((e) => {
    const emailMatch = normalizedCurrentEmail && (e.email || '').trim().toLowerCase() === normalizedCurrentEmail
    const nameMatch = normalizedCurrentName && (e.name || '').trim().toLowerCase() === normalizedCurrentName
    return emailMatch || nameMatch
  })

  const userRankText = playerIndex >= 0 ? `#${playerIndex + 1}` : 'N/A'

  // Scroll to current user's row if outside immediate view
  useEffect(() => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [playerIndex, entries.length])

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
            Live Leaderboard 🏆
          </h1>
          <p className="start-copy" style={{ margin: '0 0 0.8rem' }}>
            Real-Time Competition Rankings
          </p>

          {/* User Rank Display */}
          <div className="user-rank-banner">
            <span className="user-rank-label">Your Rank:</span>
            <span className="user-rank-value">{userRankText}</span>
          </div>
        </div>

        {/* Full-Page Leaderboard Card with Scrollable Table */}
        <div className="leaderboard-card-wrap card-glass">
          {entries.length === 0 ? (
            <div className="leaderboard-empty">
              No scores submitted yet. Be the first to compete!
            </div>
          ) : (
            <div className="leaderboard-table-responsive leaderboard-scroll-box">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="th-rank">Rank</th>
                    <th className="th-name">👤 Name</th>
                    <th className="th-score">⭐ Score</th>
                    <th className="th-wrong">❌ Wrong Clicks</th>
                    <th className="th-time">⏱ Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => {
                    const rank = index + 1
                    const isYou =
                      (normalizedCurrentEmail && (entry.email || '').trim().toLowerCase() === normalizedCurrentEmail) ||
                      (normalizedCurrentName && (entry.name || '').trim().toLowerCase() === normalizedCurrentName)

                    let rankIcon = `#${rank}`
                    if (rank === 1) rankIcon = '🥇 1'
                    else if (rank === 2) rankIcon = '🥈 2'
                    else if (rank === 3) rankIcon = '🥉 3'
                    else if (rank === 4) rankIcon = '🎖️ 4'
                    else if (rank === 5) rankIcon = '🏅 5'

                    return (
                      <tr
                        key={entry.id || `rank-${rank}-${entry.email || index}`}
                        ref={isYou ? userRowRef : null}
                        className={`lb-row ${isYou ? 'lb-row-you' : ''} ${
                          rank <= 5 ? `rank-top5 rank-top-${rank}` : ''
                        }`}
                      >
                        <td className="lb-rank">
                          <span className={`rank-badge rank-badge-${rank <= 5 ? rank : 'other'}`}>
                            {rankIcon}
                          </span>
                        </td>
                        <td className="lb-name">
                          <span className="player-name-text">{entry.name || 'Player'}</span>
                          {isYou && <span className="you-badge">You</span>}
                        </td>
                        <td className="lb-score">⭐ {entry.score ?? 0}</td>
                        <td className="lb-wrong">❌ {entry.wrongClicks ?? 0}</td>
                        <td className="lb-time">⏱ {formatTimer(entry.totalTimeUsed ?? entry.timeUsed)}</td>
                      </tr>
                    )
                  })}
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
