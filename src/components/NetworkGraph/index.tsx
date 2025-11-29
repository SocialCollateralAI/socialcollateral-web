import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Sigma } from 'sigma'
import { circular } from 'graphology-layout'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import type { NetworkGraphProps } from './NetworkGraph.types'
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
  console.log('Graph and Node Data:', graph)
  console.log('API Data:', nodeData)

  // 2. Filter Logic (Tetap di sini atau bisa dipindah ke hook lain jika ingin lebih bersih lagi)
  const filteredGraph = useMemo(() => {
    const filtered = graph.copy()
    
    filtered.forEachNode((node) => {
      const nodeInfo = nodeData.get(node)
      if (!nodeInfo) {
        filtered.dropNode(node)
        return
      }
      console.log('Filtering Node:', nodeInfo)

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
    // Add a small delay to ensure DOM is ready
    const initializeSigma = () => {
      if (!containerRef.current) {
        console.log('Container ref not ready, skipping Sigma initialization')
        return
      }

    if (!filteredGraph || filteredGraph.order === 0) {
      console.log('No nodes in graph, skipping Sigma initialization')
      return
    }

    // Clean up previous instance
    if (sigmaRef.current) {
      try {
        sigmaRef.current.kill()
      } catch (e) {
        console.log('Error cleaning up previous Sigma instance:', e)
      }
      sigmaRef.current = null
    }

    try {
      // Layout algorithms
      circular.assign(filteredGraph)
      const settings = forceAtlas2.inferSettings(filteredGraph)
      forceAtlas2.assign(filteredGraph, { iterations: 50, settings })

      // Clean any problematic node types
      filteredGraph.forEachNode((node) => {
        if (filteredGraph.hasNodeAttribute(node, 'type')) {
          filteredGraph.removeNodeAttribute(node, 'type')
        }
      })

      // Create Instance with minimal settings
      const sigma = new Sigma(filteredGraph, containerRef.current, {
        renderLabels: true,
        labelFont: "Arial, sans-serif",
        labelSize: 12,
        defaultNodeColor: "#94a3b8",
        defaultEdgeColor: "#e2e8f0"
      })

      sigmaRef.current = sigma
      console.log('Sigma initialized successfully')

    } catch (error) {
      console.error('Sigma initialization failed:', error)
      sigmaRef.current = null
      return
    }

    if (!sigmaRef.current) return

    const sigma = sigmaRef.current

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
      if (sigmaRef.current) {
        try {
          sigmaRef.current.kill()
        } catch (e) {
          console.log('Error during Sigma cleanup:', e)
        }
        sigmaRef.current = null
      }
    }
    }

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(initializeSigma, 100)

    return () => {
      clearTimeout(timeoutId)
      if (sigmaRef.current) {
        try {
          sigmaRef.current.kill()
        } catch (e) {
          console.log('Error during Sigma cleanup:', e)
        }
        sigmaRef.current = null
      }
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