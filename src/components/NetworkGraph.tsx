import { useEffect, useRef, useState } from 'react'
import Sigma from 'sigma'
import Graph from 'graphology'
import networkData from '../data/networkData.json'

interface NetworkGraphProps {
  selectedLocation: string
  selectedStatus: string
  onNodeSelect?: (node: NodeData | null) => void
}

interface NodeData {
  id: string
  label: string
  x: number
  y: number
  size: number
  color: string
  type: string
  trustScore: number
  villageId: string
  districtId: string
  cityId: string
  members: Array<{
    name: string
    role: string
    business: string
    monthlyIncome: number
  }>
  loanAmount: number
  repaymentRate: number
  location: string
  formationDate: string
  lastActivity: string
  status: string
}

interface EdgeData {
  id: string
  source: string
  target: string
  size: number
  color: string
  type: string
  strength: string
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ selectedLocation, selectedStatus, onNodeSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sigmaRef = useRef<Sigma | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Function to get node color based on trust score
  const getNodeColor = (trustScore: number) => {
    if (trustScore > 80) return '#22c55e' // Green
    if (trustScore >= 25) return '#eab308' // Yellow
    return '#ef4444' // Red
  }

  // Filter nodes based on selected filters
  const getFilteredNodes = () => {
    return networkData.nodes.filter((node: NodeData) => {
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
  }

  useEffect(() => {
    if (!containerRef.current) return

    let ro: ResizeObserver | null = null
    let mounted = true

    const createAndMountSigma = () => {
      if (!containerRef.current || !mounted) return

      // Create a new graph
      const graph = new Graph()
      const filteredNodes = getFilteredNodes()
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id))

      // Add filtered nodes with updated colors
      filteredNodes.forEach((node: NodeData) => {
        // avoid adding duplicates
        if (!graph.hasNode(node.id)) {
          graph.addNode(node.id, {
            ...node,
            type: 'circle',
            color: getNodeColor(node.trustScore)
          })
        }
      })

      // Add edges only between filtered nodes
      networkData.edges.forEach((edge: EdgeData) => {
        if (filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)) {
          // graphology will throw if edge exists, so guard
          try {
            if (!graph.hasEdge(edge.source, edge.target)) {
              graph.addEdge(edge.source, edge.target, {
                ...edge,
                type: 'line'
              })
            }
          } catch (e) {
            // ignore
          }
        }
      })

      // Clear previous Sigma instance
      if (sigmaRef.current) {
        sigmaRef.current.kill()
        sigmaRef.current = null
      }

      // Create Sigma instance only when container has width
      const el = containerRef.current
      const width = el.clientWidth
      if (width === 0) {
        // wait for ResizeObserver to detect size
        ro = new ResizeObserver(() => {
          if (!containerRef.current) return
          if (containerRef.current.clientWidth > 0) {
            if (ro) {
              ro.disconnect()
              ro = null
            }
            // call again to mount
            createAndMountSigma()
          }
        })
        ro.observe(el)
        return
      }

      const sigma = new Sigma(graph, el, ({
        renderer: {
          clearEdgeColorOnRender: false,
          clearNodeColorOnRender: false
        }
      } as any))

      sigmaRef.current = sigma

      // Handle node clicks
      sigma.on('clickNode', ({ node }) => {
        console.log('[NetworkGraph] clickNode event:', node)
        // try to find the node in the full dataset first, fallback to filteredNodes
        const nodeData = networkData.nodes.find((n: NodeData) => n.id === node) || filteredNodes.find((n: NodeData) => n.id === node)
        console.log('[NetworkGraph] resolved nodeData:', nodeData)
        if (nodeData) {
          if (typeof onNodeSelect === 'function') onNodeSelect(nodeData)
        }
      })

      // Handle node hover
      sigma.on('enterNode', ({ node }) => {
        setHoveredNode(node)
      })

      sigma.on('leaveNode', () => {
        setHoveredNode(null)
      })

      // Handle background clicks
      sigma.on('clickStage', () => {
        if (typeof onNodeSelect === 'function') onNodeSelect(null)
      })
    }

    // start initialization
    createAndMountSigma()

    return () => {
      mounted = false
      if (sigmaRef.current) {
        sigmaRef.current.kill()
        sigmaRef.current = null
      }
      if (ro) {
        try { ro.disconnect() } catch (e) {}
        ro = null
      }
    }
  }, [selectedLocation, selectedStatus])


  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-3 pointer-events-none z-10">
          <div className="text-sm font-semibold text-gray-900">
            {networkData.nodes.find(n => n.id === hoveredNode)?.label}
          </div>
          <div className="text-xs text-gray-600">
            Trust Score: {networkData.nodes.find(n => n.id === hoveredNode)?.trustScore}%
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">Group Trust Score</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>&gt; 80%: Sangat Baik</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>25% - 80%: Cukup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>&lt; 25%: Perlu Perhatian</span>
          </div>
        </div>
      </div>

      {/* Node Modal is rendered by parent (App) via onNodeSelect) */}
    </div>
  )
}

export default NetworkGraph