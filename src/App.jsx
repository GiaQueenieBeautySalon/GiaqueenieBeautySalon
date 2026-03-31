import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Footer from './components/layout/Footer'
import { supabase } from './services/supabaseClient'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Shop from './pages/Shop'
import Services from './pages/Services'
import Admin from './pages/Admin'
import DynamicPage from './pages/DynamicPage'
import Cart from './pages/Cart'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-primary-gold">Loading...</div></div>
  if (!user) return <Navigate to="/login" />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-primary-gold">Loading...</div></div>
  if (!user || !isAdmin) return <Navigate to="/dashboard" />
  return children
}

// Custom component to handle conditional footer
const ConditionalFooter = () => {
  const location = useLocation()
  const { user } = useAuth()
  
  // Check if current route is dashboard or admin (pages with sidebar)
  const isDashboardRoute = location.pathname === '/dashboard' || location.pathname === '/admin'
  
  // For dashboard routes, we want a different footer behavior
  if (isDashboardRoute) {
    return (
      <div className="dashboard-footer">
        <Footer />
      </div>
    )
  }
  
  // For regular pages, use normal footer
  return <Footer />
}

function AppContent() {
  const [dynamicPages, setDynamicPages] = useState([])

  useEffect(() => {
    fetchDynamicPages()
  }, [])

  const fetchDynamicPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('slug')
      .eq('active', true)
    setDynamicPages(data || [])
  }

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/services" element={<Services />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            {dynamicPages.map(page => (
              <Route key={page.slug} path={`/${page.slug}`} element={<DynamicPage slug={page.slug} />} />
            ))}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ConditionalFooter />
        <BottomNav />
      </div>
      <Toaster position="bottom-center" toastOptions={{ 
        style: { 
          background: '#1A1A1A', 
          color: '#FFF', 
          border: '1px solid #D4AF37' 
        } 
      }} />
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}

export default App