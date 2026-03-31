// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Force clear cache on startup
const forceCacheClear = () => {
  const currentVersion = '3.0.0'
  const storedVersion = localStorage.getItem('app_version')
  
  if (storedVersion !== currentVersion) {
    console.log('🔄 Version update detected, clearing all caches...')
    
    // Clear all localStorage except essential items
    const essentialKeys = ['app_version']
    Object.keys(localStorage).forEach(key => {
      if (!essentialKeys.includes(key)) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister())
      })
    }
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          caches.delete(key)
        })
      })
    }
    
    localStorage.setItem('app_version', currentVersion)
    console.log('✅ Cache cleared')
  }
}

forceCacheClear()

// Add a timeout to prevent infinite loading
const rootElement = document.getElementById('root')
if (rootElement) {
  // Remove the loader after 3 seconds if React hasn't loaded
  setTimeout(() => {
    const loader = rootElement.querySelector('.loader')
    if (loader) {
      loader.style.display = 'none'
    }
  }, 3000)
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)