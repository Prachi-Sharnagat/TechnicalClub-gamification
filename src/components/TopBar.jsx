import { formatTime } from '../utils/format'

export default function TopBar({ playerName, levelIndex, levelCount, seconds, wrongClicks }) {
  const progress = levelCount > 0 ? ((levelIndex + 1) / levelCount) * 100 : 0

  return (
    <div className="topbar">
      <div className="topbar-item topbar-player">
        <span className="topbar-label">Player</span>
        <span className="topbar-value">{playerName}</span>
      </div>

      <div className="topbar-item">
        <span className="topbar-label">Level</span>
        <span className="topbar-value">
          {levelIndex + 1} / {levelCount}
        </span>
      </div>

      <div className="topbar-item">
        <span className="topbar-label">Time</span>
        <span className="topbar-value topbar-mono">{formatTime(seconds)}</span>
      </div>

      <div className="topbar-item">
        <span className="topbar-label">Wrong Clicks</span>
        <span className="topbar-value topbar-mono">{wrongClicks}</span>
      </div>

      <div className="progress-wrap">
        <div className="progress-hint">Progress</div>
        <div className="progress-bar" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
