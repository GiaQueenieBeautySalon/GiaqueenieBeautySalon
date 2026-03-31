// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../services/supabaseClient'
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
        }
        
        if (session?.user) {
          console.log('✅ Session found for:', session.user.email)
          setUser(session.user)
          await checkAdminStatus(session.user.id)
        } else {
          console.log('❌ No session found')
          setUser(null)
          setIsAdmin(false)
          localStorage.removeItem('isAdmin')
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event)
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAdmin(false)
        localStorage.removeItem('isAdmin')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await checkAdminStatus(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (userId) => {
    try {
      console.log('Checking admin for user ID:', userId)
      
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
      
      if (isUserAdmin) {
        localStorage.setItem('isAdmin', 'true')
      }
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

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username}@giaqueenie.com`,
        password: password,
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
            email: `${username}@giaqueenie.com`,
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
        email: email,
        password: password
      })

      if (error) {
        console.error('Login error:', error.message)
        toast.error('Invalid username or password')
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
      toast.error('Invalid username or password')
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...')
      
      setUser(null)
      setIsAdmin(false)
      localStorage.removeItem('isAdmin')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Logged out successfully')
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