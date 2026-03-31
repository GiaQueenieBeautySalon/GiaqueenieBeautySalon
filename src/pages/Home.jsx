import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const Home = () => {
  const videoRef = useRef(null)
  const [heroMedia, setHeroMedia] = useState(null)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [featuredServices, setFeaturedServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeroMedia()
    fetchFeaturedItems()
  }, [])

  const fetchHeroMedia = async () => {
    try {
      const { data } = await supabase
        .from('hero_media')
        .select('*')
        .eq('active', true)
        .limit(1)
      
      if (data && data.length > 0) {
        setHeroMedia(data[0])
      }
    } catch (error) {
      console.error('Error loading hero media:', error)
    }
  }

  const fetchFeaturedItems = async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(4)
      
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .limit(3)
      
      setFeaturedProducts(products || [])
      setFeaturedServices(services || [])
    } catch (error) {
      console.error('Error fetching featured items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {heroMedia && heroMedia.url && heroMedia.type === 'video' ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.log('Video play error:', e))
              }
            }}
          >
            <source src={heroMedia.url} type="video/mp4" />
          </video>
        ) : heroMedia && heroMedia.url && heroMedia.type === 'image' ? (
          <img 
            src={heroMedia.url} 
            alt="Hero" 
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/30 via-dark to-primary-rose/30" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6"
            >
              <img src="/logo.svg" alt="GiaQueenie" className="h-20 mx-auto" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6"
            >
              <span className="gold-text">GiaQueenie</span>
              <br />
              <span className="text-white drop-shadow-lg">Beauty Salon</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-lg"
            >
              Where Beauty Meets Excellence
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/shop">
                <Button>Shop Now</Button>
              </Link>
              <Link to="/services">
                <Button variant="secondary">Book Service</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-2.5 bg-primary-gold rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display gold-text mb-4">
                Featured Collection
              </h2>
              <div className="w-20 h-0.5 bg-primary-gold mx-auto mb-6" />
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Discover our most coveted products
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="group overflow-hidden h-full">
                    <div className="relative aspect-square overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-gold/20 to-primary-rose/20 flex items-center justify-center">
                          <span className="text-white/40">No image</span>
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-primary-gold/90 backdrop-blur-sm rounded-full">
                          <span className="text-xs font-semibold text-dark-100">Featured</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-display text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold gold-text">${product.price}</span>
                        <Link to="/shop" className="px-4 py-2 rounded-full bg-primary-gold text-dark-100 font-semibold hover:bg-primary-rose transition-all">
                          Shop
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-transparent to-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display gold-text mb-4">
                Signature Services
              </h2>
              <div className="w-20 h-0.5 bg-primary-gold mx-auto mb-6" />
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Experience our luxury treatments
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="group overflow-hidden h-full">
                    <div className="relative h-64 overflow-hidden">
                      {service.images && service.images[0] ? (
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-gold/20 to-primary-rose/20 flex items-center justify-center">
                          <span className="text-white/40">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-display text-white mb-3">{service.name}</h3>
                      <p className="text-white/60 mb-6 line-clamp-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold gold-text">${service.price}</span>
                          <p className="text-white/40 text-sm">{service.duration} mins</p>
                        </div>
                        <Link to="/services">
                          <Button variant="secondary" className="px-6 py-2 text-sm">Book</Button>
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home