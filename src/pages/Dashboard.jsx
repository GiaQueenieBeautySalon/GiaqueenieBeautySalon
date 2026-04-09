import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  IoHomeOutline, 
  IoBagOutline, 
  IoHeartOutline, 
  IoPersonOutline, 
  IoSettingsOutline,
  IoLogOutOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoChevronForward,
  IoLocationOutline,
  IoPhonePortraitOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoHourglassOutline,
  IoRefreshOutline,
  IoStarOutline,
  IoTrendingUpOutline,
  IoGiftOutline,
  IoChevronBackOutline
} from 'react-icons/io5'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default open on desktop
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalFavorites: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0
  })
  
  const [recentOrders, setRecentOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [favorites, setFavorites] = useState([])
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    memberSince: ''
  })

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: IoHomeOutline },
    { id: 'orders', label: 'Orders', icon: IoBagOutline },
    { id: 'favorites', label: 'Favorites', icon: IoHeartOutline },
    { id: 'profile', label: 'Profile', icon: IoPersonOutline },
    { id: 'settings', label: 'Settings', icon: IoSettingsOutline }
  ]

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On mobile, default to closed; on desktop, default to open
      setSidebarOpen(!mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchOrders(),
        fetchFavorites(),
        fetchUserProfile()
      ])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error loading dashboard')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchOrders(true),
        fetchFavorites(true),
        fetchUserProfile()
      ])
      toast.success('Dashboard refreshed')
    } catch (error) {
      toast.error('Error refreshing data')
    } finally {
      setRefreshing(false)
    }
  }

  const fetchOrders = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (orders) {
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'pending_confirmation').length
      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length
      const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0
      
      setStats(prev => ({
        ...prev,
        totalOrders: orders.length,
        totalSpent: totalSpent,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        averageOrderValue: averageOrderValue
      }))
      
      setAllOrders(orders)
      setRecentOrders(orders.slice(0, 5))
    }
  }

  const fetchFavorites = async () => {
    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('*, products(*)')
      .eq('user_id', user.id)
    
    setFavorites(favoritesData || [])
    setStats(prev => ({ ...prev, totalFavorites: favoritesData?.length || 0 }))
  }

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setProfileData({
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        memberSince: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'
      })
    }
  }

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          phone: profileData.phone,
          address: profileData.address
        })
        .eq('id', user.id)
      
      if (error) throw error
      toast.success('Profile updated')
    } catch (error) {
      toast.error('Error updating profile')
    }
  }

  const removeFavorite = async (favoriteId) => {
    try {
      await supabase.from('favorites').delete().eq('id', favoriteId)
      setFavorites(favorites.filter(f => f.id !== favoriteId))
      setStats(prev => ({ ...prev, totalFavorites: prev.totalFavorites - 1 }))
      toast.success('Removed from favorites')
    } catch (error) {
      toast.error('Error removing favorite')
    }
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
      case 'delivered':
        return { color: 'text-green-400', bg: 'bg-green-500/10', icon: IoCheckmarkCircleOutline, label: 'Completed' }
      case 'pending':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: IoHourglassOutline, label: 'Pending' }
      case 'pending_confirmation':
        return { color: 'text-orange-400', bg: 'bg-orange-500/10', icon: IoHourglassOutline, label: 'Awaiting Confirmation' }
      case 'processing':
        return { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: IoRefreshOutline, label: 'Processing' }
      case 'shipped':
        return { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: IoRefreshOutline, label: 'Shipped' }
      default:
        return { color: 'text-white/40', bg: 'bg-white/5', icon: IoTimeOutline, label: status }
    }
  }

  // Handle menu item click - close sidebar on mobile
  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-5 bg-gradient-to-r from-primary-gold/10 to-transparent border border-primary-gold/20">
        <h2 className="text-xl md:text-2xl font-display text-white">
          Welcome back, <span className="gold-text">{profileData.username}</span>
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Member since {profileData.memberSince} • {stats.totalOrders} orders
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <p className="text-white/50 text-xs">Total Spent</p>
          <p className="text-2xl font-bold gold-text">${stats.totalSpent.toFixed(2)}</p>
        </div>

        <div className="glass-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center mx-auto mb-2">
            <IoHeartOutline className="text-xl text-primary-gold" />
          </div>
          <p className="text-white/50 text-xs">Favorites</p>
          <p className="text-2xl font-bold gold-text">{stats.totalFavorites}</p>
        </div>

        <div className="glass-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center mx-auto mb-2">
            <IoTrendingUpOutline className="text-xl text-primary-gold" />
          </div>
          <p className="text-white/50 text-xs">Avg Order</p>
          <p className="text-2xl font-bold gold-text">${stats.averageOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-display gold-text">Recent Orders</h3>
            <button onClick={() => handleMenuClick('orders')} className="text-primary-gold hover:text-primary-rose text-sm flex items-center gap-1">
              View All <IoChevronForward size={14} />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                return (
                  <div key={order.id} className="glass-card p-4">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                          <StatusIcon className={`text-lg ${statusConfig.color}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-white/40 text-xs flex items-center gap-1">
                            <IoCalendarOutline size={12} />
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-gold font-bold text-xl">${order.total}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="glass-card p-8 text-center">
                <IoBagOutline className="text-4xl text-white/20 mx-auto mb-3" />
                <p className="text-white/60 mb-3">No orders yet</p>
                <Link to="/shop" className="inline-block btn-primary">Start Shopping</Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-display gold-text mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/shop" className="glass-card p-4 flex items-center justify-between group hover:border-primary-gold/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center">
                  <IoGiftOutline className="text-xl text-primary-gold" />
                </div>
                <div>
                  <p className="text-white font-medium">Shop Now</p>
                  <p className="text-white/40 text-xs">New arrivals</p>
                </div>
              </div>
              <IoChevronForward className="text-white/40 group-hover:text-primary-gold" />
            </Link>
            
            <Link to="/services" className="glass-card p-4 flex items-center justify-between group hover:border-primary-gold/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center">
                  <IoStarOutline className="text-xl text-primary-gold" />
                </div>
                <div>
                  <p className="text-white font-medium">Book Service</p>
                  <p className="text-white/40 text-xs">Luxury treatments</p>
                </div>
              </div>
              <IoChevronForward className="text-white/40 group-hover:text-primary-gold" />
            </Link>
            
            <button onClick={refreshData} className="w-full glass-card p-4 flex items-center justify-between group hover:border-primary-gold/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center">
                  <IoRefreshOutline className={`text-xl text-primary-gold ${refreshing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="text-white font-medium">Refresh</p>
                  <p className="text-white/40 text-xs">Update data</p>
                </div>
              </div>
              <IoChevronForward className="text-white/40 group-hover:text-primary-gold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const OrdersSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-display gold-text">All Orders</h3>
      {allOrders.length > 0 ? (
        <div className="space-y-3">
          {allOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const StatusIcon = statusConfig.icon
            return (
              <div key={order.id} className="glass-card p-4">
                <div className="flex flex-wrap md:flex-nowrap justify-between gap-4">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                      <StatusIcon className={`text-lg ${statusConfig.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">Order #{order.id.slice(0, 12)}</p>
                      <p className="text-white/40 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                      {order.payment_method && <p className="text-white/40 text-xs mt-1">Paid via {order.payment_method}</p>}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-primary-gold font-bold text-xl">${order.total}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <IoBagOutline className="text-4xl text-white/20 mx-auto mb-3" />
          <p className="text-white/60 mb-3">No orders yet</p>
          <Link to="/shop" className="inline-block btn-primary">Start Shopping</Link>
        </div>
      )}
    </div>
  )

  const FavoritesSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-display gold-text">Your Favorites</h3>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="glass-card overflow-hidden">
              <div className="h-48 overflow-hidden">
                {fav.products?.images?.[0] ? (
                  <img src={fav.products.images[0]} alt={fav.products?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-gold/20 to-primary-rose/20 flex items-center justify-center">
                    <img src="/logo.svg" alt="Logo" className="w-12 h-12 opacity-30" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="text-white font-semibold mb-1">{fav.products?.name}</h4>
                <p className="text-primary-gold font-bold text-xl mb-3">${fav.products?.price}</p>
                <div className="flex gap-2">
                  <Link to="/shop" className="flex-1 text-center px-3 py-2 rounded-lg border border-primary-gold text-primary-gold hover:bg-primary-gold/10 transition-all text-sm">
                    View
                  </Link>
                  <button onClick={() => removeFavorite(fav.id)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <IoHeartOutline className="text-4xl text-white/20 mx-auto mb-3" />
          <p className="text-white/60 mb-3">No favorites yet</p>
          <Link to="/shop" className="inline-block btn-primary">Browse Products</Link>
        </div>
      )}
    </div>
  )

  const ProfileSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="glass-card p-6">
          <h3 className="text-xl font-display gold-text mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Username</label>
              <input type="text" value={profileData.username} disabled className="w-full px-4 py-2 glass-card text-white rounded-lg opacity-70 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Email</label>
              <input type="email" value={profileData.email} disabled className="w-full px-4 py-2 glass-card text-white rounded-lg opacity-70 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Phone</label>
              <input type="tel" value={profileData.phone || ''} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="Add your phone" className="w-full px-4 py-2 glass-card text-white rounded-lg" />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Address</label>
              <textarea value={profileData.address || ''} onChange={(e) => setProfileData({...profileData, address: e.target.value})} placeholder="Add your address" rows="2" className="w-full px-4 py-2 glass-card text-white rounded-lg" />
            </div>
            <button onClick={updateProfile} className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
      <div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-display gold-text mb-4">Account Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Member Since</span>
              <span className="text-white">{profileData.memberSince}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Total Orders</span>
              <span className="text-white">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Total Spent</span>
              <span className="text-primary-gold font-bold">${stats.totalSpent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Favorites</span>
              <span className="text-white">{stats.totalFavorites}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const SettingsSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-display gold-text">Preferences</h3>
      <div className="glass-card p-6">
        <h4 className="text-white font-semibold mb-3">Notifications</h4>
        <div className="space-y-3">
          <label className="flex justify-between items-center cursor-pointer">
            <span className="text-white/80">Email notifications</span>
            <input type="checkbox" className="w-4 h-4 rounded border-primary-gold accent-primary-gold" />
          </label>
          <label className="flex justify-between items-center cursor-pointer">
            <span className="text-white/80">Order updates</span>
            <input type="checkbox" className="w-4 h-4 rounded border-primary-gold accent-primary-gold" defaultChecked />
          </label>
          <label className="flex justify-between items-center cursor-pointer">
            <span className="text-white/80">Promotions & offers</span>
            <input type="checkbox" className="w-4 h-4 rounded border-primary-gold accent-primary-gold" />
          </label>
        </div>
      </div>
      <div className="glass-card p-6">
        <h4 className="text-white font-semibold mb-3">Account Actions</h4>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all">Change Password</button>
          <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all">Delete Account</button>
        </div>
        <p className="text-white/40 text-xs mt-3">These actions are permanent and cannot be undone.</p>
      </div>
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }
    switch (activeSection) {
      case 'overview': return <OverviewSection />
      case 'orders': return <OrdersSection />
      case 'favorites': return <FavoritesSection />
      case 'profile': return <ProfileSection />
      case 'settings': return <SettingsSection />
      default: return <OverviewSection />
    }
  }

  return (
    <div className="dashboard-layout min-h-screen">
      {/* Overlay for mobile */}
      <div 
        className={`dashboard-overlay ${sidebarOpen && isMobile ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'} pt-16`}>
        <div className="p-5 border-b border-white/10">
          <img src="/logo.svg" alt="GiaQueenie" className="h-7 mb-2" />
          <h2 className="text-xl font-display gold-text">Dashboard</h2>
          <p className="text-white/40 text-sm mt-1">{profileData.username}</p>
        </div>
        
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeSection === item.id 
                  ? 'bg-primary-gold/20 text-primary-gold border border-primary-gold/30' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-3 border-t border-white/10">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all">
            <IoLogOutOutline size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Hamburger Menu Button */}
      <button 
        className="dashboard-menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <IoChevronBackOutline size={22} /> : <IoMenuOutline size={22} />}
      </button>

      {/* Main Content */}
      <main className={`dashboard-main ${!sidebarOpen ? 'full-width' : ''} pt-16`}>
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default Dashboard