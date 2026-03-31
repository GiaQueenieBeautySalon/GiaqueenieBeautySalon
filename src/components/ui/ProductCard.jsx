import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IoHeart, IoHeartOutline, IoBagOutline } from 'react-icons/io5'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabaseClient'
import toast from 'react-hot-toast'
import GlassCard from './GlassCard'

const ProductCard = ({ product, index }) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      checkFavorite()
    }
  }, [user, product.id])

  const checkFavorite = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single()
    
    setIsFavorite(!!data)
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites')
      return
    }

    setLoading(true)
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
        setIsFavorite(false)
        toast.success('Removed from favorites')
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: product.id })
        setIsFavorite(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error('Error updating favorites')
    } finally {
      setLoading(false)
    }
  }

  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="group overflow-hidden h-full">
        <div className="relative aspect-square overflow-hidden">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://placehold.co/400x400/1A1A1A/D4AF37?text=GiaQueenie'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-gold/20 to-primary-rose/20 flex items-center justify-center">
              <img src="/logo.svg" alt="GiaQueenie" className="w-16 h-16 opacity-30" />
            </div>
          )}
          
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="absolute top-4 right-4 p-2 glass-card rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            {isFavorite ? (
              <IoHeart className="text-primary-gold" size={20} />
            ) : (
              <IoHeartOutline className="text-white" size={20} />
            )}
          </button>

          {product.featured && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-primary-gold/90 backdrop-blur-sm rounded-full">
              <span className="text-xs font-semibold text-dark-100">Featured</span>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-display text-white mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-white/60 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold gold-text">
                ${product.price}
              </span>
              {product.compare_price && (
                <span className="text-sm text-white/40 line-through ml-2">
                  ${product.compare_price}
                </span>
              )}
            </div>
            
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="px-4 py-2 rounded-full bg-primary-gold text-dark-100 font-semibold 
                       transition-all duration-300 hover:bg-primary-rose hover:scale-105 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoBagOutline className="inline mr-1" />
              Add
            </button>
          </div>

          {product.stock < 10 && product.stock > 0 && (
            <p className="text-xs text-primary-gold mt-2 animate-pulse">
              Only {product.stock} left
            </p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default ProductCard