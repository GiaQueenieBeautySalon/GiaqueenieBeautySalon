import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { uploadVideoToCloudinary } from '../../services/cloudinary'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { IoAdd, IoTrash, IoCreate, IoVideocam } from 'react-icons/io5'
import toast from 'react-hot-toast'

const PageManager = () => {
  const [pages, setPages] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    hero_video: '',
    content: '',
    products: [],
    services: [],
    active: true
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPages()
    fetchProducts()
    fetchServices()
  }, [])

  const fetchPages = async () => {
    const { data } = await supabase.from('pages').select('*').order('created_at', { ascending: false })
    setPages(data || [])
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name')
    setProducts(data || [])
  }

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('id, name')
    setServices(data || [])
  }

  const handleVideoUpload = async (file) => {
    setUploading(true)
    try {
      const url = await uploadVideoToCloudinary(file, 'pages')
      setFormData(prev => ({ ...prev, hero_video: url }))
      toast.success('Video uploaded')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingPage) {
        const { error } = await supabase
          .from('pages')
          .update(formData)
          .eq('id', editingPage.id)
        if (error) throw error
        toast.success('Page updated')
      } else {
        const { error } = await supabase.from('pages').insert([formData])
        if (error) throw error
        toast.success('Page created')
      }
      
      setShowModal(false)
      setEditingPage(null)
      setFormData({ slug: '', title: '', hero_video: '', content: '', products: [], services: [], active: true })
      fetchPages()
    } catch (error) {
      toast.error('Error saving page')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this page?')) {
      await supabase.from('pages').delete().eq('id', id)
      toast.success('Page deleted')
      fetchPages()
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditingPage(null); setFormData({ slug: '', title: '', hero_video: '', content: '', products: [], services: [], active: true }); setShowModal(true) }}>
        <IoAdd className="inline mr-2" /> Create Page
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map(page => (
          <GlassCard key={page.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold text-xl">{page.title}</h3>
                <p className="text-white/60 text-sm">/{page.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingPage(page); setFormData(page); setShowModal(true) }} 
                        className="p-2 hover:bg-white/10 rounded-lg">
                  <IoCreate />
                </button>
                <button onClick={() => handleDelete(page.id)} 
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                  <IoTrash />
                </button>
              </div>
            </div>
            <p className="text-white/60 text-sm line-clamp-2">{page.content}</p>
            <div className="mt-4 flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${page.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {page.active ? 'Active' : 'Inactive'}
              </span>
              <span className="px-2 py-1 rounded-full text-xs bg-white/10">
                {page.products?.length || 0} Products
              </span>
              <span className="px-2 py-1 rounded-full text-xs bg-white/10">
                {page.services?.length || 0} Services
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPage ? 'Edit Page' : 'Create Page'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <input
            type="text"
            placeholder="Page Slug (e.g., hair-care)"
            value={formData.slug || ''}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            className="w-full px-4 py-2 glass-card text-white"
          />
          <input
            type="text"
            placeholder="Page Title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 glass-card text-white"
          />
          <textarea
            placeholder="Page Content"
            value={formData.content || ''}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 glass-card text-white"
            rows="3"
          />
          
          {/* Hero Video Upload */}
          <div>
            <label className="block text-white/80 mb-2">Hero Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e.target.files[0])}
              className="w-full"
              disabled={uploading}
            />
            {uploading && <p className="text-primary-gold text-sm mt-2">Uploading video...</p>}
            {formData.hero_video && (
              <p className="text-primary-gold text-sm mt-2">Video uploaded</p>
            )}
          </div>

          {/* Products Selection */}
          <div>
            <label className="block text-white/80 mb-2">Associated Products</label>
            <select
              multiple
              value={formData.products || []}
              onChange={(e) => setFormData({ ...formData, products: Array.from(e.target.selectedOptions, option => option.value) })}
              className="w-full px-4 py-2 glass-card text-white"
              size="5"
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          {/* Services Selection */}
          <div>
            <label className="block text-white/80 mb-2">Associated Services</label>
            <select
              multiple
              value={formData.services || []}
              onChange={(e) => setFormData({ ...formData, services: Array.from(e.target.selectedOptions, option => option.value) })}
              className="w-full px-4 py-2 glass-card text-white"
              size="5"
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.active || false}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <span className="text-white">Active</span>
          </label>

          <Button onClick={handleSave} className="w-full">
            {editingPage ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default PageManager