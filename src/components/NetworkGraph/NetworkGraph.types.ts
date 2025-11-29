export interface GroupHeader {
  name: string
  location_city: string
  location_village: string
  member_count: number
  risk_badge: string
  trust_score: number
  loan_eligibility: string
  total_loan_amount: number
}

export interface Neighbor {
  id?: string
  name: string
  risk: string
  distance: string
  relation: string
}

export interface GroupNode {
  id: string
  type: 'healthy' | 'toxic' | 'medium'
  header: GroupHeader
  overview: {
    neighbors: Neighbor[]
    [key: string]: any
  }
}

export interface NetworkGraphProps {
  selectedLocation: string
  selectedStatus: string
  onNodeSelect?: (node: GroupNode | null) => void
  apiData?: any
}