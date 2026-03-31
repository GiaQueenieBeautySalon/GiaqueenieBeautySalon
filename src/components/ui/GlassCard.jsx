import React from 'react'
import { motion } from 'framer-motion'

const GlassCard = ({ children, className = '', hover = true, onClick, ...props }) => {
  return (
    <motion.div
      className={`
        backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl
        ${hover ? 'transition-all duration-500 hover:bg-white/10 hover:border-primary-gold/50 hover:shadow-2xl hover:-translate-y-1' : ''}
        ${className}
      `}
      whileHover={hover ? { y: -5 } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard