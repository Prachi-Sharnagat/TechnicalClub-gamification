import { motion } from 'framer-motion'

const CELEBRATION_EMOJIS = [
  '🎉', '🎊', '✨', '⭐', '🥳',
  '🎉', '🎊', '✨', '⭐', '🥳',
  '🌟', '💥', '🎈', '⭐', '✨',
  '🎉', '🎊', '🥳', '⭐', '✨',
]

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  emoji: CELEBRATION_EMOJIS[i % CELEBRATION_EMOJIS.length],
  left: `${(i * 3.2 + (i % 7) * 2.1) % 94 + 3}%`,
  delay: (i % 10) * 0.035,
  duration: 0.9 + (i % 5) * 0.06,
  rotate: (i % 2 === 0 ? 1 : -1) * (160 + (i % 6) * 50),
  scale: 0.85 + (i % 4) * 0.25,
  xOffset: (i % 2 === 0 ? 1 : -1) * (15 + (i % 5) * 18),
}))

export default function CelebrationRain() {
  return (
    <div className="celebration-rain-layer" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="rain-particle"
          style={{ left: p.left }}
          initial={{ opacity: 0, y: -30, scale: 0.5, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: ['0vh', '85vh'],
            x: [0, p.xOffset],
            scale: [0.5, p.scale, p.scale * 0.9],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  )
}
