// src/pages/Reset.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resetAuthState } from '../services/supabaseClient'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const Reset = () => {
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')

  const handleFullReset = async () => {
    setResetting(true)
    setMessage('Clearing all data...')
    
    try {
      // Clear EVERYTHING
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear all caches
      if ('caches' in window) {
        const keys = await caches.keys()
        for (const key of keys) {
          await caches.delete(key)
        }
      }
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const reg of registrations) {
          await reg.unregister()
        }
      }
      
      // Reset auth
      await resetAuthState()
      
      setMessage('Reset complete! Redirecting to home...')
      
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
      
    } catch (error) {
      console.error('Reset error:', error)
      setMessage('Error during reset: ' + error.message)
      setResetting(false)
    }
  }

  const handleSoftReset = async () => {
    setResetting(true)
    setMessage('Performing soft reset...')
    
    try {
      // Only clear auth-related items
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      sessionStorage.clear()
      
      await resetAuthState()
      
      setMessage('Reset complete! Redirecting to login...')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (error) {
      console.error('Reset error:', error)
      setMessage('Error during reset: ' + error.message)
      setResetting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-24">
      <GlassCard className="max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-display gold-text mb-4">Reset App</h1>
        <p className="text-white/60 mb-6">
          If the app is stuck loading or having issues, use these reset options.
        </p>
        
        {message && (
          <div className="mb-6 p-4 glass-card bg-primary-gold/10">
            <p className="text-primary-gold">{message}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <Button 
            onClick={handleSoftReset} 
            disabled={resetting}
            className="w-full"
          >
            Soft Reset (Clear Auth)
          </Button>
          
          <Button 
            onClick={handleFullReset} 
            variant="secondary"
            disabled={resetting}
            className="w-full"
          >
            Full Reset (Clear Everything)
          </Button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full text-white/40 hover:text-white transition-colors py-2"
          >
            Go Back
          </button>
        </div>
        
        <p className="text-white/40 text-xs mt-6">
          Need help? Contact support at support@giaqueenie.com
        </p>
      </GlassCard>
    </div>
  )
}

export default Reset