import { useMemo } from 'react'
import Graph from 'graphology'
import networkData from '../../data/networkData.json' 
import { GroupNode, Neighbor } from './NetworkGraph.types'

export const useGraphData = (apiData?: any) => {
  return useMemo(() => {
    const data = apiData || networkData
    const groups = (data as any).groups as Record<string, any>
    const nodeIds = Object.keys(groups)
    const graph = new Graph()
    const nodeDataMap = new Map<string, GroupNode>()

    // 1. Add Nodes
    nodeIds.forEach((key) => {
      const group = groups[key]
      
      // Color Logic
      let color = "#94a3b8"
      const trustScore = group.header?.trust_score || 0
      if (trustScore > 80) color = "#22c55e"
      else if (trustScore >= 25) color = "#eab308"
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
}