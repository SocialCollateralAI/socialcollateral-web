import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Minus, Maximize, MapPin, Users, TrendingUp } from 'lucide-react'
import networkData from '../data/networkData.json'

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
  id?: string // Kadang ada ID, kadang tidak di mock data
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
  // Properties tambahan untuk visualisasi graph
  x: number
  y: number
  color: string
  size: number
}

interface NetworkGraphProps {
  selectedLocation: string
  selectedStatus: string // 'all' | 'healthy' | 'toxic' | 'medium'
  onNodeSelect?: (node: GroupNode | null) => void
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ selectedLocation, selectedStatus, onNodeSelect }) => {
  // --- STATE ---
  const [zoom, setZoom] = useState(1.0) // Zoom default sedikit lebih jauh
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // --- DATA TRANSFORMATION & COORDINATE GENERATION ---
  // Use deterministic positioning for consistent layout
  const { nodes, edges } = useMemo(() => {
    const groups = (networkData as any).groups as Record<string, any>
    const nodeIds = Object.keys(groups)
    const generatedNodes: GroupNode[] = []
    const generatedEdges: { id: string; source: string; target: string; strength: string }[] = []

    // Create deterministic but spread-out positioning
    nodeIds.forEach((key, index) => {
      const group = groups[key]
      
      // Determine color based on trust_score (more accurate than type)
      let color = "#94a3b8" // Default gray
      const trustScore = group.header?.trust_score || 0
      if (trustScore > 80) color = "#22c55e" // Green - healthy (high trust)
      else if (trustScore >= 25) color = "#eab308" // Yellow - medium risk
      else color = "#ef4444" // Red - high risk (low trust)

      // Better positioning algorithm - spiral layout for better distribution
      const angle = (index / nodeIds.length) * 2 * Math.PI + index * 0.5
      const radius = 120 + (index % 3) * 80 + Math.sin(index * 0.7) * 40
      const centerX = 400
      const centerY = 300
      
      generatedNodes.push({
        ...group,
        id: key,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        color: color,
        size: Math.min(Math.max(18 + (group.header?.member_count || 0) * 1.2, 22), 45),
      })

      // Generate Edges dari Neighbors
      if (group.overview?.neighbors) {
        group.overview.neighbors.forEach((neighbor: Neighbor, idx: number) => {
          // Hanya buat garis jika neighbor punya ID dan ID tersebut ada di dataset kita
          if (neighbor.id && groups[neighbor.id]) {
            // Cek agar tidak duplikat garis (A-B dan B-A)
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
  }, []) // Dependency kosong = run once on mount

  // --- FILTER LOGIC ---
  const getFilteredNodes = () => {
    return nodes.filter((node) => {
      // Filter by Village (location_village)
      if (selectedLocation && selectedLocation !== 'all') {
        const nodeVillage = node.header?.location_village || ''
        if (nodeVillage !== selectedLocation) return false
      }
      
      // Filter by Status using trust_score ranges
      if (selectedStatus !== 'all') {
        const trustScore = node.header?.trust_score || 0
        if (selectedStatus === 'healthy' && trustScore <= 80) return false
        if (selectedStatus === 'medium' && (trustScore < 25 || trustScore > 80)) return false
        if (selectedStatus === 'high' && trustScore >= 25) return false
      }
      return true
    })
  }

  const filteredNodes = getFilteredNodes()
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id))

  // --- HANDLERS (Sama seperti sebelumnya) ---
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
    
    // Smooth pan to center the selected node with better positioning
    if (!isSame) {
      const svgCenterX = 400
      const svgCenterY = 300
      const targetX = (svgCenterX - node.x) * zoom
      const targetY = (svgCenterY - node.y) * zoom
      setPan({ x: targetX, y: targetY })
    }
    
    if (onNodeSelect) onNodeSelect(isSame ? null : node)
  }

  return (
    <div
  className="relative w-full h-full bg-[#F8FAFC] overflow-hidden border border-gray-200 rounded-xl font-sans"
  onClick={() => setSelectedNodeId(null)}
>

    <div
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
        {/* Modern Dot Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

         <svg width="100%" height="100%" viewBox="0 0 800 600" className="relative z-10">
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >

            {/* --- EDGES --- */}
          {edges.map(edge => {
              // Hanya render jika kedua node ada dalam filter (opsional: atau render tapi transparan)
              if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) return null

              const s = nodes.find(n => n.id === edge.source)
              const t = nodes.find(n => n.id === edge.target)
              if (!s || !t) return null

              const isConnected = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)
              const isDimmed = selectedNodeId && !isConnected

              // make edges dashed by default, solid when connected (clicked)
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
                  className="transition-all duration-300"
                />
              )
            })}

            {/* --- NODES --- */}
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

              // Format Nama: Ambil kata kedua ("Mawar" dari "KELOMPOK MAWAR")
              const shortLabel = node.header.name.replace("KELOMPOK ", "").toUpperCase()
              

               return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`node-clickable pointer-events-auto cursor-pointer transition-all duration-300 ${isDimmed ? "opacity-30 grayscale" : "opacity-100"}`}
                onClick={(e) => handleNodeClick(node, e)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >

                  {/* Hover Glow Effect */}
                  {isHovered && (
                    <circle
                      r={node.size + 12}
                      fill={node.color}
                      fillOpacity={0.15}
                      className="animate-pulse"
                    />
                  )}

                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      r={node.size + 6}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={3}
                      strokeOpacity={0.5}
                    />
                  )}

                  {/* Main Circle Body */}
                  <circle
                    r={isHovered ? node.size + 2 : node.size}
                    fill={node.color}
                    stroke={isSelected ? '#ffffff' : 'white'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200 ease-out"
                    style={{ 
                      filter: isSelected 
                        ? "drop-shadow(0px 8px 16px rgba(0,0,0,0.25))" 
                        : isHovered
                        ? "drop-shadow(0px 4px 8px rgba(0,0,0,0.15))"
                        : "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                    }}
                  />

                  {/* Icon Center (Optional - bisa diganti text score) */}
                

                  {/* Label Text */}
                  <text
                    y={-2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    style={{
                      fontSize: node.size > 35 ? '10px' : '9px',
                      fontWeight: 700,
                      fontFamily: "Inter, sans-serif",
                      pointerEvents: "none",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {shortLabel}
                  </text>
                  
                  {/* Trust Score */}
                  <text
                    y={8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    style={{
                      fontSize: '8px',
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      pointerEvents: "none",
                      opacity: 0.9
                    }}
                  >
                    {node.header?.trust_score || 0}
                  </text>
                  
                  {/* Trust Score Badge (Small pill below) */}
                  {isHovered && (
                     <g transform={`translate(0, ${-node.size - 15})`}>
                        <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#0f172a" />
                        <text y="4" textAnchor="middle" fill="white" fontSize="10px" fontWeight="700">
                           {node.header.trust_score}
                        </text>
                     </g>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* --- FLOATING TOOLTIP (Top Left) --- */}
      {hoveredNode && (() => {
         const node = nodes.find(n => n.id === hoveredNode)
         if(!node) return null;
         return (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-xl rounded-xl p-4 border border-gray-100 z-30 min-w-[200px] animate-in fade-in slide-in-from-left-2 duration-200">
               <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                     node.type === 'toxic' ? 'bg-red-100 text-red-600' : 
                     node.type === 'healthy' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                     {node.header.risk_badge}
                  </span>
                  <span className="text-xs font-bold text-gray-400">#{node.id}</span>
               </div>
               
               <h3 className="text-sm font-bold text-gray-800 mb-0.5">{node.header.name}</h3>
               <div className="flex items-center text-xs text-gray-500 mb-3">
                  <MapPin size={12} className="mr-1" />
                  {node.header.location_village}, {node.header.location_city}
               </div>

               <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div>
                     <div className="text-[10px] text-gray-400 mb-1 flex items-center">
                        <TrendingUp size={10} className="mr-1"/> Trust Score
                     </div>
                     <div className={`text-xl font-bold ${
                       node.header.trust_score > 80 ? 'text-green-600' :
                       node.header.trust_score >= 25 ? 'text-yellow-600' : 'text-red-600'
                     }`}>{node.header.trust_score}</div>
                  </div>
                  <div>
                     <div className="text-[10px] text-gray-400 mb-1 flex items-center">
                        <Users size={10} className="mr-1"/> Members
                     </div>
                     <div className="text-xl font-bold text-slate-700">{node.header.member_count}</div>
                  </div>
               </div>
               
               <div className="mt-3 pt-2 border-t border-gray-50">
                 <div className="text-[9px] text-gray-400 uppercase tracking-wide">Click to view details</div>
               </div>
            </div>
         )
      })()}

      {/* --- ZOOM CONTROLS --- */}
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