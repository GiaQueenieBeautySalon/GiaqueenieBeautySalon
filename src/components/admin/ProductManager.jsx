import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { uploadMultipleToCloudinary } from '../../services/cloudinary'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { IoAdd, IoTrash, IoCreate, IoImage } from 'react-icons/io5'
import toast from 'react-hot-toast'

const ProductManager = () => {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    stock: '',
    category: '',
    featured: false
  })
  const [imageFiles, setImageFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const categories = ['Hair Care', 'Hair Tools', 'Aromatherapy', 'Wedding Packages', 'Bags', 'Gift Cards']

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  const handleImageUpload = async (files) => {
    setUploading(true)
    try {
      const urls = await uploadMultipleToCloudinary(files, 'products')
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }))
      toast.success('Images uploaded')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      setImageFiles([])
    }
  }

  const handleSave = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        stock: parseInt(formData.stock)
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
        toast.success('Product updated')
      } else {
        const { error } = await supabase.from('products').insert([productData])
        if (error) throw error
        toast.success('Product added')
      }
      
      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        compare_price: '',
        stock: '',
        category: '',
        featured: false,
        images: []
      })
      fetchProducts()
    } catch (error) {
      toast.error('Error saving product')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await supabase.from('products').delete().eq('id', id)
      toast.success('Product deleted')
      fetchProducts()
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', compare_price: '', stock: '', category: '', featured: false, images: [] }); setShowModal(true) }}>
        <IoAdd className="inline mr-2" /> Add Product
      </Button>

      <div className="grid grid-cols-1 gap-4">
        {products.map(product => (
          <GlassCard key={product.id} className="p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              {product.images && product.images[0] && (
                <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div>
                <h3 className="text-white font-semibold">{product.name}</h3>
                <p className="text-white/60 text-sm">${product.price} • Stock: {product.stock}</p>
                <p className="text-white/40 text-xs">{product.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true) }} 
                      className="p-2 hover:bg-white/10 rounded-lg">
                <IoCreate />
              </button>
              <button onClick={() => handleDelete(product.id)} 
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                <IoTrash />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
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
              placeholder="Compare Price (Optional)"
              value={formData.compare_price || ''}
              onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Stock"
              value={formData.stock || ''}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            />
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2 glass-card text-white"
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured || false}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <span className="text-white">Featured Product</span>
          </label>
          
          {/* Image Upload */}
          <div>
            <label className="block text-white/80 mb-2">Product Images</label>
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
                  <img key={i} src={url} alt="Product" className="w-16 h-16 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSave} className="w-full">
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ProductManager