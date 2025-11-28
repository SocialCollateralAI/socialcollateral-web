import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Plus, Minus, Maximize, MapPin, Users, TrendingUp } from 'lucide-react'
import { Sigma } from 'sigma'
import Graph from 'graphology'
import { circular } from 'graphology-layout'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import networkData from '../data/networkData.json'

// --- TYPES SESUAI SCHEMA BARU ---
interface GroupHeader {
  name: string
  location_city: string
  location_village: string
  member_count: number
  risk_badge: string
  trust_score: number
  loan_eligibility: string
  total_loan_amount: number
}

interface Neighbor {
  id?: string
  name: string
  risk: string
  distance: string
  relation: string
}

interface GroupNode {
  id: string
  type: 'healthy' | 'toxic' | 'medium'
  header: GroupHeader
  overview: {
    neighbors: Neighbor[]
    [key: string]: any
  }
}

interface NetworkGraphProps {
  selectedLocation: string
  selectedStatus: string
  onNodeSelect?: (node: GroupNode | null) => void
  apiData?: any // API data from App.tsx
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ selectedLocation, selectedStatus, onNodeSelect, apiData }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sigmaRef = useRef<Sigma | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // --- DATA TRANSFORMATION ---
  const { graph, nodeData } = useMemo(() => {
    const data = apiData || networkData
    const groups = (data as any).groups as Record<string, any>
    const nodeIds = Object.keys(groups)
    const graph = new Graph()
    const nodeDataMap = new Map<string, GroupNode>()

    // Add nodes to graph
    nodeIds.forEach((key) => {
      const group = groups[key]
      
      // Determine color based on trust_score
      let color = "#94a3b8"
      const trustScore = group.header?.trust_score || 0
      if (trustScore > 80) color = "#22c55e"
      else if (trustScore >= 25) color = "#eab308"
      else color = "#ef4444"

      // Calculate size based on member count
      const size = Math.min(Math.max(8 + (group.header?.member_count || 0) * 0.5, 12), 25)

      // Add node to graphology
      graph.addNode(key, {
        label: group.header?.name || key,
        size: size,
        color: color,
        x: Math.random(),
        y: Math.random()
      })

      // Store full node data for tooltip/modal
      nodeDataMap.set(key, {
        ...group,
        id: key,
        type: trustScore > 80 ? 'healthy' : trustScore >= 25 ? 'medium' : 'toxic'
      })
    })

    // Add edges from neighbors
    nodeIds.forEach(key => {
      const group = groups[key]
      if (group.overview?.neighbors) {
        group.overview.neighbors.forEach((neighbor: Neighbor) => {
          if (neighbor.id && groups[neighbor.id]) {
            if (!graph.hasEdge(key, neighbor.id) && !graph.hasEdge(neighbor.id, key)) {
              graph.addEdge(key, neighbor.id, {
                type: 'line',
                size: neighbor.relation === 'Tetangga' ? 1 : 2
              })
            }
          }
        })
      }
    })

    return { graph, nodeData: nodeDataMap }
  }, [apiData])

  // --- FILTER LOGIC ---
  const filteredGraph = useMemo(() => {
    const filtered = graph.copy()
    
    // Remove nodes that don't match filters
    filtered.forEachNode((node) => {
      const nodeInfo = nodeData.get(node)
      if (!nodeInfo) {
        filtered.dropNode(node)
        return
      }

      // Filter by Village
      if (selectedLocation && selectedLocation !== 'all') {
        const nodeVillage = nodeInfo.header?.location_village || ''
        if (nodeVillage !== selectedLocation) {
          filtered.dropNode(node)
          return
        }
      }
      
      // Filter by Status using trust_score ranges
      if (selectedStatus !== 'all') {
        const trustScore = nodeInfo.header?.trust_score || 0
        if (selectedStatus === 'healthy' && trustScore <= 80) {
          filtered.dropNode(node)
          return
        }
        if (selectedStatus === 'medium' && (trustScore < 25 || trustScore > 80)) {
          filtered.dropNode(node)
          return
        }
        if (selectedStatus === 'high' && trustScore >= 25) {
          filtered.dropNode(node)
          return
        }
      }
    })

    return filtered
  }, [graph, nodeData, selectedLocation, selectedStatus])

  // --- SIGMA INITIALIZATION ---
  useEffect(() => {
    if (!containerRef.current) return

    // Apply layout
    circular.assign(filteredGraph)
    
    // Run force layout for better positioning
    const settings = forceAtlas2.inferSettings(filteredGraph)
    forceAtlas2.assign(filteredGraph, { iterations: 50, settings })

    // Create Sigma instance
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

    // Event handlers
    sigma.on('clickNode', ({ node }) => {
      const nodeInfo = nodeData.get(node)
      if (nodeInfo) {
        setSelectedNodeId(prev => prev === node ? null : node)
        if (onNodeSelect) {
          onNodeSelect(selectedNodeId === node ? null : nodeInfo)
        }
      }
    })

    sigma.on('enterNode', ({ node }) => {
      setHoveredNode(node)
    })

    sigma.on('leaveNode', () => {
      setHoveredNode(null)
    })

    sigma.on('clickStage', () => {
      setSelectedNodeId(null)
      if (onNodeSelect) onNodeSelect(null)
    })

    return () => {
      sigma.kill()
    }
  }, [filteredGraph, nodeData, onNodeSelect, selectedNodeId])

  // --- ZOOM CONTROLS ---
  const handleZoomIn = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera()
      camera.animatedZoom({ duration: 200 })
    }
  }

  const handleZoomOut = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera()
      camera.animatedUnzoom({ duration: 200 })
    }
  }

  const handleReset = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera()
      camera.animatedReset({ duration: 200 })
      setSelectedNodeId(null)
      if (onNodeSelect) onNodeSelect(null)
    }
  }

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] overflow-hidden border border-gray-200 rounded-xl font-sans">
      {/* Sigma Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
      />


      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden flex flex-col">
          <button onClick={handleZoomIn} className="p-2.5 hover:bg-gray-50 text-slate-600 border-b active:bg-gray-100">
            <Plus size={18} />
          </button>
          <button onClick={handleZoomOut} className="p-2.5 hover:bg-gray-50 text-slate-600 active:bg-gray-100">
            <Minus size={18} />
          </button>
        </div>

        <button
          onClick={handleReset}
          className="p-2.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg shadow-lg border border-indigo-100 transition active:scale-95"
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  )
}

export default NetworkGraph