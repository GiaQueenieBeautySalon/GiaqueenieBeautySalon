// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase, checkAndFixAuth, resetAuthState } from '../services/supabaseClient'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let mounted = true
    let authCheckAttempts = 0
    const MAX_AUTH_ATTEMPTS = 3

    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        
        // Check if we're stuck in an auth loop
        const authAttempts = parseInt(sessionStorage.getItem('auth_attempts') || '0')
        if (authAttempts > MAX_AUTH_ATTEMPTS) {
          console.log('⚠️ Auth loop detected, resetting...')
          await resetAuthState()
          sessionStorage.setItem('auth_attempts', '0')
        }
        
        sessionStorage.setItem('auth_attempts', (authAttempts + 1).toString())
        
        const session = await checkAndFixAuth()
        
        if (!mounted) return
        
        if (session?.user) {
          console.log('✅ Session found for:', session.user.email)
          setUser(session.user)
          await checkAdminStatus(session.user.id)
        } else {
          console.log('❌ No session found')
          setUser(null)
          setIsAdmin(false)
        }
        
        // Reset auth attempts on success
        sessionStorage.setItem('auth_attempts', '0')
        
      } catch (error) {
        console.error('Auth init error:', error)
        setAuthError(error.message)
        
        if (mounted) {
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event)
      
      if (!mounted) return
      
      // Prevent rapid auth state changes
      if (event === 'TOKEN_REFRESHED' && authCheckAttempts > 5) {
        console.log('⚠️ Too many token refreshes, skipping...')
        return
      }
      
      authCheckAttempts++
      
      // Reset after 30 seconds
      setTimeout(() => {
        authCheckAttempts = 0
      }, 30000)
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAdmin(false)
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setUser(session.user)
        await checkAdminStatus(session.user.id)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const checkAdminStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Admin check error:', error)
        setIsAdmin(false)
        return
      }

      const isUserAdmin = data?.role === 'admin'
      console.log('👑 Is admin?', isUserAdmin)
      setIsAdmin(isUserAdmin)
      
    } catch (error) {
      console.error('Admin check error:', error)
      setIsAdmin(false)
    }
  }

  const signUp = async (username, password) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        toast.error('Username already taken')
        return { error: 'Username already taken' }
      }

      const email = `${username}@giaqueenie.com`
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            username: username,
            email: email,
            role: 'user'
          }])

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        toast.success(`Welcome to GiaQueenie, ${username}!`)
        return { data: authData }
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Registration failed')
      return { error }
    }
  }

  const signIn = async (username, password) => {
    try {
      const cleanUsername = username.trim().toLowerCase()
      const email = `${cleanUsername}@giaqueenie.com`
      
      console.log('🔑 Attempting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error.message)
        
        // Check if it's a network/auth error
        if (error.message.includes('Invalid login') || error.status === 400) {
          toast.error('Invalid username or password')
        } else {
          toast.error('Login failed. Please try again.')
        }
        
        throw error
      }

      if (data.user) {
        console.log('✅ Login successful')
        setUser(data.user)
        await checkAdminStatus(data.user.id)
        toast.success(`Welcome back, ${cleanUsername}!`)
      }
      
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...')
      
      setUser(null)
      setIsAdmin(false)
      
      await supabase.auth.signOut()
      
      // Clear any lingering state
      sessionStorage.clear()
      
      toast.success('Logged out successfully')
      
      // Force reload to clean state
      window.location.href = '/'
      
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    authError,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}