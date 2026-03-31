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
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await checkAdminStatus(session.user.id)
        }
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await checkAdminStatus(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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

      setIsAdmin(data?.role === 'admin')
      console.log('Admin status:', data?.role === 'admin')
    } catch (error) {
      console.error('Admin check error:', error)
      setIsAdmin(false)
    }
  }

  const signUp = async (username, password) => {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        toast.error('Username already taken')
        return { error: 'Username already taken' }
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username}@giaqueenie.com`,
        password: password,
        options: {
          data: { username }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
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
      
      // Special case for admin - check the exact email
      let email = ''
      if (cleanUsername === 'corner') {
        email = 'corner@giaqueenie.com'
      } else {
        email = `${cleanUsername}@giaqueenie.com`
      }
      
      console.log('Attempting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error) {
        console.error('Login error:', error)
        toast.error('Invalid username or password')
        throw error
      }

      if (data.user) {
        console.log('Login successful:', data.user.email)
        setUser(data.user)
        await checkAdminStatus(data.user.id)
        
        // Check if this is the admin
        if (data.user.email === 'corner@giaqueenie.com') {
          toast.success('Welcome Admin!')
        } else {
          toast.success(`Welcome back, ${cleanUsername}!`)
        }
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setIsAdmin(false)
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