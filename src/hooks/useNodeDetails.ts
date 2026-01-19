/**
 * useNodeDetails - Hook for fetching and managing node detail data
 * Phase 3: Extracted from NodeModal/index.tsx
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchGroupDetails } from '../api/api'
import type { GroupNode } from '../types'

interface UseNodeDetailsOptions {
    node: GroupNode | null
}

interface UseNodeDetailsReturn {
    groupDetails: GroupNode | null
    loadingDetails: boolean
    loanApproved: boolean
    setLoanApproved: (value: boolean) => void
    refreshDetails: () => Promise<void>
}

/**
 * Manages fetching group details and loan approval status
 */
export const useNodeDetails = ({ node }: UseNodeDetailsOptions): UseNodeDetailsReturn => {
    const [groupDetails, setGroupDetails] = useState<GroupNode | null>(null)
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false)
    const [loanApproved, setLoanApproved] = useState<boolean>(false)

    /**
     * Fetch group details from API
     */
    const loadGroupDetails = useCallback(async (): Promise<void> => {
        if (!node) {
            setGroupDetails(null)
            return
        }

        try {
            setLoadingDetails(true)
            console.log('Fetching details for node ID:', node.id)
            const details = await fetchGroupDetails(node.id)
            console.log('Fetched group details:', details)
            setGroupDetails(details as GroupNode)
        } catch (error) {
            console.error('Failed to fetch group details:', error)
            // Use existing node data as fallback
            console.log('Using fallback node data:', node)
            setGroupDetails(node)
        } finally {
            setLoadingDetails(false)
        }
    }, [node])

    // Load details when node changes
    useEffect(() => {
        if (node) {
            // Check saved approval status
            const savedApprovalStatus = localStorage.getItem(`loanApproved_${node.id}`)
            if (savedApprovalStatus === 'true') {
                setLoanApproved(true)
            } else {
                setLoanApproved(false)
            }

            // Fetch details
            loadGroupDetails()
        } else {
            setGroupDetails(null)
            setLoanApproved(false)
        }
    }, [node, loadGroupDetails])

    return {
        groupDetails,
        loadingDetails,
        loanApproved,
        setLoanApproved,
        refreshDetails: loadGroupDetails
    }
}
