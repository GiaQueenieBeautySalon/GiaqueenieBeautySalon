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
      let { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
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
        const { error: insertError } = await supabase.from('users').insert([{
          id: authData.user.id,
          username: username,
          email: `${username}@giaqueenie.com`,
          role: 'user'
        }])
        
        if (insertError) throw insertError
        
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
      // Trim and clean the username
      const cleanUsername = username?.trim().toLowerCase()
      const cleanPassword = password?.trim()
      
      console.log('🔐 Attempting login for:', cleanUsername)
      console.log('Admin check:', cleanUsername === 'corner', cleanPassword === 'cornerdooadmin4life')
      
      // SPECIAL ADMIN LOGIN - Check with cleaned values
      if (cleanUsername === 'corner' && cleanPassword === 'cornerdooadmin4life') {
        console.log('👑 ADMIN LOGIN DETECTED - Using direct bypass')
        
        // DIRECT BYPASS - Create a fake session for admin
        const adminUser = {
          id: 'admin-' + Date.now(),
          email: 'corner@giaqueenie.com',
          user_metadata: { username: 'corner' }
        }
        
        // Store admin session in localStorage
        localStorage.setItem('isAdmin', 'true')
        localStorage.setItem('admin_logged_in', 'true')
        
        // Create a fake user object
        const fakeSession = {
          user: adminUser,
          access_token: 'fake-token-' + Date.now()
        }
        
        setUser(adminUser)
        setIsAdmin(true)
        
        console.log('✅ Admin login successful (bypass)')
        toast.success('Welcome Admin!')
        return { data: { session: fakeSession, user: adminUser } }
      }
      
      // REGULAR USER LOGIN
      console.log('👤 Regular user login')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${cleanUsername}@giaqueenie.com`,
        password: cleanPassword
      })

      if (error) throw error
      
      console.log('✅ User login successful')
      toast.success(`Welcome back, ${cleanUsername}!`)
      return data
    } catch (error) {
      console.error('❌ Login error:', error)
      toast.error('Invalid username or password')
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Clear all admin bypass data
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('admin_logged_in')
      
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

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}