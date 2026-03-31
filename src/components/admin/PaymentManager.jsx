import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { uploadToCloudinary } from '../../services/cloudinary'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { IoAdd, IoTrash, IoCreate, IoQrCode } from 'react-icons/io5'
import toast from 'react-hot-toast'

const PaymentManager = () => {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    fields: [],
    qr_code: '',
    active: true
  })
  const [newField, setNewField] = useState({ key: '', label: '', type: 'text' })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    const { data } = await supabase.from('payment_methods').select('*')
    setPaymentMethods(data || [])
  }

  const handleAddField = () => {
    if (newField.key && newField.label) {
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }))
      setNewField({ key: '', label: '', type: 'text' })
    }
  }

  const handleRemoveField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }

  const handleQRUpload = async (file) => {
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, 'payment_qr')
      setFormData(prev => ({ ...prev, qr_code: url }))
      toast.success('QR code uploaded')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingMethod) {
        const { error } = await supabase
          .from('payment_methods')
          .update(formData)
          .eq('id', editingMethod.id)
        if (error) throw error
        toast.success('Payment method updated')
      } else {
        const { error } = await supabase.from('payment_methods').insert([formData])
        if (error) throw error
        toast.success('Payment method added')
      }
      
      setShowModal(false)
      setEditingMethod(null)
      setFormData({ name: '', fields: [], qr_code: '', active: true })
      fetchPaymentMethods()
    } catch (error) {
      toast.error('Error saving payment method')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this payment method?')) {
      await supabase.from('payment_methods').delete().eq('id', id)
      toast.success('Payment method deleted')
      fetchPaymentMethods()
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditingMethod(null); setFormData({ name: '', fields: [], qr_code: '', active: true }); setShowModal(true) }}>
        <IoAdd className="inline mr-2" /> Add Payment Method
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentMethods.map(method => (
          <GlassCard key={method.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold text-xl">{method.name}</h3>
                <p className="text-white/60 text-sm">{method.fields.length} fields</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingMethod(method); setFormData(method); setShowModal(true) }} 
                        className="p-2 hover:bg-white/10 rounded-lg">
                  <IoCreate />
                </button>
                <button onClick={() => handleDelete(method.id)} 
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                  <IoTrash />
                </button>
              </div>
            </div>
            {method.qr_code && (
              <img src={method.qr_code} alt="QR Code" className="w-24 h-24 object-cover rounded-lg mb-4" />
            )}
            <div className="space-y-2">
              {method.fields.map((field, i) => (
                <div key={i} className="text-white/60 text-sm">
                  {field.label}: <span className="text-white">[User Input]</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className={`px-2 py-1 rounded-full text-xs ${method.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {method.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <input
            type="text"
            placeholder="Method Name (e.g., CashApp, Bitcoin)"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 glass-card text-white"
          />

          {/* Fields Builder */}
          <div>
            <label className="block text-white/80 mb-2">Payment Fields</label>
            <div className="space-y-2 mb-4">
              {formData.fields.map((field, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-white/60 flex-1">{field.label}</span>
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <IoTrash />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Field Key (e.g., username)"
                value={newField.key}
                onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                className="flex-1 px-4 py-2 glass-card text-white"
              />
              <input
                type="text"
                placeholder="Field Label (e.g., CashApp Username)"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="flex-1 px-4 py-2 glass-card text-white"
              />
              <Button onClick={handleAddField} className="px-4">Add</Button>
            </div>
          </div>

          {/* QR Code Upload */}
          <div>
            <label className="block text-white/80 mb-2">QR Code (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleQRUpload(e.target.files[0])}
              className="w-full"
              disabled={uploading}
            />
            {uploading && <p className="text-primary-gold text-sm mt-2">Uploading...</p>}
            {formData.qr_code && (
              <div className="mt-2">
                <img src={formData.qr_code} alt="QR Code" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            )}
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
            {editingMethod ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default PaymentManager