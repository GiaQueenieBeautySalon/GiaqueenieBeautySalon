import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import ProductCard from '../components/ui/ProductCard'
import GlassCard from '../components/ui/GlassCard'
import { IoSearch } from 'react-icons/io5'
import toast from 'react-hot-toast'

const Shop = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'Hair Care', name: 'Hair Care' },
    { id: 'Hair Tools', name: 'Hair Tools' },
    { id: 'Aromatherapy', name: 'Aromatherapy' },
    { id: 'Wedding Packages', name: 'Wedding Packages' },
    { id: 'Bags', name: 'Bags' },
    { id: 'Gift Cards', name: 'Gift Cards' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' }
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, selectedCategory, sortBy, searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    setFilteredProducts(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-24">
        <div className="text-primary-gold text-xl">Loading luxury collection...</div>
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
            Our Collection
          </h1>
          <div className="w-20 h-0.5 bg-primary-gold mx-auto mb-6" />
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Discover premium beauty essentials curated for the discerning clientele
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-card text-white placeholder-white/40 focus:outline-none focus:border-primary-gold"
          />
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-6 py-2 rounded-full transition-all duration-300 whitespace-nowrap text-sm
                  ${selectedCategory === category.id
                    ? 'bg-primary-gold text-dark-100'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-card px-4 py-2 text-white bg-transparent cursor-pointer text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-dark">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <GlassCard className="p-12">
              <p className="text-white/60 text-lg">No products found matching your criteria.</p>
            </GlassCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop