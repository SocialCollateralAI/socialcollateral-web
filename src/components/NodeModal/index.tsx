import React, { useState, useEffect, useRef } from 'react';
import type { Node } from './types';
import OverviewTab from './tabs/OverviewTab';
import TrendsTab from './tabs/TrendsTab';
import InsightsTab from './tabs/InsightTab';
import DecisionsTab from './tabs/DecisionTab';
import { fetchGroupDetails } from '../../api/api';

interface NodeModalProps {
  node: Node | null;
  onClose: () => void;
  onApprove?: (amount: number) => void;
}

const NodeModal: React.FC<NodeModalProps> = ({ node, onClose, onApprove }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loanApproved, setLoanApproved] = useState(false);
  const [showSupervisorOverride, setShowSupervisorOverride] = useState(false);
  const [supervisorPasskey, setSupervisorPasskey] = useState("");
  const [showMediumRiskConfirm, setShowMediumRiskConfirm] = useState(false);
  const [groupDetails, setGroupDetails] = useState<Node | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (node) {
      const savedApprovalStatus = localStorage.getItem(`loanApproved_${node.id}`);
      if (savedApprovalStatus === "true") {
        setLoanApproved(true);
      } else {
        setLoanApproved(false); // Reset state if switching nodes
      }

      // Fetch detailed group data from API
      const loadGroupDetails = async () => {
        try {
          setLoadingDetails(true);
          console.log('Fetching details for node ID:', node.id);
          const details = await fetchGroupDetails(node.id);
          console.log('Fetched group details:', details);
          setGroupDetails(details);
        } catch (error) {
          console.error('Failed to fetch group details:', error);
          // Use existing node data as fallback
          console.log('Using fallback node data:', node);
          setGroupDetails(node);
        } finally {
          setLoadingDetails(false);
        }
      };

      loadGroupDetails();
    } else {
      setGroupDetails(null);
    }
  }, [node]);

  // Reset scroll position saat tab berubah
  useEffect(() => {
    if (tabContentRef.current) {
      tabContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleLoanApproval = () => {
    console.log('handleLoanApproval started');
    if (!node) return;
    console.log('handleLoanApproval started for node:', node.id);
    setLoanApproved(true);
    localStorage.setItem(`loanApproved_${node.id}`, "true");
    // Determine amount based on trust score to keep behavior consistent with DecisionTab
    const trustScore = Number(node.header?.trust_score ?? 0);
    console.log('Trust score:', trustScore);
    let candidate: number = 0;
    if (trustScore < 25) {

      candidate = 0;
      console.log('High risk - setting candidate to 0');
    } else {
      // Prefer a recommended plafon, fall back to header total or a default cap
      candidate = node.overview?.max_plafon_recommendation ?? node.header?.total_loan_amount ?? 25000000;
      console.log('Non-high risk - candidate from node data:', candidate);
    }

    // Coerce candidate to a numeric amount safely
    let amount = Number(candidate);
    if (Number.isNaN(amount) || (amount === 0 && trustScore >= 25)) {
      // If coercion failed or amount is 0 for non-high-risk, use fallback
      amount = trustScore < 25 ? 0 : 25000000;
      console.log('Using fallback amount (NaN or 0 for non-high-risk):', amount);
    }
    console.log('Final calculated amount:', amount, 'type:', typeof amount);

    if (onApprove && typeof onApprove === "function") {
      try {
        console.log('Calling onApprove with amount:', amount);
        onApprove(amount);
      } catch (e) {
        console.error('onApprove handler failed:', e);
      }
    } else {
      console.log('onApprove is not a function or not provided');
    }
  };

  if (!node) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "trends", label: "Trends" },
    { id: "insights", label: "Insights" },
    { id: "decisions", label: "Decisions" },
  ];

  return (
    <div className="fixed right-0 top-0 w-152 h-screen bg-white shadow-xl border-l border-gray-200 flex flex-col z-50 animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
      {/* Header with dynamic color */}
      <div className={`p-6 ${node.header.trust_score > 80 ? "bg-green-50 text-green-700" : node.header.trust_score > 25 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"} border-b border-gray-100 relative`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{node.header.name}</h3>
              <div className={`px-2 py-1 rounded-xl border text-xs font-bold uppercase tracking-wide ${node.header.trust_score > 80 ? "bg-green-200 text-green-800 border-green-400" : node.header.trust_score > 25 ? "bg-yellow-200 text-yellow-800 border-yellow-400" : "bg-red-200 text-red-800 border-red-400"}`}>
                {node.header.risk_badge}
              </div>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {node.header.location_city}, {node.header.location_village}
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="mt-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full border ${node.header.trust_score > 80 ? "bg-green-50 text-green-800 border-green-100" : node.header.trust_score > 25 ? "bg-yellow-50 text-yellow-800 border-yellow-100" : "bg-red-50 text-red-800 border-red-100"}`}>
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l7 3v5c0 5-3.58 9.74-7 11-3.42-1.26-7-6-7-11V5l7-3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.5 12.5l1.75 1.75L15.5 10" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div className="text-start leading-tight">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Group Trust Score</div>
                    <div className={`text-3xl font-bold ${node.header.trust_score > 80 ? "text-green-800" : node.header.trust_score >= 25 ? "text-yellow-800" : "text-red-800"}`}>
                      {node.header.trust_score}<span className="text-sm text-gray-500 font-semibold"> /100</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full border ${node.header.trust_score > 80 ? "bg-green-50 text-green-800 border-green-100" : node.header.trust_score > 25 ? "bg-yellow-50 text-yellow-800 border-yellow-100" : "bg-red-50 text-red-800 border-red-100"}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 20v-1c0-2.21 3.582-4 8-4s8 1.79 8 4v1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div className="text-start leading-tight">
                    <div className="text-[10px] uppercase text-gray-500 tracking-wide font-semibold">Total Anggota</div>
                    <div className={`text-3xl font-bold ${node.header.trust_score > 80 ? "text-green-800" : node.header.trust_score >= 25 ? "text-yellow-800" : "text-red-800"}`}>{node.header.member_count}</div>
                  </div>
                </div>
              </div>
              <div className="text-center leading-tight">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Loan Eligibility</div>
                <div className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-semibold border ${node.header.trust_score > 80 ? "bg-green-100 text-green-700 border-green-300" : node.header.trust_score > 25 ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-red-100 text-red-700 border-red-300"}`}>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  {node.header.trust_score > 80 ? "Eligible" : node.header.trust_score >= 25 ? "Review" : "High Risk"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="absolute top-4 right-4">
        <button onClick={onClose} className="p-2 hover:bg-white rounded-full border-2 border-gray-300 transition-colors" type="button" aria-label="Close">
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab(tab.id)
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        ref={tabContentRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading group details...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab node={groupDetails || node} />}
            {activeTab === "trends" && <TrendsTab node={groupDetails || node} />}
            {activeTab === "insights" && <InsightsTab node={groupDetails || node} />}
            {activeTab === "decisions" && (
              <DecisionsTab
                node={groupDetails || node}
                loanApproved={loanApproved}
                handleLoanApproval={handleLoanApproval}
                showMediumRiskConfirm={showMediumRiskConfirm}
                setShowMediumRiskConfirm={setShowMediumRiskConfirm}
                showSupervisorOverride={showSupervisorOverride}
                setShowSupervisorOverride={setShowSupervisorOverride}
                supervisorPasskey={supervisorPasskey}
                setSupervisorPasskey={setSupervisorPasskey}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NodeModal;
