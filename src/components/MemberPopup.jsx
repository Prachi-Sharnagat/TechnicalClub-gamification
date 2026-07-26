import { motion } from 'framer-motion'

export default function MemberPopup({ member, isFinalLevel, onNext }) {
  const initials = member?.name
    ?.split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)

  return (
    <motion.div className="popup-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="popup-card card-torn"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <span className="popup-eyebrow eyebrow">Found you!</span>

        <div className="popup-photo" aria-hidden="true">
          {member?.avatar ? <img src={member.avatar} alt={member.name} className="popup-avatar" /> : initials}
        </div>

        <h2 className="popup-name">{member?.name}</h2>
        <p className="popup-role">{member?.role}</p>
        <p className="popup-intro">{member?.intro}</p>

        <div className="popup-skills">
          {member?.skills?.map((skill) => (
            <span className="popup-skill" key={skill}>
              {skill}
            </span>
          ))}
        </div>

        <motion.button className="btn btn-primary popup-next" onClick={onNext} whileTap={{ scale: 0.96 }}>
          {isFinalLevel ? 'See Results' : 'Next Level'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
