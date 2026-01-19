/**
 * API response types for socialcollateral-web
 * Defines expected structures from backend endpoints
 */

import type { GroupNode } from './entity';

// Raw node from API /graph endpoint
export interface GraphNodeRaw {
    key: string;
    attributes: {
        label: string;
        size: number;
        color: string;
        x: number;
        y: number;
        location_village?: string;
        location_city?: string;
        risk_badge?: string;
        trust_score?: number;
    };
}

// Raw edge from API /graph endpoint
export interface GraphEdgeRaw {
    source: string;
    target: string;
    attributes?: {
        size?: number;
        color?: string;
    };
}

// Response from GET /api/v1/graph
export interface GraphResponse {
    nodes: GraphNodeRaw[];
    edges: GraphEdgeRaw[];
}

// Response from GET /api/v1/groups/:id (detailed group data)
export type GroupDetailsResponse = GroupNode;
