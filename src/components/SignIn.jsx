import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

export default function SignIn({ onContinue, loading }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email])

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('SignIn handleSubmit', { name: name.trim(), email: email.trim(), isEmailValid })

    if (!name.trim() || !email.trim()) {
      console.log('SignIn validation failed: missing fields')
      setError('Please fill in your name and email.')
      return
    }

    if (!isEmailValid) {
      console.log('SignIn validation failed: invalid email')
      setError('Please enter a valid email address.')
      return
    }

    setError('')
 console.log("Before onContinue");

if (!onContinue) {
    console.error("onContinue is undefined");
    return;
}

console.log("Calling onContinue...");

onContinue({
    name: name.trim(),
    email: email.trim().toLowerCase(),
});

console.log("After onContinue");
  }

  return (
    <div className="start-screen">
      <motion.div
        className="start-card card-torn"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="hero-badge">Mission Brief</div>
        <span className="eyebrow">Campus Club · Hide &amp; Seek</span>
        <h1 className="start-title">Join the mission</h1>
        <p className="start-copy">Enter your details and step into the hunt for the camouflaged club member.</p>

        <form className="start-form" onSubmit={handleSubmit}>
          <label className="start-label" htmlFor="player-name">Name</label>
          <input id="player-name" className="start-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Devansh Tiwari" />

          <label className="start-label" htmlFor="player-email">Email</label>
          <input id="player-email" className="start-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

          {error ? <p className="form-error">{error}</p> : null}

          <motion.button type="submit" className="btn btn-primary start-button" whileTap={{ scale: 0.97 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Continue'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
