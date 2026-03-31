import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { uploadMultipleToCloudinary } from '../../services/cloudinary'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { IoAdd, IoTrash, IoCreate } from 'react-icons/io5'
import toast from 'react-hot-toast'

const ServiceManager = () => {
  const [services, setServices] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    images: []
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false })
    setServices(data || [])
  }

  const handleImageUpload = async (files) => {
    setUploading(true)
    try {
      const urls = await uploadMultipleToCloudinary(files, 'services')
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }))
      toast.success('Images uploaded')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      }

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)
        if (error) throw error
        toast.success('Service updated')
      } else {
        const { error } = await supabase.from('services').insert([serviceData])
        if (error) throw error
        toast.success('Service added')
      }
      
      setShowModal(false)
      setEditingService(null)
      setFormData({ name: '', description: '', price: '', duration: '', images: [] })
      fetchServices()
    } catch (error) {
      toast.error('Error saving service')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this service?')) {
      await supabase.from('services').delete().eq('id', id)
      toast.success('Service deleted')
      fetchServices()
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditingService(null); setFormData({ name: '', description: '', price: '', duration: '', images: [] }); setShowModal(true) }}>
        <IoAdd className="inline mr-2" /> Add Service
      </Button>

      <div className="grid grid-cols-1 gap-4">
        {services.map(service => (
          <GlassCard key={service.id} className="p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              {service.images && service.images[0] && (
                <img src={service.images[0]} alt={service.name} className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div>
                <h3 className="text-white font-semibold">{service.name}</h3>
                <p className="text-white/60 text-sm">${service.price} • {service.duration} mins</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingService(service); setFormData(service); setShowModal(true) }} 
                      className="p-2 hover:bg-white/10 rounded-lg">
                <IoCreate />
              </button>
              <button onClick={() => handleDelete(service.id)} 
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                <IoTrash />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? 'Edit Service' : 'Add Service'}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Service Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 glass-card text-white"
          />
          <textarea
            placeholder="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 glass-card text-white"
            rows="3"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Price"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            />
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-white/80 mb-2">Service Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(Array.from(e.target.files))}
              className="w-full"
              disabled={uploading}
            />
            {uploading && <p className="text-primary-gold text-sm mt-2">Uploading...</p>}
            {formData.images && formData.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.images.map((url, i) => (
                  <img key={i} src={url} alt="Service" className="w-16 h-16 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSave} className="w-full">
            {editingService ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ServiceManager