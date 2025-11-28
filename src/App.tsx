import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import NetworkGraph from './components/networkGraph/NetworkGraph'
import NodeModal from './components/NodeModal'
import networkData from './data/networkData.json'

function App() {
  const [selectedKabupaten, setSelectedKabupaten] = useState('')
  const [selectedDesa, setSelectedDesa] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedNode, setSelectedNode] = useState<any | null>(null)

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('amartha_wallet_balance')
    return saved ? parseInt(saved, 10) : 1000000000
  })

  const handleApproveLoan = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return
    setWalletBalance((prev) => {
      const newBalance = Math.max(prev - amount, 0)
      localStorage.setItem('amartha_wallet_balance', newBalance.toString())
      return newBalance
    })
  }

  const handleKabupatenChange = (v: string) => {
    setSelectedKabupaten(v)
    setSelectedDesa('')
    setSelectedStatus('all')
    setSelectedNode(null)
  }

  const groupsArray = useMemo(() => Object.values(networkData.groups || {}), [])

  const filteredStats = useMemo(() => {
    if (!selectedDesa) return { totalGroups: 0, totalMembers: 0 }

    const filtered = groupsArray.filter((node: any) => {
      if (node.header?.location_village !== selectedDesa) return false

      if (selectedStatus !== 'all') {
        if (selectedStatus === 'healthy') return node.header?.trust_score > 80
        if (selectedStatus === 'medium')
          return node.header?.trust_score >= 25 && node.header?.trust_score <= 80
        if (selectedStatus === 'high')
          return node.header?.trust_score < 25
        return node.type === selectedStatus
      }

      return true
    })

    const totalMembers = filtered.reduce(
      (sum: number, node: any) => sum + (node.header?.member_count || 0),
      0
    )

    return {
      totalGroups: filtered.length,
      totalMembers
    }
  }, [selectedDesa, selectedStatus, groupsArray])

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* SIDEBAR FIXED */}
      <div className="w-72 h-screen fixed left-0 top-0 border-r bg-white z-20">

        <Sidebar
          selectedKabupaten={selectedKabupaten}
          onKabupatenChange={handleKabupatenChange}
          selectedDesa={selectedDesa}
          onDesaChange={setSelectedDesa}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          walletBalance={walletBalance}
        />
      </div>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 ml-72 flex flex-col h-screen overflow-auto transition-all duration-300 ${
          selectedNode ? 'pr-96' : ''
        }`}
      >
        <Header
          activeLocation={selectedDesa || 'Select Location'}
          totalGroups={filteredStats.totalGroups}
          totalMembers={filteredStats.totalMembers}
        />

        <div className="flex-1 relative">
          {selectedDesa ? (
            <NetworkGraph
              selectedLocation={selectedDesa}
              selectedStatus={selectedStatus}
              onNodeSelect={setSelectedNode}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Location Selected</h3>
                <p className="text-sm text-gray-500">
                  Please select a <span className="text-purple-600 font-bold">Kabupaten</span> and{' '}
                  <span className="text-purple-600 font-bold">Desa</span> from sidebar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        {selectedNode && (
          <NodeModal
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onApprove={handleApproveLoan}
          />
        )}
      </main>
    </div>
  )
}

export default App
