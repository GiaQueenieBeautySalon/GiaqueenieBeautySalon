import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import ServiceCard from '../components/ui/ServiceCard'
import GlassCard from '../components/ui/GlassCard'
import { IoSearch } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { useRealtime } from '../hooks/useRealtime'  // <-- ADD THIS LINE

const Services = () => {
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // ============================================
  // REAL-TIME UPDATES - ADD THIS
  // ============================================
  useRealtime('services', () => {
    console.log('💇 Services updated, refreshing...')
    fetchServices()
  })
  // ============================================

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true })
      
      if (error) throw error
      setServices(data || [])
      setFilteredServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Error loading services')
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = [...services]
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredServices(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-24">
        <div className="text-primary-gold text-xl">Loading luxury services...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display gold-text mb-4">
            Premium Services
          </h1>
          <div className="w-20 h-0.5 bg-primary-gold mx-auto mb-6" />
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Experience the pinnacle of beauty and wellness treatments
          </p>
          
          <div className="max-w-md mx-auto relative">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass-card text-white placeholder-white/40 focus:outline-none focus:border-primary-gold"
            />
          </div>
        </motion.div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <GlassCard className="p-12">
              <p className="text-white/60 text-lg">No services found matching "{searchTerm}"</p>
            </GlassCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Services