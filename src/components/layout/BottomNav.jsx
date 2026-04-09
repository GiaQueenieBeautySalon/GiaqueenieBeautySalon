import React from 'react'
import { NavLink } from 'react-router-dom'
import { IoHome, IoBag, IoCalendar, IoPerson } from 'react-icons/io5'

const BottomNav = () => {
  const navItems = [
    { path: '/', icon: IoHome, label: 'Home' },
    { path: '/shop', icon: IoBag, label: 'Shop' },
    { path: '/services', icon: IoCalendar, label: 'Services' },
    { path: '/dashboard', icon: IoPerson, label: 'Profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-t-2xl md:hidden z-40 border-b-0 safe-padding-bottom">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 
              transition-all duration-300 py-1.5 px-3 rounded-xl
              min-h-[48px] min-w-[64px]
              ${isActive ? 'text-primary-gold bg-primary-gold/10' : 'text-white/60 hover:text-white'}
            `}
          >
            <item.icon size={22} />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav