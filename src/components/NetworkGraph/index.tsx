/**
 * NetworkGraph - Network visualization component
 * 
 * This component is now a thin UI layer that delegates all Sigma.js logic
 * to the useSigmaInitialization hook.
 */
import React from 'react'
import type { NetworkGraphProps } from '../../types'
import { useSigmaInitialization } from '../../hooks'
import ZoomControls from './ZoomControls'

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  selectedLocation,
  selectedStatus,
  onNodeSelect,
  apiData
}) => {
  const {
    containerRef,
    handleZoomIn,
    handleZoomOut,
    handleReset
  } = useSigmaInitialization({
    apiData,
    selectedLocation,
    selectedStatus,
    onNodeSelect
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