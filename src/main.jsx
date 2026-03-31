import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Clear any stale data on startup
const startupCleanup = () => {
  // Only clear if we detect a version mismatch
  const currentVersion = '2.0.0'
  const storedVersion = localStorage.getItem('app_version')
  
  if (storedVersion !== currentVersion) {
    console.log('🔄 Version update detected, clearing cache...')
    
    // Clear service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister())
      })
    }
    
    // Clear old caches
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          if (key.includes('giaqueenie') || key.includes('supabase')) {
            caches.delete(key)
          }
        })
      })
    }
    
    localStorage.setItem('app_version', currentVersion)
    console.log('✅ Cleanup complete')
  }
}

startupCleanup()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)