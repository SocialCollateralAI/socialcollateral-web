// src/components/NetworkGraph/useGraphHighlighting.ts
import { useEffect } from 'react'
import type Sigma from 'sigma'
import type { GroupNode } from './NetworkGraph.types'

interface HighlightProps {
  sigmaInstance: Sigma | null
  selectedNodeId: string | null
  nodeData: Map<string, GroupNode>
}

export const useGraphHighlighting = ({ sigmaInstance, selectedNodeId, nodeData }: HighlightProps) => {
  useEffect(() => {
    if (!sigmaInstance) return
    if (typeof (sigmaInstance as any).getGraph !== 'function') return

    try {
      const g = sigmaInstance.getGraph()
      if (!g) return
      const EDGE_HIGHLIGHT_COLOR = '#374151'

    // Update Edges
    g.forEachEdge((edge, attr, source, target) => {
      const isConnected = selectedNodeId && (source === selectedNodeId || target === selectedNodeId)
      
      const origColor = g.getEdgeAttribute(edge, 'origColor') || attr.origColor || '#e2e8f0'
      const origSize = g.getEdgeAttribute(edge, 'origSize') || attr.origSize || (attr.size || 1)

      g.setEdgeAttribute(edge, 'color', isConnected ? EDGE_HIGHLIGHT_COLOR : origColor)
      g.setEdgeAttribute(edge, 'size', isConnected ? Math.max(origSize, 3) : origSize)
      // Edge types are usually okay, but keep it simple
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
      
      // Only set color and size, don't set any type attributes
      g.setNodeAttribute(node, 'color', nodeColor)
      g.setNodeAttribute(node, 'size', isSelected ? selectedSize : originalSize)
      
      // Ensure no invalid type is set
      if (g.hasNodeAttribute(node, 'type')) {
        console.log(`Removing type attribute from node ${node}:`, g.getNodeAttribute(node, 'type'))
        g.removeNodeAttribute(node, 'type')
      }
    })

    try {
      if (typeof (sigmaInstance as any).refresh === 'function') {
        sigmaInstance.refresh()
      }
    } catch (error) {
      console.error('Sigma refresh error:', error)
      console.log('Graph nodes count:', g.order)
      console.log('Graph edges count:', g.size)
      
      // Debug: Check all node attributes
      g.forEachNode((node) => {
        const attrs = g.getNodeAttributes(node)
        console.log(`Node ${node} attributes:`, attrs)
        if (g.hasNodeAttribute(node, 'type')) {
          console.log(`Removing problematic type from node ${node}`)
          g.removeNodeAttribute(node, 'type')
        }
      })
      
      try {
        sigmaInstance.refresh()
      } catch (secondError) {
        console.error('Second refresh attempt failed:', secondError)
      }
    }
    } catch (highlightError) {
      console.error('Error in graph highlighting:', highlightError)
    }
  }, [selectedNodeId, sigmaInstance, nodeData])
}