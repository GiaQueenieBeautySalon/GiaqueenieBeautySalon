import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import ProductCard from '../components/ui/ProductCard'
import ServiceCard from '../components/ui/ServiceCard'
import GlassCard from '../components/ui/GlassCard'

const DynamicPage = ({ slug }) => {
  const [page, setPage] = useState(null)
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPageData()
  }, [slug])

  const fetchPageData = async () => {
    setLoading(true)
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single()

      if (pageError) {
        // If page not found or not active, redirect to home after a short delay
        if (pageError.code === 'PGRST116') {
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 2000)
          throw new Error('Page not found')
        }
        throw pageError
      }
      setPage(pageData)

      if (pageData.products && pageData.products.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('id', pageData.products)
        setProducts(productsData || [])
      }

      if (pageData.services && pageData.services.length > 0) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .in('id', pageData.services)
        setServices(servicesData || [])
      }
    } catch (error) {
      console.error('Error fetching page:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-24">
        <div className="text-primary-gold text-xl">Loading...</div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-24">
        <div className="text-center">
          <img src="/logo.svg" alt="GiaQueenie" className="h-16 mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-display gold-text mb-4">Page Not Found</h1>
          <p className="text-white/60 mb-6">The page you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        {page.hero_video && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[50vh] rounded-2xl overflow-hidden mb-12"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
            >
              <source src={page.hero_video} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            <div className="relative h-full flex items-center justify-center text-center px-4">
              <div>
                <h1 className="text-4xl md:text-6xl font-display gold-text mb-4">
                  {page.title}
                </h1>
                {page.content && (
                  <p className="text-white/80 text-lg max-w-2xl mx-auto">
                    {page.content}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!page.hero_video && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display gold-text mb-4">
              {page.title}
            </h1>
            <div className="w-20 h-0.5 bg-primary-gold mx-auto mb-6" />
            {page.content && (
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {page.content}
              </p>
            )}
          </motion.div>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-display gold-text mb-8 text-center">
              Our Collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Services Section */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-display gold-text mb-8 text-center">
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {products.length === 0 && services.length === 0 && (
          <GlassCard className="p-12 text-center">
            <p className="text-white/60 text-lg">Content coming soon...</p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

export default DynamicPage