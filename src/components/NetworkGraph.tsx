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

      // Add node to graphology and store original attributes on the node
      graph.addNode(key, {
        label: group.header?.name || key,
        size: size,
        color: color,
        x: Math.random(),
        y: Math.random(),
        origColor: color,
        origSize: size
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
              const edgeSize = neighbor.relation === 'Tetangga' ? 1 : 2
              graph.addEdge(key, neighbor.id, {
                type: 'line',
                size: edgeSize,
                origSize: edgeSize,
                origColor: '#e2e8f0'
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
    // Use functional updates so we don't read stale `selectedNodeId` when
    // notifying the parent. Keep Sigma instance stable (don't recreate on selection).
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
  // Note: intentionally exclude `selectedNodeId` so Sigma isn't recreated
  // when selection changes (that caused blank/white flicker). Sigma is
  // created once per graph/nodeData change.
  }, [filteredGraph, nodeData, onNodeSelect])

  // Update visuals when selection changes. We mutate edge/node attributes
  // (don't recreate Sigma) so selection highlights smoothly.
  useEffect(() => {
    const sigma = sigmaRef.current
    if (!sigma) return

    const g = sigma.getGraph()

    const EDGE_HIGHLIGHT_COLOR = '#374151' // dark gray/charcoal, not too black

    // Update edges: connected -> dark highlight color and thicker. Use stored
    // original attributes (origColor/origSize) when restoring so highlights
    // don't persist.
    g.forEachEdge((edge, attr, source, target) => {
      const isConnected = selectedNodeId && (source === selectedNodeId || target === selectedNodeId)
      const origColor = g.getEdgeAttribute(edge, 'origColor') || attr.origColor || '#e2e8f0'
      const origSize = g.getEdgeAttribute(edge, 'origSize') || attr.origSize || (attr.size || 1)
      const origType = g.getEdgeAttribute(edge, 'origType') || attr.origType || (attr.type || 'line')

      g.setEdgeAttribute(edge, 'color', isConnected ? EDGE_HIGHLIGHT_COLOR : origColor)
      g.setEdgeAttribute(edge, 'size', isConnected ? Math.max(origSize, 3) : origSize)
      g.setEdgeAttribute(edge, 'type', isConnected ? 'line' : origType)
    })

    // Update nodes: selected node -> keep original color but slightly larger.
    // Unrelated nodes -> dimmed to gray. Related nodes -> original color.
    g.forEachNode((node) => {
      const isSelected = selectedNodeId === node
      const originalColor = g.getNodeAttribute(node, 'origColor') || (nodeData.get(node) as any)?.color || '#94a3b8'
      const originalSize = g.getNodeAttribute(node, 'origSize') || (nodeData.get(node) as any)?.size || 12

      // Check if this node is related to the selected node
      let isRelated = false
      if (selectedNodeId) {
        isRelated = g.hasEdge(selectedNodeId, node) || g.hasEdge(node, selectedNodeId)
      }

      // Keep selected and related nodes in original color; dim only unrelated nodes to gray
      const nodeColor = (isSelected || isRelated || !selectedNodeId) ? originalColor : '#d1d5db'
      g.setNodeAttribute(node, 'color', nodeColor)
      g.setNodeAttribute(node, 'size', isSelected ? Math.min(originalSize * 1.4, 60) : originalSize)
    })

    sigma.refresh()
  }, [selectedNodeId])

  // Clear selection when user clicks outside the sigma container
  // But do NOT clear if click is on the modal (NodeModal)
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const target = e.target as Node | null

      // Check if the click target or any parent is the modal (has class 'fixed right-0' or similar)
      // A safer approach: check if click is inside a modal-like element by looking for specific selectors
      let isClickInModal = false
      if (target) {
        // Check if target or any parent has a data attribute indicating "don't reset selection"
        let currentElement = target as HTMLElement | null
        while (currentElement) {
          if (currentElement.classList?.contains('z-50')) {
            isClickInModal = true
            break
          }
          currentElement = currentElement.parentElement
        }
      }

      // If click is outside the sigma container AND not in modal, clear selection
      if (target && !container.contains(target) && !isClickInModal) {
        setSelectedNodeId(null)
        if (onNodeSelect) onNodeSelect(null)
      }
    }

    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [onNodeSelect])

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