import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, ZoomIn, ZoomOut } from 'lucide-react'

// Fix Leaflet default marker icon path issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export interface MapCamera {
  id: string
  name: string
  lat: number
  lng: number
  status: 'active' | 'warning' | 'offline'
  vehicleCount?: number
  speedLimit?: number
}

export interface MapTrajectoryPoint {
  lat: number
  lng: number
  camera_id: string
  timestamp?: string
  speed?: string
}

interface Props {
  cameras?: MapCamera[]
  trajectoryPoints?: MapTrajectoryPoint[]
  selectedCameraId?: string
  onSelectCamera?: (camId: string) => void
  center?: [number, number]
  zoom?: number
  height?: string
}

const DEFAULT_CAMERAS: MapCamera[] = [
  { id: 'CAM_01', name: 'MG Road Junction', lat: 12.9716, lng: 77.5946, status: 'active', vehicleCount: 42, speedLimit: 60 },
  { id: 'CAM_02', name: 'Silk Board Flyover', lat: 12.9172, lng: 77.6228, status: 'warning', vehicleCount: 88, speedLimit: 50 },
  { id: 'CAM_03', name: 'Indiranagar 100ft Rd', lat: 12.9784, lng: 77.6408, status: 'active', vehicleCount: 31, speedLimit: 50 },
  { id: 'CAM_04', name: 'Hebbal Flyover', lat: 13.0358, lng: 77.5970, status: 'active', vehicleCount: 65, speedLimit: 70 },
  { id: 'CAM_05', name: 'Electronic City Toll', lat: 12.8452, lng: 77.6602, status: 'active', vehicleCount: 54, speedLimit: 80 },
  { id: 'CAM_06', name: 'Whitefield Main Rd', lat: 12.9698, lng: 77.7499, status: 'active', vehicleCount: 29, speedLimit: 50 },
]

export default function InteractiveMap({
  cameras = DEFAULT_CAMERAS,
  trajectoryPoints = [],
  selectedCameraId,
  onSelectCamera,
  center = [12.9716, 77.5946],
  zoom = 12,
  height = '360px',
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [id: string]: L.Marker }>({})
  const polylineRef = useRef<L.Polyline | null>(null)
  const [tileLayerType, setTileLayerType] = useState<'dark' | 'satellite' | 'street'>('dark')

  // Reliable Map Tile Layers
  const TILE_URLS = {
    dark: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    street: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  }

  // Initialize Map & invalidateSize to ensure 100% full height render
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    })

    const initialTileLayer = L.tileLayer(TILE_URLS.dark, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
    }).addTo(map)

    ;(map as any)._customTileLayer = initialTileLayer
    mapInstanceRef.current = map

    // Ensure Leaflet resizes to fit container correctly
    const resizeTimer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    const handleResize = () => map.invalidateSize()
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Switch Tile Layer Theme
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if ((map as any)._customTileLayer) {
      map.removeLayer((map as any)._customTileLayer)
    }

    const newTileLayer = L.tileLayer(TILE_URLS[tileLayerType], {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    ;(map as any)._customTileLayer = newTileLayer
    map.invalidateSize()
  }, [tileLayerType])

  // Render Camera Pins
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    cameras.forEach((cam) => {
      const isSelected = cam.id === selectedCameraId
      const statusColor = cam.status === 'warning' ? '#ef4444' : '#22c55e'

      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${statusColor}30; border: 2px solid ${statusColor};"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${isSelected ? '#3b82f6' : statusColor}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${statusColor};"></div>
        </div>
      `

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([cam.lat, cam.lng], { icon: customIcon }).addTo(map)

      const popupContent = `
        <div style="background: #0f1629; color: #f0f4ff; padding: 10px; border-radius: 8px; border: 1px solid #1e2d4a; font-family: sans-serif; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: #3b82f6; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
            <span>${cam.name}</span>
            <span style="font-size: 10px; font-family: monospace; background: #1e2d4a; padding: 2px 6px; border-radius: 4px;">${cam.id}</span>
          </div>
          <div style="font-size: 11px; color: #8899bb; margin-bottom: 8px;">GPS: ${cam.lat.toFixed(4)}, ${cam.lng.toFixed(4)}</div>
          <div style="display: flex; gap: 8px; font-size: 11px; font-family: monospace;">
            <div style="background: #141c30; padding: 4px 8px; border-radius: 4px; flex: 1;">
              <div style="color: #4a6080; font-size: 9px;">VEHICLES</div>
              <div style="color: #22c55e; font-weight: 600;">${cam.vehicleCount || 0}/m</div>
            </div>
            <div style="background: #141c30; padding: 4px 8px; border-radius: 4px; flex: 1;">
              <div style="color: #4a6080; font-size: 9px;">SPEED LIMIT</div>
              <div style="color: #f59e0b; font-weight: 600;">${cam.speedLimit || 60} km/h</div>
            </div>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)
      marker.on('click', () => {
        if (onSelectCamera) onSelectCamera(cam.id)
      })

      markersRef.current[cam.id] = marker
    })
  }, [cameras, selectedCameraId])

  // Render Trajectory Polyline
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    if (trajectoryPoints.length > 0) {
      const latLngs = trajectoryPoints.map((p) => [p.lat, p.lng] as [number, number])

      const polyline = L.polyline(latLngs, {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(map)

      polylineRef.current = polyline
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] })
    }
  }, [trajectoryPoints])

  // Fly to selected camera
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedCameraId) return

    const cam = cameras.find((c) => c.id === selectedCameraId)
    if (cam) {
      map.flyTo([cam.lat, cam.lng], 14, { duration: 1.2 })
      const marker = markersRef.current[cam.id]
      if (marker) marker.openPopup()
    }
  }, [selectedCameraId])

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#1e2d4a] shadow-2xl w-full" style={{ height, minHeight: '340px' }}>
      {/* Map Canvas with Explicit Height */}
      <div ref={mapContainerRef} className="w-full h-full z-0" style={{ height: '100%', minHeight: '340px', background: '#0a0e1a' }} />

      {/* Top Left Status Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#0a0e1acc] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1e2d4a]">
        <Navigation size={13} className="text-[#3b82f6] animate-spin" />
        <span className="text-xs font-mono font-semibold text-[#f0f4ff]">BENGALURU GIS METRO TRAFFIC</span>
      </div>

      {/* Top Right Map Style Switcher */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#0a0e1acc] backdrop-blur-md p-1 rounded-lg border border-[#1e2d4a]">
        <button
          onClick={() => setTileLayerType('dark')}
          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
            tileLayerType === 'dark' ? 'bg-[#2563eb] text-white' : 'text-[#8899bb] hover:text-white'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setTileLayerType('satellite')}
          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
            tileLayerType === 'satellite' ? 'bg-[#2563eb] text-white' : 'text-[#8899bb] hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setTileLayerType('street')}
          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
            tileLayerType === 'street' ? 'bg-[#2563eb] text-white' : 'text-[#8899bb] hover:text-white'
          }`}
        >
          Streets
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-8 h-8 rounded-lg bg-[#0a0e1acc] backdrop-blur-md border border-[#1e2d4a] flex items-center justify-center text-[#8899bb] hover:text-white transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-8 h-8 rounded-lg bg-[#0a0e1acc] backdrop-blur-md border border-[#1e2d4a] flex items-center justify-center text-[#8899bb] hover:text-white transition-colors"
        >
          <ZoomOut size={16} />
        </button>
      </div>
    </div>
  )
}
