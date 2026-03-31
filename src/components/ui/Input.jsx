import React from 'react'

const Input = ({ 
  label, 
  type = 'text', 
  className = '', 
  error,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-white/80 text-sm font-medium">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
          text-white placeholder-white/40 focus:outline-none focus:border-primary-gold 
          transition-all duration-300 ${error ? 'border-red-500' : ''} ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

export default Input