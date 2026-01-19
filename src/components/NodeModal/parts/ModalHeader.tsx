/**
 * ModalHeader - Header section of NodeModal with trust score styling
 * Phase 3: Extracted from NodeModal/index.tsx
 */
import React from 'react'
import type { GroupNode } from '../../../types'

interface ModalHeaderProps {
    node: GroupNode
    onClose: () => void
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ node, onClose }) => {
    const trustScore = node.header.trust_score

    // Determine color scheme based on trust score
    const colorScheme = trustScore > 80
        ? {
            bg: 'bg-green-50',
            text: 'text-green-700',
            badge: 'bg-green-200 text-green-800 border-green-400'
        }
        : trustScore > 25
            ? {
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                badge: 'bg-yellow-200 text-yellow-800 border-yellow-400'
            }
            : {
                bg: 'bg-red-50',
                text: 'text-red-700',
                badge: 'bg-red-200 text-red-800 border-red-400'
            }

    return (
        <div className={`p-6 ${colorScheme.bg} ${colorScheme.text} border-b border-gray-100 relative`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{node.header.name}</h3>
                        <div className={`px-2 py-1 rounded-xl border text-xs font-bold uppercase tracking-wide ${colorScheme.badge}`}>
                            {node.header.risk_badge}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {node.header.location_city}, {node.header.location_village}
                    </div>
                </div>
            </div>

            {/* Close Button */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white rounded-full border-2 border-gray-300 transition-colors"
                    type="button"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default ModalHeader
