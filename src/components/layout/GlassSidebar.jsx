import React from 'react'
import { motion } from 'framer-motion'
import { 
  IoHome, 
  IoBag, 
  IoHeart, 
  IoPerson, 
  IoSettings,
  IoLogOut 
} from 'react-icons/io5'
import { useAuth } from '../../contexts/AuthContext'

const GlassSidebar = ({ isOpen, onClose, setActiveSection, activeSection }) => {
  const { signOut } = useAuth()

  const menuItems = [
    { id: 'home', icon: IoHome, label: 'Dashboard Home' },
    { id: 'orders', icon: IoBag, label: 'My Orders' },
    { id: 'favorites', icon: IoHeart, label: 'Favorites' },
    { id: 'profile', icon: IoPerson, label: 'Profile' },
    { id: 'settings', icon: IoSettings, label: 'Settings' }
  ]

  const sidebarContent = (
    <div className="h-full flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-display gold-text">Dashboard</h2>
        <div className="h-px bg-gradient-to-r from-primary-gold/50 to-transparent mt-2" />
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id)
              onClose()
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${activeSection === item.id 
                ? 'bg-primary-gold/20 text-primary-gold border border-primary-gold/30' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
              }
            `}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={signOut}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all duration-300 mt-4 w-full"
      >
        <IoLogOut size={20} />
        <span>Sign Out</span>
      </button>
    </div>
  )

  // Desktop version - always visible
  if (isOpen === true && window.innerWidth >= 768) {
    return (
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 glass-card rounded-r-2xl overflow-y-auto">
        {sidebarContent}
      </aside>
    )
  }

  // Mobile version - conditional
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed left-0 top-0 h-full w-80 glass-card rounded-r-2xl z-50 overflow-y-auto"
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}

export default GlassSidebar