/**
 * NodeModalWrapper - Conditional wrapper for NodeModal
 * Renders the modal only when a node is selected
 */
import React from 'react'
import { useDashboard } from '../../context'
import NodeModal from './index'

const NodeModalWrapper: React.FC = () => {
    const { selectedNode, setSelectedNode, handleApproveLoan, apiData } = useDashboard()

    if (!selectedNode) return null

    return (
        <NodeModal
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onApprove={handleApproveLoan}
            apiData={apiData}
        />
    )
}

export default NodeModalWrapper
