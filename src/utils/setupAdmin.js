// src/utils/setupAdmin.js
import { supabase } from '../services/supabaseClient'

export const setupAdminUser = async () => {
  console.log('🔧 Setting up admin user...')
  
  try {
    // First, check if admin already exists in users table
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .eq('username', 'corner')
      .single()

    if (existingAdmin) {
      console.log('Admin user exists:', existingAdmin)
      
      // Check if they have an auth account by trying to get session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || session.user?.email !== existingAdmin.email) {
        console.log('Admin exists but not logged in - trying to sign in...')
        
        // Try to sign in with admin credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: existingAdmin.email,
          password: 'cornerdooadmin4life'
        })
        
        if (signInError) {
          console.log('Admin auth account missing - creating...')
          
          // Create auth account for admin
          const { data: newAuth, error: createError } = await supabase.auth.signUp({
            email: existingAdmin.email,
            password: 'cornerdooadmin4life',
            options: {
              data: { username: 'corner' }
            }
          })
          
          if (createError) {
            console.error('Failed to create admin auth:', createError)
          } else if (newAuth.user) {
            // Update users table with correct auth ID
            await supabase
              .from('users')
              .update({ id: newAuth.user.id })
              .eq('username', 'corner')
            
            console.log('✅ Admin auth account created!')
          }
        }
      } else {
        console.log('✅ Admin has auth account and is logged in')
      }
      
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
      throw authError
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
        console.log('Username: corner')
        console.log('Password: cornerdooadmin4life')
      }
      
      return authData.user
    }
  } catch (error) {
    console.error('Admin setup error:', error)
  }
}