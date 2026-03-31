import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [promotion, setPromotion] = useState(null)
  const [promoCode, setPromoCode] = useState('')

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    const savedPromo = localStorage.getItem('promotion')
    if (savedPromo) {
      setPromotion(JSON.parse(savedPromo))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (promotion) {
      localStorage.setItem('promotion', JSON.stringify(promotion))
    } else {
      localStorage.removeItem('promotion')
    }
  }, [promotion])

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
    toast.success('Added to cart')
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
    toast.success('Removed from cart')
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    setPromotion(null)
    setPromoCode('')
  }

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getDiscount = () => {
    if (!promotion) return 0
    const subtotal = getSubtotal()
    
    if (promotion.type === 'percentage') {
      return (subtotal * promotion.value) / 100
    } else {
      return promotion.value
    }
  }

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount())
  }

  const applyPromotion = async (code) => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .single()

      if (error) throw error

      const now = new Date()
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)

      if (now >= startDate && now <= endDate) {
        setPromotion(data)
        setPromoCode(code.toUpperCase())
        toast.success('Promotion applied!')
        return true
      } else {
        toast.error('Promotion expired')
        return false
      }
    } catch (error) {
      toast.error('Invalid promotion code')
      return false
    }
  }

  const removePromotion = () => {
    setPromotion(null)
    setPromoCode('')
    toast.success('Promotion removed')
  }

  const createOrder = async (userId, paymentMethod, paymentDetails, shippingAddress) => {
  try {
    // First, get the user's email from auth
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single()
    
    if (userError) {
      console.error('User fetch error:', userError)
    }
    
    const orderData = {
      user_id: userId,
      total: getTotal(),
      status: 'pending_confirmation',
      payment_method: paymentMethod,
      payment_details: paymentDetails,
      shipping_address: shippingAddress,
      customer_notes: shippingAddress.notes || '',
      created_at: new Date().toISOString()
    }
    
    console.log('Creating order with data:', orderData)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('Order insert error:', orderError)
      throw new Error(orderError.message)
    }
    
    console.log('Order created:', order)

    // Create order items - simplified to only use columns that exist
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name || 'Product',
      // Only include image if the column exists (it will be added by SQL above)
      image: item.images?.[0] || null
    }))

    console.log('Order items to insert:', orderItems)

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items error:', itemsError)
      throw new Error(itemsError.message)
    }

    // Update product stock
    for (const item of cart) {
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id)
      
      if (stockError) {
        console.error('Stock update error:', stockError)
      }
    }

    toast.success('Order placed successfully! Please upload payment proof to confirm.')
    return order
  } catch (error) {
    console.error('Create order error:', error)
    toast.error('Error creating order: ' + error.message)
    throw error
  }
}

  const value = {
    cart,
    promotion,
    promoCode,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getDiscount,
    getTotal,
    applyPromotion,
    removePromotion,
    createOrder
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}