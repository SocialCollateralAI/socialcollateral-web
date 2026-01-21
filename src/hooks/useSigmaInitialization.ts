/**
 * useSigmaInitialization - Hook for initializing and managing Sigma.js instance
 * Extracted from NetworkGraph/index.tsx to separate UI from library logic
 */
import { useEffect, useRef, useMemo, useState, useCallback, type RefObject } from 'react'
import Sigma from 'sigma'
import type SigmaType from 'sigma'
import { circular } from 'graphology-layout'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import type { GroupNode, GraphResponse } from '../types'
import { useNetworkGraphData } from './useNetworkGraphData'
import { useGraphHighlighting } from './useGraphHighlighting'

interface UseSigmaOptions {
    apiData?: GraphResponse | null
    selectedLocation: string
    selectedStatus: string
    onNodeSelect?: (node: GroupNode | null) => void
}

interface UseSigmaReturn {
    containerRef: RefObject<HTMLDivElement | null>
    handleZoomIn: () => void
    handleZoomOut: () => void
    handleReset: () => void
}

export const useSigmaInitialization = ({
    apiData,
    selectedLocation,
    selectedStatus,
    onNodeSelect
}: UseSigmaOptions): UseSigmaReturn => {
    const containerRef = useRef<HTMLDivElement>(null)
    const sigmaRef = useRef<SigmaType | null>(null)
    const sigmaReadyRef = useRef(false)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    // 1. Get Data from API
    const { graph, nodeData } = useNetworkGraphData(apiData)

    // 2. Filter Logic
    const filteredGraph = useMemo(() => {
        const filtered = graph.copy()

        filtered.forEachNode((node) => {
            const nodeInfo = nodeData.get(node)
            if (!nodeInfo) {
                filtered.dropNode(node)
                return
            }

            // Filter by Village
            if (selectedLocation && selectedLocation !== 'all') {
                if (nodeInfo.header?.location_village !== selectedLocation) {
                    filtered.dropNode(node)
                    return
                }
            }

            // Filter by Status
            // Thresholds: Healthy >= 80, Medium 26-79, Toxic <= 25
            const trustScore = nodeInfo.header?.trust_score || 0
            if (selectedStatus !== 'all') {
                if (selectedStatus === 'healthy' && trustScore < 80) filtered.dropNode(node)
                else if (selectedStatus === 'medium' && (trustScore <= 25 || trustScore >= 80)) filtered.dropNode(node)
                else if (selectedStatus === 'toxic' && trustScore > 25) filtered.dropNode(node)
            }
        })
        return filtered
    }, [graph, nodeData, selectedLocation, selectedStatus])

    // 3. Sigma Initialization & Layout
    useEffect(() => {
        const initializeSigma = () => {
            if (!containerRef.current) {

                return
            }

            if (!filteredGraph || filteredGraph.order === 0) {

                return
            }

            // Clean up previous instance
            if (sigmaRef.current) {
                try {
                    sigmaRef.current.kill()
                } catch {
                    // Silently ignore cleanup errors
                }
                sigmaRef.current = null
            }

            try {
                // Layout algorithms
                circular.assign(filteredGraph)
                const settings = forceAtlas2.inferSettings(filteredGraph)
                forceAtlas2.assign(filteredGraph, { iterations: 50, settings })

                // Clean any problematic node types
                filteredGraph.forEachNode((node) => {
                    if (filteredGraph.hasNodeAttribute(node, 'type')) {
                        filteredGraph.removeNodeAttribute(node, 'type')
                    }
                })

                // Create Instance with minimal settings
                const sigma = new Sigma(filteredGraph, containerRef.current, {
                    renderLabels: true,
                    labelFont: "Arial, sans-serif",
                    labelSize: 12,
                    defaultNodeColor: "#94a3b8",
                    defaultEdgeColor: "#e2e8f0"
                })

                // mark not-ready until fully wired
                sigmaReadyRef.current = false
                sigmaRef.current = sigma


                // small tick to allow internal Sigma setup before marking ready
                setTimeout(() => {
                    sigmaReadyRef.current = true
                    try {
                        sigma.refresh()
                    } catch (e) {
                        console.warn('Refresh after init failed:', e)
                    }
                }, 0)

            } catch (error) {
                console.error('Sigma initialization failed:', error)
                sigmaRef.current = null
                return
            }

            if (!sigmaRef.current) return

            const sigma = sigmaRef.current

            // Click Event Handlers
            const handleClickNode = ({ node }: { node: string }) => {
                const nodeInfo = nodeData.get(node)
                if (nodeInfo) {
                    setSelectedNodeId((prev) => {
                        const next = prev === node ? null : node
                        if (onNodeSelect) onNodeSelect(next ? nodeInfo : null)
                        return next
                    })
                }
            }

            const handleClickStage = () => {
                setSelectedNodeId(null)
                if (onNodeSelect) onNodeSelect(null)
            }

            try {
                sigma.on('clickNode', handleClickNode)
                sigma.on('clickStage', handleClickStage)
            } catch (e) {
                console.warn('Failed to attach sigma event handlers:', e)
            }

            return () => {
                // remove handlers first
                try {
                    sigma.off && sigma.off('clickNode', handleClickNode)
                    sigma.off && sigma.off('clickStage', handleClickStage)
                } catch {
                    // Silently ignore event handler removal errors
                }

                // kill instance
                if (sigmaRef.current) {
                    try {
                        sigmaRef.current.kill()
                    } catch {
                        // Silently ignore cleanup errors
                    }
                    sigmaRef.current = null
                    sigmaReadyRef.current = false
                }
            }
        }

        // Use setTimeout to ensure DOM is ready
        const timeoutId = setTimeout(initializeSigma, 100)

        return () => {
            clearTimeout(timeoutId)
            if (sigmaRef.current) {
                try {
                    sigmaRef.current.kill()
                } catch {
                    // Silently ignore cleanup errors
                }
                sigmaRef.current = null
            }
        }
    }, [filteredGraph, nodeData, onNodeSelect])

    // 4. Handle Visual Highlighting
    useGraphHighlighting({
        sigmaInstance: sigmaReadyRef.current ? sigmaRef.current : null,
        selectedNodeId,
        nodeData
    })

    // 5. Handle Click Outside
    useEffect(() => {
        const handleDocClick = (e: MouseEvent) => {
            const container = containerRef.current
            if (!container) return
            const target = e.target as Node | null

            let isClickInModal = false
            if (target) {
                let currentElement = target as HTMLElement | null
                while (currentElement) {
                    if (currentElement.classList?.contains('z-50')) {
                        isClickInModal = true
                        break
                    }
                    currentElement = currentElement.parentElement
                }
            }

            if (target && !container.contains(target) && !isClickInModal) {
                setSelectedNodeId(null)
                if (onNodeSelect) onNodeSelect(null)
            }
        }
        document.addEventListener('click', handleDocClick)
        return () => document.removeEventListener('click', handleDocClick)
    }, [onNodeSelect])

    // 6. Zoom Handlers
    const handleZoomIn = useCallback(() => {
        sigmaRef.current?.getCamera().animatedZoom({ duration: 200 })
    }, [])

    const handleZoomOut = useCallback(() => {
        sigmaRef.current?.getCamera().animatedUnzoom({ duration: 200 })
    }, [])

    const handleReset = useCallback(() => {
        sigmaRef.current?.getCamera().animatedReset({ duration: 200 })
        setSelectedNodeId(null)
        if (onNodeSelect) onNodeSelect(null)
    }, [onNodeSelect])

    return {
        containerRef,
        handleZoomIn,
        handleZoomOut,
        handleReset
    }
}
