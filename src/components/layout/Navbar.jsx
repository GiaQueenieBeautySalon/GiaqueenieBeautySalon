import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { IoMenu, IoClose, IoBag, IoPerson, IoLogOut, IoGrid } from 'react-icons/io5'
import { supabase } from '../../services/supabaseClient'

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dynamicPages, setDynamicPages] = useState([])
  const [cartCount, setCartCount] = useState(0)

  // Fetch dynamic pages whenever the component mounts
  useEffect(() => {
    fetchDynamicPages()
    
    // Set up real-time subscription for pages changes
    const pagesSubscription = supabase
      .channel('pages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pages' }, 
        () => {
          // Refresh pages when any change occurs
          fetchDynamicPages()
        }
      )
      .subscribe()
    
    return () => {
      pagesSubscription.unsubscribe()
    }
  }, [])

  const fetchDynamicPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('slug, title')
        .eq('active', true)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setDynamicPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    setCartCount(count)
  }

  // Listen for cart updates
  useEffect(() => {
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    
    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount)
    
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/services', label: 'Services' },
    ...dynamicPages.map(page => ({ 
      path: `/${page.slug}`, 
      label: page.title,
      // Optional: add a key for React
      key: page.slug
    }))
  ]

  const handleLogout = async () => {
    await signOut()
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="GiaQueenie" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white/80 hover:text-primary-gold transition-colors text-sm uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative">
              <IoBag size={22} className="text-white hover:text-primary-gold transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-gold text-dark-100 text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-lg bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30 transition-all text-sm"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full bg-primary-gold text-black font-semibold hover:bg-primary-rose transition-all text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full border border-primary-gold text-primary-gold hover:bg-primary-gold/10 transition-all text-sm"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card rounded-none border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/80 hover:text-primary-gold transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block text-white/80 hover:text-primary-gold transition-colors py-2">
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-primary-gold py-2"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white py-2"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-red-400 w-full text-left py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block btn-primary text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block btn-secondary text-center"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar