import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { IoAdd, IoTrash, IoCreate } from 'react-icons/io5'
import toast from 'react-hot-toast'

const PromotionManager = () => {
  const [promotions, setPromotions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    start_date: '',
    end_date: '',
    active: true
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
    setPromotions(data || [])
  }

  const handleSave = async () => {
    try {
      const promoData = {
        ...formData,
        code: formData.code.toUpperCase(),
        value: parseFloat(formData.value)
      }

      if (editingPromotion) {
        const { error } = await supabase
          .from('promotions')
          .update(promoData)
          .eq('id', editingPromotion.id)
        if (error) throw error
        toast.success('Promotion updated')
      } else {
        const { error } = await supabase.from('promotions').insert([promoData])
        if (error) throw error
        toast.success('Promotion created')
      }
      
      setShowModal(false)
      setEditingPromotion(null)
      setFormData({ code: '', type: 'percentage', value: '', start_date: '', end_date: '', active: true })
      fetchPromotions()
    } catch (error) {
      toast.error('Error saving promotion')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this promotion?')) {
      await supabase.from('promotions').delete().eq('id', id)
      toast.success('Promotion deleted')
      fetchPromotions()
    }
  }

  const isActive = (promotion) => {
    const now = new Date()
    const start = new Date(promotion.start_date)
    const end = new Date(promotion.end_date)
    return promotion.active && now >= start && now <= end
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditingPromotion(null); setFormData({ code: '', type: 'percentage', value: '', start_date: '', end_date: '', active: true }); setShowModal(true) }}>
        <IoAdd className="inline mr-2" /> Add Promotion
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map(promo => (
          <GlassCard key={promo.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold text-xl">{promo.code}</h3>
                <p className="text-white/60 text-sm">
                  {promo.type === 'percentage' ? `${promo.value}% OFF` : `$${promo.value} OFF`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingPromotion(promo); setFormData(promo); setShowModal(true) }} 
                        className="p-2 hover:bg-white/10 rounded-lg">
                  <IoCreate />
                </button>
                <button onClick={() => handleDelete(promo.id)} 
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                  <IoTrash />
                </button>
              </div>
            </div>
            <div className="text-white/60 text-sm">
              {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
            </div>
            <div className="mt-4">
              <span className={`px-2 py-1 rounded-full text-xs ${isActive(promo) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isActive(promo) ? 'Active' : 'Expired'}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPromotion ? 'Edit Promotion' : 'Add Promotion'}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Promo Code (e.g., WELCOME20)"
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 glass-card text-white"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
            <input
              type="number"
              placeholder={formData.type === 'percentage' ? 'Discount %' : 'Discount $'}
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={formData.start_date || ''}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            />
            <input
              type="datetime-local"
              value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            />
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
            {editingPromotion ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default PromotionManager