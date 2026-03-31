import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// PERMANENT FIX: Destroy all service workers and caches
if ('serviceWorker' in navigator) {
  // Kill all existing service workers
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister()
      console.log('🔴 Service worker killed')
    }
  })
  
  // Block any new service workers
  navigator.serviceWorker.register = () => {
    console.warn('⚠️ Service workers are disabled for this app')
    return Promise.reject(new Error('Service workers are disabled'))
  }
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(keys => {
    keys.forEach(key => {
      caches.delete(key)
      console.log('🗑️ Cache deleted:', key)
    })
  })
}

// Clear localStorage except for critical items
const criticalKeys = ['supabase.auth.token']
Object.keys(localStorage).forEach(key => {
  if (!criticalKeys.includes(key)) {
    localStorage.removeItem(key)
  }
})

// Clear sessionStorage
sessionStorage.clear()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)