import { useState } from 'react'

interface Node {
  id: string
  label: string
  trustScore: number
  members: Array<{
    name: string
    role: string
    business: string
    monthlyIncome: number
  }>
  loanAmount: number
  repaymentRate: number
  location: string
  formationDate: string
  lastActivity: string
  status: string
}

interface NodeModalProps {
  node: Node | null
  onClose: () => void
}

const NodeModal: React.FC<NodeModalProps> = ({ node, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')
  
  if (!node) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getTrustScoreColor = (score: number) => {
    if (score > 80) return 'text-green-600 bg-green-50'
    if (score >= 25) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Anggota' },
    { id: 'insights', label: 'Insights' },
    { id: 'decisions', label: 'Keputusan' }
  ]

  return (
    <div className="fixed right-0 top-0 w-96 h-screen bg-white shadow-xl border-l border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Detail Kelompok</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
          type="button"
        >
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Group Title & Trust Score */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">{node.label}</h3>
        <div className="mt-2 flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrustScoreColor(node.trustScore)}`}>
            Trust Score: {node.trustScore}%
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(node.status)}`}>
            {node.status.toUpperCase()}
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {node.members.length} anggota • {node.location}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Informasi Dasar</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lokasi:</span>
                  <span className="text-gray-900">{node.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal Pembentukan:</span>
                  <span className="text-gray-900">{new Date(node.formationDate).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktivitas Terakhir:</span>
                  <span className="text-gray-900">{new Date(node.lastActivity).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Metrik Keuangan</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pinjaman:</span>
                  <span className="text-gray-900">{formatCurrency(node.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tingkat Pembayaran:</span>
                  <span className="text-gray-900">{node.repaymentRate}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Trust Score Breakdown</h4>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-2xl font-bold mb-1" style={{color: node.trustScore > 80 ? '#22c55e' : node.trustScore >= 25 ? '#eab308' : '#ef4444'}}>
                  {node.trustScore}%
                </div>
                <div className="text-xs text-gray-600">
                  {node.trustScore > 80 ? 'Sangat Baik - Risiko Rendah' : 
                   node.trustScore >= 25 ? 'Cukup - Risiko Sedang' : 
                   'Perlu Perhatian - Risiko Tinggi'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Daftar Anggota</h4>
              <div className="space-y-3">
                {node.members.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.role}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {member.business} • {formatCurrency(member.monthlyIncome)}/bulan
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Statistik Anggota</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Anggota:</span>
                  <span className="text-gray-900">{node.members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rata-rata Pendapatan:</span>
                  <span className="text-gray-900">
                    {formatCurrency(node.members.reduce((sum, m) => sum + m.monthlyIncome, 0) / node.members.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Analisis Kinerja</h4>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-lg font-semibold text-blue-900">
                  Repayment Rate: {node.repaymentRate}%
                </div>
                <div className="text-sm text-blue-700 mb-2">
                  {node.repaymentRate >= 95 ? 'Excellent' : 
                   node.repaymentRate >= 85 ? 'Good' : 
                   node.repaymentRate >= 70 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Profil Risiko</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">Status Kelompok</div>
                  <div className="text-gray-600 capitalize">{node.status}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">Trust Score</div>
                  <div className="text-gray-600">{node.trustScore}% - 
                    {node.trustScore > 80 ? ' Sangat Dipercaya' : 
                     node.trustScore >= 25 ? ' Cukup Dipercaya' : 
                     ' Perlu Monitoring'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Rekomendasi AI</h4>
              
              {node.trustScore >= 80 ? (
                <div className="bg-green-50 border border-green-200 p-3 rounded">
                  <div className="font-medium text-green-800">✅ APPROVE - Risiko Rendah</div>
                  <div className="text-sm text-green-700 mt-1">
                    Kelompok menunjukkan trust score tinggi dan performa pembayaran baik. 
                    Rekomendasikan plafon 90-100% dari yang diajukan.
                  </div>
                </div>
              ) : node.trustScore >= 25 ? (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <div className="font-medium text-yellow-800">⚠️ APPROVE - Risiko Sedang</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Kelompok menunjukkan potensi baik dengan beberapa area perhatian. 
                    Rekomendasikan plafon 60-80% dengan monitoring ketat.
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <div className="font-medium text-red-800">❌ REVIEW - Risiko Tinggi</div>
                  <div className="text-sm text-red-700 mt-1">
                    Kelompok menunjukkan risiko tinggi. Pertimbangkan penolakan atau 
                    pinjaman dengan plafon sangat terbatas (20-40%) dan pendampingan intensif.
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Action Items</h4>
              <div className="space-y-2 text-sm">
                {node.status === 'critical' && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lakukan evaluasi mendalam dan pendampingan intensif</span>
                  </div>
                )}
                {node.trustScore < 50 && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Perkuat ikatan sosial dan kekompakan kelompok</span>
                  </div>
                )}
                {node.repaymentRate < 85 && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor pola pembayaran dan berikan edukasi finansial</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Update data kelompok dalam 30 hari</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NodeModal