/**
 * useGraphData - Hook for API data fetching and filtering logic
 * Phase 2: Business logic extraction
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchGraph } from '../api/api'
import type { GraphResponse, GraphNodeRaw } from '../types'

// Type for simplified group data used in filtering stats
export interface SimplifiedGroupNode {
    header?: {
        location_city?: string
        location_village?: string
        trust_score?: number
        member_count?: number
    }
    type?: string
}

// Filtered stats return type
export interface FilteredStats {
    totalGroups: number
    totalMembers: number
}

interface UseGraphDataOptions {
    selectedDesa: string
    selectedStatus: string
}

interface UseGraphDataReturn {
    apiData: GraphResponse | null
    isLoading: boolean
    groupsArray: SimplifiedGroupNode[]
    filteredStats: FilteredStats
    refreshData: () => Promise<void>
}

/**
 * Manages API data fetching and complex filtering logic
 */
export const useGraphData = ({
    selectedDesa,
    selectedStatus
}: UseGraphDataOptions): UseGraphDataReturn => {
    const [apiData, setApiData] = useState<GraphResponse | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    /**
     * Fetches graph data from API
     */
    const loadGraphData = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true)
            const data = await fetchGraph()
            setApiData(data)
        } catch (error) {
            console.error('Failed to fetch graph data:', error)
            // Fallback to empty data structure
            setApiData({ nodes: [], edges: [] })
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch data on mount
    useEffect(() => {
        loadGraphData()
    }, [loadGraphData])

    /**
     * Convert API data into simplified groups array for filtering
     */
    const groupsArray = useMemo((): SimplifiedGroupNode[] => {
        if (!apiData) return []

        // Handle new API format with nodes array
        if (apiData.nodes) {
            return apiData.nodes.map((node: GraphNodeRaw): SimplifiedGroupNode => ({
                header: {
                    location_city: node.attributes?.location_city || '',
                    location_village: node.attributes?.location_village || '',
                    trust_score: node.attributes?.trust_score || 0,
                    member_count: node.attributes?.size ? Math.round(node.attributes.size * 2) : 0
                }
            }))
        }

        // Fallback to old format (shouldn't happen with new API)
        return []
    }, [apiData])

    /**
     * Calculate filtered statistics based on selected filters
     */
    const filteredStats = useMemo((): FilteredStats => {
        if (!selectedDesa) {
            return { totalGroups: 0, totalMembers: 0 }
        }

        const filteredNodes = groupsArray.filter((node: SimplifiedGroupNode) => {
            if (node.header?.location_village !== selectedDesa) return false

            if (selectedStatus !== 'all') {
                const trustScore = node.header?.trust_score ?? 0

                if (selectedStatus === 'healthy') return trustScore > 80
                if (selectedStatus === 'medium') return trustScore > 25 && trustScore <= 80
                if (selectedStatus === 'toxic') return trustScore <= 25

                return node.type === selectedStatus
            }

            return true
        })

        const totalMembers = filteredNodes.reduce(
            (sum: number, node: SimplifiedGroupNode) => sum + (node.header?.member_count || 0),
            0
        )

        return {
            totalGroups: filteredNodes.length,
            totalMembers
        }
    }, [selectedDesa, selectedStatus, groupsArray])

    return {
        apiData,
        isLoading,
        groupsArray,
        filteredStats,
        refreshData: loadGraphData
    }
}
