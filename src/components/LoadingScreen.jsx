import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'

export default function LoadingScreen({ message = 'Preparing your adventure...' }) {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-card card-torn"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <HeaderLogo size="medium" />
        <div className="loading-ring" aria-hidden="true" />
        <p className="eyebrow">Technical Club</p>
        <h1 className="loading-title">Loading Adventure</h1>
        <p className="loading-copy">{message}</p>
      </motion.div>
    </div>
  )
}
