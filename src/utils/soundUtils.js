// Web Audio API Sound Synthesizer for Zero-Latency Browser Sound Effects

let audioCtx = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// 1. Countdown Sound (3, 2, 1 -> low beep, GO! -> high pitch chime)
export const playCountdownSound = (step) => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const isGo = step === 'GO!' || step === 0
    const freq = isGo ? 880 : 440 // A5 for GO!, A4 for count

    osc.type = isGo ? 'triangle' : 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isGo ? 0.4 : 0.2))

    osc.start()
    osc.stop(ctx.currentTime + (isGo ? 0.4 : 0.2))
  } catch (err) {
    // Audio context fallback
  }
}

// 2. Wrong Click Buzz Sound
export const playWrongSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(160, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)

    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch (err) {
    // Audio fallback
  }
}

// 3. Success / Hit Sound (Pleasant Chime: C5 -> E5 -> G5)
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08)

      gain.gain.setValueAtTime(0.18, ctx.currentTime + index * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.3)

      osc.start(ctx.currentTime + index * 0.08)
      osc.stop(ctx.currentTime + index * 0.08 + 0.3)
    })
  } catch (err) {
    // Audio fallback
  }
}

// 4. Tick Sound for Last 10 Seconds
export const playTickSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1000, ctx.currentTime)

    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  } catch (err) {
    // Audio fallback
  }
}

// 5. Trophy Victory Fanfare
export const playTrophySound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12)

      gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.5)

      osc.start(ctx.currentTime + index * 0.12)
      osc.stop(ctx.currentTime + index * 0.12 + 0.5)
    })
  } catch (err) {
    // Audio fallback
  }
}

// Haptic Vibration Helper
export const triggerVibration = (pattern = [40]) => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  } catch (err) {
    // Haptics fallback
  }
}
