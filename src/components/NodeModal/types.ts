export interface Node {
  id: string;
  type: string;
  header: {
    name: string;
    location_city: string;
    location_village: string;
    member_count: number;
    risk_badge: string;
    trust_score: number;
    loan_eligibility: string;
    total_loan_amount: number;
  };
  overview: {
    primary_driver: {
      text: string;
      payment_score: number;
      social_score: number;
    };
    metrics: {
      cycle: number;
      repayment_rate: number;
      avg_delay: string;
    };
    neighbors: Array<{
      name: string;
      risk: string;
      distance: string;
      relation: string;
    }>;
    max_plafon_recommendation: number;
  };
  trends: {
    repayment_history: Array<{
      month: string;
      rate: number;
    }>;

    asset_growth: Array<{
      month: string;
      value: number;
    }>;
    stats: {
      streak: number;
      last_default: string;
      trend_val: number;
      trend_dir: string;
      avg_rate: number;
      best_rate: number;
    };
    seasonality_heatmap: number[];
  };
  insights: {
    social_graph: {
      risk_members: Array<{
        name: string;
        risk_score: string;
        hops: string;
      }>;
    };
    cv: {
      home: {
        condition: string;
        material: string;
        roof: string;
        access: string;
        occupancy: string;
        assets: string[];
        img_url: string;
      };
      biz: {
        stability: string;
        type: string;
        traffic: string;
        status: string;
        digital: string;
        inventory: string[];
        img_url: string;
      };
    };
    prediction: {
      default_risk_prob: number;
      horizon_days: number;
      what_if: {
        current_score: number;
        projected_score: number;
        improvement_pct: number;
        scenario: string;
      };
    };
    recommendation_text: string;
  };
  decision: {
    last_audit: string;
    is_locked: boolean;
  };
}
