import { motion } from 'framer-motion'

export default function HeaderLogo({ size = 'medium', className = '' }) {
  return (
    <motion.div
      className={`tc-logo-wrapper tc-logo--${size} ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { duration: 0.5 },
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <img src="/tc-logo.png" alt="Technical Club Logo" className="tc-logo-img" />
    </motion.div>
  )
}
