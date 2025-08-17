// Utility functions for data fetching and management

export const fetchOrientationData = async () => {
  try {
    if (window.api && window.api.getOrientationData) {
      const data = await window.api.getOrientationData()
      return { data, error: null }
    } else {
      return { data: null, error: 'API not available' }
    }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

export const fetchSystemData = async () => {
  try {
    if (window.api) {
      const timeData = await window.api.getSystemTime()
      
      // Get precise location using browser's geolocation API
      const locationData = await getPreciseLocation()
      
      return { 
        systemTime: timeData, 
        deviceLocation: locationData, 
        error: null 
      }
    } else {
      return { 
        systemTime: null, 
        deviceLocation: null, 
        error: 'API not available' 
      }
    }
  } catch (err) {
    console.error('Error fetching system data:', err)
    return { 
      systemTime: null, 
      deviceLocation: null, 
      error: err.message 
    }
  }
}

// Get precise location using browser's geolocation API
export const getPreciseLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    const options = {
      enableHighAccuracy: true,  // Use GPS if available
      timeout: 10000,           // 10 second timeout
      maximumAge: 300000        // Cache for 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Get address information using reverse geocoding
          const addressData = await getAddressFromCoords(latitude, longitude)
          
          resolve({
            lat: latitude,
            lon: longitude,
            accuracy: position.coords.accuracy,
            city: addressData.city,
            country: addressData.country,
            region: addressData.region,
            timezone: addressData.timezone,
            method: 'GPS/WiFi/Cell'
          })
        } catch (error) {
          // If reverse geocoding fails, still return coordinates
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            city: 'Unknown',
            country: 'Unknown',
            region: 'Unknown',
            timezone: 'Unknown',
            method: 'GPS/WiFi/Cell'
          })
        }
      },
      (error) => {
        // Fallback to IP-based location if geolocation fails
        console.warn('Precise geolocation failed, falling back to IP-based location:', error.message)
        getIPBasedLocation().then(resolve).catch(reject)
      },
      options
    )
  })
}

// Get address information from coordinates using reverse geocoding
const getAddressFromCoords = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
    )
    const data = await response.json()
    
    return {
      city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
      country: data.address?.country || 'Unknown',
      region: data.address?.state || data.address?.province || 'Unknown',
      timezone: data.address?.timezone || 'Unknown'
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return {
      city: 'Unknown',
      country: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown'
    }
  }
}

// Fallback IP-based location
const getIPBasedLocation = async () => {
  try {
    const response = await fetch('http://ip-api.com/json/')
    const data = await response.json()
    
    return {
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      region: data.regionName || 'Unknown',
      lat: data.lat || 0,
      lon: data.lon || 0,
      timezone: data.timezone || 'Unknown',
      method: 'IP-based'
    }
  } catch (error) {
    throw new Error('IP-based location failed')
  }
}

export const fetchSystemTime = async () => {
  try {
    if (window.api) {
      const timeData = await window.api.getSystemTime()
      return { data: timeData, error: null }
    } else {
      return { data: null, error: 'API not available' }
    }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

export const setupWindowResizeListener = (callback) => {
  const handleResize = () => callback()
  window.addEventListener('resize', handleResize)
  
  // Listen for Electron window resize events
  if (window.api && window.api.onWindowResize) {
    window.api.onWindowResize(() => callback())
  }
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

export const setupTimeInterval = (callback) => {
  const interval = setInterval(() => {
    if (window.api) {
      window.api.getSystemTime().then(callback)
    }
  }, 1000)
  
  return () => clearInterval(interval)
}
