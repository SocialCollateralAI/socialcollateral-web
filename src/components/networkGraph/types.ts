interface GroupHeader {
  name: string
  x: number
  y: number
  size: number
  color: string
  location_city: string
  location_village: string
  member_count: number
  risk_badge: string
  trust_score: number
  loan_eligibility: string
  total_loan_amount: number
}

interface Neighbor {
  id?: string
  name: string
  risk: string
  distance: string
  relation: string
}

interface GroupNode {
  id: string
  type: 'healthy' | 'toxic' | 'medium'
  header: GroupHeader
  overview: {
    neighbors: Neighbor[]
    [key: string]: any
  }
  x: number
  y: number
  color: string
  size: number
}

interface NetworkGraphProps {
  selectedLocation: string
  selectedStatus: string
  onNodeSelect?: (node: GroupNode | null) => void
}