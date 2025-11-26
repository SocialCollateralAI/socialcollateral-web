import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import NetworkGraph from './components/NetworkGraph'
import NodeModal from './components/NodeModal'
import networkData from './data/networkData.json'

function App (){
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedNode, setSelectedNode] = useState<any | null>(null)

  // Calculate filtered data for header stats
  const filteredStats = useMemo(() => {
    const filteredNodes = Object.values(networkData.groups).filter(node => {
      // Location filter
      if (selectedLocation !== 'all') {
        if (selectedLocation === 'bekasi' && node.header.location_city !== 'Bekasi') return false
        if (selectedLocation === 'karawang' && node.header.location_city !== 'Karawang') return false
        if (!['bekasi', 'karawang'].includes(selectedLocation) && node.header.location_village !== selectedLocation) return false
      }

      // Status filter
      const trustScore = node.header.trust_score
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'active' && node.header.loan_eligibility !== 'eligible') return false
        if (selectedStatus === 'high' && trustScore <= 80) return false
        if (selectedStatus === 'medium' && (trustScore < 25 || trustScore > 80)) return false
        if (selectedStatus === 'low' && trustScore >= 25) return false
      }

      return true
    })

    const totalMembers = filteredNodes.reduce((sum, node) => sum + node.header.member_count, 0)

    return {
      totalGroups: filteredNodes.length,
      totalMembers
    }
  }, [selectedLocation, selectedStatus])

  return(
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <main className={`flex-1 flex flex-col ${selectedNode ? 'pr-96' : ''}`}>
        <Header 
          activeLocation={selectedLocation}
          totalGroups={filteredStats.totalGroups}
          totalMembers={filteredStats.totalMembers}
        />
        
        <div className="flex-1">
          <NetworkGraph 
            selectedLocation={selectedLocation}
            selectedStatus={selectedStatus}
            onNodeSelect={setSelectedNode}
          />
        </div>
      
      {/* Right-side modal rendered as sibling so it appears on the right */}
      {selectedNode && (
        <NodeModal node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
      </main>
    </div>
  )
}

export default App;