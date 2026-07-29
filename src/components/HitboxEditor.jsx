import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { levels as baseLevels } from '../data/levels'

const STORAGE_KEY = 'hitbox-editor-data'
const MIN_SIZE = 3

const createDefaultBoxes = () =>
  Object.fromEntries(
    baseLevels.map((level, index) => {
      const fileName = (level.sceneImage || '').split('/').pop() || `q${index + 1}.png`
      return [fileName, level.hitbox ? { ...level.hitbox } : { x: 40, y: 30, width: 10, height: 12 }]
    }),
  )

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function readStoredBoxes() {
  if (typeof window === 'undefined') return createDefaultBoxes()

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return createDefaultBoxes()

    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === 'object' ? { ...createDefaultBoxes(), ...parsed } : createDefaultBoxes()
  } catch (error) {
    console.error('Unable to read hitbox editor storage', error)
    return createDefaultBoxes()
  }
}

export default function HitboxEditor({ onBack }) {
  const frameRef = useRef(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [boxes, setBoxes] = useState(readStoredBoxes)
  const [dragState, setDragState] = useState(null)
  const [copied, setCopied] = useState(false)

  const currentLevel = useMemo(() => baseLevels[imageIndex] || baseLevels[0], [imageIndex])
  const imageName = useMemo(() => {
    if (!currentLevel?.sceneImage) return `q${imageIndex + 1}.png`
    return currentLevel.sceneImage.split('/').pop()
  }, [currentLevel, imageIndex])

  const box = useMemo(() => {
    return boxes[imageName] || currentLevel?.hitbox || { x: 40, y: 30, width: 10, height: 12 }
  }, [boxes, imageName, currentLevel])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes))
  }, [boxes])

  const updateBox = useCallback((nextBox) => {
    setBoxes((current) => ({ ...current, [imageName]: nextBox }))
  }, [imageName])

  const getPointerPercent = (clientX, clientY) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }

    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }

  const handlePointerMove = useCallback((event) => {
    if (!dragState) return

    const pointer = getPointerPercent(event.clientX, event.clientY)
    const dx = pointer.x - dragState.startPointer.x
    const dy = pointer.y - dragState.startPointer.y

    if (dragState.mode === 'drag') {
      const nextX = clamp(dragState.startBox.x + dx, 0, 100 - dragState.startBox.width)
      const nextY = clamp(dragState.startBox.y + dy, 0, 100 - dragState.startBox.height)
      updateBox({ ...dragState.startBox, x: nextX, y: nextY })
      return
    }

    const nextBox = { ...dragState.startBox }

    switch (dragState.corner) {
      case 'tl': {
        const nextWidth = clamp(dragState.startBox.width - dx, MIN_SIZE, 100)
        const nextHeight = clamp(dragState.startBox.height - dy, MIN_SIZE, 100)
        const nextX = clamp(dragState.startBox.x + (dragState.startBox.width - nextWidth), 0, 100 - nextWidth)
        const nextY = clamp(dragState.startBox.y + (dragState.startBox.height - nextHeight), 0, 100 - nextHeight)
        Object.assign(nextBox, { x: nextX, y: nextY, width: nextWidth, height: nextHeight })
        break
      }
      case 'tr': {
        const nextWidth = clamp(dragState.startBox.width + dx, MIN_SIZE, 100 - dragState.startBox.x)
        const nextHeight = clamp(dragState.startBox.height - dy, MIN_SIZE, 100)
        const nextY = clamp(dragState.startBox.y + (dragState.startBox.height - nextHeight), 0, 100 - nextHeight)
        Object.assign(nextBox, { y: nextY, width: nextWidth, height: nextHeight })
        break
      }
      case 'bl': {
        const nextWidth = clamp(dragState.startBox.width - dx, MIN_SIZE, 100)
        const nextHeight = clamp(dragState.startBox.height + dy, MIN_SIZE, 100 - dragState.startBox.y)
        const nextX = clamp(dragState.startBox.x + (dragState.startBox.width - nextWidth), 0, 100 - nextWidth)
        Object.assign(nextBox, { x: nextX, width: nextWidth, height: nextHeight })
        break
      }
      case 'br': {
        const nextWidth = clamp(dragState.startBox.width + dx, MIN_SIZE, 100 - dragState.startBox.x)
        const nextHeight = clamp(dragState.startBox.height + dy, MIN_SIZE, 100 - dragState.startBox.y)
        Object.assign(nextBox, { width: nextWidth, height: nextHeight })
        break
      }
      default:
        break
    }

    updateBox(nextBox)
  }, [dragState, updateBox])

  useEffect(() => {
    if (!dragState) return undefined

    const onPointerMove = (e) => handlePointerMove(e)
    const onPointerUp = () => setDragState(null)

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [dragState, handlePointerMove])

  const startDrag = (event, mode, corner = null) => {
    event.preventDefault()
    event.stopPropagation()

    const pointer = getPointerPercent(event.clientX, event.clientY)
    setDragState({
      mode,
      corner,
      startPointer: pointer,
      startBox: { ...box },
    })
  }

  const copyJson = async () => {
    const text = `hitbox: {\n  x: ${box.x.toFixed(1)},\n  y: ${box.y.toFixed(1)},\n  width: ${box.width.toFixed(1)},\n  height: ${box.height.toFixed(1)}\n}`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1000)
    } catch (error) {
      console.error('Unable to copy hitbox JSON', error)
    }
  }

  const updateCurrentValue = (field, value) => {
    const numeric = Number(value)
    const next = { ...box, [field]: Number.isFinite(numeric) ? numeric : 0 }
    updateBox(next)
  }

  const previousImage = () => setImageIndex((current) => (current === 0 ? baseLevels.length - 1 : current - 1))
  const nextImage = () => setImageIndex((current) => (current === baseLevels.length - 1 ? 0 : current + 1))

  return (
    <div className="editor-page">
      <div className="editor-toolbar">
        <div>
          <p className="eyebrow">Hitbox Editor</p>
          <h1>Mark one click target for each level image</h1>
        </div>
        <div className="editor-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back to Game
          </button>
        </div>
      </div>

      <div className="editor-panel">
        <div className="editor-controls">
          <div className="editor-nav">
            <button type="button" className="btn btn-ghost" onClick={previousImage}>
              Previous Image
            </button>
            <span className="editor-counter">{imageIndex + 1} / {baseLevels.length}</span>
            <button type="button" className="btn btn-ghost" onClick={nextImage}>
              Next Image
            </button>
          </div>

          <div className="editor-image-name">{imageName}</div>

          <div className="editor-values">
            <label>
              <span>X</span>
              <input type="number" step="0.1" value={box.x.toFixed(1)} onChange={(event) => updateCurrentValue('x', event.target.value)} />
            </label>
            <label>
              <span>Y</span>
              <input type="number" step="0.1" value={box.y.toFixed(1)} onChange={(event) => updateCurrentValue('y', event.target.value)} />
            </label>
            <label>
              <span>Width</span>
              <input type="number" step="0.1" value={box.width.toFixed(1)} onChange={(event) => updateCurrentValue('width', event.target.value)} />
            </label>
            <label>
              <span>Height</span>
              <input type="number" step="0.1" value={box.height.toFixed(1)} onChange={(event) => updateCurrentValue('height', event.target.value)} />
            </label>
          </div>

          <button type="button" className="btn btn-primary" onClick={copyJson}>
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>

        <div className="editor-canvas-wrap">
          <div className="editor-canvas" ref={frameRef}>
            {currentLevel?.sceneImage ? (
              <img
                className="editor-image"
                src={currentLevel.sceneImage}
                alt={imageName}
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
            ) : null}

            <div
              className="editor-box"
              style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%` }}
              onPointerDown={(event) => startDrag(event, 'drag')}
            >
              <div className="editor-handle editor-handle--tl" onPointerDown={(event) => startDrag(event, 'resize', 'tl')} />
              <div className="editor-handle editor-handle--tr" onPointerDown={(event) => startDrag(event, 'resize', 'tr')} />
              <div className="editor-handle editor-handle--bl" onPointerDown={(event) => startDrag(event, 'resize', 'bl')} />
              <div className="editor-handle editor-handle--br" onPointerDown={(event) => startDrag(event, 'resize', 'br')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
