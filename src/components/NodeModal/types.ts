/**
 * NodeModal types - re-exported from centralized types for backward compatibility
 */

// Re-export GroupNode as Node for backward compatibility
export type { GroupNode as Node } from '../../types';

// Re-export related types
export type {
  GroupHeader,
  Neighbor,
  GroupOverview,
  GroupTrends,
  GroupInsights,
  GroupDecision,
  PrimaryDriver,
  OverviewMetrics,
  RepaymentHistoryItem,
  AssetGrowthItem,
  TrendStats,
  RiskMember,
  HomeCVData,
  BusinessCVData,
  WhatIfScenario,
  PredictionData
} from '../../types';
