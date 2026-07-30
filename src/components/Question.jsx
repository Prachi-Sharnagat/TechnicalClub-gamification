import { motion } from 'framer-motion'

export default function Question({ children, questionNumber }) {
  return (
    <motion.div
      className="hero-question-wrapper"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="hero-question-card card-glass">
        {questionNumber ? (
          <span className="hero-question-badge">
            QUESTION {questionNumber}
          </span>
        ) : null}
        <h2 className="hero-question-text">{children}</h2>
      </div>
    </motion.div>
  )
}
