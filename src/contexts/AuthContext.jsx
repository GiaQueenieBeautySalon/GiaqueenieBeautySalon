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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await checkAndSetAdminStatus(currentUser.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await checkAndSetAdminStatus(currentUser.id)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAndSetAdminStatus = async (userId) => {
    try {
      // First check if user exists in users table
      let { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      // If user doesn't exist, create them
      if (error && error.code === 'PGRST116') {
        const { data: authUser } = await supabase.auth.getUser()
        const username = authUser.user?.user_metadata?.username || authUser.user?.email?.split('@')[0] || 'user'
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            username: username,
            email: authUser.user?.email,
            role: username === 'corner' ? 'admin' : 'user'
          }])
          .select()
          .single()
        
        if (!insertError && newUser) {
          userData = newUser
        }
      }
      
      const isAdminUser = userData?.role === 'admin'
      setIsAdmin(isAdminUser)
      
      // Store admin status in localStorage for quick access
      if (isAdminUser) {
        localStorage.setItem('isAdmin', 'true')
      } else {
        localStorage.removeItem('isAdmin')
      }
      
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  const signUp = async (username, password) => {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()
      
      if (existing) {
        toast.error('Username already exists')
        return
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
        // Create user record
        const { error: insertError } = await supabase.from('users').insert([{
          id: authData.user.id,
          username: username,
          email: `${username}@giaqueenie.com`,
          role: 'user'
        }])
        
        if (insertError) throw insertError
        
        // Auto login after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: `${username}@giaqueenie.com`,
          password: password
        })
        
        if (signInError) throw signInError
        toast.success(`Welcome to GiaQueenie, ${username}!`)
        return authData
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      throw error
    }
  }

  const signIn = async (username, password) => {
    try {
      // Special admin login
      if (username === 'corner' && password === 'cornerdooadmin4life') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'corner@giaqueenie.com',
          password: 'cornerdooadmin4life'
        })
        
        if (error && error.message === 'Invalid login credentials') {
          // Admin doesn't exist, create it
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'corner@giaqueenie.com',
            password: 'cornerdooadmin4life',
            options: { 
              data: { username: 'corner' }
            }
          })
          
          if (signUpError) throw signUpError
          
          if (signUpData.user) {
            await supabase.from('users').insert([{
              id: signUpData.user.id,
              username: 'corner',
              email: 'corner@giaqueenie.com',
              role: 'admin'
            }])
          }
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'corner@giaqueenie.com',
            password: 'cornerdooadmin4life'
          })
          
          if (loginError) throw loginError
          toast.success('Welcome Admin!')
          return loginData
        }
        
        if (error) throw error
        toast.success('Welcome Admin!')
        return data
      }
      
      // Regular user login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@giaqueenie.com`,
        password: password
      })

      if (error) throw error
      
      toast.success(`Welcome back, ${username}!`)
      return data
    } catch (error) {
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
      localStorage.removeItem('isAdmin')
      toast.success('Logged out successfully')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}