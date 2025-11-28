import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Minus, Maximize, MapPin, Users, TrendingUp } from 'lucide-react'
import networkData from '../../data/networkData.json'

// --- TYPES SESUAI SCHEMA BARU ---
interface GroupHeader {
  name: string
  x: number
  y: number
  size: number
  color: string
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
  x: number
  y: number
  color: string
  size: number
}

interface NetworkGraphProps {
  selectedLocation: string
  selectedStatus: string
  onNodeSelect?: (node: GroupNode | null) => void
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ selectedLocation, selectedStatus, onNodeSelect }) => {
  const [zoom, setZoom] = useState(0.75)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // GENERATE NODES + EDGES
  const { nodes, edges } = useMemo(() => {
    const groups = (networkData as any).groups as Record<string, any>
    const nodeIds = Object.keys(groups)

    const generatedNodes: GroupNode[] = []
    const generatedEdges: { id: string; source: string; target: string; strength: string }[] = []

    nodeIds.forEach((key, index) => {
      const group = groups[key]

      let color = "#94a3b8"
      const trustScore = group.header?.trust_score || 0
      if (trustScore > 80) color = "#22c55e"
      else if (trustScore >= 25) color = "#eab308"
      else color = "#ef4444"

      const angle = (index / nodeIds.length) * 2 * Math.PI + index * 0.5
      const radius = 120 + (index % 3) * 80 + Math.sin(index * 0.7) * 40
      const centerX = 400
      const centerY = 300

      generatedNodes.push({
        ...group,
        id: key,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        color,
        size: Math.min(Math.max(18 + (group.header?.member_count || 0) * 1.2, 22), 45),
      })

      if (group.overview?.neighbors) {
        group.overview.neighbors.forEach((neighbor: Neighbor) => {
          if (neighbor.id && groups[neighbor.id]) {
            const edgeId = [key, neighbor.id].sort().join('-')
            if (!generatedEdges.find(e => e.id === edgeId)) {
              generatedEdges.push({
                id: edgeId,
                source: key,
                target: neighbor.id,
                strength: neighbor.relation
              })
            }
          }
        })
      }
    })

    return { nodes: generatedNodes, edges: generatedEdges }
  }, [])

  // FILTER NODES
  const filteredNodes = nodes.filter((node) => {
    if (selectedLocation !== 'all') {
      const village = node.header?.location_village || ''
      if (village !== selectedLocation) return false
    }

    const trust = node.header?.trust_score || 0
    if (selectedStatus === 'healthy' && trust <= 80) return false
    if (selectedStatus === 'medium' && (trust < 25 || trust > 80)) return false
    if (selectedStatus === 'high' && trust >= 25) return false

    return true
  })

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id))

  // HANDLERS
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.3, 4))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.3, 0.1))

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedNodeId(null)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleNodeClick = (node: GroupNode, e: React.MouseEvent) => {
    e.stopPropagation()
    const isSame = node.id === selectedNodeId
    const newId = isSame ? null : node.id
    setSelectedNodeId(newId)

    if (!isSame) {
      const svgCenterX = 400
      const svgCenterY = 300
      setPan({
        x: (svgCenterX - node.x) * zoom,
        y: (svgCenterY - node.y) * zoom
      })
    }

    onNodeSelect?.(isSame ? null : node)
  }

  return (
    <div
      className="relative w-full h-full bg-[#f2f5f8] overflow-hidden border border-gray-200 rounded-xl"
      onClick={() => setSelectedNodeId(null)}
    >

      {/* CANVAS */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* DOT GRID BACKGROUND */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(#94A3B8 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg width="100%" height="100%" viewBox="0 0 800 600" className="relative z-10">
          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            style={{
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >

            {/* EDGES */}
            {edges.map(edge => {
              if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) return null

              const s = nodes.find(n => n.id === edge.source)
              const t = nodes.find(n => n.id === edge.target)
              if (!s || !t) return null

              const isConnected = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)
              const isDimmed = selectedNodeId && !isConnected

              const dash = isConnected ? "0" : (edge.strength === 'Tetangga' ? "4,4" : "6,6")

              return (
                <line
                  key={edge.id}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={isConnected ? "#334155" : "#94a3b8"}
                  strokeWidth={isConnected ? 2.8 : 1.5}
                  strokeOpacity={isDimmed ? 0.08 : 0.45}
                  strokeDasharray={dash}
                />
              )
            })}

            {/* NODES */}
            {filteredNodes.map(node => {
              const isSelected = node.id === selectedNodeId
              const isHovered = hoveredNode === node.id

              const isDimmed =
                selectedNodeId &&
                !isSelected &&
                !edges.some(e =>
                  (e.source === selectedNodeId && e.target === node.id) ||
                  (e.source === node.id && e.target === selectedNodeId)
                )

              const shortLabel = node.header.name.replace("KELOMPOK ", "").toUpperCase()

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className={`cursor-pointer transition-all duration-300 ${isDimmed ? "opacity-30 grayscale" : "opacity-100"}`}
                  onClick={(e) => handleNodeClick(node, e)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >

                  {isHovered && (
                    <circle
                      r={node.size + 12}
                      fill={node.color}
                      fillOpacity={0.15}
                      className="animate-pulse"
                    />
                  )}

                  {isSelected && (
                    <circle
                      r={node.size + 6}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={3}
                      strokeOpacity={0.5}
                    />
                  )}

                  <circle
                    r={isHovered ? node.size + 2 : node.size}
                    fill={node.color}
                    stroke="white"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200"
                    style={{
                      filter: isSelected
                        ? "drop-shadow(0px 8px 16px rgba(0,0,0,0.25))"
                        : isHovered
                          ? "drop-shadow(0px 4px 8px rgba(0,0,0,0.15))"
                          : "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                    }}
                  />

                  <text
                    y={-2}
                    textAnchor="middle"
                    fill="#ffffff"
                    style={{ fontSize: node.size > 35 ? '10px' : '9px', fontWeight: 700 }}
                  >
                    {shortLabel}
                  </text>

                  <text
                    y={8}
                    textAnchor="middle"
                    fill="#ffffff"
                    style={{ fontSize: '8px', opacity: 0.9 }}
                  >
                    {node.header?.trust_score || 0}
                  </text>

                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* 🔥 ZOOM CONTROLS (SUDAH DIPERBAIKI) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden flex flex-col">
          <button onClick={handleZoomIn} className="p-2.5 hover:bg-gray-50 text-slate-600 border-b">
            <Plus size={18} />
          </button>
          <button onClick={handleZoomOut} className="p-2.5 hover:bg-gray-50 text-slate-600">
            <Minus size={18} />
          </button>
        </div>

        <button
          onClick={handleReset}
          className="p-2.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg shadow-lg border border-indigo-100"
        >
          <Maximize size={18} />
        </button>
      </div>

    </div>
  )
}

export default NetworkGraph
