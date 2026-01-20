import { useMemo } from 'react'
import Graph from 'graphology'
import type { GroupNode, Neighbor } from './NetworkGraph.types'

/**
 * Calculate node size based on trust score and risk status
 * Matches Backend seeder logic for visual consistency
 */
function calculateNodeSize(trustScore: number, riskStatus: 'healthy' | 'medium' | 'toxic'): number {
  if (riskStatus === 'healthy') {
    // HEALTHY: 25-50px based on trust score
    // Trust 80 → 25px, Trust 100 → 50px
    const size = 25 + Math.floor((trustScore - 80) * 1.25) // (50-25)/(100-80) = 1.25
    return Math.max(25, Math.min(50, size))
  } else if (riskStatus === 'medium') {
    // MEDIUM: 20-30px based on trust score (adjusted to avoid ambiguity with toxic)
    // Trust 26 → 20px, Trust 79 → 30px
    const size = 20 + Math.floor((trustScore - 26) * 0.19) // (30-20)/(79-26) ≈ 0.19
    return Math.max(20, Math.min(30, size))
  } else {
    // TOXIC: 20-45px (INVERTED - lower trust = bigger size for urgency!)
    // Trust 25 → 20px, Trust 0 → 45px
    const invertedUrgency = Math.max(0, 25 - trustScore)
    const size = 20 + Math.floor(invertedUrgency * 1.0) // (45-20)/25 = 1.0
    return Math.max(20, Math.min(45, size))
  }
}

export const useGraphData = (apiData?: any) => {
  return useMemo(() => {
    const data = apiData
    const graph = new Graph()
    const nodeDataMap = new Map<string, GroupNode>()

    // Return empty graph if no data
    if (!data) {
      return { graph, nodeData: nodeDataMap }
    }

    // Handle new API format with nodes/edges arrays
    if (data.nodes && data.edges) {
      // 1. Add Nodes from new API format
      data.nodes.forEach((node: any) => {
        const key = node.key
        const attrs = node.attributes

        // Calculate color based on trust score to ensure consistency with NodeModal
        // Logic: >=80 (Green/Healthy), >25 (Yellow/Medium), <=25 (Red/Toxic)
        const trustScore = attrs.trust_score || 0
        let nodeColor = "#ef4444" // Default Red (Toxic)
        if (trustScore >= 80) nodeColor = "#22c55e" // Green (Healthy)
        else if (trustScore > 25) nodeColor = "#eab308" // Yellow (Medium)

        // Calculate derived values for consistency
        const calculatedType = trustScore >= 80 ? 'healthy' : trustScore > 25 ? 'medium' : 'toxic'

        // Calculate node size dynamically (matches Backend logic)
        const calculatedSize = calculateNodeSize(trustScore, calculatedType)

        // Add to Graph using calculated size
        graph.addNode(key, {
          label: attrs.label || key,
          size: calculatedSize,
          color: nodeColor,
          x: attrs.x || Math.random() * 800,
          y: attrs.y || Math.random() * 600,
          origColor: nodeColor,
          origSize: calculatedSize
          // Note: Don't set 'type' for nodes - use Sigma's default renderer
        })

        // Calculate derived values ensures consistency across UI
        const calculatedBadge = trustScore >= 80 ? 'LOW RISK' : trustScore > 25 ? 'MED RISK' : 'HIGH RISK'
        const calculatedEligibility = trustScore >= 80 ? 'Eligible' : trustScore > 25 ? 'Review' : 'High Risk'

        // Store basic metadata for API nodes
        nodeDataMap.set(key, {
          id: key,
          type: calculatedType,
          header: {
            name: attrs.label,
            location_village: attrs.location_village,
            member_count: Math.round(attrs.size * 2), // Estimate from size
            risk_badge: calculatedBadge,
            trust_score: trustScore,
            location_city: attrs.location_city || '',
            loan_eligibility: calculatedEligibility,
            total_loan_amount: 0
          },
          overview: {
            neighbors: []
          }
        })
      })

      // 2. Add Edges from new API format  
      data.edges.forEach((edge: any) => {
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
          graph.addEdge(edge.source, edge.target, {
            size: edge.attributes?.size || 1,
            color: edge.attributes?.color || '#cbd5e1',
            origSize: edge.attributes?.size || 1,
            origColor: edge.attributes?.color || '#cbd5e1'
          })
        }
      })
    } else {
      // Fallback to old networkData format
      const groups = (data as any).groups as Record<string, any>
      const nodeIds = Object.keys(groups)

      // 1. Add Nodes (old format)
      nodeIds.forEach((key) => {
        const group = groups[key]

        // Color Logic (updated to match new threshold)
        let color = "#94a3b8"
        const trustScore = group.header?.trust_score || 0
        if (trustScore >= 80) color = "#22c55e"
        else if (trustScore > 25) color = "#eab308"
        else color = "#ef4444"

        // Calculate risk type for size calculation
        const riskType = trustScore >= 80 ? 'healthy' : trustScore > 25 ? 'medium' : 'toxic'

        // Size Logic - use same calculation as new format
        const size = calculateNodeSize(trustScore, riskType)

        // Add to Graph
        graph.addNode(key, {
          label: group.header?.name || key,
          size: size,
          color: color,
          x: Math.random(),
          y: Math.random(),
          origColor: color,
          origSize: size
          // Note: Don't set 'type' for nodes - use Sigma's default renderer
        })

        // Store Metadata
        nodeDataMap.set(key, {
          ...group,
          id: key,
          type: trustScore > 80 ? 'healthy' : trustScore >= 25 ? 'medium' : 'toxic'
        })
      })

      // 2. Add Edges
      nodeIds.forEach(key => {
        const group = groups[key]
        if (group.overview?.neighbors) {
          group.overview.neighbors.forEach((neighbor: Neighbor) => {
            if (neighbor.id && groups[neighbor.id]) {
              if (!graph.hasEdge(key, neighbor.id) && !graph.hasEdge(neighbor.id, key)) {
                const edgeSize = neighbor.relation === 'Tetangga' ? 1 : 2
                graph.addEdge(key, neighbor.id, {
                  size: edgeSize,
                  color: '#e2e8f0',
                  origSize: edgeSize,
                  origColor: '#e2e8f0'
                })
              }
            }
          })
        }
      })
    } // Close else block

    // Clean up any node types that might cause Sigma rendering issues
    graph.forEachNode((node) => {
      if (graph.hasNodeAttribute(node, 'type')) {
        graph.removeNodeAttribute(node, 'type')
      }
    })

    return { graph, nodeData: nodeDataMap }
  }, [apiData])
}