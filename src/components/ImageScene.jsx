import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SkipModal from './SkipModal'
import { playWrongSound, playSuccessSound, triggerVibration } from '../utils/soundUtils'

let flashId = 0
let scoreFlyId = 0
const DEBUG = false

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function ImageScene({ level, onFound, onWrongClick, onSkip, levelSolved, disabled }) {
  const containerRef = useRef(null)
  const [flashes, setFlashes] = useState([])
  const [scoreFlies, setScoreFlies] = useState([])
  const [hitbox, setHitbox] = useState(level?.hitbox || { x: 0, y: 0, width: 0, height: 0 })
  const [dragState, setDragState] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)

  const [prevLevelId, setPrevLevelId] = useState(level?.id)

  if (prevLevelId !== level?.id) {
    setPrevLevelId(level?.id)
    setHitbox(level?.hitbox || { x: 0, y: 0, width: 0, height: 0 })
    setCopied(false)
    setShowSkipModal(false)
  }

  useEffect(() => {
    if (!dragState) return undefined

    const handlePointerMove = (event) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const pointerX = ((event.clientX - rect.left) / rect.width) * 100
      const pointerY = ((event.clientY - rect.top) / rect.height) * 100

      setHitbox((current) => {
        if (dragState.mode === 'drag') {
          const nextX = clamp(pointerX - dragState.offsetX, 0, 100 - current.width)
          const nextY = clamp(pointerY - dragState.offsetY, 0, 100 - current.height)
          return { ...current, x: nextX, y: nextY }
        }

        const nextWidth = clamp(pointerX - current.x, 1, 100 - current.x)
        const nextHeight = clamp(pointerY - current.y, 1, 100 - current.y)
        return { ...current, width: nextWidth, height: nextHeight }
      })
    }

    const handlePointerUp = () => {
      setDragState(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState])

  const registerWrongFlash = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    playWrongSound()
    triggerVibration([20])

    const id = ++flashId
    const flash = {
      id,
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
    setFlashes((prev) => [...prev, flash])
    window.setTimeout(() => {
      setFlashes((prev) => prev.filter((f) => f.id !== id))
    }, 400)
  }, [])

  const registerScoreFly = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    playSuccessSound()
    triggerVibration([50])

    const id = ++scoreFlyId
    const fly = {
      id,
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
    setScoreFlies((prev) => [...prev, fly])
    window.setTimeout(() => {
      setScoreFlies((prev) => prev.filter((f) => f.id !== id))
    }, 900)
  }, [])

  const getPositionInPercent = (clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }

    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    return { x, y }
  }

  const handleInteraction = (event) => {
    if (levelSolved || showSkipModal || disabled) return

    let clientX = event.clientX
    let clientY = event.clientY

    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    }

    const { x, y } = getPositionInPercent(clientX, clientY)
    const insideHitbox =
      x >= hitbox.x &&
      x <= hitbox.x + hitbox.width &&
      y >= hitbox.y &&
      y <= hitbox.y + hitbox.height

    if (insideHitbox) {
      registerScoreFly(clientX, clientY)
      onFound()
      return
    }

    registerWrongFlash(clientX, clientY)
    onWrongClick()
  }

  const startDrag = (event, mode) => {
    event.preventDefault()
    event.stopPropagation()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const pointerX = ((event.clientX - rect.left) / rect.width) * 100
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100

    setDragState({
      mode,
      offsetX: pointerX - hitbox.x,
      offsetY: pointerY - hitbox.y,
    })
  }

  const copyHitbox = async () => {
    const text = `{
  x: ${hitbox.x.toFixed(2)},
  y: ${hitbox.y.toFixed(2)},
  width: ${hitbox.width.toFixed(2)},
  height: ${hitbox.height.toFixed(2)}
}`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 900)
    } catch (error) {
      console.error('Unable to copy hitbox', error)
    }
  }

  return (
    <div className="scene-wrap">
      <motion.div
        key={level?.id}
        className="scene-frame card-glass"
        ref={containerRef}
        onPointerDown={handleInteraction}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <img
          className="scene-image"
          src={level?.sceneImage || level?.image}
          alt="Hidden object scene"
          draggable={false}
          onError={(e) => {
            const currentSrc = e.target.src
            if (currentSrc.endsWith('.png')) {
              e.target.src = currentSrc.replace(/\.png$/, '.jpg')
            } else if (currentSrc.endsWith('.jpg')) {
              e.target.src = currentSrc.replace(/\.jpg$/, '.jpeg')
            }
          }}
        />

        {/* Hotspot is 100% invisible during gameplay - zero borders, zero green rectangles */}
        {DEBUG ? (
          <div
            className="scene-hotspot scene-hotspot--dev"
            style={{
              left: `${hitbox.x}%`,
              top: `${hitbox.y}%`,
              width: `${hitbox.width}%`,
              height: `${hitbox.height}%`,
              opacity: 0.6,
              pointerEvents: 'auto',
            }}
            onPointerDown={(event) => startDrag(event, 'drag')}
            role="button"
            aria-label="Target region"
          >
            <div
              className="scene-hotspot-resize"
              onPointerDown={(event) => startDrag(event, 'resize')}
            />
          </div>
        ) : null}

        {/* Subtle 12px Wrong Tap Marker Animation */}
        <AnimatePresence>
          {flashes.map((f) => (
            <motion.span
              key={f.id}
              className="wrong-flash-subtle"
              style={{ left: f.x, top: f.y }}
              initial={{ opacity: 1, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              ❌
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Floating +100 Score Animation */}
        <AnimatePresence>
          {scoreFlies.map((sf) => (
            <motion.span
              key={sf.id}
              className="score-fly"
              style={{ left: sf.x, top: sf.y }}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], y: -80, scale: 1.3 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            >
              ⭐ +100
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="scene-quiz">
        {level?.question ? <h2 className="scene-question">{level.question}</h2> : null}
        <p className="scene-hint">
          {levelSolved ? 'Target discovered! +100 Points' : 'Tap the hidden object in the scene above!'}
        </p>
      </div>

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

      {DEBUG ? (
        <div className="scene-editor">
          <div className="scene-editor-actions">
            <strong>Hitbox Editor</strong>
            <button type="button" className="btn btn-ghost scene-editor-copy" onClick={copyHitbox}>
              {copied ? 'Copied!' : 'Copy Hitbox'}
            </button>
          </div>
          <div className="scene-editor-values">
            <span>x: {hitbox.x.toFixed(2)}</span>
            <span>y: {hitbox.y.toFixed(2)}</span>
            <span>width: {hitbox.width.toFixed(2)}</span>
            <span>height: {hitbox.height.toFixed(2)}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
