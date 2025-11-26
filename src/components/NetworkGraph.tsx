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
  type: string
  header: {
    name: string
    location_city: string
    location_village: string
    member_count: number
    risk_badge: string
    trust_score: number
    loan_eligibility: string
    total_loan_amount: number
  }
  overview: {
    primary_driver: {
      text: string
      payment_score: number
      social_score: number
    }
    metrics: {
      cycle: number
      repayment_rate: number
      avg_delay: string
    }
    neighbors: Array<{
      name: string
      risk: string
      distance: string
      relation: string
    }>
    max_plafon_recommendation: number
  }
  trends: {
    repayment_history: Array<{
      month: string
      rate: number
    }>
    asset_growth: Array<{
      month: string
      value: number
    }>
    stats: {
      streak: number
      last_default: string
      trend_val: number
      trend_dir: string
      avg_rate: number
      best_rate: number
    }
    seasonality_heatmap: number[]
  }
  insights: {
    social_graph: {
      risk_members: Array<{
        name: string
        risk_score: string
        hops: string
      }>
    }
    cv: {
      home: {
        condition: string
        material: string
        roof: string
        access: string
        occupancy: string
        assets: string[]
        img_url: string
      }
      biz: {
        stability: string
        type: string
        traffic: string
        status: string
        digital: string
        inventory: string[]
        img_url: string
      }
    }
    prediction: {
      default_risk_prob: number
      horizon_days: number
      what_if: {
        current_score: number
        projected_score: number
        improvement_pct: number
        scenario: string
      }
    }
    recommendation_text: string
  }
  decision: {
    last_audit: string
    is_locked: boolean
  }
}



const NetworkGraph: React.FC<NetworkGraphProps> = ({ selectedLocation, selectedStatus, onNodeSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sigmaRef = useRef<Sigma | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Function to get node color based on trust score
  const getNodeColor = (trustScore: number) => {
    if (trustScore > 80) return '#22c55e' // Green (Healthy)
    if (trustScore >= 25) return '#eab308' // Yellow (Medium)
    return '#ef4444' // Red (High Risk)
  }

  // --- UPDATED: Filter Logic lebih pintar (Mapping Score) ---
  const getFilteredNodes = () => {
    return networkData.nodes.filter((node: NodeData) => {

      // 1. Location Filter
      if (selectedLocation !== 'all') {
        // Cek jika user memilih kota (kabupaten)
        if (selectedLocation === 'bogor' && node.cityId !== 'bogor') return false
        if (selectedLocation === 'bekasi' && node.cityId !== 'bekasi') return false
        if (selectedLocation === 'karawang' && node.cityId !== 'karawang') return false

        // Cek jika user memilih desa (villageId)
        // Jika selectedLocation bukan nama kota, kita asumsikan itu ID desa
        const isCity = ['bogor', 'bekasi', 'karawang'].includes(selectedLocation)
        if (!isCity && node.villageId !== selectedLocation) return false
      }

      // 2. Status Filter (Sinkronisasi dengan Logic Trust Score/Warna)
      if (selectedStatus !== 'all') {
        // Healthy: Score > 80
        if (selectedStatus === 'healthy') {
          return node.trustScore > 80
        }
        // Medium: Score 25 - 80
        if (selectedStatus === 'medium') {
          return node.trustScore >= 25 && node.trustScore <= 80
        }
        // High Risk: Score < 25
        if (selectedStatus === 'high') {
          return node.trustScore < 25
        }

        // Fallback: Jika logic diatas tidak kena, cek string equality biasa
        if (node.status !== selectedStatus) return false
      }

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

      // Debugging: Cek di console berapa node yang lolos filter
      console.log(`[NetworkGraph] Filtered: Location=${selectedLocation}, Status=${selectedStatus} -> Nodes Count: ${filteredNodes.length}`)

      const filteredNodeIds = new Set(filteredNodes.map(n => n.id))

      // Add filtered nodes with updated colors
      filteredNodes.forEach((node: NodeData) => {
        // avoid adding duplicates
        if (!graph.hasNode(node.id)) {
          graph.addNode(node.id, {
            ...node,
            label: node.header.name,
            x: Math.random() * 800,
            y: Math.random() * 600,
            size: 10,
            type: 'circle',
            color: getNodeColor(node.header.trust_score)
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
                type: 'line',
                color: '#e5e7eb', // Default edge color (light gray)
                size: 2
              })
            }
          } catch (e) {
            // ignore
          }
        } catch (e) {
          console.warn('Could not add edge between groups:', e)
        }
      }

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

        if (nodeData) {
          if (typeof onNodeSelect === 'function') onNodeSelect(nodeData)
        }
      })

      // Handle node hover
      sigma.on('enterNode', ({ node }) => {
        setHoveredNode(node)
        // Optional: Change cursor style
        if (containerRef.current) containerRef.current.style.cursor = 'pointer'
      })

      sigma.on('leaveNode', () => {
        setHoveredNode(null)
        if (containerRef.current) containerRef.current.style.cursor = 'default'
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
  }, [selectedLocation, selectedStatus]) // Dependency Array ensures re-run on change


  return (
    <div className="relative w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div ref={containerRef} className="w-full h-full outline-none" />

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-100 rounded-xl p-4 pointer-events-none z-10 min-w-[200px] animate-in fade-in zoom-in duration-200">
          <div className="text-sm font-bold text-gray-900 mb-1">
            {networkData.nodes.find(n => n.id === hoveredNode)?.label}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Trust Score</span>
            <span className={`font-bold ${
              (networkData.nodes.find(n => n.id === hoveredNode)?.trustScore || 0) > 80 ? 'text-green-600' :
              (networkData.nodes.find(n => n.id === hoveredNode)?.trustScore || 0) >= 25 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {networkData.nodes.find(n => n.id === hoveredNode)?.trustScore}%
            </span>
          </div>
          <div className="text-xs text-gray-400 border-t pt-2 mt-1">
            Click to view details
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm shadow-md border border-gray-100 rounded-xl p-4 z-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Risk Categories</h3>
        <div className="space-y-2 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-gray-700">Healthy Group (&gt; 80%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
            <span className="text-gray-700">Medium Risk (25% - 80%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-gray-700">High Risk (&lt; 25%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkGraph
