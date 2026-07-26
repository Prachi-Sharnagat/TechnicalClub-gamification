import { useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

let flashId = 0

export default function ImageScene({ level, onFound, onWrongClick, devMode = false }) {
  const containerRef = useRef(null)
  const [flashes, setFlashes] = useState([])

  const registerFlash = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const id = ++flashId
    const flash = {
      id,
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
    setFlashes((prev) => [...prev, flash])
    window.setTimeout(() => {
      setFlashes((prev) => prev.filter((f) => f.id !== id))
    }, 550)
  }, [])

  const handleImageMiss = (e) => {
    registerFlash(e.clientX, e.clientY)
    onWrongClick()
  }

  const handleHotspotClick = (e) => {
    e.stopPropagation()
    onFound()
  }

  const hotspot = level?.hitbox || level?.hotspot || { x: 0, y: 0, width: 0, height: 0 }

  return (
    <div className="scene-wrap">
      <div className="scene-frame" ref={containerRef} onClick={handleImageMiss}>
        <img className="scene-image" src={level?.sceneImage || level?.image} alt="Find the camouflaged club member" draggable={false} />

        <div
          className={devMode ? 'scene-hotspot scene-hotspot--dev' : 'scene-hotspot'}
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            width: `${hotspot.width}%`,
            height: `${hotspot.height}%`,
          }}
          onClick={handleHotspotClick}
          role="button"
          aria-label="Hidden club member"
        />

        <AnimatePresence>
          {flashes.map((f) => (
            <motion.span
              key={f.id}
              className="wrong-flash"
              style={{ left: f.x, top: f.y }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              ✕
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <p className="scene-hint">Tap or click anywhere you think the club member is hiding.</p>
    </div>
  )
}
