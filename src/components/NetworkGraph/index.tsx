import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Sigma } from 'sigma'
import { circular } from 'graphology-layout'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import { NetworkGraphProps } from './NetworkGraph.types'
import { useGraphData } from './userGraphData'
import { useGraphHighlighting } from './useGraphHighlighting'
import ZoomControls from './ZoomControls'

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  selectedLocation, 
  selectedStatus, 
  onNodeSelect, 
  apiData 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sigmaRef = useRef<Sigma | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 1. Get Data
  const { graph, nodeData } = useGraphData(apiData)

  // 2. Filter Logic (Tetap di sini atau bisa dipindah ke hook lain jika ingin lebih bersih lagi)
  const filteredGraph = useMemo(() => {
    const filtered = graph.copy()
    
    filtered.forEachNode((node) => {
      const nodeInfo = nodeData.get(node)
      if (!nodeInfo) {
        filtered.dropNode(node)
        return
      }

      // Filter by Village
      if (selectedLocation && selectedLocation !== 'all') {
        if (nodeInfo.header?.location_village !== selectedLocation) {
          filtered.dropNode(node)
          return
        }
      }
      
      // Filter by Status
      const trustScore = nodeInfo.header?.trust_score || 0
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'healthy' && trustScore <= 80) filtered.dropNode(node)
        else if (selectedStatus === 'medium' && (trustScore < 25 || trustScore > 80)) filtered.dropNode(node)
        else if (selectedStatus === 'toxic' && trustScore >= 25) filtered.dropNode(node)
      }
    })
    return filtered
  }, [graph, nodeData, selectedLocation, selectedStatus])

  // 3. Sigma Initialization & Layout
  useEffect(() => {
    if (!containerRef.current) return

    // Layout algorithms
    circular.assign(filteredGraph)
    const settings = forceAtlas2.inferSettings(filteredGraph)
    forceAtlas2.assign(filteredGraph, { iterations: 50, settings })

    // Create Instance
    const sigma = new Sigma(filteredGraph, containerRef.current, {
      renderLabels: true,
      labelFont: "Inter, sans-serif",
      labelSize: 12,
      labelWeight: "600",
      defaultNodeColor: "#94a3b8",
      defaultEdgeColor: "#e2e8f0",
      minCameraRatio: 0.1,
      maxCameraRatio: 10
    })

    sigmaRef.current = sigma

    // Click Event Handler
    sigma.on('clickNode', ({ node }) => {
      const nodeInfo = nodeData.get(node)
      if (nodeInfo) {
        setSelectedNodeId((prev) => {
          const next = prev === node ? null : node
          if (onNodeSelect) onNodeSelect(next ? nodeInfo : null)
          return next
        })
      }
    })

    sigma.on('clickStage', () => {
      setSelectedNodeId(null)
      if (onNodeSelect) onNodeSelect(null)
    })

    return () => {
      sigma.kill()
      sigmaRef.current = null
    }
  }, [filteredGraph, nodeData, onNodeSelect])

  // 4. Handle Visual Highlighting (via Hook)
  useGraphHighlighting({
    sigmaInstance: sigmaRef.current,
    selectedNodeId,
    nodeData
  })

  // 5. Handle Click Outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const target = e.target as Node | null

      let isClickInModal = false
      if (target) {
        let currentElement = target as HTMLElement | null
        while (currentElement) {
          if (currentElement.classList?.contains('z-50')) { // Asumsi class modal
            isClickInModal = true
            break
          }
          currentElement = currentElement.parentElement
        }
      }

      if (target && !container.contains(target) && !isClickInModal) {
        setSelectedNodeId(null)
        if (onNodeSelect) onNodeSelect(null)
      }
    }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [onNodeSelect])

  // 6. Zoom Handlers
  const handleZoomIn = () => sigmaRef.current?.getCamera().animatedZoom({ duration: 200 })
  const handleZoomOut = () => sigmaRef.current?.getCamera().animatedUnzoom({ duration: 200 })
  const handleReset = () => {
    sigmaRef.current?.getCamera().animatedReset({ duration: 200 })
    setSelectedNodeId(null)
    if (onNodeSelect) onNodeSelect(null)
  }

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] overflow-hidden border border-gray-200 rounded-xl font-sans">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
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