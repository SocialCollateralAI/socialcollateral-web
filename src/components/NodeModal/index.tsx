/**
 * NodeModal - Main modal component for group details
 * Phase 3: Refactored to use extracted parts and useNodeDetails hook
 */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import type { GroupNode, GraphResponse, Neighbor } from '../../types'
import { useNodeDetails } from '../../hooks/useNodeDetails'
import { getRiskStatus } from '../../utils/riskStyles'
import { ModalHeader, ScoreCard } from './parts'
import OverviewTab from './tabs/OverviewTab'
import TrendsTab from './tabs/TrendsTab'
import InsightsTab from './tabs/InsightTab'
import DecisionsTab from './tabs/DecisionTab'

interface NodeModalProps {
  node: GroupNode | null
  onClose: () => void
  onApprove?: (amount: number) => void
  apiData?: GraphResponse | null
}

const NodeModal: React.FC<NodeModalProps> = ({ node, onClose, onApprove, apiData }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showSupervisorOverride, setShowSupervisorOverride] = useState(false)
  const [supervisorPasskey, setSupervisorPasskey] = useState('')
  const [showMediumRiskConfirm, setShowMediumRiskConfirm] = useState(false)
  const tabContentRef = useRef<HTMLDivElement>(null)

  // Use extracted hook for node details
  const { groupDetails, loadingDetails, loanApproved, setLoanApproved } = useNodeDetails({ node })

  // Derive neighbors from graph edges (source of truth for visual connections)
  const graphNeighbors = useMemo((): Neighbor[] => {
    if (!apiData?.edges || !apiData?.nodes || !node) return []

    const nodeId = node.id
    const connectedNodeIds = new Set<string>()

    // Find all edges connected to this node
    apiData.edges.forEach(edge => {
      if (edge.source === nodeId) connectedNodeIds.add(edge.target)
      if (edge.target === nodeId) connectedNodeIds.add(edge.source)
    })

    // Build neighbor objects from connected nodes with proper risk status
    return apiData.nodes
      .filter(n => connectedNodeIds.has(n.key))
      .map(n => {
        const trustScore = n.attributes.trust_score || 0
        const riskStatus = getRiskStatus(trustScore)
        // Map variant to risk category
        const riskCategory = riskStatus.variant === 'success' ? 'healthy' :
          riskStatus.variant === 'warning' ? 'medium' : 'toxic'

        return {
          id: n.key,
          name: n.attributes.label || n.key,
          risk: riskCategory,
          distance: 'N/A',
          relation: 'Connected',
          trust_score: trustScore
        }
      })
  }, [apiData, node])

  // Reset scroll position when tab changes
  useEffect(() => {
    if (tabContentRef.current) {
      tabContentRef.current.scrollTop = 0
    }
  }, [activeTab])

  const handleLoanApproval = () => {

    if (!node) return

    setLoanApproved(true)
    localStorage.setItem(`loanApproved_${node.id}`, 'true')

    // Determine amount based on trust score
    const trustScore = Number(node.header?.trust_score ?? 0)

    let candidate: number = 0
    if (trustScore < 25) {
      candidate = 0

    } else {
      candidate = node.overview?.max_plafon_recommendation ?? node.header?.total_loan_amount ?? 25000000

    }

    // Coerce candidate to a numeric amount safely
    let amount = Number(candidate)
    if (Number.isNaN(amount) || (amount === 0 && trustScore >= 25)) {
      amount = trustScore < 25 ? 0 : 25000000

    }


    if (onApprove && typeof onApprove === 'function') {
      try {
        onApprove(amount)
      } catch (e) {
        console.error('onApprove handler failed:', e)
      }
    }
  }

  if (!node) return null

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'insights', label: 'Insights' },
    { id: 'decisions', label: 'Decisions' }
  ]

  // Use groupDetails if available, otherwise fall back to node
  const displayNode = groupDetails || node

  return (
    <div
      className="fixed right-0 top-0 w-152 h-screen bg-white shadow-xl border-l border-gray-200 flex flex-col z-50 animate-in slide-in-from-right duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with dynamic color - using extracted component */}
      <ModalHeader node={node} onClose={onClose} />

      {/* Score Card - using extracted component */}
      <div className="px-6 -mt-2">
        <ScoreCard node={node} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mt-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab(tab.id)
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        ref={tabContentRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading group details...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab node={displayNode} graphNeighbors={graphNeighbors} />}
            {activeTab === 'trends' && <TrendsTab node={displayNode} />}
            {activeTab === 'insights' && <InsightsTab node={displayNode} />}
            {activeTab === 'decisions' && (
              <DecisionsTab
                node={displayNode}
                loanApproved={loanApproved}
                handleLoanApproval={handleLoanApproval}
                showMediumRiskConfirm={showMediumRiskConfirm}
                setShowMediumRiskConfirm={setShowMediumRiskConfirm}
                showSupervisorOverride={showSupervisorOverride}
                setShowSupervisorOverride={setShowSupervisorOverride}
                supervisorPasskey={supervisorPasskey}
                setSupervisorPasskey={setSupervisorPasskey}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NodeModal
