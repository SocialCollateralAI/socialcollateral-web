interface HeaderProps {
  activeLocation: string
  totalGroups: number
  totalMembers: number
}

const Header = ({ activeLocation, totalGroups, totalMembers }: HeaderProps) => {
  const getLocationName = (locationId: string) => {
    const locationMap: Record<string, string> = {
      'all': 'Semua Lokasi',
      'bekasi': 'Kota Bekasi',
      'karawang': 'Kabupaten Karawang',
      'sukamaju': 'Desa Sukamaju',
      'makmur': 'Desa Makmur',
      'sejahtera': 'Desa Sejahtera',
      'harmoni': 'Desa Harmoni',
      'sumber_jaya': 'Desa Sumber Jaya',
      'karya_mukti': 'Desa Karya Mukti',
      'tanjung_sari': 'Desa Tanjung Sari',
      'wangun_harja': 'Desa Wangun Harja'
    }
    return locationMap[locationId] || 'Lokasi Tidak Dikenal'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Jaringan Sosial - {getLocationName(activeLocation)}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Visualisasi jaringan kelompok dan koneksi sosial
          </p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalGroups}</div>
            <div className="text-xs text-gray-500">Total Kelompok</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalMembers}</div>
            <div className="text-xs text-gray-500">Total Anggota</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Date().toLocaleDateString('id-ID')}
            </div>
            <div className="text-xs text-gray-500">Update Terakhir</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header