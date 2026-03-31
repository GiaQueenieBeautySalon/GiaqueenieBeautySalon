// src/utils/setupAdmin.js - Remove auto-login
import { supabase } from '../services/supabaseClient'

export const setupAdminUser = async () => {
  console.log('🔧 Setting up admin user...')
  
  try {
    // Check if admin exists in users table
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .eq('username', 'corner')
      .single()

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.username)
      // DO NOT auto-login - just return
      return existingAdmin
    }

    // Create new admin user in auth
    console.log('Creating new admin user...')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'corner@giaqueenie.com',
      password: 'cornerdooadmin4life',
      options: {
        data: { username: 'corner' }
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return null
    }

    if (authData.user) {
      // Create admin profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          username: 'corner',
          email: 'corner@giaqueenie.com',
          role: 'admin'
        }])

      if (profileError) {
        console.error('Profile creation error:', profileError)
      } else {
        console.log('✅ Admin user created successfully!')
      }
      
      // IMPORTANT: DO NOT auto-login
      return authData.user
    }
  } catch (error) {
    console.error('Admin setup error:', error)
  }
}