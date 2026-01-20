export type RiskVariant = 'success' | 'warning' | 'danger'

export interface RiskStatus {
    variant: RiskVariant
    label: string
    badgeLabel: string
    eligibilityLabel: string
}

/**
 * Determines risk status based on trust_score ONLY
 * This ensures Graph and Modal colors are always in sync
 * 
 * @param trustScore - The numeric trust score (0-100)
 * @returns RiskStatus with variant and labels
 */
export function getRiskStatus(trustScore: number): RiskStatus {
    if (trustScore > 80) {
        return {
            variant: 'success',
            label: 'Healthy',
            badgeLabel: 'LOW RISK',
            eligibilityLabel: 'Eligible'
        }
    }

    if (trustScore > 25) {
        return {
            variant: 'warning',
            label: 'Medium',
            badgeLabel: 'MED RISK',
            eligibilityLabel: 'Review'
        }
    }

    // trustScore < 25
    return {
        variant: 'danger',
        label: 'High Risk',
        badgeLabel: 'HIGH RISK',
        eligibilityLabel: 'High Risk'
    }
}

/**
 * Calculate node size based on trust score and risk status
 * Uses different formulas per risk tier with inverted logic for high-risk nodes
 * 
 * @param trustScore - The numeric trust score (0-100)
 * @param riskStatus - The risk status label ('Healthy', 'Medium', 'High Risk', 'Toxic')
 * @returns The calculated node size
 */
export function getRiskBasedNodeSize(trustScore: number, riskStatus: string): number {
    const status = riskStatus.toLowerCase()

    // Healthy (Score >= 80): Formula 25 + floor((score - 80) * 1.25), Min 25, Max 50
    if (status === 'healthy' || status === 'low risk') {
        const size = 25 + Math.floor((trustScore - 80) * 1.25)
        return Math.min(Math.max(size, 25), 50)
    }

    // Medium (Score > 25 but < 80): Formula 20 + floor((score - 26) * 0.19), Min 20, Max 30
    if (status === 'medium' || status === 'med risk' || status === 'review') {
        const size = 20 + Math.floor((trustScore - 26) * 0.19)
        return Math.min(Math.max(size, 20), 30)
    }

    // High Risk/Toxic (Score <= 25): INVERTED - lower score = bigger node
    // Formula: 20 + floor((25 - score) * 1.0), Min 20, Max 45
    const size = 20 + Math.floor((25 - trustScore) * 1.0)
    return Math.min(Math.max(size, 20), 45)
}

export const riskColorSchemes = {
    success: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        textDark: 'text-green-800',
        badge: 'bg-green-200 text-green-800 border-green-400',
        iconBg: 'bg-green-50 text-green-800 border-green-100',
        eligibility: 'bg-green-100 text-green-700 border-green-300'
    },
    warning: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        textDark: 'text-yellow-800',
        badge: 'bg-yellow-200 text-yellow-800 border-yellow-400',
        iconBg: 'bg-yellow-50 text-yellow-800 border-yellow-100',
        eligibility: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    danger: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        textDark: 'text-red-800',
        badge: 'bg-red-200 text-red-800 border-red-400',
        iconBg: 'bg-red-50 text-red-800 border-red-100',
        eligibility: 'bg-red-100 text-red-700 border-red-300'
    }
} as const

export type RiskColorScheme = typeof riskColorSchemes[RiskVariant]

/**
 * Get complete color scheme and labels for a trust score
 * Single function to determine all visual properties
 * 
 * @param trustScore - The numeric trust score (0-100)
 * @returns Object with colors and labels
 */
export function getRiskStyling(trustScore: number): RiskStatus & { colors: RiskColorScheme } {
    const status = getRiskStatus(trustScore)
    const colors = riskColorSchemes[status.variant]

    return {
        ...status,
        colors
    }
}
