import React from 'react'
import { NavLink } from 'react-router-dom'
import { IoHome, IoBag, IoCalendar, IoPerson, IoHeart } from 'react-icons/io5'

const BottomNav = () => {
  const navItems = [
    { path: '/', icon: IoHome, label: 'Home' },
    { path: '/shop', icon: IoBag, label: 'Shop' },
    { path: '/services', icon: IoCalendar, label: 'Services' },
    { path: '/dashboard', icon: IoPerson, label: 'Profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-t-2xl md:hidden z-40 border-b-0">
      <div className="flex justify-around py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-all duration-300
              ${isActive ? 'text-primary-gold' : 'text-white/60 hover:text-white'}
            `}
          >
            <item.icon size={22} />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav