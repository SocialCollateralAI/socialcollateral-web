/**
 * ScoreCard - Trust score and member statistics card
 * Phase 3: Extracted from NodeModal/index.tsx
 */
import React from 'react'
import type { GroupNode } from '../../../types'

interface ScoreCardProps {
    node: GroupNode
}

const ScoreCard: React.FC<ScoreCardProps> = ({ node }) => {
    const trustScore = node.header.trust_score

    // Determine color scheme based on trust score
    const colorScheme = trustScore > 80
        ? {
            iconBg: 'bg-green-50 text-green-800 border-green-100',
            text: 'text-green-800',
            eligibility: 'bg-green-100 text-green-700 border-green-300',
            eligibilityLabel: 'Eligible'
        }
        : trustScore > 25
            ? {
                iconBg: 'bg-yellow-50 text-yellow-800 border-yellow-100',
                text: 'text-yellow-800',
                eligibility: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                eligibilityLabel: 'Review'
            }
            : {
                iconBg: 'bg-red-50 text-red-800 border-red-100',
                text: 'text-red-800',
                eligibility: 'bg-red-100 text-red-700 border-red-300',
                eligibilityLabel: 'High Risk'
            }

    return (
        <div className="mt-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        {/* Trust Score */}
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full border ${colorScheme.iconBg}`}>
                                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 2l7 3v5c0 5-3.58 9.74-7 11-3.42-1.26-7-6-7-11V5l7-3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9.5 12.5l1.75 1.75L15.5 10" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="text-start leading-tight">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Group Trust Score</div>
                                <div className={`text-3xl font-bold ${colorScheme.text}`}>
                                    {trustScore}<span className="text-sm text-gray-500 font-semibold"> /100</span>
                                </div>
                            </div>
                        </div>

                        {/* Member Count */}
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full border ${colorScheme.iconBg}`}>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4 20v-1c0-2.21 3.582-4 8-4s8 1.79 8 4v1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="text-start leading-tight">
                                <div className="text-[10px] uppercase text-gray-500 tracking-wide font-semibold">Total Anggota</div>
                                <div className={`text-3xl font-bold ${colorScheme.text}`}>{node.header.member_count}</div>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility */}
                    <div className="text-center leading-tight">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Loan Eligibility</div>
                        <div className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-semibold border ${colorScheme.eligibility}`}>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {colorScheme.eligibilityLabel}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScoreCard
