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
    const filteredNodes = networkData.nodes.filter(node => {
      // Location filter
      if (selectedLocation !== 'all') {
        if (selectedLocation === 'bekasi' && node.cityId !== 'bekasi') return false
        if (selectedLocation === 'karawang' && node.cityId !== 'karawang') return false
        if (!['bekasi', 'karawang'].includes(selectedLocation) && node.villageId !== selectedLocation) return false
      }

      // Status filter
      if (selectedStatus !== 'all' && node.status !== selectedStatus) return false

      return true
    })

    const totalMembers = filteredNodes.reduce((sum, node) => sum + node.members.length, 0)

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