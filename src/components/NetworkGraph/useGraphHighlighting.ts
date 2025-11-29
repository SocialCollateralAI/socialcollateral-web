// src/components/NetworkGraph/useGraphHighlighting.ts
import { useEffect } from 'react'
import Sigma from 'sigma'
import { GroupNode } from './NetworkGraph.types'

interface HighlightProps {
  sigmaInstance: Sigma | null
  selectedNodeId: string | null
  nodeData: Map<string, GroupNode>
}

export const useGraphHighlighting = ({ sigmaInstance, selectedNodeId, nodeData }: HighlightProps) => {
  useEffect(() => {
    if (!sigmaInstance) return

    const g = sigmaInstance.getGraph()
    const EDGE_HIGHLIGHT_COLOR = '#374151'

    // Update Edges
    g.forEachEdge((edge, attr, source, target) => {
      const isConnected = selectedNodeId && (source === selectedNodeId || target === selectedNodeId)
      
      const origColor = g.getEdgeAttribute(edge, 'origColor') || attr.origColor || '#e2e8f0'
      const origSize = g.getEdgeAttribute(edge, 'origSize') || attr.origSize || (attr.size || 1)
      const origType = g.getEdgeAttribute(edge, 'origType') || attr.origType || (attr.type || 'line')

      g.setEdgeAttribute(edge, 'color', isConnected ? EDGE_HIGHLIGHT_COLOR : origColor)
      g.setEdgeAttribute(edge, 'size', isConnected ? Math.max(origSize, 3) : origSize)
      g.setEdgeAttribute(edge, 'type', isConnected ? 'line' : origType)
    })

    // Update Nodes
    g.forEachNode((node) => {
      const isSelected = selectedNodeId === node
      // Ambil atribut original, fallback ke nodeData jika tidak ada di atribut graph
      const originalColor = g.getNodeAttribute(node, 'origColor') || (nodeData.get(node) as any)?.color || '#94a3b8'
      const originalSize = g.getNodeAttribute(node, 'origSize') || (nodeData.get(node) as any)?.size || 12
      const selectedSize = g.getNodeAttribute(node, 'selectedSize') || originalSize * 1.4

      let isRelated = false
      if (selectedNodeId) {
        isRelated = g.hasEdge(selectedNodeId, node) || g.hasEdge(node, selectedNodeId)
      }

      const nodeColor = (isSelected || isRelated || !selectedNodeId) ? originalColor : '#d1d5db'
      
      g.setNodeAttribute(node, 'color', nodeColor)
      g.setNodeAttribute(node, 'size', isSelected ? selectedSize : originalSize)
    })

    sigmaInstance.refresh()
  }, [selectedNodeId, sigmaInstance, nodeData])
}