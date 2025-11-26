interface SidebarProps {
  selectedLocation: string
  onLocationChange: (location: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
}

const Sidebar = ({ selectedLocation, onLocationChange, selectedStatus, onStatusChange }: SidebarProps) => {
  const locations = [
    { id: 'all', label: 'Semua Lokasi' },
    { id: 'bekasi', label: 'Kota Bekasi' },
    { id: 'karawang', label: 'Kabupaten Karawang' },
    { id: 'sukamaju', label: 'Desa Sukamaju' },
    { id: 'makmur', label: 'Desa Makmur' },
    { id: 'sejahtera', label: 'Desa Sejahtera' },
    { id: 'harmoni', label: 'Desa Harmoni' },
    { id: 'sumber_jaya', label: 'Desa Sumber Jaya' },
    { id: 'karya_mukti', label: 'Desa Karya Mukti' },
    { id: 'tanjung_sari', label: 'Desa Tanjung Sari' },
    { id: 'wangun_harja', label: 'Desa Wangun Harja' }
  ]

  const statusOptions = [
    { id: 'all', label: 'Semua Status' },
    { id: 'active', label: 'Aktif' },
    { id: 'warning', label: 'Peringatan' },
    { id: 'critical', label: 'Kritis' }
  ]

  return (
    <aside className="w-80 min-h-screen bg-gray-900 text-gray-100 flex-shrink-0">
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="text-lg font-semibold">SocialCollateral</div>
        <div className="text-xs text-gray-400 mt-1">Jaringan Amanah</div>
      </div>

      <div className="p-4 space-y-6">
        {/* Location Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Filter Lokasi</h3>
          <div className="space-y-1">
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Filter Status</h3>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label key={status.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={status.id}
                  checked={selectedStatus === status.id}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Trust Score Legend */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Trust Score</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-400">&gt; 80% - Sangat Baik</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-400">25% - 80% - Cukup</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-400">&lt; 25% - Perlu Perhatian</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-gray-800 text-xs text-gray-400">
        Social Graph Engine v1.0
      </div>
    </aside>
  )
}

export default Sidebar
