// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// CRITICAL FIX: Clear corrupted storage on startup
const clearCorruptedStorage = () => {
  console.log('🧹 Checking for corrupted storage...')
  
  try {
    // Check if we're stuck in a loading loop
    const loadAttempts = parseInt(sessionStorage.getItem('load_attempts') || '0')
    
    if (loadAttempts > 3) {
      console.log('⚠️ Detected loading loop! Clearing all storage...')
      
      // Clear everything except version
      const version = localStorage.getItem('app_version')
      
      // Clear localStorage
      localStorage.clear()
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      // Restore version
      if (version) {
        localStorage.setItem('app_version', version)
      }
      
      console.log('✅ Storage cleared due to loading loop')
    }
    
    // Increment load attempts
    sessionStorage.setItem('load_attempts', (loadAttempts + 1).toString())
    
    // Reset after 10 seconds if app loads successfully
    setTimeout(() => {
      sessionStorage.setItem('load_attempts', '0')
    }, 10000)
    
  } catch (error) {
    console.error('Error clearing storage:', error)
  }
}

// Clear any Supabase auth tokens that might be corrupted
const clearCorruptedAuth = () => {
  try {
    const supabaseKey = Object.keys(localStorage).find(key => 
      key.includes('supabase') || key.includes('sb-')
    )
    
    if (supabaseKey) {
      try {
        const value = localStorage.getItem(supabaseKey)
        if (value) {
          JSON.parse(value) // Test if it's valid JSON
        }
      } catch (e) {
        // Corrupted JSON - clear it
        console.log('⚠️ Found corrupted auth token, clearing...')
        localStorage.removeItem(supabaseKey)
      }
    }
  } catch (error) {
    console.error('Error checking auth:', error)
  }
}

// Service Worker Cleanup - This is crucial!
const cleanupServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      
      for (const registration of registrations) {
        console.log('🗑️ Unregistering service worker:', registration.scope)
        await registration.unregister()
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys()
        for (const key of cacheKeys) {
          console.log('🗑️ Deleting cache:', key)
          await caches.delete(key)
        }
      }
      
      console.log('✅ Service workers and caches cleared')
    } catch (error) {
      console.error('Error cleaning service workers:', error)
    }
  }
}

// Version check with proper cleanup
const checkVersion = () => {
  const currentVersion = '3.1.0' // Increment this when you deploy fixes
  const storedVersion = localStorage.getItem('app_version')
  
  if (storedVersion !== currentVersion) {
    console.log('🔄 Version update detected, performing clean reset...')
    
    // Keep only essential items
    const keepKeys = ['app_version']
    const savedValues = {}
    
    keepKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) savedValues[key] = value
    })
    
    // Clear everything
    localStorage.clear()
    sessionStorage.clear()
    
    // Restore kept items
    Object.entries(savedValues).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })
    
    // Set new version
    localStorage.setItem('app_version', currentVersion)
    
    console.log('✅ Clean reset complete')
  }
}

// Run all cleanup functions
const initializeApp = async () => {
  console.log('🚀 Initializing GiaQueenie App...')
  
  // Step 1: Check version and clear if needed
  checkVersion()
  
  // Step 2: Clear corrupted storage
  clearCorruptedStorage()
  
  // Step 3: Clear corrupted auth
  clearCorruptedAuth()
  
  // Step 4: Cleanup service workers (this is key for the loading loop!)
  await cleanupServiceWorkers()
  
  console.log('✅ Initialization complete, mounting React...')
  
  // Mount the app
  const rootElement = document.getElementById('root')
  if (rootElement) {
    // Clear the initial loader
    const loader = rootElement.querySelector('.initial-loader')
    if (loader) {
      loader.remove()
    }
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }
  
  // Mark as successfully loaded
  sessionStorage.setItem('load_attempts', '0')
}

// Start the app
initializeApp().catch(error => {
  console.error('❌ Failed to initialize app:', error)
  
  // Show error message to user
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0A0A0A;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #D4AF37; margin-bottom: 20px;">GiaQueenie</h1>
          <p style="color: white; margin-bottom: 20px;">Having trouble loading? Let's fix that.</p>
          <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" 
                  style="background: #D4AF37; color: black; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Click to Reset & Reload
          </button>
        </div>
      </div>
    `
  }
})