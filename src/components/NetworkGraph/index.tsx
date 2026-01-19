/**
 * NetworkGraph - Network visualization component
 * Phase 3: Refactored to use DashboardContext instead of props
 */
import React from 'react'
import { useDashboard } from '../../context'
import { useSigmaInitialization } from '../../hooks'
import ZoomControls from './ZoomControls'

const NetworkGraph: React.FC = () => {
  // Get data from context
  const {
    selectedDesa,
    selectedStatus,
    setSelectedNode,
    apiData
  } = useDashboard()

  const {
    containerRef,
    handleZoomIn,
    handleZoomOut,
    handleReset
  } = useSigmaInitialization({
    apiData,
    selectedLocation: selectedDesa,
    selectedStatus,
    onNodeSelect: setSelectedNode
  })

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] overflow-hidden border border-gray-200 rounded-xl font-sans">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          minHeight: '400px',
          minWidth: '400px'
        }}
      />
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />
    </div>
  )
}

export default NetworkGraph