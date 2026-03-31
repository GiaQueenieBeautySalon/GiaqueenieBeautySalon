const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dncv9mquq'
const UPLOAD_PRESET = 'giaqueenie'  // Use the preset name directly

export const uploadToCloudinary = async (file, folder = 'products') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  // Add timestamp to avoid cache issues
  formData.append('timestamp', Math.floor(Date.now() / 1000))
  
  // Add folder structure in the public_id
  const fileName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')
  const timestamp = Date.now()
  formData.append('public_id', `${folder}/${fileName}_${timestamp}`)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    const data = await response.json()
    if (data.error) {
      console.error('Cloudinary error:', data.error)
      throw new Error(data.error.message)
    }
    console.log('Upload success:', data.secure_url)
    return data.secure_url
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export const uploadMultipleToCloudinary = async (files, folder = 'products') => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder))
  return Promise.all(uploadPromises)
}

export const uploadVideoToCloudinary = async (file, folder = 'hero') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('timestamp', Math.floor(Date.now() / 1000))
  
  const fileName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')
  const timestamp = Date.now()
  formData.append('public_id', `${folder}/${fileName}_${timestamp}`)
  formData.append('resource_type', 'video')

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    const data = await response.json()
    if (data.error) {
      console.error('Cloudinary error:', data.error)
      throw new Error(data.error.message)
    }
    console.log('Video upload success:', data.secure_url)
    return data.secure_url
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}