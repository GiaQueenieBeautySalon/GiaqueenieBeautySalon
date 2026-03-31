// src/App.jsx
import React, { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Footer from './components/layout/Footer'
import { supabase } from './services/supabaseClient'
import { setupAdminUser } from './utils/setupAdmin'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Shop = lazy(() => import('./pages/Shop'))
const Services = lazy(() => import('./pages/Services'))
const Admin = lazy(() => import('./pages/Admin'))
const DynamicPage = lazy(() => import('./pages/DynamicPage'))
const Cart = lazy(() => import('./pages/cart'))

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user || !isAdmin) return <Navigate to="/dashboard" />
  return children
}

function AppContent() {
  const [dynamicPages, setDynamicPages] = useState([])
  const { user, loading } = useAuth()

  // src/App.jsx - Update the useEffect that calls setupAdmin
useEffect(() => {
  // Run admin setup once but DO NOT auto-login
  const initAdmin = async () => {
    try {
      // Just check/create admin, don't login automatically
      await setupAdminUser()
    } catch (error) {
      console.error('Admin setup error:', error)
    }
  }
  initAdmin()
}, [])

  useEffect(() => {
    fetchDynamicPages()
    
    // Fix auth state on mount
    const fixAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        localStorage.removeItem('supabase.auth.token')
      }
    }
    fixAuth()
  }, [])

  const fetchDynamicPages = async () => {
    try {
      const { data } = await supabase
        .from('pages')
        .select('slug')
        .eq('active', true)
      setDynamicPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  // Don't show anything while loading to prevent flash
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        </main>
        <Footer />
        <BottomNav />
      </div>
      <Toaster 
        position="bottom-center" 
        toastOptions={{ 
          style: { 
            background: '#1A1A1A', 
            color: '#FFF', 
            border: '1px solid #D4AF37' 
          } 
        }} 
      />
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