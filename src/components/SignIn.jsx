import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import HeaderLogo from './HeaderLogo'

export default function SignIn({ onContinue, loading }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email])
  const isFormValid = useMemo(() => name.trim().length > 0 && isEmailValid, [name, isEmailValid])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Please enter your Full Name.')
      return
    }

    if (!isEmailValid) {
      setError('Please enter a valid Email Address.')
      return
    }

    setError('')
    if (!onContinue) return

    onContinue({
      name: name.trim(),
      email: email.trim().toLowerCase(),
    })
  }

  return (
    <div className="start-screen">
      <motion.div
        className="start-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="start-hero-header">
          <HeaderLogo size="large" />
          <span className="eyebrow">Technical Club Flagship</span>
          <h1 className="start-title">5-Minute Competition</h1>
          <p className="start-copy">
            Discover hidden objects across 15 levels in 5 minutes! Score 100 points per discovery.
          </p>
        </div>

        <form className="start-form" onSubmit={handleSubmit}>
          <div className="input-field-group">
            <label className="start-label" htmlFor="player-name">
              Full Name *
            </label>
            <input
              id="player-name"
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="krish Mishra"
              required
            />
          </div>

          <div className="input-field-group">
            <label className="start-label" htmlFor="player-email">
              Email Address *
            </label>
            <input
              id="player-email"
              className="glass-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              required
            />
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <motion.button
            type="submit"
            className={`btn btn-gradient-blue start-button ${!isFormValid ? 'btn-disabled' : ''}`}
            whileHover={isFormValid ? { y: -2 } : {}}
            whileTap={isFormValid ? { scale: 0.96 } : {}}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Starting...' : 'Start Game 🚀'}
          </motion.button>
        </form>

        <footer className="start-footer">
          Technical Club © 2026 • Official Event Competition
        </footer>
      </motion.div>
    </div>
  )
}
