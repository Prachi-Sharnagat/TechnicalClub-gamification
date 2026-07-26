import { motion } from 'framer-motion'

export default function LoadingScreen({ message = 'Preparing your mission...' }) {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-card card-torn"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="loading-ring" aria-hidden="true" />
        <p className="eyebrow">Loading</p>
        <h1 className="loading-title">Mission is loading</h1>
        <p className="loading-copy">{message}</p>
      </motion.div>
    </div>
  )
}
