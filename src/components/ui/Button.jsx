import React from 'react'
import { motion } from 'framer-motion'

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const variants = {
    primary: 'bg-primary-gold text-black hover:bg-primary-rose hover:shadow-lg hover:shadow-primary-gold/50',
    secondary: 'border-2 border-primary-gold text-primary-gold hover:bg-primary-gold/20 hover:border-primary-rose hover:text-primary-rose',
    outline: 'border border-white/20 text-white hover:border-primary-gold hover:text-primary-gold'
  }

  return (
    <motion.button
      type={type}
      className={`
        px-8 py-3 rounded-full font-semibold transition-all duration-300 
        transform hover:scale-105 active:scale-95
        ${variants[variant]} 
        ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  )
}

export default Button