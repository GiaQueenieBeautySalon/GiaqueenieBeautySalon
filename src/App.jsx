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
const Reset = lazy(() => import('./pages/Reset'))
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
  const [dataVersion, setDataVersion] = useState(0) // Add this to force re-renders

  // REAL-TIME SUBSCRIPTIONS - THIS IS THE FIX
  useEffect(() => {
    console.log('🔌 Setting up real-time subscriptions...')
    
    // Subscribe to ALL database changes
    const channels = [
      // Products changes
      supabase
        .channel('products-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' }, 
          (payload) => {
            console.log('📦 Products changed:', payload.eventType)
            setDataVersion(v => v + 1)
            // Dispatch custom event for components to refresh
            window.dispatchEvent(new CustomEvent('productsUpdated', { detail: payload }))
          }
        )
        .subscribe(),
      
      // Services changes
      supabase
        .channel('services-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'services' }, 
          (payload) => {
            console.log('💇 Services changed:', payload.eventType)
            setDataVersion(v => v + 1)
            window.dispatchEvent(new CustomEvent('servicesUpdated', { detail: payload }))
          }
        )
        .subscribe(),
      
      // Pages changes
      supabase
        .channel('pages-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pages' }, 
          (payload) => {
            console.log('📄 Pages changed:', payload.eventType)
            fetchDynamicPages() // Immediately refresh pages
            setDataVersion(v => v + 1)
            window.dispatchEvent(new CustomEvent('pagesUpdated', { detail: payload }))
          }
        )
        .subscribe(),
      
      // Orders changes
      supabase
        .channel('orders-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders' }, 
          (payload) => {
            console.log('🛒 Orders changed:', payload.eventType)
            setDataVersion(v => v + 1)
            window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: payload }))
          }
        )
        .subscribe(),
      
      // Users changes
      supabase
        .channel('users-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'users' }, 
          (payload) => {
            console.log('👤 Users changed:', payload.eventType)
            setDataVersion(v => v + 1)
            window.dispatchEvent(new CustomEvent('usersUpdated', { detail: payload }))
          }
        )
        .subscribe(),
      
      // Hero media changes
      supabase
        .channel('hero-media-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'hero_media' }, 
          (payload) => {
            console.log('🎬 Hero media changed:', payload.eventType)
            setDataVersion(v => v + 1)
            window.dispatchEvent(new CustomEvent('heroMediaUpdated', { detail: payload }))
          }
        )
        .subscribe(),
      
      // Promotions changes
      supabase
        .channel('promotions-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'promotions' }, 
          (payload) => {
            console.log('🏷️ Promotions changed:', payload.eventType)
            setDataVersion(v => v + 1)
            window.dispatchEvent(new CustomEvent('promotionsUpdated', { detail: payload }))
          }
        )
        .subscribe(),
      
      // Payment methods changes
      supabase
        .channel('payment-methods-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'payment_methods' }, 
          (payload) => {
            console.log('💳 Payment methods changed:', payload.eventType)
            setDataVersion(v => v + 1)
            window.dispatchEvent(new CustomEvent('paymentMethodsUpdated', { detail: payload }))
          }
        )
        .subscribe()
    ]

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔌 Cleaning up real-time subscriptions...')
      channels.forEach(channel => channel.unsubscribe())
    }
  }, [])

  useEffect(() => {
    // Run admin setup once
    const initAdmin = async () => {
      try {
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
              <Route path="/" element={<Home key={`home-${dataVersion}`} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shop" element={<Shop key={`shop-${dataVersion}`} />} />
              <Route path="/services" element={<Services key={`services-${dataVersion}`} />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard key={`dashboard-${dataVersion}`} /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin key={`admin-${dataVersion}`} /></AdminRoute>} />
              <Route path="/reset" element={<Reset />} />
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