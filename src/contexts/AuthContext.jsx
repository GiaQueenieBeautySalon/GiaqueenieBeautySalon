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
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await checkAdminStatus(session.user.id)
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
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
          // Don't throw - user might still be able to login
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
      
      console.log('Attempting login for:', email)
      
      // Attempt sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error) {
        console.error('Auth error:', error)
        
        // If user doesn't exist in auth, try to create them
        if (error.message.includes('Invalid login credentials')) {
          // Check if this is a valid user in our users table
          const { data: userData } = await supabase
            .from('users')
            .select('username, email')
            .eq('username', cleanUsername)
            .single()
          
          if (userData) {
            // User exists in users table but not in auth - create auth account
            const tempPassword = password || 'temporary123'
            const { data: newAuth, error: createError } = await supabase.auth.signUp({
              email: userData.email || email,
              password: tempPassword,
              options: {
                data: { username: cleanUsername }
              }
            })
            
            if (createError) {
              console.error('Auth creation error:', createError)
              toast.error('Account exists but needs setup. Please contact support.')
              throw createError
            }
            
            if (newAuth.user) {
              // Update user id to match auth
              await supabase
                .from('users')
                .update({ id: newAuth.user.id })
                .eq('username', cleanUsername)
              
              // Try login again
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email: userData.email || email,
                password: tempPassword
              })
              
              if (!retryError && retryData.user) {
                setUser(retryData.user)
                await checkAdminStatus(retryData.user.id)
                toast.success(`Welcome back, ${cleanUsername}!`)
                return retryData
              }
            }
          }
        }
        
        toast.error('Invalid username or password')
        throw error
      }

      if (data.user) {
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setIsAdmin(false)
      toast.success('Logged out successfully')
      
      // Redirect to home
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