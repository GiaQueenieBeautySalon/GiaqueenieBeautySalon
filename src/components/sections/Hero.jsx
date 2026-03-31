import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Hero = () => {
  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch(e => {
        console.log('Auto-play prevented:', e)
        setVideoError(true)
      })
    }
  }, [videoError])

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Video */}
      {!videoError ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
        >
          <source
            src="https://player.vimeo.com/external/434045863.sd.mp4?s=1c12b2d8c7a6d4e8f9a0b1c2d3e4f5a6b7c8d9e0&profile_id=164"
            type="video/mp4"
          />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/20 via-dark to-primary-rose/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-primary-gold">Loading luxury experience...</p>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Gradient Overlays for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6"
          >
            <span className="text-primary-gold drop-shadow-lg">GiaQueenie</span>
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
            <Link to="/shop" className="btn-primary inline-block text-center">
              Shop Now
            </Link>
            <Link to="/services" className="btn-secondary inline-block text-center">
              Book Service
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
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
  )
}

export default Hero