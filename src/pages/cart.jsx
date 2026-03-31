import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { IoTrash, IoAdd, IoRemove, IoArrowBack, IoCloudUpload, IoCheckmarkCircle, IoCopy, IoDocumentText, IoWallet } from 'react-icons/io5'
import toast from 'react-hot-toast'

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getSubtotal, 
    getDiscount, 
    getTotal,
    applyPromotion,
    removePromotion,
    promotion,
    promoCode,
    createOrder
  } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [promoInput, setPromoInput] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
    phone: ''
  })
  const [customerNotes, setCustomerNotes] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)
  const [uploadingProof, setUploadingProof] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const fetchPaymentMethods = async () => {
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('active', true)
    setPaymentMethods(data || [])
  }

  const loadUserProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('username, phone, address')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setShippingAddress(prev => ({
        ...prev,
        full_name: data.username || '',
        phone: data.phone || ''
      }))
    }
  }

  const handleApplyPromo = async () => {
    await applyPromotion(promoInput)
    setPromoInput('')
  }

  // Step 1: User sees payment details, then clicks "I have paid"
  const handleProceedToPayment = () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method')
      return
    }
    if (!shippingAddress.full_name || !shippingAddress.address_line1 || !shippingAddress.city) {
      toast.error('Please fill in your shipping address')
      return
    }
    setShowPaymentDetails(true)
  }

  // Step 2: Place order after user has paid
  const handlePlaceOrder = async () => {
  if (!user) {
    toast.error('Please login to checkout')
    navigate('/login')
    return
  }

  try {
    // Create order first
    const orderData = {
      user_id: user.id,
      total: getTotal(),
      status: 'pending',
      payment_method: selectedPayment.name,
      payment_details: selectedPayment.fields || [],
      shipping_address: shippingAddress,
      customer_notes: customerNotes,
      created_at: new Date().toISOString()
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('Order error:', orderError)
      toast.error('Error creating order: ' + orderError.message)
      return
    }

    console.log('Order created with ID:', order.id)
    setOrderId(order.id)  // Make sure this is set
    
    // Create order items
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.images?.[0] || null
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items error:', itemsError)
    }

    setOrderPlaced(true)
    toast.success('Order placed! Please upload your payment proof.')
    
  } catch (error) {
    console.error('Order failed:', error)
    toast.error('Error creating order: ' + error.message)
  }
}

  // In Cart.jsx - Replace your handleUploadPaymentProof function with this
const handleUploadPaymentProof = async () => {
  if (!paymentProof) {
    toast.error('Please select a payment proof image')
    return
  }

  setUploadingProof(true)
  const toastId = toast.loading('Uploading payment proof...')
  
  try {
    console.log('Starting upload...', paymentProof.name)
    
    // Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', paymentProof)
    formData.append('upload_preset', 'giaqueenie')
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dncv9mquq/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    const data = await response.json()
    
    if (data.error) {
      console.error('Cloudinary error:', data.error)
      throw new Error(data.error.message)
    }
    
    const proofUrl = data.secure_url
    console.log('✅ Upload successful! URL:', proofUrl)
    
    // IMPORTANT: First check if order exists
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()
    
    if (checkError) {
      console.error('Order check error:', checkError)
      toast.error('Order not found. Please try again.')
      setUploadingProof(false)
      return
    }
    
    console.log('Found order:', existingOrder)
    
    // Update order with payment proof URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_proof: proofUrl,
        status: 'pending_confirmation',
        payment_confirmed: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
    
    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }
    
    // Verify the update worked
    const { data: verifyOrder, error: verifyError } = await supabase
      .from('orders')
      .select('payment_proof, status')
      .eq('id', orderId)
      .single()
    
    console.log('✅ Verification after update:', verifyOrder)
    
    if (verifyError) {
      console.error('Verify error:', verifyError)
    }
    
    if (!verifyOrder?.payment_proof) {
      console.error('❌ Payment proof not saved!')
      toast.error('Failed to save payment proof. Please try again.')
      setUploadingProof(false)
      return
    }
    
    toast.success('Payment proof uploaded! Admin will confirm soon.', { id: toastId })
    
    // Clear cart
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
    
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error('Upload failed: ' + error.message, { id: toastId })
  } finally {
    setUploadingProof(false)
  }
}

  if (cart.length === 0 && !showCheckout && !orderPlaced) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.svg" alt="GiaQueenie" className="h-16 mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-display gold-text mb-4">Your Cart is Empty</h1>
          <p className="text-white/60 mb-8">Discover our luxury collection</p>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show payment details before order placement
  if (showPaymentDetails && selectedPayment && !orderPlaced) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowPaymentDetails(false)}
            className="mb-6 flex items-center gap-2 text-white/60 hover:text-primary-gold transition-colors"
          >
            <IoArrowBack size={20} />
            <span>Back to Checkout</span>
          </button>

          <GlassCard className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-gold/20 flex items-center justify-center mx-auto mb-3">
                <IoWallet className="text-2xl text-primary-gold" />
              </div>
              <h2 className="text-2xl font-display gold-text">Payment Details</h2>
              <p className="text-white/60 text-sm mt-2">
                Please make payment to the details below
              </p>
            </div>

            {/* Payment Instructions */}
<div className="glass-card p-4">
  <p className="text-primary-gold text-sm font-semibold mb-3">Payment Instructions:</p>
  
  {selectedPayment.fields && selectedPayment.fields.length > 0 ? (
    <div className="space-y-3">
      <p className="text-white/60 text-xs">Please make payment to:</p>
      {selectedPayment.fields.map((field, idx) => (
        <div key={idx} className="bg-white/10 p-3 rounded-lg">
          <p className="text-white/40 text-xs mb-1">{field.label}</p>
          <p className="text-white font-mono text-lg break-all" id={`payment-value-${idx}`}>
            {field.value || field.placeholder || 'Information provided by admin'}
          </p>
          <button
            onClick={() => {
              const textToCopy = field.value || field.placeholder || ''
              if (textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                  .then(() => {
                    toast.success(`${field.label} copied!`)
                  })
                  .catch(() => {
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea')
                    textarea.value = textToCopy
                    document.body.appendChild(textarea)
                    textarea.select()
                    document.execCommand('copy')
                    document.body.removeChild(textarea)
                    toast.success(`${field.label} copied!`)
                  })
              } else {
                toast.error('Nothing to copy')
              }
            }}
            className="mt-2 text-primary-gold text-xs hover:underline flex items-center gap-1"
          >
            <IoCopy size={12} /> Copy {field.label}
          </button>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-white/60">Contact admin for payment details</p>
  )}
  
  {selectedPayment.qr_code && (
    <div className="mt-4 text-center">
      <p className="text-white/60 text-xs mb-2">Scan QR Code to Pay:</p>
      <img 
        src={selectedPayment.qr_code} 
        alt="QR Code" 
        className="w-48 h-48 object-contain mx-auto rounded-lg"
      />
    </div>
  )}
  
  <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
    <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Important:</p>
    <p className="text-white/60 text-xs">
      1. Make payment to the details above<br />
      2. Take a screenshot or photo of your payment receipt<br />
      3. Click "I Have Paid" below to complete your order
    </p>
  </div>
</div>

            <Button onClick={handlePlaceOrder} className="w-full py-3 text-lg">
              ✅ I Have Paid
            </Button>
          </GlassCard>
        </div>
      </div>
    )
  }

  // Show proof upload after order placed
  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4 flex items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <IoCheckmarkCircle className="text-4xl text-green-500" />
          </div>
          <h1 className="text-2xl font-display gold-text mb-2">Order Placed!</h1>
          <p className="text-white/60 mb-2">Order ID: {orderId?.slice(0, 12)}...</p>
          <p className="text-white/80 mb-6">Please upload your payment proof to confirm your order.</p>
          
          <div className="space-y-4">
            <div className="glass-card p-4">
              <label className="block text-white/80 text-sm mb-2">Payment Proof (Screenshot/Receipt)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProof(e.target.files[0])}
                className="w-full text-white/60 text-sm"
              />
              {paymentProof && (
                <p className="text-primary-gold text-xs mt-2">Selected: {paymentProof.name}</p>
              )}
            </div>
            
            <textarea
              placeholder="Additional notes for admin (optional)"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="input-luxury text-sm"
              rows="3"
            />
            
            <Button 
              onClick={handleUploadPaymentProof} 
              disabled={uploadingProof}
              className="w-full"
            >
              {uploadingProof ? 'Uploading...' : '📸 Upload Payment Proof'}
            </Button>
            
            <Link to="/dashboard">
              <Button variant="secondary" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    )
  }

  // Shopping Cart View
  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-display gold-text mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <GlassCard className="p-4 flex gap-4">
                    {item.images && item.images[0] && (
                      <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <p className="text-primary-gold font-bold">${item.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white/10 rounded transition-all"
                        >
                          <IoRemove size={16} />
                        </button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white/10 rounded transition-all"
                        >
                          <IoAdd size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-red-500 hover:text-red-400 transition-all"
                        >
                          <IoTrash size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div>
            <GlassCard className="p-6">
              <h2 className="text-xl font-display gold-text mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">${getSubtotal().toFixed(2)}</span>
                </div>
                {promotion && (
                  <div className="flex justify-between text-primary-gold">
                    <span>Discount</span>
                    <span>-${getDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-primary-gold font-bold text-xl">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 px-4 py-2 glass-card text-white"
                  />
                  <Button onClick={handleApplyPromo} className="px-4">Apply</Button>
                </div>
                {promotion && (
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-primary-gold text-sm">Code: {promoCode}</span>
                    <button onClick={removePromotion} className="text-red-500 text-sm hover:text-red-400">Remove</button>
                  </div>
                )}
              </div>

              {!showCheckout ? (
                <Button onClick={() => setShowCheckout(true)} className="w-full">
                  Proceed to Checkout
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Shipping Address Section */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <IoDocumentText /> Shipping Address
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={shippingAddress.full_name}
                        onChange={(e) => setShippingAddress({...shippingAddress, full_name: e.target.value})}
                        className="input-luxury text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1 *"
                        value={shippingAddress.address_line1}
                        onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})}
                        className="input-luxury text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={shippingAddress.address_line2}
                        onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})}
                        className="input-luxury text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City *"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="input-luxury text-sm"
                        />
                        <input
                          type="text"
                          placeholder="State *"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                          className="input-luxury text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                          className="input-luxury text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Phone *"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                          className="input-luxury text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Select Payment Method</h3>
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method)}
                        className={`w-full p-3 rounded-xl text-left transition-all mb-2 ${
                          selectedPayment?.id === method.id
                            ? 'bg-primary-gold/20 border border-primary-gold'
                            : 'glass-card hover:bg-white/10'
                        }`}
                      >
                        <span className="text-white font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    placeholder="Order notes (optional)"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="input-luxury text-sm"
                    rows="2"
                  />
                  
                  <div className="flex gap-3">
                    <Button onClick={() => setShowCheckout(false)} variant="secondary" className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleProceedToPayment} className="flex-1">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart