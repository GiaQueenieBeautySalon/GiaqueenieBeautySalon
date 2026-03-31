import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { 
  IoLogoFacebook, 
  IoLogoInstagram, 
  IoLogoTwitter, 
  IoLogoTiktok, 
  IoLogoYoutube, 
  IoLogoPinterest, 
  IoLogoLinkedin,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

const Footer = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'GiaQueenie',
    tagline: 'Luxury Beauty Salon',
    description: 'Experience the pinnacle of luxury beauty and wellness treatments.',
    email: 'info@giaqueenie.com',
    phone: '+234 123 456 7890',
    address: '123 Luxury Avenue, Lagos, Nigeria',
    business_hours: 'Mon-Sat: 9am - 8pm | Sun: 12pm - 6pm',
    copyright: '© 2024 GiaQueenie. All rights reserved.'
  })
  
  const [socialLinks, setSocialLinks] = useState([])
  const [quickLinks, setQuickLinks] = useState([])
  const [footerSections, setFooterSections] = useState([])
  const [loading, setLoading] = useState(true)

  // Icon mapping
  const getSocialIcon = (platform) => {
    const iconMap = {
      facebook: IoLogoFacebook,
      instagram: IoLogoInstagram,
      twitter: IoLogoTwitter,
      tiktok: IoLogoTiktok,
      youtube: IoLogoYoutube,
      pinterest: IoLogoPinterest,
      linkedin: IoLogoLinkedin
    }
    const Icon = iconMap[platform?.toLowerCase()]
    return Icon ? <Icon size={20} /> : platform
  }

  const getContactIcon = (icon) => {
    const iconMap = {
      email: IoMailOutline,
      phone: IoCallOutline,
      address: IoLocationOutline,
      hours: IoTimeOutline
    }
    const Icon = iconMap[icon?.toLowerCase()]
    return Icon ? <Icon size={18} /> : null
  }

  useEffect(() => {
    loadFooterSettings()
  }, [])

  const loadFooterSettings = async () => {
    setLoading(true)
    try {
      // Load company info
      const { data: companyData, error: companyError } = await supabase
        .from('footer_settings')
        .select('content')
        .eq('type', 'company')
        .single()
      
      if (companyError) {
        console.error('Error loading company:', companyError)
      } else if (companyData) {
        console.log('Company data loaded:', companyData.content)
        setCompanyInfo(companyData.content)
      }

      // Load social links
      const { data: socialData, error: socialError } = await supabase
        .from('footer_settings')
        .select('content')
        .eq('type', 'social')
        .single()
      
      if (socialError) {
        console.error('Error loading social:', socialError)
      } else if (socialData && Array.isArray(socialData.content)) {
        console.log('Social links loaded:', socialData.content)
        setSocialLinks(socialData.content.filter(link => link.active && link.url))
      }

      // Load quick links separately
      const { data: quickLinksData, error: quickLinksError } = await supabase
        .from('footer_settings')
        .select('content')
        .eq('type', 'quick_links')
        .single()
      
      if (quickLinksError) {
        console.error('Error loading quick links:', quickLinksError)
      } else if (quickLinksData && Array.isArray(quickLinksData.content)) {
        console.log('Quick links loaded:', quickLinksData.content)
        setQuickLinks(quickLinksData.content.filter(link => link.active))
      }

      // Load footer sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('footer_settings')
        .select('content')
        .eq('type', 'footer_sections')
        .single()
      
      if (sectionsError) {
        console.error('Error loading sections:', sectionsError)
      } else if (sectionsData && Array.isArray(sectionsData.content)) {
        console.log('Footer sections loaded:', sectionsData.content)
        
        // Process sections to ensure they have proper data
        const processedSections = sectionsData.content.map(section => {
          // If it's the quick-links section and doesn't have items, add them from quickLinks state
          if (section.id === 'quick-links' && (!section.items || section.items.length === 0)) {
            return {
              ...section,
              items: quickLinks.map(link => ({ title: link.title, url: link.url }))
            }
          }
          return section
        })
        
        setFooterSections(processedSections.filter(section => section.active))
      }
    } catch (error) {
      console.error('Error loading footer settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <footer className="bg-dark-200 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-dark-200 border-t border-white/10">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt={companyInfo.name} className="h-10 w-auto" />
              <div>
                <h3 className="text-xl font-display gold-text">{companyInfo.name}</h3>
                <p className="text-white/40 text-xs">{companyInfo.tagline}</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {companyInfo.description}
            </p>
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-primary-gold hover:text-dark-100 transition-all duration-300"
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links Section */}
          {quickLinks.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-primary-gold font-semibold text-lg">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    {link.url.startsWith('http') ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-primary-gold text-sm transition-colors flex items-center gap-1 group"
                      >
                        <IoArrowForwardOutline size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.title}
                      </a>
                    ) : (
                      <Link
                        to={link.url}
                        className="text-white/60 hover:text-primary-gold text-sm transition-colors flex items-center gap-1 group"
                      >
                        <IoArrowForwardOutline size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dynamic Footer Sections */}
          {footerSections.map((section) => {
            // Skip if it's the quick-links section since we already display it above
            if (section.id === 'quick-links') return null
            
            return (
              <div key={section.id} className="space-y-4">
                <h4 className="text-primary-gold font-semibold text-lg">{section.title}</h4>
                
                {section.type === 'links' && section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx}>
                        {item.url && item.url.startsWith('http') ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-primary-gold text-sm transition-colors flex items-center gap-1 group"
                          >
                            <IoArrowForwardOutline size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            {item.title}
                          </a>
                        ) : item.url ? (
                          <Link
                            to={item.url}
                            className="text-white/60 hover:text-primary-gold text-sm transition-colors flex items-center gap-1 group"
                          >
                            <IoArrowForwardOutline size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            {item.title}
                          </Link>
                        ) : (
                          <span className="text-white/60 text-sm">{item.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {section.type === 'text' && (
                  <p className="text-white/60 text-sm leading-relaxed">
                    {section.content || companyInfo.business_hours}
                  </p>
                )}

                {section.type === 'contact' && section.items && (
                  <div className="space-y-3">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {getContactIcon(item.icon) && (
                          <span className="text-primary-gold mt-0.5">
                            {getContactIcon(item.icon)}
                          </span>
                        )}
                        <div>
                          <p className="text-white/40 text-xs">{item.label}</p>
                          {item.value && item.value.includes('@') ? (
                            <a href={`mailto:${item.value}`} className="text-white/60 hover:text-primary-gold text-sm transition-colors">
                              {item.value}
                            </a>
                          ) : item.value && item.value.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/) ? (
                            <a href={`tel:${item.value}`} className="text-white/60 hover:text-primary-gold text-sm transition-colors">
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-white/60 text-sm">{item.value || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm text-center md:text-left">
              {companyInfo.copyright}
            </p>
            <div className="flex gap-6">
              {quickLinks.filter(link => link.title === 'Privacy Policy' || link.title === 'Terms & Conditions').map((link, idx) => (
                <Link key={idx} to={link.url} className="text-white/40 hover:text-primary-gold text-xs transition-colors">
                  {link.title}
                </Link>
              ))}
              {!quickLinks.find(l => l.title === 'Privacy Policy') && (
                <Link to="/privacy" className="text-white/40 hover:text-primary-gold text-xs transition-colors">
                  Privacy Policy
                </Link>
              )}
              {!quickLinks.find(l => l.title === 'Terms & Conditions') && (
                <Link to="/terms" className="text-white/40 hover:text-primary-gold text-xs transition-colors">
                  Terms & Conditions
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer