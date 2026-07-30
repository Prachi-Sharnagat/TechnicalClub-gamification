import { useEffect } from "react";
import { motion } from "framer-motion";
import HeaderLogo from "./HeaderLogo";

export default function CelebrationPopup({
  score,
  totalScore,
  isFinalLevel,
  onNext,
}) {
  // Auto move to next level after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      className="popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="popup-card celebration-card card-glass"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 25,
        }}
      >
        {/* Optional Logo */}
        {/* <HeaderLogo size="small" /> */}

        <motion.div
          className="celebration-points"
          initial={{ scale: 0.5, y: 20, opacity: 0 }}
          animate={{ scale: 1.1, y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 12,
          }}
        >
          +100 Points 🎉
        </motion.div>

        {/* Keep this button if you want manual skip */}
        <motion.button
          className="btn btn-success celebration-next"
          onClick={onNext}
          whileTap={{ scale: 0.96 }}
        >
          {isFinalLevel ? "See Final Results" : "Next Level ➜"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}