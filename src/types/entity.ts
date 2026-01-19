/**
 * Core entity types for socialcollateral-web
 * Single source of truth for all domain entities
 */

// Risk status literal type
export type RiskStatus = 'healthy' | 'medium' | 'toxic';

// Neighbor connection in the network
export interface Neighbor {
    id?: string;
    name: string;
    risk: string;
    distance: string;
    relation: string;
    trust_score?: number;
}

// Group header metadata
export interface GroupHeader {
    name: string;
    location_city: string;
    location_village: string;
    member_count: number;
    risk_badge: string;
    trust_score: number;
    loan_eligibility: string;
    total_loan_amount: number;
}

// Primary risk driver metrics
export interface PrimaryDriver {
    text: string;
    payment_score: number;
    social_score: number;
}

// Overview metrics
export interface OverviewMetrics {
    cycle: number;
    repayment_rate: number;
    avg_delay: string;
}

// Group overview section
export interface GroupOverview {
    primary_driver?: PrimaryDriver;
    metrics?: OverviewMetrics;
    neighbors: Neighbor[];
    max_plafon_recommendation?: number;
}

// Repayment history item
export interface RepaymentHistoryItem {
    month: string;
    rate: number;
}

// Asset growth item
export interface AssetGrowthItem {
    month: string;
    value: number;
}

// Trend statistics
export interface TrendStats {
    streak: number;
    last_default: string;
    trend_val: number;
    trend_dir: string;
    avg_rate: number;
    best_rate: number;
}

// Trends section
export interface GroupTrends {
    repayment_history: RepaymentHistoryItem[];
    asset_growth: AssetGrowthItem[];
    stats: TrendStats;
    seasonality_heatmap: number[];
}

// Risk member in social graph
export interface RiskMember {
    name: string;
    risk_score: string;
    hops: string;
}

// Home CV data
export interface HomeCVData {
    condition: string;
    material: string;
    roof: string;
    access: string;
    occupancy: string;
    assets: string[];
    img_url: string;
}

// Business CV data
export interface BusinessCVData {
    stability: string;
    type: string;
    traffic: string;
    status: string;
    digital: string;
    inventory: string[];
    img_url: string;
}

// What-if prediction scenario
export interface WhatIfScenario {
    current_score: number;
    projected_score: number;
    improvement_pct: number;
    scenario: string;
}

// Prediction data
export interface PredictionData {
    default_risk_prob: number;
    horizon_days: number;
    what_if: WhatIfScenario;
}

// Insights section
export interface GroupInsights {
    social_graph: {
        risk_members: RiskMember[];
    };
    cv: {
        home: HomeCVData;
        biz: BusinessCVData;
    };
    prediction: PredictionData;
    recommendation_text: string;
}

// Decision section
export interface GroupDecision {
    last_audit: string;
    is_locked: boolean;
}

// Complete Group Node (unified from Node and GroupNode)
export interface GroupNode {
    id: string;
    type: RiskStatus;
    header: GroupHeader;
    overview?: GroupOverview;
    trends?: GroupTrends;
    insights?: GroupInsights;
    decision?: GroupDecision;
}

// NetworkGraph component props
export interface NetworkGraphProps {
    selectedLocation: string;
    selectedStatus: string;
    onNodeSelect?: (node: GroupNode | null) => void;
    apiData?: import('./api').GraphResponse | null;
}
