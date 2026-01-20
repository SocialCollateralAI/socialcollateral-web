/**
 * useNetworkGraphData - Hook for transforming API data into Graphology graph
 * Moved from src/components/NetworkGraph/userGraphData.ts
 */
import { useMemo } from 'react'
import Graph from 'graphology'
import type { GroupNode, Neighbor, GraphResponse, GraphNodeRaw, GraphEdgeRaw } from '../types'
import { getRiskStatus, getRiskBasedNodeSize } from '../utils/riskStyles'

// Type for legacy API format (fallback)
interface LegacyGroupData {
    header?: {
        name?: string;
        location_village?: string;
        location_city?: string;
        member_count?: number;
        risk_badge?: string;
        trust_score?: number;
        loan_eligibility?: string;
        total_loan_amount?: number;
    };
    overview?: {
        neighbors?: Neighbor[];
        primary_driver?: {
            text: string;
            payment_score: number;
            social_score: number;
        };
        metrics?: {
            cycle: number;
            repayment_rate: number;
            avg_delay: string;
        };
        max_plafon_recommendation?: number;
    };
    trends?: unknown;
    insights?: unknown;
    decision?: unknown;
}

interface LegacyApiFormat {
    groups?: Record<string, LegacyGroupData>;
}

export const useNetworkGraphData = (apiData?: GraphResponse | null) => {
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
            data.nodes.forEach((node: GraphNodeRaw) => {
                const key = node.key
                const attrs = node.attributes

                // Get trust score and determine consistent risk status
                const trustScore = attrs.trust_score || 0
                const riskStatus = getRiskStatus(trustScore)

                // Calculate dynamic size using the new sizing logic
                const nodeSize = getRiskBasedNodeSize(trustScore, riskStatus.label)

                // Determine color based on risk variant
                let nodeColor = "#94a3b8"
                if (riskStatus.variant === 'success') nodeColor = "#22c55e"
                else if (riskStatus.variant === 'warning') nodeColor = "#eab308"
                else if (riskStatus.variant === 'danger') nodeColor = "#ef4444"

                // Add to Graph using provided coordinates and calculated attributes
                graph.addNode(key, {
                    label: attrs.label || key,
                    size: nodeSize,
                    color: nodeColor,
                    x: attrs.x || Math.random() * 800,
                    y: attrs.y || Math.random() * 600,
                    origColor: nodeColor,
                    origSize: nodeSize
                    // Note: Don't set 'type' for nodes - use Sigma's default renderer
                })

                // Store basic metadata for API nodes
                const nodeType = riskStatus.variant === 'success' ? 'healthy' :
                    riskStatus.variant === 'warning' ? 'medium' : 'toxic'

                nodeDataMap.set(key, {
                    id: key,
                    type: nodeType,
                    header: {
                        name: attrs.label || key,
                        location_village: attrs.location_village || '',
                        member_count: Math.round(nodeSize * 2), // Estimate from size
                        risk_badge: riskStatus.badgeLabel,
                        trust_score: trustScore,
                        location_city: attrs.location_city || '',
                        loan_eligibility: riskStatus.eligibilityLabel,
                        total_loan_amount: 0
                    },
                    overview: {
                        neighbors: []
                    }
                })
            })

            // 2. Add Edges from new API format  
            data.edges.forEach((edge: GraphEdgeRaw) => {
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
            const legacyData = data as unknown as LegacyApiFormat
            const groups = legacyData.groups || {}
            const nodeIds = Object.keys(groups)

            // 1. Add Nodes (old format)
            nodeIds.forEach((key) => {
                const group = groups[key]

                // Get trust score and determine consistent risk status
                const trustScore = group.header?.trust_score || 0
                const riskStatus = getRiskStatus(trustScore)

                // Calculate dynamic size using the new sizing logic
                const size = getRiskBasedNodeSize(trustScore, riskStatus.label)

                // Determine color based on risk variant
                let color = "#94a3b8"
                if (riskStatus.variant === 'success') color = "#22c55e"
                else if (riskStatus.variant === 'warning') color = "#eab308"
                else if (riskStatus.variant === 'danger') color = "#ef4444"

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

                // Store Metadata - construct proper GroupNode from legacy data
                const groupNode: GroupNode = {
                    id: key,
                    type: trustScore > 80 ? 'healthy' : trustScore >= 25 ? 'medium' : 'toxic',
                    header: {
                        name: group.header?.name || key,
                        location_village: group.header?.location_village || '',
                        location_city: group.header?.location_city || '',
                        member_count: group.header?.member_count || 0,
                        risk_badge: group.header?.risk_badge || '',
                        trust_score: group.header?.trust_score || 0,
                        loan_eligibility: group.header?.loan_eligibility || '',
                        total_loan_amount: group.header?.total_loan_amount || 0
                    },
                    overview: group.overview ? {
                        neighbors: group.overview.neighbors || [],
                        primary_driver: group.overview.primary_driver,
                        metrics: group.overview.metrics,
                        max_plafon_recommendation: group.overview.max_plafon_recommendation
                    } : undefined,
                    trends: group.trends as GroupNode['trends'],
                    insights: group.insights as GroupNode['insights'],
                    decision: group.decision as GroupNode['decision']
                }
                nodeDataMap.set(key, groupNode)
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
