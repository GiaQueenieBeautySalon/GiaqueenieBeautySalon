import React from 'react'
import { motion } from 'framer-motion'
import { IoTimeOutline, IoCalendarOutline } from 'react-icons/io5'
import GlassCard from './GlassCard'
import Button from './Button'
import toast from 'react-hot-toast'

const ServiceCard = ({ service, index }) => {
  const handleBook = () => {
    toast.success(`Booking request sent for ${service.name}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
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
              <img src="/logo.svg" alt="GiaQueenie" className="w-16 h-16 opacity-30" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-display text-white mb-3">
            {service.name}
          </h3>
          <p className="text-white/60 mb-6 line-clamp-3">
            {service.description}
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white/80">
              <IoTimeOutline size={18} />
              <span>{service.duration} mins</span>
            </div>
            <div className="text-2xl font-bold gold-text">
              ${service.price}
            </div>
          </div>
          
          <Button onClick={handleBook} className="w-full">
            <IoCalendarOutline className="inline mr-2" />
            Book Now
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default ServiceCard