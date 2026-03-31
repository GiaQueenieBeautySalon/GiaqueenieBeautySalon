import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { uploadToCloudinary, uploadMultipleToCloudinary, uploadVideoToCloudinary } from '../services/cloudinary'
import toast from 'react-hot-toast'
import { 
  IoAnalyticsOutline, 
  IoPeopleOutline, 
  IoBagOutline, 
  IoPricetagOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoImageOutline,
  IoCreateOutline,
  IoCardOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCreateOutline as IoEditOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoSettingsOutline,
  IoMenuOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoStatsChartOutline
} from 'react-icons/io5'

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('analytics')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Data states
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [pages, setPages] = useState([])
  const [promotions, setPromotions] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [heroMedia, setHeroMedia] = useState([])
  const [contactInfo, setContactInfo] = useState({})
  const [socialLinks, setSocialLinks] = useState([])
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [uploading, setUploading] = useState(false)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalServices: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0
  })

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: IoAnalyticsOutline, description: 'View store performance' },
    { id: 'products', label: 'Products', icon: IoBagOutline, description: 'Manage your products' },
    { id: 'services', label: 'Services', icon: IoPricetagOutline, description: 'Manage your services' },
    { id: 'orders', label: 'Orders', icon: IoCalendarOutline, description: 'Track customer orders' },
    { id: 'users', label: 'Users', icon: IoPeopleOutline, description: 'Manage customers' },
    { id: 'pages', label: 'Pages', icon: IoCreateOutline, description: 'Create dynamic pages' },
    { id: 'promotions', label: 'Promotions', icon: IoWalletOutline, description: 'Discount codes' },
    { id: 'payments', label: 'Payments', icon: IoCardOutline, description: 'Payment methods' },
    { id: 'media', label: 'Media', icon: IoImageOutline, description: 'Hero videos & images' },
    { id: 'settings', label: 'Settings', icon: IoSettingsOutline, description: 'Store settings' }
  ]

  const categories = ['Hair Care', 'Hair Tools', 'Aromatherapy', 'Wedding Packages', 'Bags', 'Gift Cards']

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'analytics':
          await fetchAnalytics()
          break
        case 'products':
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
          if (productsError) throw productsError
          setProducts(productsData || [])
          break
        case 'services':
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false })
          if (servicesError) throw servicesError
          setServices(servicesData || [])
          break
        case 'orders':
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*, users(username)')
            .order('created_at', { ascending: false })
          if (ordersError) throw ordersError
          setOrders(ordersData || [])
          break
        case 'users':
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (usersError) {
    console.error('Users fetch error:', usersError)
    throw usersError
  }
  
  console.log('Fetched users:', usersData) // Add this to debug
  setUsers(usersData || [])
  break
        case 'pages':
          case 'pages':
  const { data: pagesData, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })
  if (pagesError) throw pagesError
  setPages(pagesData || [])
  
  // Also fetch products and services for the dropdowns
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, price')
  const { data: allServices } = await supabase
    .from('services')
    .select('id, name, price, duration')
  
  setProducts(allProducts || [])
  setServices(allServices || [])
  break
        case 'promotions':
          const { data: promotionsData, error: promotionsError } = await supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: false })
          if (promotionsError) throw promotionsError
          setPromotions(promotionsData || [])
          break
        case 'payments':
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payment_methods')
            .select('*')
          if (paymentsError) throw paymentsError
          setPaymentMethods(paymentsData || [])
          break
        case 'media':
          const { data: mediaData, error: mediaError } = await supabase
            .from('hero_media')
            .select('*')
            .order('created_at', { ascending: false })
          if (mediaError) throw mediaError
          setHeroMedia(mediaData || [])
          break
        case 'settings':
          await fetchSettings()
          break
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    toast.success('Data refreshed')
    setRefreshing(false)
  }

  const fetchAnalytics = async () => {
    try {
      // Get ALL users count
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (userError) {
        console.error('User count error:', userError)
      }
      
      // Get ALL orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
      
      if (ordersError) {
        console.error('Orders error:', ordersError)
      }
      
      // Get product count
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      // Get service count
      const { count: serviceCount, error: serviceError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
      
      const orders = ordersData || []
      
      // Calculate totals safely
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const completedOrders = orders.filter(o => o.status === 'completed').length
      
      // Calculate last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const monthlyOrders = orders.filter(o => {
        if (!o.created_at) return false
        return new Date(o.created_at) >= thirtyDaysAgo
      })
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      
      setStats({
        totalUsers: userCount || 0,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        totalProducts: productCount || 0,
        totalServices: serviceCount || 0,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        monthlyRevenue: monthlyRevenue
      })
      
    } catch (error) {
      console.error('Analytics fetch error:', error)
      toast.error('Error loading analytics')
    }
  }

  const fetchSettings = async () => {
    const { data: contact } = await supabase.from('contact_info').select('*').limit(1)
    if (contact && contact.length > 0) setContactInfo(contact[0])
    const { data: social } = await supabase.from('social_links').select('*')
    setSocialLinks(social || [])
  }

  const handleDelete = async (table, id) => {
  if (window.confirm('Are you sure you want to delete this? This action cannot be undone.')) {
    try {
      console.log('Deleting from:', table, 'ID:', id)
      
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select()
      
      if (error) {
        console.error('Delete error:', error)
        throw error
      }
      
      console.log('Delete response:', data)
      toast.success('Deleted successfully')
      
      // Refresh the data after deletion
      await fetchData()
      
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error deleting: ' + error.message)
    }
  }
}
  const handleMediaDelete = async (id) => {
    if (window.confirm('Delete this media permanently?')) {
      try {
        const { error } = await supabase.from('hero_media').delete().eq('id', id)
        if (error) throw error
        toast.success('Media deleted')
        await fetchData()
      } catch (error) {
        toast.error('Error deleting media')
      }
    }
  }

  const handleImageUpload = async (files, setLocalImages) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const toastId = toast.loading(`Uploading ${files.length} image(s)...`)
    try {
      const urls = await uploadMultipleToCloudinary(files, activeTab)
      if (setLocalImages) {
        setLocalImages(urls)
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...urls]
        }))
      }
      toast.success(`${files.length} image(s) uploaded`, { id: toastId })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed: ' + error.message, { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (savedData) => {
    try {
      let table = ''
      let saveData = { ...(savedData || formData) }
      
      switch (activeTab) {
        case 'products':
          table = 'products'
          if (saveData.price) saveData.price = parseFloat(saveData.price)
          if (saveData.compare_price) saveData.compare_price = parseFloat(saveData.compare_price)
          if (saveData.stock) saveData.stock = parseInt(saveData.stock)
          break
        case 'services':
  table = 'services'
  // Validate required fields
  if (!saveData.name) {
    toast.error('Service name is required')
    return
  }
  if (!saveData.price || saveData.price <= 0) {
    toast.error('Valid price is required')
    return
  }
  if (!saveData.duration || saveData.duration <= 0) {
    toast.error('Valid duration is required')
    return
  }
  if (saveData.price) saveData.price = parseFloat(saveData.price)
  if (saveData.duration) saveData.duration = parseInt(saveData.duration)
  break
        case 'pages':
          table = 'pages'
          // Ensure required fields have values
          if (!saveData.slug) {
            toast.error('Page slug is required')
            return
          }
          if (!saveData.title) {
            toast.error('Page title is required')
            return
          }
          // Make sure products and services are arrays
          saveData.products = saveData.products || []
          saveData.services = saveData.services || []
          break
        case 'promotions':
          table = 'promotions'
          if (saveData.value) saveData.value = parseFloat(saveData.value)
          break
        case 'payments':
  table = 'payment_methods'
  // Validate required fields
  if (!saveData.name || saveData.name.trim() === '') {
    toast.error('Payment method name is required')
    return
  }
  // Ensure fields is an array
  if (!saveData.fields) {
    saveData.fields = []
  }
  if (typeof saveData.fields === 'string') {
    try {
      saveData.fields = JSON.parse(saveData.fields)
    } catch (e) {
      saveData.fields = []
    }
  }
  // Ensure fields is always an array
  saveData.fields = Array.isArray(saveData.fields) ? saveData.fields : []
  break
        default:
          toast.error('Invalid section')
          return
      }

      // Remove empty values
      Object.keys(saveData).forEach(key => {
        if (saveData[key] === undefined || saveData[key] === null || saveData[key] === '') {
          delete saveData[key]
        }
      })

      console.log('Saving to table:', table, 'Data:', saveData)

      if (editingItem) {
        // Update existing item
        const { data, error } = await supabase
          .from(table)
          .update(saveData)
          .eq('id', editingItem.id)
          .select()
        
        if (error) {
          console.error('Update error:', error)
          throw error
        }
        console.log('Update response:', data)
        toast.success('Updated successfully')
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from(table)
          .insert([saveData])
          .select()
        
        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        console.log('Insert response:', data)
        toast.success('Added successfully')
      }
      
      setShowModal(false)
      setEditingItem(null)
      setFormData({})
      await fetchData()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Error saving: ' + error.message)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
      
      if (error) throw error
      toast.success(`Order marked as ${status}`)
      await fetchData()
    } catch (error) {
      toast.error('Error updating order: ' + error.message)
    }
  }

  const updateUserRole = async (userId, role) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
      
      if (error) throw error
      toast.success(`User role updated to ${role}`)
      await fetchData()
    } catch (error) {
      toast.error('Error updating user role: ' + error.message)
    }
  }

  const handleHeroUpload = async (file, type) => {
    if (!file) return
    setUploading(true)
    const toastId = toast.loading(`Uploading ${type}...`)
    try {
      let url
      if (type === 'video') {
        url = await uploadVideoToCloudinary(file, 'hero')
      } else {
        url = await uploadToCloudinary(file, 'hero')
      }
      
      // Insert new media
      const { error } = await supabase
        .from('hero_media')
        .insert([{ type, url, active: false }])
      
      if (error) throw error
      
      toast.success(`${type} uploaded!`, { id: toastId })
      await fetchData()
    } catch (error) {
      toast.error('Upload failed: ' + error.message, { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const updateContactInfo = async () => {
    try {
      const { error } = await supabase
        .from('contact_info')
        .upsert({ id: contactInfo.id || '00000000-0000-0000-0000-000000000001', ...contactInfo })
      if (error) throw error
      toast.success('Contact info updated')
      await fetchSettings()
    } catch (error) {
      toast.error('Error updating contact info: ' + error.message)
    }
  }

  const updateSocialLink = async (platform, url) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .upsert({ platform, url, active: true })
      if (error) throw error
      toast.success(`${platform} link updated`)
      await fetchSettings()
    } catch (error) {
      toast.error('Error updating social link: ' + error.message)
    }
  }

  const setActiveHeroMedia = async (id) => {
    try {
      await supabase.from('hero_media').update({ active: false })
      await supabase.from('hero_media').update({ active: true }).eq('id', id)
      toast.success('Hero media activated')
      await fetchData()
    } catch (error) {
      toast.error('Error activating media')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'processing': return 'bg-blue-500/20 text-blue-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-white/10 text-white/60'
    }
  }

  const getFilteredOrders = () => {
    let filtered = [...orders]
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus)
    }
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.users?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }

  const getFilteredProducts = () => {
    let filtered = [...products]
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }

  const getFilteredServices = () => {
    let filtered = [...services]
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }

  const getFilteredUsers = () => {
    let filtered = [...users]
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setShowModal(true)
  }

  const openAddModal = () => {
  setEditingItem(null)
  if (activeTab === 'products') {
    setFormData({ name: '', description: '', price: '', compare_price: '', stock: '', category: '', featured: false, images: [] })
  } else if (activeTab === 'services') {
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      duration: '', 
      images: [] 
    })
  } else if (activeTab === 'pages') {
    setFormData({ 
      slug: '', 
      title: '', 
      hero_video: '', 
      content: '', 
      products: [], 
      services: [], 
      active: true 
    })
  } else if (activeTab === 'promotions') {
    setFormData({ code: '', type: 'percentage', value: '', start_date: '', end_date: '', active: true })
  } else if (activeTab === 'payments') {
    setFormData({ name: '', fields: [], qr_code: '', active: true })
  }
  setShowModal(true)
}

  // Analytics Section
  const AnalyticsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center mx-auto mb-2">
            <IoPeopleOutline className="text-xl text-primary-gold" />
          </div>
          <p className="text-white/50 text-xs">Total Users</p>
          <p className="text-2xl font-bold gold-text">{stats.totalUsers}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center mx-auto mb-2">
            <IoBagOutline className="text-xl text-primary-gold" />
          </div>
          <p className="text-white/50 text-xs">Total Orders</p>
          <p className="text-2xl font-bold gold-text">{stats.totalOrders}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center mx-auto mb-2">
            <IoWalletOutline className="text-xl text-primary-gold" />
          </div>
          <p className="text-white/50 text-xs">Total Revenue</p>
          <p className="text-2xl font-bold gold-text">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center mx-auto mb-2">
            <IoPricetagOutline className="text-xl text-primary-gold" />
          </div>
          <p className="text-white/50 text-xs">Products</p>
          <p className="text-2xl font-bold gold-text">{stats.totalProducts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-lg font-display gold-text mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Pending Orders</span>
              <span className="text-yellow-400 font-bold text-xl">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Completed Orders</span>
              <span className="text-green-400 font-bold text-xl">{stats.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Total Orders</span>
              <span className="text-primary-gold font-bold text-xl">{stats.totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-lg font-display gold-text mb-4">Revenue Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Total Revenue</span>
              <span className="text-primary-gold font-bold text-xl">${stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Last 30 Days</span>
              <span className="text-green-400 font-bold text-xl">${stats.monthlyRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Avg Order Value</span>
              <span className="text-white font-bold text-xl">
                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Products Section
  const ProductsSection = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-card text-white rounded-lg text-sm"
          />
        </div>
        <button onClick={openAddModal} className="btn-primary py-2 text-sm">
          <IoAddOutline className="inline mr-1" /> Add Product
        </button>
      </div>
      
      <div className="space-y-3">
        {getFilteredProducts().map(product => (
          <div key={product.id} className="glass-card p-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              {product.images && product.images[0] && (
                <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
              )}
              <div>
                <h3 className="text-white font-semibold">{product.name}</h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="text-primary-gold font-bold">${product.price}</span>
                  <span className="text-white/60 text-sm">Stock: {product.stock}</span>
                  {product.category && <span className="text-white/40 text-sm">{product.category}</span>}
                  {product.featured && <span className="text-primary-gold text-xs">Featured</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEditModal(product)} className="p-2 hover:bg-white/10 rounded-lg text-primary-gold">
                <IoEditOutline size={18} />
              </button>
              <button onClick={() => handleDelete('products', product.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                <IoTrashOutline size={18} />
              </button>
            </div>
          </div>
        ))}
        {getFilteredProducts().length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-white/60">No products found</p>
          </div>
        )}
      </div>
    </div>
  )

  // Services Section
  // Services Section - FIXED VERSION
const ServicesSection = () => (
  <div className="space-y-5">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 glass-card text-white rounded-lg text-sm"
        />
      </div>
      <button onClick={openAddModal} className="btn-primary py-2 text-sm">
        <IoAddOutline className="inline mr-1" /> Add Service
      </button>
    </div>
    
    <div className="space-y-3">
      {getFilteredServices().map(service => (
        <div key={service.id} className="glass-card p-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            {service.images && service.images[0] && (
              <img src={service.images[0]} alt={service.name} className="w-12 h-12 object-cover rounded-lg" />
            )}
            <div>
              <h3 className="text-white font-semibold">{service.name}</h3>
              <div className="flex gap-3 mt-1">
                <span className="text-primary-gold font-bold">${service.price}</span>
                <span className="text-white/60 text-sm">{service.duration} mins</span>
              </div>
              {service.description && (
                <p className="text-white/40 text-xs mt-1 line-clamp-1">{service.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                console.log('Editing service:', service)
                setEditingItem(service)
                setFormData({ 
                  id: service.id,
                  name: service.name || '',
                  description: service.description || '',
                  price: service.price || '',
                  duration: service.duration || '',
                  images: service.images || []
                })
                setShowModal(true)
              }} 
              className="p-2 hover:bg-white/10 rounded-lg text-primary-gold"
            >
              <IoEditOutline size={18} />
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
                  handleDelete('services', service.id)
                }
              }} 
              className="p-2 hover:bg-red-500/20 rounded-lg text-red-500"
            >
              <IoTrashOutline size={18} />
            </button>
          </div>
        </div>
      ))}
      {getFilteredServices().length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-white/60 mb-4">No services found</p>
          <button onClick={openAddModal} className="btn-primary py-2 text-sm">
            <IoAddOutline className="inline mr-1" /> Add Your First Service
          </button>
        </div>
      )}
    </div>
  </div>
)

// Orders Section - WITH WORKING DELETE FUNCTIONALITY
const OrdersSection = () => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Simplified version after running ON DELETE CASCADE SQL
const handleDeleteOrder = async (orderId, event) => {
  if (event) event.stopPropagation()
  
  if (!window.confirm('⚠️ Are you sure you want to delete this order?')) return
  
  setDeleting(true)
  try {
    // Delete order items
    await supabase.from('order_items').delete().eq('order_id', orderId)
    
    // Delete order (notifications auto-delete due to CASCADE)
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (error) throw error
    
    toast.success('Order deleted successfully')
    await fetchData()
    
    if (selectedOrder?.id === orderId) {
      setShowOrderModal(false)
      setSelectedOrder(null)
    }
  } catch (error) {
    toast.error('Error deleting order: ' + error.message)
  } finally {
    setDeleting(false)
  }
}

// Delete all orders function - COMPLETE FIX
const handleDeleteAllOrders = async () => {
  if (!window.confirm('⚠️⚠️⚠️ DANGER: This will delete ALL orders and their associated data! This action cannot be undone. Are you absolutely sure?')) {
    return
  }
  
  setDeleting(true)
  try {
    // First get all order IDs
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id')
    
    if (fetchError) throw fetchError
    
    if (!orders || orders.length === 0) {
      toast.info('No orders to delete')
      setDeleting(false)
      return
    }
    
    const orderIds = orders.map(order => order.id)
    console.log(`Found ${orderIds.length} orders to delete`)
    
    // Step 1: Delete notifications related to these orders
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .delete()
      .in('order_id', orderIds)
      .select()
    
    if (notifError) {
      console.error('Error deleting notifications:', notifError)
    } else {
      console.log(`Deleted ${notifData?.length || 0} notifications`)
    }
    
    // Step 2: Delete order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .in('order_id', orderIds)
      .select()
    
    if (itemsError) {
      console.error('Error deleting order items:', itemsError)
    } else {
      console.log(`Deleted ${itemsData?.length || 0} order items`)
    }
    
    // Step 3: Delete all orders
    const { data: deletedOrders, error: ordersError } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIds)
      .select()
    
    if (ordersError) {
      console.error('Orders delete error:', ordersError)
      throw ordersError
    }
    
    console.log(`Deleted ${deletedOrders?.length || 0} orders`)
    toast.success(`All ${orders.length} orders deleted successfully`)
    
    // Refresh orders list
    await fetchData()
    
    // Close modal if open
    setShowOrderModal(false)
    setSelectedOrder(null)
    
  } catch (error) {
    console.error('Delete all error:', error)
    toast.error('Error deleting all orders: ' + error.message)
  } finally {
    setDeleting(false)
  }
}

  const confirmPayment = async (orderId) => {
  setLoading(true)
  try {
    // CRITICAL FIX: Update order status to processing and confirm payment
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_confirmed: true,
        payment_confirmed_at: new Date().toISOString(),
        status: 'processing',  // Change from pending_confirmation to processing
        admin_notes: `Payment confirmed by admin on ${new Date().toLocaleString()}`
      })
      .eq('id', orderId)
    
    if (error) throw error
    
    toast.success('Payment confirmed! Order is now processing.')
    await fetchData()  // Refresh the orders list
    
    // Update the selected order if it's the one being confirmed
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        payment_confirmed: true,
        status: 'processing',
        payment_confirmed_at: new Date().toISOString(),
        admin_notes: selectedOrder.admin_notes || `Payment confirmed by admin on ${new Date().toLocaleString()}`
      })
    }
    
    // Also update the order in the local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, payment_confirmed: true, status: 'processing', payment_confirmed_at: new Date().toISOString() }
          : order
      )
    )
    
  } catch (error) {
    console.error('Payment confirmation error:', error)
    toast.error('Error confirming payment: ' + error.message)
  } finally {
    setLoading(false)
  }
}

  const markAsShipped = async (orderId) => {
    if (!trackingNumber) {
      toast.error('Please enter tracking number')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'shipped',
          tracking_number: trackingNumber,
          shipped_at: new Date().toISOString()
        })
        .eq('id', orderId)
      
      if (error) throw error
      toast.success('Order marked as shipped!')
      setTrackingNumber('')
      await fetchData()
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'shipped',
          tracking_number: trackingNumber,
          shipped_at: new Date().toISOString()
        })
      }
    } catch (error) {
      toast.error('Error updating order: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsDelivered = async (orderId) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', orderId)
      
      if (error) throw error
      toast.success('Order marked as delivered!')
      await fetchData()
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
      }
    } catch (error) {
      toast.error('Error updating order: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateAdminNotes = async (orderId, notes) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ admin_notes: notes })
        .eq('id', orderId)
      
      if (error) throw error
      toast.success('Notes saved')
      await fetchData()
    } catch (error) {
      toast.error('Error saving notes: ' + error.message)
    }
  }

  const getOrderStatusBadge = (order) => {
    const statusColors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      pending_confirmation: 'bg-orange-500/20 text-orange-400',
      processing: 'bg-blue-500/20 text-blue-400',
      shipped: 'bg-purple-500/20 text-purple-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    }
    
    const statusLabels = {
      pending: 'Pending Payment',
      pending_confirmation: 'Awaiting Payment Proof',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-white/10 text-white/60'}`}>
        {statusLabels[order.status] || order.status}
      </span>
    )
  }

  const OrderDetailModal = () => {
    if (!selectedOrder) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
        <div className="relative glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display gold-text">Order Details</h2>
            <div className="flex gap-2">
              <button
                onClick={(e) => handleDeleteOrder(selectedOrder.id, e)}
                disabled={deleting}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
              >
                <IoTrashOutline size={20} />
              </button>
              <button 
                onClick={() => {
                  setShowOrderModal(false)
                  setSelectedOrder(null)
                }} 
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Order Info */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs">Order ID</p>
              <p className="text-white font-mono text-sm">{selectedOrder.id}</p>
              <p className="text-white/40 text-xs mt-2">Date</p>
              <p className="text-white text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              <p className="text-white/40 text-xs mt-2">Total</p>
              <p className="text-primary-gold font-bold text-xl">${selectedOrder.total}</p>
            </div>

            {/* Customer Info */}
            <div className="glass-card p-4">
              <h3 className="text-white font-semibold mb-2">Customer Information</h3>
              <p className="text-white">Name: {selectedOrder.shipping_address?.full_name || selectedOrder.users?.username}</p>
              <p className="text-white/60 text-sm">Email: {selectedOrder.users?.email}</p>
              <p className="text-white/60 text-sm">Phone: {selectedOrder.shipping_address?.phone || 'Not provided'}</p>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shipping_address && (
              <div className="glass-card p-4">
                <h3 className="text-white font-semibold mb-2">Shipping Address</h3>
                <p className="text-white">{selectedOrder.shipping_address.full_name}</p>
                <p className="text-white/80 text-sm">{selectedOrder.shipping_address.address_line1}</p>
                {selectedOrder.shipping_address.address_line2 && (
                  <p className="text-white/80 text-sm">{selectedOrder.shipping_address.address_line2}</p>
                )}
                <p className="text-white/80 text-sm">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                <p className="text-white/80 text-sm">{selectedOrder.shipping_address.country}</p>
                <p className="text-white/80 text-sm">Phone: {selectedOrder.shipping_address.phone}</p>
              </div>
            )}

            {/* Payment Info */}
            <div className="glass-card p-4">
  <h3 className="text-white font-semibold mb-2">Payment Information</h3>
  <p className="text-white">Method: {selectedOrder.payment_method}</p>
  
  {/* Debug: Log the payment_proof URL */}
  {console.log('Payment proof URL:', selectedOrder.payment_proof)}
  
  {selectedOrder.payment_proof && (
    <div className="mt-3">
      <p className="text-white/60 text-xs mb-2">Payment Proof:</p>
      <div className="bg-white/5 rounded-lg p-3">
        {selectedOrder.payment_proof.startsWith('http') ? (
          <>
            <img 
              src={selectedOrder.payment_proof} 
              alt="Payment Proof" 
              className="max-w-full max-h-64 rounded-lg mx-auto cursor-pointer mb-2"
              style={{ objectFit: 'contain' }}
              onError={(e) => {
                console.error('Image failed to load:', selectedOrder.payment_proof)
                e.target.src = 'https://placehold.co/400x200/ff0000/ffffff?text=Image+Failed+to+Load'
              }}
              onClick={() => window.open(selectedOrder.payment_proof, '_blank')}
            />
            <button
              onClick={() => window.open(selectedOrder.payment_proof, '_blank')}
              className="text-primary-gold text-xs hover:underline w-full text-center"
            >
              View Full Image →
            </button>
          </>
        ) : (
          <p className="text-red-400 text-xs">Invalid image URL: {selectedOrder.payment_proof}</p>
        )}
      </div>
    </div>
  )}
  
  {!selectedOrder.payment_proof && selectedOrder.status === 'pending_confirmation' && (
    <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
      <p className="text-yellow-400 text-xs">Awaiting payment proof upload...</p>
    </div>
  )}
  
  <div className="mt-2">
    <span className={`px-2 py-1 rounded-full text-xs ${selectedOrder.payment_confirmed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
      {selectedOrder.payment_confirmed ? 'Payment Confirmed ✓' : 'Payment Pending'}
    </span>
  </div>
</div>

            {/* Admin Actions */}
            <div className="glass-card p-4">
  <h3 className="text-white font-semibold mb-3">Admin Actions</h3>
  
  {/* Show confirm button when payment proof exists and not confirmed */}
  {!selectedOrder.payment_confirmed && selectedOrder.payment_proof && (
    <button
      onClick={() => confirmPayment(selectedOrder.id)}
      disabled={loading}
      className="w-full mb-3 btn-primary py-2 text-sm"
    >
      {loading ? 'Processing...' : '✓ Confirm Payment Received'}
    </button>
  )}
  
  {/* Show that payment is already confirmed */}
  {selectedOrder.payment_confirmed && (
    <div className="mb-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
      <p className="text-green-400 text-sm flex items-center gap-2">
        <IoCheckmarkCircleOutline size={18} />
        Payment confirmed on {new Date(selectedOrder.payment_confirmed_at).toLocaleString()}
      </p>
    </div>
  )}
  
  {/* Show shipping options when payment is confirmed but not shipped */}
  {selectedOrder.payment_confirmed && selectedOrder.status === 'processing' && (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Enter Tracking Number"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        className="input-luxury text-sm"
      />
      <button
        onClick={() => markAsShipped(selectedOrder.id)}
        disabled={loading}
        className="w-full btn-primary py-2 text-sm"
      >
        {loading ? 'Processing...' : '📦 Mark as Shipped'}
      </button>
    </div>
  )}
  
  {/* Show shipped status */}
  {selectedOrder.status === 'shipped' && (
    <div className="space-y-3">
      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
        <p className="text-purple-400 text-sm">
          Tracking #: {selectedOrder.tracking_number || 'Not provided'}
        </p>
        <p className="text-white/60 text-xs mt-1">
          Shipped on: {new Date(selectedOrder.shipped_at).toLocaleString()}
        </p>
      </div>
      <button
        onClick={() => markAsDelivered(selectedOrder.id)}
        disabled={loading}
        className="w-full btn-primary py-2 text-sm"
      >
        {loading ? 'Processing...' : '✅ Mark as Delivered'}
      </button>
    </div>
  )}
  
  {/* Add admin notes textarea */}
  <textarea
    placeholder="Admin Notes (internal)"
    value={adminNotes}
    onChange={(e) => setAdminNotes(e.target.value)}
    className="input-luxury text-sm mt-3"
    rows="2"
  />
  <button
    onClick={() => updateAdminNotes(selectedOrder.id, adminNotes)}
    className="w-full mt-2 btn-secondary py-2 text-sm"
  >
    Save Notes
  </button>
</div>

            {/* Customer Notes */}
            {selectedOrder.customer_notes && (
              <div className="glass-card p-4">
                <h3 className="text-white font-semibold mb-2">Customer Notes</h3>
                <p className="text-white/80 text-sm">{selectedOrder.customer_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-card text-white rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-card px-3 py-2 text-white text-sm rounded-lg"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending Payment</option>
            <option value="pending_confirmation">Awaiting Proof</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          
          {/* Delete All Orders Button */}
          <button
            onClick={handleDeleteAllOrders}
            disabled={deleting}
            className="px-3 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <IoTrashOutline size={16} />
            {deleting ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {getFilteredOrders().map(order => (
          <div 
            key={order.id} 
            className="glass-card p-4 hover:border-primary-gold/30 transition-all cursor-pointer" 
            onClick={() => {
              setSelectedOrder(order)
              setTrackingNumber(order.tracking_number || '')
              setAdminNotes(order.admin_notes || '')
              setShowOrderModal(true)
            }}
          >
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <p className="text-white/40 text-xs mb-1">Order ID</p>
                <p className="text-white font-mono text-sm">{order.id.slice(0, 12)}...</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Customer</p>
                <p className="text-white text-sm">{order.users?.username || 'Guest'}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Date</p>
                <p className="text-white/80 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Total</p>
                <p className="text-primary-gold font-bold text-xl">${order.total}</p>
              </div>
              <div>
  <p className="text-white/40 text-xs mb-1">Status</p>
  <select
    value={order.status}
    onChange={(e) => {
      // Only allow status changes for non-cancelled orders
      if (order.status !== 'cancelled') {
        updateOrderStatus(order.id, e.target.value)
      }
    }}
    disabled={order.status === 'cancelled'}
    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border-none cursor-pointer bg-transparent ${order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <option value="pending" className="bg-dark">Pending Payment</option>
    <option value="pending_confirmation" className="bg-dark">Awaiting Proof</option>
    <option value="processing" className="bg-dark">Processing</option>
    <option value="shipped" className="bg-dark">Shipped</option>
    <option value="delivered" className="bg-dark">Delivered</option>
    <option value="cancelled" className="bg-dark">Cancelled</option>
  </select>
</div>
              {order.payment_proof && !order.payment_confirmed && (
                <div className="relative">
                  <span className="animate-pulse px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                    📸 Proof Uploaded
                  </span>
                </div>
              )}
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteOrder(order.id, e)
                  }}
                  disabled={deleting}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                >
                  <IoTrashOutline size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {getFilteredOrders().length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-white/60">No orders found</p>
          </div>
        )}
      </div>

      <OrderDetailModal />
    </div>
  )
}

  // Users Section
  // Users Section - FIXED VERSION
// Users Section
const UsersSection = () => (
  <div className="space-y-5">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 glass-card text-white rounded-lg text-sm"
        />
      </div>
      
      {/* THIS IS WHERE THE REFRESH BUTTON GOES */}
      <button 
        onClick={async () => {
          setLoading(true)
          await fetchData()
          setLoading(false)
        }}
        className="px-3 py-2 glass-card rounded-lg text-white/70 hover:text-white text-sm"
      >
        <IoRefreshOutline className="inline mr-1" /> Refresh Users
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {getFilteredUsers().map(user => (
        <div key={user.id} className="glass-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-semibold">{user.username}</h3>
              <p className="text-white/40 text-sm">{user.email}</p>
              <p className="text-white/30 text-xs mt-2">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <select
              value={user.role || 'user'}
              onChange={(e) => updateUserRole(user.id, e.target.value)}
              className={`px-2 py-1 rounded-full text-xs font-medium border-none cursor-pointer ${user.role === 'admin' ? 'bg-primary-gold/20 text-primary-gold' : 'bg-white/10 text-white/60'}`}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      ))}
      {getFilteredUsers().length === 0 && (
        <div className="col-span-full glass-card p-8 text-center">
          <p className="text-white/60">No users found</p>
        </div>
      )}
    </div>
  </div>
)

  // Pages Section
  // Pages Section - FIXED VERSION
// Pages Section - FIXED VERSION
const PagesSection = () => (
  <div className="space-y-5">
    <div className="flex justify-end">
      <button onClick={openAddModal} className="btn-primary py-2 text-sm">
        <IoAddOutline className="inline mr-1" /> Create Page
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pages.map(page => (
        <div key={page.id} className="glass-card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-white font-semibold">{page.title || 'Untitled'}</h3>
              <p className="text-white/40 text-sm">/{page.slug || 'no-slug'}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  // Log to see what we're getting
                  console.log('Editing page:', page)
                  console.log('Products array:', page.products)
                  console.log('Services array:', page.services)
                  
                  setEditingItem(page)
                  setFormData({ 
                    id: page.id,
                    slug: page.slug || '',
                    title: page.title || '',
                    hero_video: page.hero_video || '',
                    content: page.content || '',
                    products: page.products || [],
                    services: page.services || [],
                    active: page.active !== undefined ? page.active : true
                  })
                  setShowModal(true)
                }} 
                className="p-2 hover:bg-white/10 rounded-lg text-primary-gold"
              >
                <IoEditOutline size={16} />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
                    handleDelete('pages', page.id)
                  }
                }} 
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-500"
              >
                <IoTrashOutline size={16} />
              </button>
            </div>
          </div>
          {page.content && (
            <p className="text-white/60 text-sm line-clamp-2 mb-3">{page.content}</p>
          )}
          <div className="mt-3 flex gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs ${page.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {page.active ? 'Active' : 'Inactive'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/10">
              {page.products?.length || 0} Products
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/10">
              {page.services?.length || 0} Services
            </span>
          </div>
          <div className="mt-3 text-xs text-white/30">
            Created: {new Date(page.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
      {pages.length === 0 && (
        <div className="col-span-full glass-card p-8 text-center">
          <p className="text-white/60 mb-4">No pages created yet</p>
          <button onClick={openAddModal} className="btn-primary py-2 text-sm">
            <IoAddOutline className="inline mr-1" /> Create Your First Page
          </button>
        </div>
      )}
    </div>
  </div>
)

  // Promotions Section
  const PromotionsSection = () => (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAddModal} className="btn-primary py-2 text-sm">
          <IoAddOutline className="inline mr-1" /> Add Promotion
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map(promo => {
          const isActive = promo.active && new Date(promo.start_date) <= new Date() && new Date(promo.end_date) >= new Date()
          return (
            <div key={promo.id} className="glass-card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold text-xl">{promo.code}</h3>
                  <p className="text-primary-gold text-lg">{promo.type === 'percentage' ? `${promo.value}% OFF` : `$${promo.value} OFF`}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(promo)} className="p-2 hover:bg-white/10 rounded-lg text-primary-gold">
                    <IoEditOutline size={16} />
                  </button>
                  <button onClick={() => handleDelete('promotions', promo.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                    <IoTrashOutline size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isActive ? 'Active' : 'Expired'}
                </span>
              </div>
            </div>
          )
        })}
        {promotions.length === 0 && (
          <div className="col-span-full glass-card p-8 text-center">
            <p className="text-white/60">No promotions created yet</p>
          </div>
        )}
      </div>
    </div>
  )

  // Payments Section
  // Payments Section - FIXED with proper edit/delete and payment tags
const PaymentsSection = () => (
  <div className="space-y-5">
    <div className="flex justify-end">
      <button onClick={openAddModal} className="btn-primary py-2 text-sm">
        <IoAddOutline className="inline mr-1" /> Add Payment Method
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paymentMethods.map(method => (
        <div key={method.id} className="glass-card p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">{method.name}</h3>
              <p className="text-white/40 text-sm mt-1">
                {method.fields?.length || 0} payment fields configured
              </p>
              
              {/* Display payment fields/tags */}
              {method.fields && method.fields.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-white/60 text-xs font-semibold">Payment Details Required:</p>
                  {method.fields.map((field, idx) => (
                    <div key={idx} className="glass-card p-2 bg-white/5">
                      <p className="text-primary-gold text-xs font-medium">{field.label}</p>
                      <p className="text-white/40 text-xs break-all">{field.key}</p>
                      {field.type && (
                        <span className="text-white/30 text-xs">Type: {field.type}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {method.qr_code && (
                <div className="mt-3">
                  <p className="text-white/60 text-xs mb-1">QR Code:</p>
                  <img 
                    src={method.qr_code} 
                    alt="QR Code" 
                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => window.open(method.qr_code, '_blank')}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  console.log('Editing payment method:', method)
                  setEditingItem(method)
                  setFormData({ 
                    id: method.id,
                    name: method.name || '',
                    fields: method.fields || [],
                    qr_code: method.qr_code || '',
                    active: method.active !== undefined ? method.active : true
                  })
                  setShowModal(true)
                }} 
                className="p-2 hover:bg-white/10 rounded-lg text-primary-gold"
              >
                <IoEditOutline size={18} />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`Delete payment method "${method.name}"? This action cannot be undone.`)) {
                    handleDelete('payment_methods', method.id)
                  }
                }} 
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-500"
              >
                <IoTrashOutline size={18} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-full text-xs ${method.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {method.active ? 'Active' : 'Inactive'}
            </span>
            {method.active && (
              <span className="text-xs text-primary-gold">Visible to customers</span>
            )}
          </div>
        </div>
      ))}
      {paymentMethods.length === 0 && (
        <div className="col-span-full glass-card p-8 text-center">
          <p className="text-white/60 mb-4">No payment methods added</p>
          <button onClick={openAddModal} className="btn-primary py-2 text-sm">
            <IoAddOutline className="inline mr-1" /> Add Your First Payment Method
          </button>
        </div>
      )}
    </div>
  </div>
)

  // Media Section
  const MediaSection = () => (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h3 className="text-lg font-display gold-text mb-4">Hero Section Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Upload Hero Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleHeroUpload(e.target.files[0], 'video')}
              disabled={uploading}
              className="w-full text-white/60 text-sm"
            />
            <p className="text-white/40 text-xs mt-1">Recommended: MP4, 1920x1080</p>
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Upload Hero Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleHeroUpload(e.target.files[0], 'image')}
              disabled={uploading}
              className="w-full text-white/60 text-sm"
            />
          </div>
        </div>
        {uploading && <p className="text-primary-gold text-sm mt-3">Uploading...</p>}
      </div>

      <div>
        <h3 className="text-lg font-display gold-text mb-4">Current Hero Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {heroMedia.map(media => (
            <div key={media.id} className="glass-card p-3">
              {media.type === 'video' ? (
                <video src={media.url} className="w-full h-40 object-cover rounded-lg" controls />
              ) : (
                <img src={media.url} alt="Hero" className="w-full h-40 object-cover rounded-lg" />
              )}
              <div className="mt-3 flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded-full text-xs ${media.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
                  {media.active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  {!media.active && (
                    <button 
                      onClick={() => setActiveHeroMedia(media.id)}
                      className="px-3 py-1 rounded-lg bg-primary-gold/20 text-primary-gold text-xs"
                    >
                      Set Active
                    </button>
                  )}
                  <button 
                    onClick={() => handleMediaDelete(media.id)}
                    className="px-3 py-1 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {heroMedia.length === 0 && (
            <div className="col-span-full glass-card p-8 text-center">
              <p className="text-white/60">No hero media uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Settings Section - Enhanced with Footer Management
const SettingsSection = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'GiaQueenie',
    tagline: 'Luxury Beauty Salon',
    description: 'Experience the pinnacle of luxury beauty and wellness treatments.',
    logo: '/logo.svg',
    email: 'info@giaqueenie.com',
    phone: '+234 123 456 7890',
    address: '123 Luxury Avenue, Lagos, Nigeria',
    business_hours: 'Mon-Sat: 9am - 8pm | Sun: 12pm - 6pm',
    copyright: '© 2024 GiaQueenie. All rights reserved.'
  })

  const [socialLinks, setSocialLinks] = useState([
    { platform: 'facebook', url: 'https://facebook.com/giaqueenie', icon: 'facebook', active: true },
    { platform: 'instagram', url: 'https://instagram.com/giaqueenie', icon: 'instagram', active: true },
    { platform: 'twitter', url: 'https://twitter.com/giaqueenie', icon: 'twitter', active: true },
    { platform: 'tiktok', url: '', icon: 'tiktok', active: false },
    { platform: 'youtube', url: '', icon: 'youtube', active: false },
    { platform: 'pinterest', url: '', icon: 'pinterest', active: false },
    { platform: 'linkedin', url: '', icon: 'linkedin', active: false }
  ])

  const [quickLinks, setQuickLinks] = useState([
    { title: 'Shop', url: '/shop', active: true },
    { title: 'Services', url: '/services', active: true },
    { title: 'About Us', url: '/about', active: true },
    { title: 'Contact', url: '/contact', active: true },
    { title: 'Privacy Policy', url: '/privacy', active: true },
    { title: 'Terms & Conditions', url: '/terms', active: true }
  ])

  const [footerSections, setFooterSections] = useState([
    {
      id: 'quick-links',
      title: 'Quick Links',
      type: 'links',
      items: quickLinks,
      active: true
    },
    {
      id: 'contact-info',
      title: 'Contact Info',
      type: 'contact',
      items: [
        { icon: 'email', label: 'Email', value: companyInfo.email },
        { icon: 'phone', label: 'Phone', value: companyInfo.phone },
        { icon: 'address', label: 'Address', value: companyInfo.address }
      ],
      active: true
    },
    {
      id: 'business-hours',
      title: 'Business Hours',
      type: 'text',
      content: companyInfo.business_hours,
      active: true
    }
  ])

  const [loading, setLoading] = useState(false)
  const [activeEditModal, setActiveEditModal] = useState(null)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [newSocial, setNewSocial] = useState({ platform: '', url: '', icon: '' })
  const [newSection, setNewSection] = useState({ title: '', type: 'links', content: '' })

  // Load saved settings from database on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Load company info
      const { data: companyData } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('type', 'company')
        .single()
      
      if (companyData) {
        setCompanyInfo(companyData.content || companyInfo)
      }

      // Load social links
      const { data: socialData } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('type', 'social')
        .single()
      
      if (socialData) {
        setSocialLinks(socialData.content || socialLinks)
      }

      // Load quick links
      const { data: linksData } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('type', 'quick_links')
        .single()
      
      if (linksData) {
        setQuickLinks(linksData.content || quickLinks)
      }

      // Load footer sections
      const { data: sectionsData } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('type', 'footer_sections')
        .single()
      
      if (sectionsData) {
        setFooterSections(sectionsData.content || footerSections)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (type, content) => {
    try {
      const { error } = await supabase
        .from('footer_settings')
        .upsert({
          type: type,
          content: content,
          updated_at: new Date().toISOString()
        }, { onConflict: 'type' })
      
      if (error) throw error
      toast.success('Settings saved successfully!')
      return true
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error saving settings: ' + error.message)
      return false
    }
  }

  const handleSaveCompanyInfo = async () => {
    setLoading(true)
    const success = await saveSettings('company', companyInfo)
    if (success) {
      // Update footer sections that use company info
      const updatedSections = footerSections.map(section => {
        if (section.id === 'contact-info') {
          return {
            ...section,
            items: [
              { icon: 'email', label: 'Email', value: companyInfo.email },
              { icon: 'phone', label: 'Phone', value: companyInfo.phone },
              { icon: 'address', label: 'Address', value: companyInfo.address }
            ]
          }
        }
        if (section.id === 'business-hours') {
          return {
            ...section,
            content: companyInfo.business_hours
          }
        }
        return section
      })
      setFooterSections(updatedSections)
      await saveSettings('footer_sections', updatedSections)
    }
    setLoading(false)
  }

  // In Admin.jsx - Update the handleSaveSocialLinks function
const handleSaveSocialLinks = async () => {
  setLoading(true)
  try {
    // Filter out empty social links and ensure proper structure
    const cleanSocialLinks = socialLinks
      .filter(link => link.platform && link.platform.trim() !== '')
      .map(link => ({
        platform: link.platform,
        url: link.url || '',
        icon: link.platform.toLowerCase(),
        active: link.active !== undefined ? link.active : true
      }))
    
    const { error } = await supabase
      .from('footer_settings')
      .upsert({
        type: 'social',
        content: cleanSocialLinks,
        updated_at: new Date().toISOString()
      }, { onConflict: 'type' })
    
    if (error) throw error
    toast.success('Social links saved successfully!')
    await loadSettings() // Reload to verify
  } catch (error) {
    console.error('Error saving social links:', error)
    toast.error('Error saving social links: ' + error.message)
  } finally {
    setLoading(false)
  }
}

  const handleSaveQuickLinks = async () => {
    setLoading(true)
    await saveSettings('quick_links', quickLinks)
    // Update footer sections
    const updatedSections = footerSections.map(section => {
      if (section.id === 'quick-links') {
        return { ...section, items: quickLinks }
      }
      return section
    })
    setFooterSections(updatedSections)
    await saveSettings('footer_sections', updatedSections)
    setLoading(false)
  }

  const handleSaveFooterSections = async () => {
    setLoading(true)
    await saveSettings('footer_sections', footerSections)
    setLoading(false)
  }

  const addQuickLink = () => {
    if (newLink.title && newLink.url) {
      setQuickLinks([...quickLinks, { ...newLink, active: true }])
      setNewLink({ title: '', url: '' })
      toast.success('Quick link added')
    } else {
      toast.error('Please fill in both title and URL')
    }
  }

  const removeQuickLink = (index) => {
    const updated = [...quickLinks]
    updated.splice(index, 1)
    setQuickLinks(updated)
    toast.success('Quick link removed')
  }

  const toggleQuickLinkActive = (index) => {
    const updated = [...quickLinks]
    updated[index].active = !updated[index].active
    setQuickLinks(updated)
  }

  const addSocialLink = () => {
    if (newSocial.platform && newSocial.url) {
      const icon = newSocial.platform.toLowerCase()
      setSocialLinks([...socialLinks, { 
        platform: newSocial.platform, 
        url: newSocial.url, 
        icon: icon,
        active: true 
      }])
      setNewSocial({ platform: '', url: '', icon: '' })
      toast.success('Social link added')
    } else {
      toast.error('Please fill in platform and URL')
    }
  }

  const removeSocialLink = (index) => {
    const updated = [...socialLinks]
    updated.splice(index, 1)
    setSocialLinks(updated)
    toast.success('Social link removed')
  }

  const toggleSocialActive = (index) => {
    const updated = [...socialLinks]
    updated[index].active = !updated[index].active
    setSocialLinks(updated)
  }

  const addFooterSection = () => {
    if (newSection.title) {
      const newId = `section-${Date.now()}`
      const section = {
        id: newId,
        title: newSection.title,
        type: newSection.type,
        active: true
      }
      
      if (newSection.type === 'links') {
        section.items = []
      } else if (newSection.type === 'text') {
        section.content = newSection.content || ''
      } else if (newSection.type === 'contact') {
        section.items = [
          { icon: 'email', label: 'Email', value: '' },
          { icon: 'phone', label: 'Phone', value: '' },
          { icon: 'address', label: 'Address', value: '' }
        ]
      }
      
      setFooterSections([...footerSections, section])
      setNewSection({ title: '', type: 'links', content: '' })
      toast.success('Footer section added')
    } else {
      toast.error('Please enter a section title')
    }
  }

  const removeFooterSection = (id) => {
    setFooterSections(footerSections.filter(s => s.id !== id))
    toast.success('Footer section removed')
  }

  const toggleFooterSectionActive = (id) => {
    setFooterSections(footerSections.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ))
  }

  const updateFooterSectionContent = (id, field, value) => {
    setFooterSections(footerSections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const updateFooterSectionItems = (id, items) => {
    setFooterSections(footerSections.map(s => 
      s.id === id ? { ...s, items: items } : s
    ))
  }

  return (
    <div className="space-y-8">
      {/* Company Information Section */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display gold-text">Company Information</h3>
          <button onClick={handleSaveCompanyInfo} disabled={loading} className="btn-primary py-2 px-4 text-sm">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Company Name</label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Tagline</label>
            <input
              type="text"
              value={companyInfo.tagline}
              onChange={(e) => setCompanyInfo({ ...companyInfo, tagline: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Description</label>
            <textarea
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
              rows="2"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Email</label>
            <input
              type="email"
              value={companyInfo.email}
              onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Phone</label>
            <input
              type="tel"
              value={companyInfo.phone}
              onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Address</label>
            <input
              type="text"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Business Hours</label>
            <input
              type="text"
              value={companyInfo.business_hours}
              onChange={(e) => setCompanyInfo({ ...companyInfo, business_hours: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
              placeholder="Mon-Sat: 9am - 8pm | Sun: 12pm - 6pm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Copyright Text</label>
            <input
              type="text"
              value={companyInfo.copyright}
              onChange={(e) => setCompanyInfo({ ...companyInfo, copyright: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links Section */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display gold-text">Social Media Links</h3>
          <button onClick={handleSaveSocialLinks} disabled={loading} className="btn-primary py-2 px-4 text-sm">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="space-y-3 mb-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 glass-card p-3">
              <input
                type="text"
                placeholder="Platform (e.g., Instagram)"
                value={link.platform}
                onChange={(e) => {
                  const updated = [...socialLinks]
                  updated[index].platform = e.target.value
                  updated[index].icon = e.target.value.toLowerCase()
                  setSocialLinks(updated)
                }}
                className="flex-1 px-3 py-2 glass-card text-white rounded-lg text-sm"
              />
              <input
                type="url"
                placeholder="URL"
                value={link.url}
                onChange={(e) => {
                  const updated = [...socialLinks]
                  updated[index].url = e.target.value
                  setSocialLinks(updated)
                }}
                className="flex-2 px-3 py-2 glass-card text-white rounded-lg text-sm"
              />
              <button
                onClick={() => toggleSocialActive(index)}
                className={`px-3 py-2 rounded-lg text-sm ${link.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}
              >
                {link.active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => removeSocialLink(index)}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-500"
              >
                <IoTrashOutline size={18} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Add new social link */}
        <div className="flex gap-3 mt-4">
          <input
            type="text"
            placeholder="Platform (e.g., TikTok)"
            value={newSocial.platform}
            onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
            className="flex-1 px-3 py-2 glass-card text-white rounded-lg text-sm"
          />
          <input
            type="url"
            placeholder="URL"
            value={newSocial.url}
            onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
            className="flex-2 px-3 py-2 glass-card text-white rounded-lg text-sm"
          />
          <button onClick={addSocialLink} className="btn-primary py-2 px-4 text-sm">
            <IoAddOutline className="inline mr-1" /> Add
          </button>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display gold-text">Quick Links (Footer Navigation)</h3>
          <button onClick={handleSaveQuickLinks} disabled={loading} className="btn-primary py-2 px-4 text-sm">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="space-y-3 mb-4">
          {quickLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 glass-card p-3">
              <input
                type="text"
                placeholder="Link Title"
                value={link.title}
                onChange={(e) => {
                  const updated = [...quickLinks]
                  updated[index].title = e.target.value
                  setQuickLinks(updated)
                }}
                className="flex-1 px-3 py-2 glass-card text-white rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="URL (e.g., /about)"
                value={link.url}
                onChange={(e) => {
                  const updated = [...quickLinks]
                  updated[index].url = e.target.value
                  setQuickLinks(updated)
                }}
                className="flex-1 px-3 py-2 glass-card text-white rounded-lg text-sm"
              />
              <button
                onClick={() => toggleQuickLinkActive(index)}
                className={`px-3 py-2 rounded-lg text-sm ${link.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}
              >
                {link.active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => removeQuickLink(index)}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-500"
              >
                <IoTrashOutline size={18} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Add new quick link */}
        <div className="flex gap-3 mt-4">
          <input
            type="text"
            placeholder="Link Title"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="flex-1 px-3 py-2 glass-card text-white rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="URL (e.g., /about)"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="flex-1 px-3 py-2 glass-card text-white rounded-lg text-sm"
          />
          <button onClick={addQuickLink} className="btn-primary py-2 px-4 text-sm">
            <IoAddOutline className="inline mr-1" /> Add Link
          </button>
        </div>
      </div>

      {/* Footer Sections - Customizable */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display gold-text">Footer Sections</h3>
          <button onClick={handleSaveFooterSections} disabled={loading} className="btn-primary py-2 px-4 text-sm">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          {footerSections.map((section) => (
            <div key={section.id} className="glass-card p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateFooterSectionContent(section.id, 'title', e.target.value)}
                    className="text-white font-semibold bg-transparent border-b border-white/20 px-2 py-1 text-lg"
                  />
                  <select
                    value={section.type}
                    onChange={(e) => updateFooterSectionContent(section.id, 'type', e.target.value)}
                    className="ml-3 px-2 py-1 glass-card text-white text-sm rounded-lg"
                    disabled={section.id === 'quick-links' || section.id === 'contact-info' || section.id === 'business-hours'}
                  >
                    <option value="links">Links</option>
                    <option value="text">Text Content</option>
                    <option value="contact">Contact Info</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFooterSectionActive(section.id)}
                    className={`px-3 py-1 rounded-lg text-xs ${section.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}
                  >
                    {section.active ? 'Visible' : 'Hidden'}
                  </button>
                  {section.id !== 'quick-links' && section.id !== 'contact-info' && section.id !== 'business-hours' && (
                    <button
                      onClick={() => removeFooterSection(section.id)}
                      className="p-1 hover:bg-red-500/20 rounded-lg text-red-500"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {section.type === 'links' && (
                <div className="space-y-2 mt-3">
                  {section.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Link Title"
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...section.items]
                          newItems[idx].title = e.target.value
                          updateFooterSectionItems(section.id, newItems)
                        }}
                        className="flex-1 px-3 py-1 glass-card text-white rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        value={item.url}
                        onChange={(e) => {
                          const newItems = [...section.items]
                          newItems[idx].url = e.target.value
                          updateFooterSectionItems(section.id, newItems)
                        }}
                        className="flex-2 px-3 py-1 glass-card text-white rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          const newItems = section.items.filter((_, i) => i !== idx)
                          updateFooterSectionItems(section.id, newItems)
                        }}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-red-500"
                      >
                        <IoTrashOutline size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...(section.items || []), { title: 'New Link', url: '/' }]
                      updateFooterSectionItems(section.id, newItems)
                    }}
                    className="text-primary-gold text-sm hover:underline mt-2"
                  >
                    + Add Link
                  </button>
                </div>
              )}
              
              {section.type === 'text' && (
                <textarea
                  value={section.content || ''}
                  onChange={(e) => updateFooterSectionContent(section.id, 'content', e.target.value)}
                  className="w-full px-3 py-2 glass-card text-white rounded-lg text-sm mt-3"
                  rows="3"
                  placeholder="Enter text content for this section..."
                />
              )}
              
              {section.type === 'contact' && (
                <div className="space-y-2 mt-3">
                  {section.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Icon (email, phone, address)"
                        value={item.icon}
                        onChange={(e) => {
                          const newItems = [...section.items]
                          newItems[idx].icon = e.target.value
                          updateFooterSectionItems(section.id, newItems)
                        }}
                        className="w-32 px-3 py-1 glass-card text-white rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => {
                          const newItems = [...section.items]
                          newItems[idx].label = e.target.value
                          updateFooterSectionItems(section.id, newItems)
                        }}
                        className="flex-1 px-3 py-1 glass-card text-white rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => {
                          const newItems = [...section.items]
                          newItems[idx].value = e.target.value
                          updateFooterSectionItems(section.id, newItems)
                        }}
                        className="flex-2 px-3 py-1 glass-card text-white rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          const newItems = section.items.filter((_, i) => i !== idx)
                          updateFooterSectionItems(section.id, newItems)
                        }}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-red-500"
                      >
                        <IoTrashOutline size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...(section.items || []), { icon: 'new', label: 'New Field', value: '' }]
                      updateFooterSectionItems(section.id, newItems)
                    }}
                    className="text-primary-gold text-sm hover:underline mt-2"
                  >
                    + Add Contact Field
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Add new footer section */}
        <div className="glass-card p-4 bg-white/5">
          <h4 className="text-white font-semibold mb-3">Add New Footer Section</h4>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Section Title"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              className="flex-1 px-3 py-2 glass-card text-white rounded-lg text-sm"
            />
            <select
              value={newSection.type}
              onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
              className="px-3 py-2 glass-card text-white rounded-lg text-sm"
            >
              <option value="links">Links</option>
              <option value="text">Text Content</option>
              <option value="contact">Contact Info</option>
            </select>
            <button onClick={addFooterSection} className="btn-primary py-2 px-4 text-sm">
              <IoAddOutline className="inline mr-1" /> Add Section
            </button>
          </div>
          {newSection.type === 'text' && (
            <textarea
              placeholder="Initial content..."
              value={newSection.content}
              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
              className="w-full mt-3 px-3 py-2 glass-card text-white rounded-lg text-sm"
              rows="2"
            />
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-display gold-text mb-4">Footer Preview</h3>
        <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.filter(s => s.active).map((section) => (
              <div key={section.id}>
                <h4 className="text-primary-gold font-semibold mb-3">{section.title}</h4>
                {section.type === 'links' && section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx}>
                        <a href={item.url} className="text-white/60 hover:text-primary-gold text-sm transition-colors">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {section.type === 'text' && (
                  <p className="text-white/60 text-sm">{section.content}</p>
                )}
                {section.type === 'contact' && section.items && (
                  <div className="space-y-2">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="text-white/60 text-sm">
                        <strong>{item.label}:</strong> {item.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="flex justify-center gap-4 mb-4">
              {socialLinks.filter(s => s.active && s.url).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-primary-gold transition-colors"
                >
                  {link.platform}
                </a>
              ))}
            </div>
            <p className="text-white/40 text-sm">{companyInfo.copyright}</p>
          </div>
        </div>
        <p className="text-white/40 text-xs mt-4 text-center">
          This preview shows how your footer will appear on the website. All changes are saved automatically when you click "Save Changes".
        </p>
      </div>
    </div>
  )
}

  // AddEditModal Component - FIXED VERSION with proper typing
  const AddEditModal = () => {
    // Local state for form data to prevent re-renders on each keystroke
    const [localFormData, setLocalFormData] = useState({})
    const [localUploading, setLocalUploading] = useState(false)
    
    // Initialize local form data when modal opens
    useEffect(() => {
      if (showModal) {
        setLocalFormData({ ...formData })
      }
    }, [showModal, formData, editingItem])
    
    if (!showModal) return null
    
    const handleLocalChange = (field, value) => {
      setLocalFormData(prev => ({ ...prev, [field]: value }))
    }
    
    const handleLocalImageUpload = async (files) => {
      if (!files || files.length === 0) return
      setLocalUploading(true)
      const toastId = toast.loading(`Uploading ${files.length} image(s)...`)
      try {
        const urls = await uploadMultipleToCloudinary(files, activeTab)
        setLocalFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...urls]
        }))
        toast.success(`${files.length} image(s) uploaded`, { id: toastId })
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Upload failed: ' + error.message, { id: toastId })
      } finally {
        setLocalUploading(false)
      }
    }
    
    const handleLocalSave = async () => {
      setFormData(localFormData)
      await handleSave(localFormData)
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
        <div className="relative glass-card w-full max-w-lg max-h-[85vh] overflow-y-auto p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display gold-text">{editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}</h2>
            <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
              <IoCloseOutline size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            {activeTab === 'products' && (
              <>
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  value={localFormData.name || ''} 
                  onChange={(e) => handleLocalChange('name', e.target.value)} 
                  className="input-luxury text-sm" 
                  autoComplete="off"
                />
                <textarea 
                  placeholder="Description" 
                  value={localFormData.description || ''} 
                  onChange={(e) => handleLocalChange('description', e.target.value)} 
                  className="input-luxury text-sm" 
                  rows="3"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="Price" 
                    value={localFormData.price || ''} 
                    onChange={(e) => handleLocalChange('price', e.target.value)} 
                    className="input-luxury text-sm" 
                  />
                  <input 
                    type="number" 
                    placeholder="Compare Price" 
                    value={localFormData.compare_price || ''} 
                    onChange={(e) => handleLocalChange('compare_price', e.target.value)} 
                    className="input-luxury text-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="Stock" 
                    value={localFormData.stock || ''} 
                    onChange={(e) => handleLocalChange('stock', e.target.value)} 
                    className="input-luxury text-sm" 
                  />
                  <select 
                    value={localFormData.category || ''} 
                    onChange={(e) => handleLocalChange('category', e.target.value)} 
                    className="input-luxury text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={localFormData.featured || false} 
                    onChange={(e) => handleLocalChange('featured', e.target.checked)} 
                    className="w-4 h-4" 
                  />
                  <span className="text-white text-sm">Featured Product</span>
                </label>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Images</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => handleLocalImageUpload(Array.from(e.target.files))} 
                    disabled={localUploading} 
                    className="w-full text-white/60 text-sm" 
                  />
                  {localUploading && <p className="text-primary-gold text-xs mt-1">Uploading...</p>}
                  {localFormData.images && localFormData.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {localFormData.images.map((url, i) => (
                        <img key={i} src={url} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {activeTab === 'services' && (
  <>
    <div>
      <label className="block text-white/80 text-sm mb-1">Service Name *</label>
      <input 
        type="text" 
        placeholder="e.g., Luxury Hair Styling" 
        value={localFormData.name || ''} 
        onChange={(e) => handleLocalChange('name', e.target.value)} 
        className="input-luxury text-sm" 
        autoComplete="off"
      />
    </div>
    
    <div>
      <label className="block text-white/80 text-sm mb-1">Description</label>
      <textarea 
        placeholder="Describe your service..." 
        value={localFormData.description || ''} 
        onChange={(e) => handleLocalChange('description', e.target.value)} 
        className="input-luxury text-sm" 
        rows="3"
      />
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-white/80 text-sm mb-1">Price ($) *</label>
        <input 
          type="number" 
          placeholder="0.00" 
          value={localFormData.price || ''} 
          onChange={(e) => handleLocalChange('price', e.target.value)} 
          className="input-luxury text-sm" 
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Duration (minutes) *</label>
        <input 
          type="number" 
          placeholder="60" 
          value={localFormData.duration || ''} 
          onChange={(e) => handleLocalChange('duration', e.target.value)} 
          className="input-luxury text-sm" 
        />
      </div>
    </div>
    
    <div>
      <label className="block text-white/80 text-sm mb-2">Service Images</label>
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={(e) => handleLocalImageUpload(Array.from(e.target.files))} 
        disabled={localUploading} 
        className="w-full text-white/60 text-sm" 
      />
      {localUploading && <p className="text-primary-gold text-xs mt-1">Uploading images...</p>}
      {localFormData.images && localFormData.images.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {localFormData.images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
              <button
                onClick={() => {
                  const newImages = localFormData.images.filter((_, idx) => idx !== i)
                  handleLocalChange('images', newImages)
                }}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    
    {/* Preview Section */}
    {localFormData.name && (
      <div className="mt-4 p-3 glass-card bg-white/5 rounded-lg">
        <p className="text-primary-gold text-xs font-semibold mb-2">SERVICE PREVIEW</p>
        <p className="text-white font-semibold">{localFormData.name}</p>
        {localFormData.description && (
          <p className="text-white/60 text-xs mt-1 line-clamp-2">{localFormData.description}</p>
        )}
        <div className="flex gap-3 mt-2">
          <span className="text-primary-gold font-bold">${localFormData.price || '0'}</span>
          <span className="text-white/40 text-xs">{localFormData.duration || '0'} mins</span>
        </div>
      </div>
    )}
  </>
)}
            
            {activeTab === 'pages' && (
  <>
    <div>
      <label className="block text-white/80 text-sm mb-1">Page Slug (URL)</label>
      <input 
        type="text" 
        placeholder="e.g., hair-care" 
        value={localFormData.slug || ''} 
        onChange={(e) => handleLocalChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} 
        className="input-luxury text-sm" 
        autoComplete="off"
      />
      <p className="text-white/40 text-xs mt-1">This will be the page URL: /{localFormData.slug || 'your-page-slug'}</p>
    </div>
    
    <div>
      <label className="block text-white/80 text-sm mb-1">Page Title</label>
      <input 
        type="text" 
        placeholder="Page Title" 
        value={localFormData.title || ''} 
        onChange={(e) => handleLocalChange('title', e.target.value)} 
        className="input-luxury text-sm" 
        autoComplete="off"
      />
    </div>
    
    <div>
      <label className="block text-white/80 text-sm mb-1">Page Content</label>
      <textarea 
        placeholder="Write your page content here..." 
        value={localFormData.content || ''} 
        onChange={(e) => handleLocalChange('content', e.target.value)} 
        className="input-luxury text-sm" 
        rows="4"
      />
    </div>
    
    <div>
      <label className="block text-white/80 text-sm mb-1">Hero Video URL (Optional)</label>
      <input 
        type="text" 
        placeholder="https://example.com/video.mp4" 
        value={localFormData.hero_video || ''} 
        onChange={(e) => handleLocalChange('hero_video', e.target.value)} 
        className="input-luxury text-sm" 
        autoComplete="off"
      />
      <p className="text-white/40 text-xs mt-1">Add a video URL for the page hero section</p>
    </div>
    
    <div>
      <label className="block text-white/80 text-sm mb-1">Hero Video</label>
      
      {/* Option 1: Upload Video */}
      <div className="mb-3">
        <label className="block text-white/60 text-xs mb-1">Upload Video (MP4 recommended)</label>
        <input 
          type="file" 
          accept="video/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              setLocalUploading(true);
              const toastId = toast.loading('Uploading video...');
              try {
                const url = await uploadVideoToCloudinary(file, 'pages');
                handleLocalChange('hero_video', url);
                toast.success('Video uploaded!', { id: toastId });
              } catch (error) {
                toast.error('Upload failed: ' + error.message, { id: toastId });
              } finally {
                setLocalUploading(false);
              }
            }
          }}
          disabled={localUploading}
          className="w-full text-white/60 text-sm"
        />
        {localUploading && <p className="text-primary-gold text-xs mt-1">Uploading video...</p>}
      </div>
      
      {/* Option 2: Paste URL */}
      <div>
        <label className="block text-white/60 text-xs mb-1">Or paste video URL</label>
        <input 
          type="text" 
          placeholder="https://res.cloudinary.com/your-cloud/video/upload/hero.mp4" 
          value={localFormData.hero_video || ''} 
          onChange={(e) => handleLocalChange('hero_video', e.target.value)} 
          className="input-luxury text-sm" 
          autoComplete="off"
        />
      </div>
      
      <p className="text-white/40 text-xs mt-2">Supports MP4 videos. For YouTube/Vimeo, use the embed URL or direct video file URL.</p>
      
      {/* Preview if video exists */}
      {localFormData.hero_video && (
        <div className="mt-3">
          <p className="text-primary-gold text-xs mb-2">Video Preview:</p>
          <video 
            src={localFormData.hero_video} 
            className="w-full max-h-40 object-cover rounded-lg"
            controls
          />
          <button 
            onClick={() => handleLocalChange('hero_video', '')}
            className="mt-2 text-xs text-red-500 hover:text-red-400"
          >
            Remove Video
          </button>
        </div>
      )}
    </div>

    <div>
      <label className="block text-white/80 text-sm mb-1">Associated Products</label>
      <select
        multiple
        value={localFormData.products || []}
        onChange={(e) => {
          const selectedValues = Array.from(e.target.selectedOptions, option => option.value)
          console.log('Selected products:', selectedValues)
          handleLocalChange('products', selectedValues)
        }}
        className="input-luxury text-sm"
        size="4"
      >
        {products.map(product => (
          <option 
            key={product.id} 
            value={product.id}
            selected={(localFormData.products || []).includes(product.id)}
          >
            {product.name} - ${product.price}
          </option>
        ))}
      </select>
      <p className="text-white/40 text-xs mt-1">Hold Ctrl/Cmd to select multiple products</p>
      {localFormData.products && localFormData.products.length > 0 && (
        <div className="mt-2 text-xs text-primary-gold">
          Selected: {localFormData.products.length} product(s)
        </div>
      )}
    </div>
    
    <div>
      <label className="block text-white/80 text-sm mb-1">Associated Services</label>
      <select
        multiple
        value={localFormData.services || []}
        onChange={(e) => {
          const selectedValues = Array.from(e.target.selectedOptions, option => option.value)
          console.log('Selected services:', selectedValues)
          handleLocalChange('services', selectedValues)
        }}
        className="input-luxury text-sm"
        size="4"
      >
        {services.map(service => (
          <option 
            key={service.id} 
            value={service.id}
            selected={(localFormData.services || []).includes(service.id)}
          >
            {service.name} - ${service.price} ({service.duration} min)
          </option>
        ))}
      </select>
      <p className="text-white/40 text-xs mt-1">Hold Ctrl/Cmd to select multiple services</p>
      {localFormData.services && localFormData.services.length > 0 && (
        <div className="mt-2 text-xs text-primary-gold">
          Selected: {localFormData.services.length} service(s)
        </div>
      )}
    </div>
    
    <label className="flex items-center gap-2 cursor-pointer">
      <input 
        type="checkbox" 
        checked={localFormData.active || false} 
        onChange={(e) => handleLocalChange('active', e.target.checked)} 
        className="w-4 h-4 rounded border-primary-gold accent-primary-gold"
      />
      <span className="text-white text-sm">Active (visible on website)</span>
    </label>
    
    {/* Preview Section */}
    {localFormData.slug && localFormData.title && (
      <div className="mt-4 p-3 glass-card bg-white/5 rounded-lg">
        <p className="text-primary-gold text-xs font-semibold mb-2">PREVIEW</p>
        <p className="text-white text-sm">URL: /{localFormData.slug}</p>
        <p className="text-white font-semibold mt-1">{localFormData.title}</p>
        {localFormData.content && (
          <p className="text-white/60 text-xs mt-1 line-clamp-2">{localFormData.content}</p>
        )}
        <div className="mt-2 flex gap-2">
          <span className="text-xs text-white/40">
            Products: {localFormData.products?.length || 0}
          </span>
          <span className="text-xs text-white/40">
            Services: {localFormData.services?.length || 0}
          </span>
        </div>
      </div>
    )}
  </>
)}
            
            {activeTab === 'promotions' && (
              <>
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  value={localFormData.code || ''} 
                  onChange={(e) => handleLocalChange('code', e.target.value.toUpperCase())} 
                  className="input-luxury text-sm" 
                  autoComplete="off"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={localFormData.type || 'percentage'} 
                    onChange={(e) => handleLocalChange('type', e.target.value)} 
                    className="input-luxury text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Value" 
                    value={localFormData.value || ''} 
                    onChange={(e) => handleLocalChange('value', e.target.value)} 
                    className="input-luxury text-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="datetime-local" 
                    value={localFormData.start_date || ''} 
                    onChange={(e) => handleLocalChange('start_date', e.target.value)} 
                    className="input-luxury text-sm" 
                  />
                  <input 
                    type="datetime-local" 
                    value={localFormData.end_date || ''} 
                    onChange={(e) => handleLocalChange('end_date', e.target.value)} 
                    className="input-luxury text-sm" 
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={localFormData.active || false} 
                    onChange={(e) => handleLocalChange('active', e.target.checked)} 
                    className="w-4 h-4" 
                  />
                  <span className="text-white text-sm">Active</span>
                </label>
              </>
            )}
            
            {activeTab === 'payments' && (
  <>
    <div>
      <label className="block text-white/80 text-sm mb-1">Payment Method Name *</label>
      <input 
        type="text" 
        placeholder="e.g., Bank Transfer, CashApp, Bitcoin" 
        value={localFormData.name || ''} 
        onChange={(e) => handleLocalChange('name', e.target.value)} 
        className="input-luxury text-sm" 
        autoComplete="off"
      />
    </div>
    
    {/* Payment Fields/Tags Builder */}
    <div>
      <label className="block text-white/80 text-sm mb-2">Payment Details/Tags</label>
      <p className="text-white/40 text-xs mb-2">Add the information customers need to make payment</p>
      
      {/* Display existing fields */}
      {localFormData.fields && localFormData.fields.length > 0 && (
        <div className="space-y-2 mb-3">
          {localFormData.fields.map((field, index) => (
            <div key={index} className="glass-card p-2 flex justify-between items-center">
              <div>
                <p className="text-primary-gold text-sm font-medium">{field.label}</p>
                <p className="text-white/40 text-xs">
                  Key: {field.key} | Type: {field.type}
                </p>
                {field.placeholder && (
                  <p className="text-white/30 text-xs">Placeholder: {field.placeholder}</p>
                )}
              </div>
              <button
                onClick={() => {
                  const newFields = [...(localFormData.fields || [])]
                  newFields.splice(index, 1)
                  handleLocalChange('fields', newFields)
                }}
                className="text-red-500 hover:text-red-400 p-1"
              >
                <IoTrashOutline size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add new field */}
      <div className="glass-card p-3 mt-2">
        <p className="text-white/60 text-xs mb-2">Add New Payment Detail:</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="text"
            placeholder="Label (e.g., Account Name)"
            id="newFieldLabel"
            className="input-luxury text-sm"
          />
          <input
            type="text"
            placeholder="Key (e.g., account_name)"
            id="newFieldKey"
            className="input-luxury text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            id="newFieldType"
            className="input-luxury text-sm"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
          </select>
          <input
            type="text"
            placeholder="Placeholder (optional)"
            id="newFieldPlaceholder"
            className="input-luxury text-sm"
          />
        </div>
        <button
          onClick={() => {
            const label = document.getElementById('newFieldLabel').value
            const key = document.getElementById('newFieldKey').value
            const type = document.getElementById('newFieldType').value
            const placeholder = document.getElementById('newFieldPlaceholder').value
            
            if (!label || !key) {
              toast.error('Please fill in Label and Key')
              return
            }
            
            const newField = {
              key: key.toLowerCase().replace(/\s+/g, '_'),
              label: label,
              type: type,
              placeholder: placeholder || ''
            }
            
            handleLocalChange('fields', [...(localFormData.fields || []), newField])
            
            // Clear inputs
            document.getElementById('newFieldLabel').value = ''
            document.getElementById('newFieldKey').value = ''
            document.getElementById('newFieldPlaceholder').value = ''
            
            toast.success('Field added')
          }}
          className="btn-primary py-1 text-sm w-full"
        >
          + Add Field
        </button>
      </div>
    </div>
    
    {/* QR Code Upload */}
    <div>
      <label className="block text-white/80 text-sm mb-2">QR Code (Optional)</label>
      <p className="text-white/40 text-xs mb-2">Upload a QR code for easy payment (e.g., bank QR, crypto wallet)</p>
      <input 
        type="file" 
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files[0]
          if (file) {
            setLocalUploading(true)
            const toastId = toast.loading('Uploading QR code...')
            try {
              const formData = new FormData()
              formData.append('file', file)
              formData.append('upload_preset', 'giaqueenie')
              
              const response = await fetch(
                `https://api.cloudinary.com/v1_1/dncv9mquq/image/upload`,
                {
                  method: 'POST',
                  body: formData
                }
              )
              
              const data = await response.json()
              const url = data.secure_url
              handleLocalChange('qr_code', url)
              toast.success('QR code uploaded!', { id: toastId })
            } catch (error) {
              toast.error('Upload failed: ' + error.message, { id: toastId })
            } finally {
              setLocalUploading(false)
            }
          }
        }}
        disabled={localUploading}
        className="w-full text-white/60 text-sm"
      />
      {localUploading && <p className="text-primary-gold text-xs mt-1">Uploading...</p>}
      {localFormData.qr_code && (
        <div className="mt-3">
          <div className="flex items-center gap-3">
            <img 
              src={localFormData.qr_code} 
              alt="QR Code Preview" 
              className="w-20 h-20 object-cover rounded-lg"
            />
            <button
              onClick={() => handleLocalChange('qr_code', '')}
              className="text-red-500 text-xs hover:text-red-400"
            >
              Remove QR Code
            </button>
          </div>
        </div>
      )}
    </div>
    
    {/* Example Preview */}
    {localFormData.fields && localFormData.fields.length > 0 && (
      <div className="mt-4 p-3 glass-card bg-white/5 rounded-lg">
        <p className="text-primary-gold text-xs font-semibold mb-2">CUSTOMER PREVIEW</p>
        <p className="text-white text-sm mb-2">Customers will see:</p>
        <div className="space-y-2">
          {localFormData.fields.map((field, idx) => (
            <div key={idx} className="bg-white/5 p-2 rounded">
              <p className="text-white/60 text-xs">{field.label}</p>
              <p className="text-white/30 text-xs italic">[User will enter {field.label}]</p>
            </div>
          ))}
        </div>
        {localFormData.qr_code && (
          <div className="mt-2">
            <p className="text-white/60 text-xs">QR Code will be displayed</p>
          </div>
        )}
      </div>
    )}
    
    <label className="flex items-center gap-2 cursor-pointer">
      <input 
        type="checkbox" 
        checked={localFormData.active || false} 
        onChange={(e) => handleLocalChange('active', e.target.checked)} 
        className="w-4 h-4 rounded border-primary-gold accent-primary-gold"
      />
      <span className="text-white text-sm">Active (visible to customers during checkout)</span>
    </label>
  </>
)}
            
            <button onClick={handleLocalSave} className="btn-primary w-full py-2 text-sm">
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }

    switch (activeTab) {
      case 'analytics': return <AnalyticsSection />
      case 'products': return <ProductsSection />
      case 'services': return <ServicesSection />
      case 'orders': return <OrdersSection />
      case 'users': return <UsersSection />
      case 'pages': return <PagesSection />
      case 'promotions': return <PromotionsSection />
      case 'payments': return <PaymentsSection />
      case 'media': return <MediaSection />
      case 'settings': return <SettingsSection />
      default: return null
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-20 left-4 z-50 p-2 glass-card rounded-xl"
      >
        <IoMenuOutline size={22} />
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-5 border-b border-white/10">
          <img src="/logo.svg" alt="GiaQueenie" className="h-7 mb-2" />
          <h2 className="text-xl font-display gold-text">Admin Panel</h2>
          <p className="text-white/40 text-sm mt-1">Store Management</p>
        </div>
        
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSearchTerm(''); setFilterStatus('all'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === item.id 
                  ? 'bg-primary-gold/20 text-primary-gold border border-primary-gold/30' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <div className="flex-1">
                <span className="text-sm">{item.label}</span>
                <p className="text-xs opacity-60">{item.description}</p>
              </div>
            </button>
          ))}
        </nav>
        
        <div className="p-3 border-t border-white/10">
          <button onClick={refreshData} disabled={refreshing} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 transition-all">
            <IoRefreshOutline className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-display gold-text">
              {menuItems.find(m => m.id === activeTab)?.label || 'Admin Dashboard'}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {menuItems.find(m => m.id === activeTab)?.description || 'Manage your store'}
            </p>
          </div>
          
          {renderContent()}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AddEditModal />
    </div>
  )
}

export default Admin