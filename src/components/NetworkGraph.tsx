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
    if (trustScore > 80) return '#22c55e' // Green
    if (trustScore >= 25) return '#eab308' // Yellow
    return '#ef4444' // Red
  }

  // Filter nodes based on selected filters
  const getFilteredNodes = () => {
    return Object.values(networkData.groups).filter((node: NodeData) => {
      // Location filter
      if (selectedLocation !== 'all') {
        if (selectedLocation === 'bekasi' && node.header.location_city !== 'Bekasi') return false
        if (selectedLocation === 'karawang' && node.header.location_city !== 'Karawang') return false
        if (!['bekasi', 'karawang'].includes(selectedLocation) && node.header.location_village !== selectedLocation) return false
      }

      // Status filter
      const trustScore = node.header.trust_score
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'active' && node.header.loan_eligibility !== 'eligible') return false
        if (selectedStatus === 'high' && trustScore <= 80) return false
        if (selectedStatus === 'medium' && (trustScore < 25 || trustScore > 80)) return false
        if (selectedStatus === 'low' && trustScore >= 25) return false
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

      // Add edges between groups (create simple connection between existing groups)
      const groupIds = Object.keys(networkData.groups)
      if (groupIds.length >= 2 && filteredNodeIds.has(groupIds[0]) && filteredNodeIds.has(groupIds[1])) {
        try {
          if (!graph.hasEdge(groupIds[0], groupIds[1])) {
            graph.addEdge(groupIds[0], groupIds[1], {
              id: `${groupIds[0]}-${groupIds[1]}`,
              source: groupIds[0],
              target: groupIds[1],
              type: 'line',
              color: '#e5e7eb'
            })
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
        // try to find the node in the groups object first, fallback to filteredNodes
        const nodeData = (networkData.groups as any)[node] || filteredNodes.find((n: NodeData) => n.id === node)
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
            {(networkData.groups as any)[hoveredNode]?.header.name}
          </div>
          <div className="text-xs text-gray-600">
            Trust Score: {(networkData.groups as any)[hoveredNode]?.header.trust_score}%
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