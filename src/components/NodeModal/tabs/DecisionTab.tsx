import React, { useState } from 'react';
import { Node } from '../types';
import { X, Check } from 'lucide-react';
import formatCurrency from '../../../utils/formatCurrency';

interface DecisionsTabProps {
  node: Node;
  loanApproved: boolean;
  handleLoanApproval: () => void;
  showMediumRiskConfirm: boolean;
  setShowMediumRiskConfirm: (show: boolean) => void;
  showSupervisorOverride: boolean;
  setShowSupervisorOverride: (show: boolean) => void;
  supervisorPasskey: string;
  setSupervisorPasskey: (key: string) => void;
}

const DecisionsTab: React.FC<DecisionsTabProps> = ({
  node,
  loanApproved,
  handleLoanApproval,
  showMediumRiskConfirm,
  setShowMediumRiskConfirm,
  showSupervisorOverride,
  setShowSupervisorOverride,
  supervisorPasskey,
  setSupervisorPasskey,
}) => {
  const [isRejected, setIsRejected] = useState(false);

  // LOGIC: High Risk (Trust Score < 25) cap 0, sisanya 25.000.000
  const isHighRisk = node.header.trust_score < 25;
  const recommendedCap = isHighRisk ? 0 : 25000000;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* RECOMMENDED CAP */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">
        <div className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-2">RECOMMENDED CAP</div>
        <div className={`text-4xl font-bold mb-1 ${recommendedCap === 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatCurrency(recommendedCap)}
        </div>
        <div className="text-sm text-red-500">↘ Reduces Global Budget</div>
      </div>

      {/* APPROVE / REJECT STATUS AREA */}
      <div className="space-y-4">
        {/* CASE 1: LOAN APPROVED (Global State) */}
        {loanApproved ? (
          <div className="w-full py-6 px-6 rounded-lg bg-green-50 border border-green-200 text-center animate-in zoom-in duration-300">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-green-800 mb-2">LOAN APPROVED</div>
            <div className="text-sm text-green-700">Funds scheduled for disbursement.</div>
          </div>
        ) : isRejected ? (
          /* CASE 2: LOAN REJECTED (Local State) */
          <div className="w-full py-6 px-6 rounded-lg bg-red-50 border border-red-200 text-center animate-in zoom-in duration-300">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-red-800 mb-2">LOAN REJECTED</div>
            <div className="text-sm text-red-700">Application has been declined based on risk assessment.</div>
            <button
              onClick={() => setIsRejected(false)}
              className="mt-4 text-xs text-red-600 hover:text-red-800 underline font-medium"
            >
              Undo Decision
            </button>
          </div>
        ) : (
          /* CASE 3: PENDING ACTION */
          <>
            {/* Medium Risk Confirmation Modal */}
            {showMediumRiskConfirm && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg animate-in slide-in-from-top-2 duration-200">
                <div className="font-medium text-yellow-800 mb-2">⚠ Medium Risk Confirmation</div>
                <div className="text-sm text-yellow-700 mb-3">This group has medium risk profile. Are you sure you want to approve?</div>
                <div className="flex gap-2">
                  <button onClick={() => { handleLoanApproval(); setShowMediumRiskConfirm(false); }} className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700">Yes, Approve</button>
                  <button onClick={() => setShowMediumRiskConfirm(false)} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            )}

            {/* Main Approve Button Logic */}
            {node.header.trust_score < 25 ? (
              <div className="w-full">
                {!showSupervisorOverride ? (
                  <div className="w-full py-6 px-2 rounded-lg bg-gray-50 border border-gray-200 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-500 mb-2">APPROVAL LOCKED (HIGH RISK)</div>
                    <button onClick={() => setShowSupervisorOverride(true)} className="text-sm text-purple-600 hover:text-purple-800 font-medium underline hover:cursor-pointer">Request Supervisor Override</button>
                  </div>
                ) : (
                  <div className="w-full py-6 px-6 rounded-lg bg-gray-50 border border-gray-200 text-center animate-in fade-in duration-200">
                    <div className="text-sm font-bold text-gray-800 mb-4">ENTER SUPERVISOR PASSKEY</div>
                    <div className="flex gap-2">
                      <input type="password" placeholder="Passkey..." value={supervisorPasskey} onChange={(e) => setSupervisorPasskey(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                      <button onClick={() => {
                        if (supervisorPasskey === "DIR123") {
                          handleLoanApproval();
                          setShowSupervisorOverride(false);
                          setSupervisorPasskey("");
                        } else {
                          alert("Invalid passkey");
                        }
                      }} className="px-6 py-3 bg-black text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
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
                    handleLoanApproval();
                  } else if (node.header.trust_score >= 25) {
                    setShowMediumRiskConfirm(true);
                  }
                }}
                className="w-full py-4 text-lg font-bold rounded-lg transition-colors flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white shadow-sm"
              >
                <Check className="w-5 h-5" />
                APPROVE LOAN
              </button>
            )}
          </>
        )}
      </div>

      {/* ACTION BUTTONS (Only show if no decision made) */}
      {!loanApproved && !isRejected && (
        <div className="grid grid-cols-2 gap-4">
          <button className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Schedule Visit
          </button>
          <button
            onClick={() => setIsRejected(true)}
            className="px-4 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Reject Application
          </button>
        </div>
      )}

      {/* AUDIT FOOTER */}
      <div className="text-center mt-2">
        <div className="text-xs text-gray-400 font-medium tracking-wide flex items-center justify-center gap-1.5 uppercase">
          <span>⚙</span>
          {isHighRisk
            ? "TERAKHIR DIAUDIT OLEH SYSTEM (BARU SAJA)"
            : `TERAKHIR DIAUDIT OLEH FIELD ${node.decision.last_audit.toUpperCase()} (2 Jam lalu)`
          }
        </div>
      </div>
    </div>
  );
};

export default DecisionsTab;
