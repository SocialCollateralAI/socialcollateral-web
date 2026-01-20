import { useMemo } from 'react'
import Graph from 'graphology'
import type { GroupNode, Neighbor } from './NetworkGraph.types'

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

        // Add to Graph using provided coordinates and attributes
        graph.addNode(key, {
          label: attrs.label || key,
          size: attrs.size || 15,
          color: nodeColor,
          x: attrs.x || Math.random() * 800,
          y: attrs.y || Math.random() * 600,
          origColor: nodeColor,
          origSize: attrs.size || 15
          // Note: Don't set 'type' for nodes - use Sigma's default renderer
        })

        // Calculate derived values ensures consistency across UI
        const calculatedBadge = trustScore >= 80 ? 'LOW RISK' : trustScore > 25 ? 'MED RISK' : 'HIGH RISK'
        const calculatedType = trustScore >= 80 ? 'healthy' : trustScore > 25 ? 'medium' : 'toxic'
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

        // Color Logic
        let color = "#94a3b8"
        const trustScore = group.header?.trust_score || 0
        if (trustScore > 80) color = "#22c55e"
        else if (trustScore > 25) color = "#eab308"
        else color = "#ef4444"

        // Size Logic
        const size = Math.min(Math.max(8 + (group.header?.member_count || 0) * 0.5, 12), 25)

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