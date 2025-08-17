import { useState, useEffect } from 'react'
import { LocationSection } from './Sections/location.jsx'
import { TimeSection } from './Sections/time.jsx'

import './App.css'
import { 
  fetchOrientationData, 
  setupWindowResizeListener,  
} from './utils.js'

function App() {
  const [orientationData, setOrientationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    // Initial data fetch
    const initializeData = async () => {
      const orientationResult = await fetchOrientationData()
      if (orientationResult.error) {
        setError(orientationResult.error)
      } else {
        setOrientationData(orientationResult.data)
      }
      setLoading(false)
    }

    initializeData()


    // Setup window resize listener
    const clearResizeListener = setupWindowResizeListener(async () => {
      const result = await fetchOrientationData()
      if (!result.error) {
        setOrientationData(result.data)
      }
    })

    return () => {
      clearResizeListener()
    }
  }, [])

  if (loading) {
    return <div className="loading">Loading orientation data...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  if (!orientationData) {
    return <div className="error">No orientation data available</div>
  }

  return (
    <div className="app-container">
      {/* for debugging */}
      {/* <div className="orientation-info">
        <h2>Screen Orientation: {orientationData.isLandscape ? 'Landscape' : 'Portrait'}</h2>
        <p>Dimensions: {orientationData.width} x {orientationData.height}</p>
        <p>Layout: {orientationData.isLandscape ? '2x3 Grid (3 top, 3 bottom)' : '2x2 Grid (2 top, 2 bottom)'}</p>
        <p>Total Sections: {orientationData.sections.length}</p>
      </div> */}
             {orientationData.isLandscape &&
         <div className="screen-container grid grid-cols-3 grid-rows-2 h-full">
           <div className="border border-black p-4">
             <h3>System Time</h3>
             <TimeSection />
           </div>
           <div >
             <h3>Section 2</h3>
           </div>
           <div >
              <h3>Device Location</h3>
             <LocationSection />
           </div>
           <div >
             <h3>Section 4</h3>
           </div>
           <div >
             <h3>Section 5</h3>
           </div>
           <div>
             <h3>Section 6</h3>
           </div>
         </div>
        }

             {!orientationData.isLandscape &&
         <div className="screen-container grid grid-cols-2 grid-rows-2 h-full">
           <div >
             <h3>System Time</h3>
             <TimeSection />

           </div>
           <div c>
             <h3>Device Location</h3>
             <LocationSection />

           </div>
           <div >
             <h3>Section 3</h3>
           </div>
           <div >
             <h3>Section 4</h3>
           </div>
         </div>
       }


    </div>
  )
}

export default App
