import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { uploadVideoToCloudinary, uploadToCloudinary } from '../../services/cloudinary'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { IoVideocam, IoImage, IoTrash } from 'react-icons/io5'
import toast from 'react-hot-toast'

const MediaManager = () => {
  const [heroMedia, setHeroMedia] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchHeroMedia()
  }, [])

  const fetchHeroMedia = async () => {
    const { data } = await supabase.from('hero_media').select('*').order('created_at', { ascending: false })
    setHeroMedia(data || [])
  }

  const handleHeroUpload = async (file, type) => {
    setUploading(true)
    try {
      let url
      if (type === 'video') {
        url = await uploadVideoToCloudinary(file, 'hero')
      } else {
        url = await uploadToCloudinary(file, 'hero')
      }

      // Deactivate other media
      await supabase.from('hero_media').update({ active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      
      // Insert new media
      const { error } = await supabase.from('hero_media').insert([{
        type,
        url,
        active: true
      }])

      if (error) throw error
      toast.success('Hero media uploaded and activated')
      fetchHeroMedia()
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSetActive = async (id) => {
    await supabase.from('hero_media').update({ active: false })
    await supabase.from('hero_media').update({ active: true }).eq('id', id)
    toast.success('Hero media updated')
    fetchHeroMedia()
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this media?')) {
      await supabase.from('hero_media').delete().eq('id', id)
      toast.success('Media deleted')
      fetchHeroMedia()
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Media Upload */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-display gold-text mb-4">Hero Section Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 mb-2">Upload Hero Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleHeroUpload(e.target.files[0], 'video')}
              className="w-full"
              disabled={uploading}
            />
            <p className="text-white/40 text-sm mt-2">Recommended: MP4, 1920x1080</p>
          </div>
          <div>
            <label className="block text-white/80 mb-2">Upload Hero Image (Fallback)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleHeroUpload(e.target.files[0], 'image')}
              className="w-full"
              disabled={uploading}
            />
          </div>
        </div>
        {uploading && <p className="text-primary-gold mt-4">Uploading...</p>}
      </GlassCard>

      {/* Current Hero Media */}
      <div>
        <h3 className="text-xl font-display gold-text mb-4">Current Hero Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heroMedia.map(media => (
            <GlassCard key={media.id} className="p-4">
              {media.type === 'video' ? (
                <video src={media.url} className="w-full h-48 object-cover rounded-lg" controls />
              ) : (
                <img src={media.url} alt="Hero" className="w-full h-48 object-cover rounded-lg" />
              )}
              <div className="flex justify-between items-center mt-4">
                <span className={`px-2 py-1 rounded-full text-xs ${media.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
                  {media.active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  {!media.active && (
                    <button onClick={() => handleSetActive(media.id)} className="px-3 py-1 rounded-lg bg-primary-gold/20 text-primary-gold text-sm">
                      Set Active
                    </button>
                  )}
                  <button onClick={() => handleDelete(media.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                    <IoTrash />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MediaManager