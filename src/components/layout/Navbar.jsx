import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { IoMenu, IoClose, IoBag } from 'react-icons/io5'
import { supabase } from '../../services/supabaseClient'

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dynamicPages, setDynamicPages] = useState([])
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchDynamicPages()
    
    const pagesSubscription = supabase
      .channel('pages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pages' }, 
        () => fetchDynamicPages()
      )
      .subscribe()
    
    return () => {
      pagesSubscription.unsubscribe()
    }
  }, [])

  const fetchDynamicPages = async () => {
    try {
      const { data } = await supabase
        .from('pages')
        .select('slug, title')
        .eq('active', true)
        .order('created_at', { ascending: true })
      
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

  useEffect(() => {
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
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
      label: page.title
    }))
  ]

  const handleLogout = async () => {
    await signOut()
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0 safe-padding-top">
      <div className="nav-container">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="GiaQueenie" className="h-8 sm:h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white/80 hover:text-primary-gold transition-colors text-xs lg:text-sm uppercase tracking-wider whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Link to="/cart" className="relative p-2">
              <IoBag size={20} className="text-white hover:text-primary-gold transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-gold text-dark-100 text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30 transition-all text-xs lg:text-sm whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all text-xs lg:text-sm whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs lg:text-sm whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <Link
                  to="/login"
                  className="px-4 lg:px-5 py-1.5 lg:py-2 rounded-full bg-primary-gold text-black font-semibold hover:bg-primary-rose transition-all text-xs lg:text-sm whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 lg:px-5 py-1.5 lg:py-2 rounded-full border border-primary-gold text-primary-gold hover:bg-primary-gold/10 transition-all text-xs lg:text-sm whitespace-nowrap"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
            <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/80 hover:text-primary-gold transition-colors py-3 text-base min-h-[44px]"
                >
                  {link.label}
                </Link>
              ))}
              
              <Link 
                to="/cart" 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center justify-between text-white/80 hover:text-primary-gold transition-colors py-3 min-h-[44px]"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-primary-gold text-dark-100 px-2 py-0.5 rounded-full text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-primary-gold py-3 text-base min-h-[44px]"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white py-3 text-base min-h-[44px]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-red-400 w-full text-left py-3 text-base min-h-[44px]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block btn-primary text-center py-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block btn-secondary text-center py-3"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar