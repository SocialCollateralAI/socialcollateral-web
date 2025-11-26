import { useState } from 'react'
import { Sparkles, FileText, FileX, CheckCircle, Calendar, X } from 'lucide-react'

interface Node {
  id: string
  label: string
  trustScore: number
  members: Array<{
    name: string
    role: string
    business: string
    monthlyIncome: number
  }>
  loanAmount: number
  repaymentRate: number
  location: string
  formationDate: string
  lastActivity: string
  status: string
}

interface NodeModalProps {
  node: Node | null
  onClose: () => void
  onApproveLoan: (amount: number) => void // Prop baru untuk handle approval
}

const NodeModal: React.FC<NodeModalProps> = ({ node, onClose, onApproveLoan }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasDecided, setHasDecided] = useState(false)

  if (!node) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount).replace('Rp', 'Rp ')
  }

  // Hitung rekomendasi plafon (misal 100% jika skor bagus, 80% jika sedang)
  const recommendedPlafon = node.trustScore > 80 ? node.loanAmount : node.loanAmount * 0.8

  const handleApprove = () => {
    setIsProcessing(true)
    // Simulasi loading network
    setTimeout(() => {
      onApproveLoan(recommendedPlafon)
      setIsProcessing(false)
      setHasDecided(true)
    }, 1000)
  }

  // const getTrustScoreColor = (score: number) => {
  //   if (score > 80) return 'text-green-600 bg-green-50'
  //   if (score >= 25) return 'text-yellow-600 bg-yellow-50'
  //   return 'text-red-600 bg-red-50'
  // }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'insights', label: 'Insights' },
    { id: 'decisions', label: 'Decision' }
  ]

  return (
    <div className="fixed right-0 top-0 w-96 h-screen bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50 animate-in slide-in-from-right duration-300">
      {/* Header with Green Background like Mockup */}
      <div className="bg-[#F0FDF4] p-5 pb-0 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-bold text-gray-900">{node.label}</h2>
               <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                 Low Risk
               </span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
              <div className="w-3 h-3 text-gray-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
              {node.location}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Stats Card inside Header */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Group Trust Score</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-green-600">{node.trustScore}</span>
              <span className="text-gray-400 text-xs mb-1.5">/100</span>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Anggota</p>
             <div className="flex items-center justify-end gap-1 text-gray-900 font-bold mt-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                {node.members.length}
             </div>
          </div>
        </div>

        {/* Custom Tab Navigation */}
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-6 relative">

        {/* --- DECISION TAB (Mockup Implementation) --- */}
        {activeTab === 'decisions' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">

            {!hasDecided ? (
              <>
                {/* Recommended Plafon Section */}
                <div className="text-center mt-4 mb-8">
                  <h4 className="text-gray-500 text-sm font-medium mb-1">Plafon Direkomendasikan:</h4>
                  <div className="text-[32px] font-bold text-gray-900 tracking-tight">
                    {formatCurrency(recommendedPlafon)}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Keputusan ini akan mengurangi anggaran global.
                  </p>
                </div>

                {/* AI Decision Drafter Box */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">AI Decision Drafter</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-600 hover:text-purple-700 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
                      <FileText className="w-3.5 h-3.5" />
                      Draft Approval
                    </button>
                    <button className="flex-1 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-700 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
                      <FileX className="w-3.5 h-3.5" />
                      Draft Rejection
                    </button>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3 mt-auto">
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-200 transition-all transform active:scale-[0.98]"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Approve Loan Application
                      </>
                    )}
                  </button>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                      <Calendar className="w-4 h-4" />
                      Schedule Visit
                    </button>
                    <button className="flex-1 bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Success State after Approval
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Loan Approved!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Funds have been deducted from Amartha Wallet.<br/>
                  Total deducted: <span className="font-bold text-gray-900">{formatCurrency(recommendedPlafon)}</span>
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800"
                >
                  Close Panel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === 'overview' && (
           <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Member Breakdown</h4>
                <div className="space-y-3">
                  {node.members.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                      <div>
                        <div className="font-medium text-gray-800">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.business}</div>
                      </div>
                      <div className="text-right font-medium text-gray-900">
                         {formatCurrency(m.monthlyIncome)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        )}
      </div>

      {/* Floating Action Button (Mockup Sparkle) */}
      <div className="absolute bottom-6 right-6">
        <button className="w-12 h-12 bg-[#d946ef] hover:bg-[#c026d3] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110">
          <Sparkles className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default NodeModal
