/**
 * DashboardContext - Global state management for the dashboard
 * Phase 2: Centralized state store integrating all hooks
 */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { GroupNode, GraphResponse } from '../types'
import { useWallet } from '../hooks/useWallet'
import { useGraphData, type SimplifiedGroupNode, type FilteredStats } from '../hooks/useGraphData'

// ============================================================================
// Context Type Definition
// ============================================================================

interface DashboardContextType {
    // Filter States
    selectedKabupaten: string
    selectedDesa: string
    selectedStatus: string
    selectedNode: GroupNode | null

    // Filter Setters
    setSelectedKabupaten: (value: string) => void
    setSelectedDesa: (value: string) => void
    setSelectedStatus: (value: string) => void
    setSelectedNode: (node: GroupNode | null) => void
    handleKabupatenChange: (value: string) => void

    // Wallet Data
    walletBalance: number
    handleApproveLoan: (amount: number) => void

    // Graph Data
    apiData: GraphResponse | null
    isLoading: boolean
    groupsArray: SimplifiedGroupNode[]
    filteredStats: FilteredStats
    refreshData: () => Promise<void>
}

// ============================================================================
// Context Creation
// ============================================================================

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

// ============================================================================
// Provider Component
// ============================================================================

interface DashboardProviderProps {
    children: ReactNode
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
    // ---------------------------------------------------------------------------
    // Filter States
    // ---------------------------------------------------------------------------
    const [selectedKabupaten, setSelectedKabupaten] = useState<string>('')
    const [selectedDesa, setSelectedDesa] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedNode, setSelectedNode] = useState<GroupNode | null>(null)

    // ---------------------------------------------------------------------------
    // Integrate Wallet Hook
    // ---------------------------------------------------------------------------
    const { walletBalance, handleApproveLoan } = useWallet()

    // ---------------------------------------------------------------------------
    // Integrate Graph Data Hook
    // ---------------------------------------------------------------------------
    const {
        apiData,
        isLoading,
        groupsArray,
        filteredStats,
        refreshData
    } = useGraphData({
        selectedDesa,
        selectedStatus
    })

    // ---------------------------------------------------------------------------
    // Complex Filter Handlers
    // ---------------------------------------------------------------------------

    /**
     * Handles Kabupaten change - resets dependent filters
     */
    const handleKabupatenChange = useCallback((value: string): void => {
        setSelectedKabupaten(value)
        setSelectedDesa('')
        setSelectedStatus('all')
        setSelectedNode(null)
    }, [])

    // ---------------------------------------------------------------------------
    // Context Value
    // ---------------------------------------------------------------------------
    const value: DashboardContextType = {
        // Filter States
        selectedKabupaten,
        selectedDesa,
        selectedStatus,
        selectedNode,

        // Filter Setters
        setSelectedKabupaten,
        setSelectedDesa,
        setSelectedStatus,
        setSelectedNode,
        handleKabupatenChange,

        // Wallet Data
        walletBalance,
        handleApproveLoan,

        // Graph Data
        apiData,
        isLoading,
        groupsArray,
        filteredStats,
        refreshData
    }

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    )
}

// ============================================================================
// Custom Hook for Consuming Context
// ============================================================================

/**
 * Hook to access Dashboard context
 * @throws Error if used outside of DashboardProvider
 */
export const useDashboard = (): DashboardContextType => {
    const context = useContext(DashboardContext)

    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }

    return context
}

// ============================================================================
// Exports
// ============================================================================

export type { DashboardContextType, SimplifiedGroupNode, FilteredStats }
