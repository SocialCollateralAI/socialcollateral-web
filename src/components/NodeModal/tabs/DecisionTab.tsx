import React from 'react';
import { Node } from '../types';

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* RECOMMENDED CAP */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">
        <div className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-2">RECOMMENDED CAP</div>
        <div className="text-4xl font-bold text-gray-900 mb-1">25.000.0000</div>
        <div className="text-sm text-red-500">↘ Reduces Global Budget</div>
      </div>

      {/* AI DECISION DRAFTER */}
      {/*<div className="bg-white border border-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <h4 className="text-sm font-bold text-gray-900">AI Decision Drafter</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Approval</span>
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Rejection</span>
          </button>
        </div>
      </div>*/}

      {/* APPROVE LOAN BUTTON WITH LOGIC */}
      <div className="space-y-4">
        {!loanApproved ? (
          <>
            {/* Medium Risk Confirmation Modal */}
            {showMediumRiskConfirm && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="font-medium text-yellow-800 mb-2">⚠ Medium Risk Confirmation</div>
                <div className="text-sm text-yellow-700 mb-3">This group has medium risk profile. Are you sure you want to approve?</div>
                <div className="flex gap-2">
                  <button onClick={() => { handleLoanApproval(); setShowMediumRiskConfirm(false); }} className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700">Yes, Approve</button>
                  <button onClick={() => setShowMediumRiskConfirm(false)} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">Cancel</button>
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
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-500 mb-2">APPROVAL LOCKED (HIGH RISK)</div>
                    <button onClick={() => setShowSupervisorOverride(true)} className="text-sm text-purple-600 hover:text-purple-800 font-medium underline hover:cursor-pointer">Request Supervisor Override</button>
                  </div>
                ) : (
                  <div className="w-full py-6 px-6 rounded-lg bg-gray-50 border border-gray-200 text-center">
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
                className="w-full py-4 text-lg font-bold rounded-lg transition-colors flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                APPROVE LOAN
              </button>
            )}
          </>
        ) : (
          <div className="w-full py-6 px-6 rounded-lg bg-green-50 border border-green-200 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-xl font-bold text-green-800 mb-2">LOAN APPROVED</div>
            <div className="text-sm text-green-700">Funds scheduled for disbursement.</div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-4">
        <button className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Schedule Visit</button>
        <button className="px-4 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">Reject Application</button>
      </div>

      {/* AUDIT FOOTER */}
      <div className="text-center">
        <div className="text-xs text-gray-500">⚙ TERAKHIR DIAUDIT OLEH FIELD {node.decision.last_audit.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default DecisionsTab;
