import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LatLng {
  lat: number
  lng: number
}

interface LocationPickerProps {
  value?: LatLng | null
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } },
  )
  const data = await res.json()
  return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

async function searchAddress(query: string): Promise<Array<{ lat: number; lng: number; display_name: string }>> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } },
  )
  const data = await res.json()
  return data.map((item: { lat: string; lon: string; display_name: string }) => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    display_name: item.display_name,
  }))
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

function FlyToLocation({ position }: { position: LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 1 })
    }
  }, [map, position])
  return null
}

export default function LocationPicker({ value, onLocationSelect }: LocationPickerProps) {
  const [marker, setMarker] = useState<LatLng | null>(value ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; display_name: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const defaultCenter: LatLng = value ?? { lat: 41.3111, lng: 69.2797 }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMapClick = useCallback(async (latlng: LatLng) => {
    setMarker(latlng)
    setIsGeocoding(true)
    try {
      const address = await reverseGeocode(latlng.lat, latlng.lng)
      onLocationSelect({ lat: latlng.lat, lng: latlng.lng, address })
    } finally {
      setIsGeocoding(false)
    }
  }, [onLocationSelect])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const results = await searchAddress(searchQuery)
      setSearchResults(results)
      setShowResults(true)
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectResult(result: { lat: number; lng: number; display_name: string }) {
    const latlng = { lat: result.lat, lng: result.lng }
    setMarker(latlng)
    setShowResults(false)
    setSearchQuery(result.display_name)
    onLocationSelect({ lat: result.lat, lng: result.lng, address: result.display_name })
  }

  return (
    <div className="space-y-3">
      <div ref={searchRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              placeholder="Search for an address…"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[1000] mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
            {searchResults.map((result, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="text-gray-700">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-lg border" style={{ height: 300 }}>
        <MapContainer
          center={defaultCenter}
          zoom={value ? 17 : 13}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onMapClick={handleMapClick} />
          <FlyToLocation position={marker} />
          {marker && <Marker position={marker} icon={markerIcon} />}
        </MapContainer>

        {isGeocoding && (
          <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs text-gray-600 shadow">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Resolving address…
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Click on the map or search to select a precise delivery location.
      </p>
    </div>
  )
}
