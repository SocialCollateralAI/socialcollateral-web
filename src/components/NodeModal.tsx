import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import home_good from "../assets/mock/home_good.jpg";
import home_poor from "../assets/mock/home_poor.jpg";
import biz_good from "../assets/mock/biz_good.jpg";
import biz_poor from "../assets/mock/biz_poor.jpg";

interface Node {
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

interface NodeModalProps {
  node: Node | null;
  onClose: () => void;
}

const NodeModal: React.FC<NodeModalProps> = ({ node, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [radarSort, setRadarSort] = useState("toxic-first");
  const [loanApproved, setLoanApproved] = useState(false);
  const [showSupervisorOverride, setShowSupervisorOverride] = useState(false);
  const [supervisorPasskey, setSupervisorPasskey] = useState("");
  const [showMediumRiskConfirm, setShowMediumRiskConfirm] = useState(false);
  const [imagePopup, setImagePopup] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({ isOpen: false, imageUrl: "", title: "" });

  // assetMap uses module-level imports (see top of file) to resolve JSON paths

  const assetMap: Record<string, string> = {
    "home_good.jpg": home_good as unknown as string,
    "home_poor.jpg": home_poor as unknown as string,
    "biz_good.jpg": biz_good as unknown as string,
    "biz_poor.jpg": biz_poor as unknown as string,
  };

  const resolveAssetPath = (rawPath: string) => {
    if (!rawPath || typeof rawPath !== "string") return rawPath;
    const fileName = rawPath.split("/").pop() || rawPath;
    return assetMap[fileName] || rawPath;
  };

  // Initialize loan approval state from localStorage
  useEffect(() => {
    if (node) {
      const savedApprovalStatus = localStorage.getItem(
        `loanApproved_${node.id}`
      );
      if (savedApprovalStatus === "true") {
        setLoanApproved(true);
      }
    }
  }, [node]);

  // Function to handle loan approval and save to localStorage
  const handleLoanApproval = () => {
    if (node) {
      setLoanApproved(true);
      localStorage.setItem(`loanApproved_${node.id}`, "true");
    }
  };

  if (!node) return null;

  // Derived values for charts
  const assetMax = Math.max(
    0,
    ...(node.trends.asset_growth || []).map((a) => a.value)
  );
  const assetYAxisMax = assetMax > 0 ? Math.ceil(assetMax * 1.15) : 10;

  // Resolved preview URLs for the small inline buttons
  const homePreviewUrl = resolveAssetPath(node.insights.cv.home.img_url);
  const bizPreviewUrl = resolveAssetPath(node.insights.cv.biz.img_url);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "trends", label: "Trends" },
    { id: "insights", label: "Insights" },
    { id: "decisions", label: "Decisions" },
  ];

  return (
    <div className="fixed right-0 top-0 w-152 h-screen bg-white shadow-xl border-l border-gray-200 flex flex-col z-50">
      {/* Colored header background */}
      <div
        className={`p-6 ${
          node.header.trust_score > 80
            ? "bg-green-50 text-green-700"
            : node.header.trust_score >= 25
            ? "bg-yellow-50 text-yellow-700"
            : "bg-red-50 text-red-700"
        } border-b border-gray-100 relative`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {node.header.name}
              </h3>
              <div
                className={`px-2 py-1 rounded-xl border text-xs font-bold uppercase tracking-wide ${
                  node.header.trust_score > 80
                    ? "bg-green-200 text-green-800 border-green-400"
                    : node.header.trust_score >= 25
                    ? "bg-yellow-200 text-yellow-800 border-yellow-400"
                    : "bg-red-200 text-red-800 border-red-400"
                }`}
              >
                {node.header.risk_badge}
              </div>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {node.header.location_city}, {node.header.location_village}
            </div>
          </div>
        </div>

        {/* White info card containing Trust / Members / Eligibility */}
        <div className="mt-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              {/* LEFT SIDE */}
              <div className="flex items-center gap-10">
                {/* Shield + Score */}
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full border ${
                      node.header.trust_score > 80
                        ? "bg-green-50 text-green-800 border-green-100"
                        : node.header.trust_score >= 25
                        ? "bg-yellow-50 text-yellow-800 border-yellow-100"
                        : "bg-red-50 text-red-800 border-red-100"
                    }`}
                  >
                    <svg
                      className="w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M12 2l7 3v5c0 5-3.58 9.74-7 11-3.42-1.26-7-6-7-11V5l7-3z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.5 12.5l1.75 1.75L15.5 10"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="text-start leading-tight">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                      Group Trust Score
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        node.header.trust_score > 80
                          ? "text-green-800"
                          : node.header.trust_score >= 25
                          ? "text-yellow-800"
                          : "text-red-800"
                      }`}
                    >
                      {node.header.trust_score}
                      <span className="text-sm text-gray-500 font-semibold">
                        {" "}
                        /100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Anggota */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full border ${
                      node.header.trust_score > 80
                        ? "bg-green-50 text-green-800 border-green-100"
                        : node.header.trust_score >= 25
                        ? "bg-yellow-50 text-yellow-800 border-yellow-100"
                        : "bg-red-50 text-red-800 border-red-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 20v-1c0-2.21 3.582-4 8-4s8 1.79 8 4v1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="text-start leading-tight">
                    <div className="text-[10px] uppercase text-gray-500 tracking-wide font-semibold">
                      Total Anggota
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        node.header.trust_score > 80
                          ? "text-green-800"
                          : node.header.trust_score >= 25
                          ? "text-yellow-800"
                          : "text-red-800"
                      }`}
                    >
                      {node.header.member_count}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE - Loan Eligibility */}
              <div className="text-center leading-tight">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                  Loan Eligibility
                </div>

                <div
                  className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-semibold border ${
                    node.header.trust_score > 80
                      ? "bg-green-100 text-green-700 border-green-300"
                      : node.header.trust_score >= 25
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : "bg-red-100 text-red-700 border-red-300"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {node.header.trust_score > 80
                    ? "Eligible"
                    : node.header.trust_score >= 25
                    ? "Review"
                    : "High Risk"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close button in top-right corner */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white rounded-full border-2 border-gray-300 transition-colors"
          type="button"
          aria-label="Close"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* PRIMARY RISK DRIVER */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="text-sm font-bold text-gray-900 uppercase">
                  PRIMARY RISK DRIVER
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {node.overview.primary_driver.text}
              </p>

              {/* Enhanced Comparative Bar Chart */}
              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-gray-600 gap-3">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Payment History
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Social Context
                  </span>
                </div>
                <div className="relative">
                  <div className="flex bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-4 transition-all duration-700 ${
                        node.header.trust_score > 80
                          ? "bg-blue-500"
                          : node.header.trust_score >= 25
                          ? "bg-blue-400"
                          : "bg-blue-300"
                      }`}
                      style={{
                        width: `${node.overview.primary_driver.payment_score}%`,
                      }}
                    ></div>
                    <div
                      className={`h-4 transition-all duration-700 ${
                        node.header.trust_score > 80
                          ? "bg-emerald-500"
                          : node.header.trust_score >= 25
                          ? "bg-emerald-400"
                          : "bg-emerald-300"
                      }`}
                      style={{
                        width: `${node.overview.primary_driver.social_score}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          node.header.trust_score > 80
                            ? "bg-blue-500"
                            : node.header.trust_score >= 25
                            ? "bg-blue-400"
                            : "bg-blue-300"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-700 font-bold">
                        {node.overview.primary_driver.payment_score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700 font-bold">
                        {node.overview.primary_driver.social_score}%
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          node.header.trust_score > 80
                            ? "bg-emerald-500"
                            : node.header.trust_score >= 25
                            ? "bg-emerald-400"
                            : "bg-emerald-300"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* METRICS CARDS */}
            <div className="grid grid-cols-3 gap-4">
              {/* Cycle Card */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">
                  CYCLE
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {node.overview.metrics.cycle}
                </div>
                <div className="text-xs text-gray-500">Times Borrowed</div>
              </div>

              {/* Repayment Card with Circular Progress */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
                  REPAYMENT
                </div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-2">
                  {/* Enhanced circular progress with risk-based colors */}
                  <svg
                    className="w-20 h-20 transform -rotate-90 drop-shadow-sm"
                    viewBox="0 0 80 80"
                  >
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle with risk-based color */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={
                        node.header.trust_score > 80
                          ? "#10b981"
                          : node.header.trust_score >= 25
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${
                        (node.overview.metrics.repayment_rate / 100) * 201
                      } 201`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div
                    className={`absolute text-lg font-bold ${
                      node.header.trust_score > 80
                        ? "text-green-700"
                        : node.header.trust_score >= 25
                        ? "text-amber-700"
                        : "text-red-700"
                    }`}
                  >
                    {node.overview.metrics.repayment_rate}%
                  </div>
                </div>
              </div>

              {/* Average Delay Card */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
                  AVG DELAY
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      node.overview.metrics.repayment_rate >= 95
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      node.overview.metrics.repayment_rate >= 85 &&
                      node.overview.metrics.repayment_rate < 95
                        ? "bg-yellow-500"
                        : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      node.overview.metrics.repayment_rate < 85
                        ? "bg-red-500"
                        : "bg-gray-200"
                    }`}
                  ></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {node.overview.metrics.avg_delay}
                </div>
              </div>
            </div>

            {/* TOTAL PINJAMAN TERSALURKAN */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 uppercase tracking-wide font-bold">
                  TOTAL PINJAMAN TERSALURKAN
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(node.header.total_loan_amount)}
                </div>
              </div>
            </div>

            {/* RADAR KONEKSI */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <h4 className="text-sm font-bold text-gray-900 uppercase">
                    RADAR KONEKSI
                  </h4>
                </div>
                <div className="relative">
                  <select
                    value={radarSort}
                    onChange={(e) => setRadarSort(e.target.value)}
                    className="text-xs text-gray-700 uppercase font-bold bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  >
                    <option value="toxic-first">SORT: TOXIC FIRST</option>
                    <option value="health-first">SORT: HEALTH FIRST</option>
                    <option value="location">SORT: LOCATION</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {node.overview.neighbors
                  .sort((a, b) => {
                    if (radarSort === "toxic-first") {
                      if (a.risk === "toxic" && b.risk !== "toxic") return -1;
                      if (a.risk !== "toxic" && b.risk === "toxic") return 1;
                    } else if (radarSort === "health-first") {
                      if (a.risk === "healthy" && b.risk !== "healthy")
                        return -1;
                      if (a.risk !== "healthy" && b.risk === "healthy")
                        return 1;
                    } else if (radarSort === "location") {
                      // Sort by distance (nearest to farthest)
                      const distanceA = parseFloat(
                        a.distance.replace("km", "")
                      );
                      const distanceB = parseFloat(
                        b.distance.replace("km", "")
                      );
                      return distanceA - distanceB;
                    }
                    return 0;
                  })
                  .map((neighbor, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${
                        neighbor.risk === "toxic"
                          ? "bg-red-50 border border-red-100"
                          : "bg-green-50 border border-green-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            neighbor.risk === "toxic"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {neighbor.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {neighbor.relation} • {neighbor.distance}
                          </div>
                        </div>
                      </div>
                      {neighbor.risk === "toxic" && (
                        <div className="px-2 py-1 bg-red-100 border border-red-400 text-red-700 text-xs font-semibold rounded uppercase">
                          CONTAGION RISK
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="space-y-6">
            {/* REPAYMENT HISTORY LINE CHART */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-6 px-6 py-6">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  REPAYMENT HISTORY
                </h4>
              </div>

              <div
                className={`h-52 w-full rounded ${
                  node.header.trust_score > 80
                    ? "bg-gradient-to-b from-green-50/30 to-transparent"
                    : node.header.trust_score >= 25
                    ? "bg-gradient-to-b from-amber-50/30 to-transparent"
                    : "bg-gradient-to-b from-red-50/30 to-transparent"
                }`}
              >
                <LineChart
                  dataset={node.trends.repayment_history}
                  xAxis={[
                    {
                      scaleType: "point",
                      dataKey: "month",
                      tickLabelStyle: {
                        fontSize: 10,
                        fill: "#9ca3af",
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      max: 100,
                      tickLabelStyle: {
                        fontSize: 10,
                        fill: "#9ca3af",
                      },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "rate",
                      color:
                        node.header.trust_score > 80
                          ? "#15803d"
                          : node.header.trust_score >= 25
                          ? "#b45309"
                          : "#b91c1c",
                      curve: "monotoneX",
                      area: true,
                      showMark: false,
                    },
                  ]}
                  height={208}
                  margin={{ left: 32, right: 16, top: 16, bottom: 32 }}
                  grid={{ horizontal: false, vertical: false }}
                  slotProps={{
                    legend: { hidden: true } as Partial<any>,
                  }}
                  sx={{
                    "& .MuiChartsAxis-line": {
                      stroke: "#e5e7eb",
                      strokeWidth: 1,
                    },
                    "& .MuiChartsAxis-tick": {
                      stroke: "transparent",
                    },
                    "& .MuiLineElement-root": {
                      strokeWidth: 2.5,
                    },
                    "& .MuiAreaElement-root": {
                      fill: `url(#repayment-gradient-${
                        node.header.trust_score > 80
                          ? "green"
                          : node.header.trust_score >= 25
                          ? "amber"
                          : "red"
                      })`,
                      fillOpacity: 0.15,
                    },
                  }}
                >
                  <defs>
                    <linearGradient
                      id="repayment-gradient-green"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#15803d" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#15803d"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                    <linearGradient
                      id="repayment-gradient-amber"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#b45309" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#b45309"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                    <linearGradient
                      id="repayment-gradient-red"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#b91c1c"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>
                </LineChart>
              </div>
            </div>

            {/* METRICS CARDS */}
            <div className="grid grid-cols-3 gap-4">
              {/* Streak Card */}
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                      STREAK
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {node.trends.stats.streak}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Default Card */}
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                      LAST DEFAULT
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {node.trends.stats.last_default}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Card */}
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-lg ${
                        node.trends.stats.trend_dir === "up"
                          ? "bg-green-50"
                          : "bg-red-50"
                      } flex items-center justify-center`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          node.trends.stats.trend_dir === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={
                            node.trends.stats.trend_dir === "up"
                              ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                      TREND 6M
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        node.trends.stats.trend_dir === "up"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {node.trends.stats.trend_val}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ASSET GROWTH BAR CHART */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <h4 className="text-sm font-bold text-gray-900 uppercase">
                    ASSET GROWTH EST. (JUTA)
                  </h4>
                </div>
                <div className="text-xs text-gray-500">
                  Avg: {node.trends.stats.avg_rate}% | Best:{" "}
                  {node.trends.stats.best_rate}%
                </div>
              </div>

              {/* MUI X-Charts Bar Chart */}
              <div className="h-56 w-full bg-gray-50 rounded-lg py-2">
                <BarChart
                  dataset={node.trends.asset_growth}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "month",
                      tickLabelStyle: { fontSize: 11, fill: "#6b7280" },
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      max: assetYAxisMax,
                      tickLabelStyle: { fontSize: 11, fill: "#6b7280" },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "value",
                      color:
                        node.header.trust_score > 80
                          ? "#10b981"
                          : node.header.trust_score >= 25
                          ? "#fbbb4dff"
                          : "#f46c6cff",
                    },
                  ]}
                  height={200}
                  margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                  grid={{ horizontal: true, vertical: false }}
                  sx={{
                    "& .MuiChartsAxis-line": {
                      stroke: "#e5e7eb",
                      strokeWidth: 1,
                    },
                    "& .MuiChartsGrid-line": {
                      stroke: "#f3f4f6",
                      strokeDasharray: "3 3",
                    },
                    "& .MuiChartsLegend-series": {
                      fontSize: "11px",
                      fill: "#6b7280",
                    },
                    "& .MuiChartsTooltip-root": {
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      fontSize: "12px",
                    },
                    "& .MuiBarElement-root": { rx: 6, ry: 6 },
                  }}
                />
              </div>
            </div>

            {/* SEASONALITY DETECTION HEATMAP */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    SEASONALITY DETECTION
                  </h4>
                </div>
                <div className="text-xs text-gray-500">12 Month Lookback</div>
              </div>

              {/* Simplified Heatmap Grid */}
              <div className="grid grid-cols-12 gap-2 mb-3">
                {node.trends.seasonality_heatmap.map((level, i) => {
                  const getHeatmapColor = (value: number) => {
                    // Simple color mapping: 1 = green, 2 = yellow, 3 = red
                    if (value === 1) return "#86efac"; // green-300
                    if (value === 2) return "#fde047"; // yellow-300
                    if (value === 3) return "#fca5a5"; // red-300
                    return "#e5e7eb"; // gray-200 (fallback)
                  };

                  return (
                    <div
                      key={i}
                      className="h-10 rounded transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        backgroundColor: getHeatmapColor(level),
                      }}
                      title={`Month ${i + 1}: Level ${level}`}
                    />
                  );
                })}
              </div>

              <div className="text-xs text-gray-500 italic">
                Heatmap indicates payment latency intensity per month.
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            {/* PREDICTION & WHAT-IF */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h4 className="text-sm font-bold text-gray-900 uppercase">
                  PREDICTION & WHAT-IF
                </h4>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                  <h5 className="text-sm font-bold text-orange-800 mb-2">
                    PREDICTED DEFAULT RISK
                  </h5>
                  <div className="flex items-baseline gap-4">
                    <div className="text-3xl font-bold text-orange-600">
                      {node.insights.prediction.default_risk_prob}%
                    </div>
                    <div className="text-xs text-orange-700">
                      in next {node.insights.prediction.horizon_days} days
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded">
                  <h5 className="text-sm font-bold text-gray-400 mb-2">
                    WHAT-IF SIMULATION:{" "}
                    {node.insights.prediction.what_if.scenario.toUpperCase()}
                  </h5>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 rounded-md p-2 py-1">
                      <div className="text-sm font-semibold text-gray-600">
                        Current:{" "}
                        <span className="font-bold">
                          {node.insights.prediction.what_if.current_score}%
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-600">→</div>
                    <div className="flex">
                      <div className="text-sm text-green-800 bg-green-100 rounded-md p-2 py-1 font-semibold">
                        Projected:{" "}
                        <span className="font-bold">
                          {node.insights.prediction.what_if.projected_score}%
                        </span>
                      </div>
                      <div className="text-xs text-green-600 p-2 py-1">
                        (+{node.insights.prediction.what_if.improvement_pct}%
                        Quality)
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-2 italic border border-gray-200 rounded-md text-xs text-gray-800">
                    💡 {node.insights.recommendation_text}
                  </div>
                </div>
              </div>
            </div>
            {/* SOCIAL GRAPH INTELLIGENCE */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-purple-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="text-sm font-bold text-gray-900 uppercase">
                  SOCIAL GRAPH INTELLIGENCE
                </h4>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold text-gray-700 uppercase">
                    HIGH RISK MEMBERS DETECTION
                  </h5>
                  <div className="text-xs text-gray-500">
                    {node.insights.social_graph.risk_members.length} members
                    flagged
                  </div>
                </div>

                <div className="space-y-2">
                  {node.insights.social_graph.risk_members.map(
                    (member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {member.hops}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-red-600">
                          {member.risk_score} trust
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* INSIGHT CARDS */}
            <div className="grid grid-cols-2 gap-4">
              {/* Home Insight */}
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <h5 className="text-sm font-bold text-gray-900 uppercase">
                    HOME INSIGHT
                  </h5>
                  <div
                    className={`ml-auto px-2 py-1 text-xs font-bold rounded ${
                      node.insights.cv.home.condition === "GOOD"
                        ? "bg-green-100 text-green-800"
                        : node.insights.cv.home.condition === "ENOUGH"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {node.insights.cv.home.condition}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">
                      {node.insights.cv.home.material}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roof:</span>
                    <span className="font-medium">
                      {node.insights.cv.home.roof}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Access:</span>
                    <span className="font-medium">
                      {node.insights.cv.home.access}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy:</span>
                    <span className="font-medium">
                      {node.insights.cv.home.occupancy}
                    </span>
                  </div>

                  <div className="flex gap-1 mt-2">
                    {node.insights.cv.home.assets.map((asset, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>

                  {/* Home Image */}
                  <div className="mt-4 border-t pt-3">
                    <button
                      onClick={() =>
                        setImagePopup({
                          isOpen: true,
                          imageUrl: resolveAssetPath(
                            node.insights.cv.home.img_url
                          ),
                          title: "Home Image - " + node.header.name,
                        })
                      }
                      className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 
               rounded-lg hover:bg-gray-50 transition-colors overflow-hidden 
               flex items-center justify-center"
                    >
                      {homePreviewUrl ? (
                        <img
                          src={homePreviewUrl}
                          alt="Home Image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=";
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">
                            View Home Image
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Business Insight */}
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h5 className="text-sm font-bold text-gray-900 uppercase">
                    BIZ INSIGHT
                  </h5>
                  <div
                    className={`ml-auto px-2 py-1 text-xs font-bold rounded ${
                      node.insights.cv.biz.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {node.insights.cv.biz.status}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {node.insights.cv.biz.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stability:</span>
                    <span className="font-medium">
                      {node.insights.cv.biz.stability}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Traffic:</span>
                    <span className="font-medium">
                      {node.insights.cv.biz.traffic}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Digital:</span>
                    <span className="font-medium">
                      {node.insights.cv.biz.digital}
                    </span>
                  </div>

                  <div className="flex gap-1 mt-2">
                    {node.insights.cv.biz.inventory.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Business Image */}
                  <div className="mt-4 border-t pt-3">
                    <button
                      onClick={() =>
                        setImagePopup({
                          isOpen: true,
                          imageUrl: resolveAssetPath(
                            node.insights.cv.biz.img_url
                          ),
                          title: "Business Image - " + node.header.name,
                        })
                      }
                      className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg 
               hover:bg-gray-50 transition-colors overflow-hidden flex items-center justify-center"
                    >
                      {bizPreviewUrl ? (
                        <img
                          src={bizPreviewUrl}
                          alt="Business Image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=";
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="text-sm text-gray-600 font-medium">
                            View Business Image
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "decisions" && (
          <div className="space-y-6">
            {/* RECOMMENDED CAP */}
            <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-2">
                RECOMMENDED CAP
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {formatCurrency(node.overview.max_plafon_recommendation)}
              </div>
              <div className="text-sm text-red-500">
                ↘ Reduces Global Budget
              </div>
            </div>

            {/* AI DECISION DRAFTER */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-purple-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="text-sm font-bold text-gray-900">
                  AI Decision Drafter
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Approval
                  </span>
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Rejection
                  </span>
                </button>
              </div>
            </div>

            {/* APPROVE LOAN BUTTON WITH LOGIC */}
            <div className="space-y-4">
              {!loanApproved ? (
                <>
                  {/* Medium Risk Confirmation Modal */}
                  {showMediumRiskConfirm && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="font-medium text-yellow-800 mb-2">
                        ⚠️ Medium Risk Confirmation
                      </div>
                      <div className="text-sm text-yellow-700 mb-3">
                        This group has medium risk profile. Are you sure you
                        want to approve?
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleLoanApproval();
                            setShowMediumRiskConfirm(false);
                          }}
                          className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700"
                        >
                          Yes, Approve
                        </button>
                        <button
                          onClick={() => setShowMediumRiskConfirm(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Main Approve Button */}
                  {node.header.trust_score < 25 ? (
                    <div className="w-full">
                      {!showSupervisorOverride ? (
                        <div className="w-full py-6 px-2 rounded-lg bg-gray-50 border border-gray-200 text-center">
                          <div className="flex justify-center mb-3">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-500 mb-2">
                            APPROVAL LOCKED (HIGH RISK)
                          </div>
                          <button
                            onClick={() => setShowSupervisorOverride(true)}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium underline hover:cursor-pointer"
                          >
                            Request Supervisor Override
                          </button>
                        </div>
                      ) : (
                        <div className="w-full py-6 px-6 rounded-lg bg-gray-50 border border-gray-200 text-center">
                          <div className="text-sm font-bold text-gray-800 mb-4">
                            ENTER SUPERVISOR PASSKEY
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="Passkey..."
                              value={supervisorPasskey}
                              onChange={(e) =>
                                setSupervisorPasskey(e.target.value)
                              }
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => {
                                if (supervisorPasskey === "DIR123") {
                                  handleLoanApproval();
                                  setShowSupervisorOverride(false);
                                  setSupervisorPasskey("");
                                } else {
                                  alert("Invalid passkey");
                                }
                              }}
                              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (node.header.trust_score > 80) {
                          // Low risk - direct approval
                          handleLoanApproval();
                        } else if (node.header.trust_score >= 25) {
                          // Medium risk - show confirmation
                          setShowMediumRiskConfirm(true);
                        }
                      }}
                      className="w-full py-4 text-lg font-bold rounded-lg transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      APPROVE LOAN
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full py-6 px-6 rounded-lg bg-green-50 border border-green-200 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-800 mb-2">
                    LOAN APPROVED
                  </div>
                  <div className="text-sm text-green-700">
                    Funds scheduled for disbursement.
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-4">
              <button className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Schedule Visit
              </button>

              <button className="px-4 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
                Reject Application
              </button>
            </div>

            {/* AUDIT FOOTER */}
            <div className="text-center">
              <div className="text-xs text-gray-500">
                ⚙️ {node.decision.last_audit.toUpperCase()}
              </div>
           </div>
        )}
      </div>

      {/* Image Popup Modal */}
      {imagePopup.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() =>
            setImagePopup({ isOpen: false, imageUrl: "", title: "" })
          }
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {imagePopup.title}
                </h3>
                <button
                  onClick={() =>
                    setImagePopup({ isOpen: false, imageUrl: "", title: "" })
                  }
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="p-6">
              <img
                src={imagePopup.imageUrl}
                alt={imagePopup.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEzIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeModal;
