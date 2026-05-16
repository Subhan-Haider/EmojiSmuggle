import { motion } from 'framer-motion';

const emojis = ['🕵️', '📦', '💾', '💿', '🔌', '💻', '📡', '🔋', '⚡', '🔒', '🔑', '👁️', '🌑', '🤫', '👾', '💎'];

const seededValue = (seed, min, max) => {
  const value = Math.sin(seed * 999) * 10000;
  return min + (value - Math.floor(value)) * (max - min);
};

const FloatingEmoji = ({ emoji, index }) => {
  const size = seededValue(index + 1, 14, 34);
  const opacity = seededValue(index + 3, 0.025, 0.07);
  const duration = seededValue(index + 5, 32, 58);
  const initialX = seededValue(index + 7, 2, 96);
  const initialY = seededValue(index + 11, 8, 92);
  const driftX = seededValue(index + 13, -4, 4);
  const driftY = seededValue(index + 17, 8, 22);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.92,
        x: `${initialX}vw`,
        y: `${initialY}vh`,
      }}
      animate={{
        opacity: [opacity, opacity * 1.35, opacity],
        scale: [0.92, 1, 0.92],
        x: [`${initialX}vw`, `${initialX + driftX}vw`, `${initialX}vw`],
        y: [`${initialY}vh`, `${initialY - driftY}vh`, `${initialY}vh`],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay: index * 0.35,
        ease: 'linear',
      }}
      className="fixed pointer-events-none z-0 select-none blur-[1px]"
      style={{ fontSize: `${size}px` }}
    >
      {emoji}
    </motion.div>
  );
};

const EmojiParticles = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {emojis.map((emoji, index) => (
      <FloatingEmoji key={`${emoji}-${index}`} emoji={emoji} index={index} />
    ))}
  </div>
);

export default EmojiParticles;
