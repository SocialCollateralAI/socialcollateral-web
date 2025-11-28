import React, { useState } from 'react';
import { Node } from '../types';
import home_good from "../../../assets/mock/home_good.jpg";
import home_poor from "../../../assets/mock/home_poor.jpg";
import biz_good from "../../../assets/mock/biz_good.jpg";
import biz_poor from "../../../assets/mock/biz_poor.jpg";

interface InsightsTabProps {
  node: Node;
}

const InsightsTab: React.FC<InsightsTabProps> = ({ node }) => {
  const [imagePopup, setImagePopup] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({ isOpen: false, imageUrl: "", title: "" });

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

  const homePreviewUrl = resolveAssetPath(node.insights.cv.home.img_url);
  const bizPreviewUrl = resolveAssetPath(node.insights.cv.biz.img_url);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* PREDICTION & WHAT-IF */}
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h4 className="text-sm font-bold text-gray-900 uppercase">PREDICTION & WHAT-IF</h4>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 p-3 rounded">
            <h5 className="text-sm font-bold text-orange-800 mb-2">PREDICTED DEFAULT RISK</h5>
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-bold text-orange-600">{node.insights.prediction.default_risk_prob}%</div>
              <div className="text-xs text-orange-700">in next {node.insights.prediction.horizon_days} days</div>
            </div>
          </div>

          <div className="p-3 rounded">
            <h5 className="text-sm font-bold text-gray-400 mb-2">WHAT-IF SIMULATION: {node.insights.prediction.what_if.scenario.toUpperCase()}</h5>
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 rounded-md p-2 py-1">
                <div className="text-sm font-semibold text-gray-600">Current: <span className="font-bold">{node.insights.prediction.what_if.current_score}%</span></div>
              </div>
              <div className="text-gray-600">→</div>
              <div className="flex">
                <div className="text-sm text-green-800 bg-green-100 rounded-md p-2 py-1 font-semibold">Projected: <span className="font-bold">{node.insights.prediction.what_if.projected_score}%</span></div>
                <div className="text-xs text-green-600 p-2 py-1">(+{node.insights.prediction.what_if.improvement_pct}% Quality)</div>
              </div>
            </div>
            <div className="mt-8 p-2 italic border border-gray-200 rounded-md text-xs text-gray-800">💡 {node.insights.recommendation_text}</div>
          </div>
        </div>
      </div>

      {/* SOCIAL GRAPH INTELLIGENCE */}
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <h4 className="text-sm font-bold text-gray-900 uppercase">SOCIAL GRAPH INTELLIGENCE</h4>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-gray-700 uppercase">HIGH RISK MEMBERS DETECTION</h5>
            <div className="text-xs text-gray-500">{node.insights.social_graph.risk_members.length} members flagged</div>
          </div>
          <div className="space-y-2">
            {node.insights.social_graph.risk_members
              .sort((a, b) => {
                const scoreA = parseInt(a.risk_score || '0', 10)
                const scoreB = parseInt(b.risk_score || '0', 10)
                return scoreA - scoreB // urutkan dari kecil ke besar
              })
              .map((member, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-600">{member.hops}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-red-600">{member.risk_score} trust</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOME & BIZ INSIGHTS */}
      <div className="grid grid-cols-2 gap-4">
        {/* Home Insight */}
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <h5 className="text-sm font-bold text-gray-900 uppercase">HOME INSIGHT</h5>
            <div className={`ml-auto px-2 py-1 text-xs font-bold rounded ${node.insights.cv.home.condition === "GOOD" ? "bg-green-100 text-green-800" : node.insights.cv.home.condition === "ENOUGH" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
              {node.insights.cv.home.condition}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Material:</span><span className="font-medium">{node.insights.cv.home.material}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Roof:</span><span className="font-medium">{node.insights.cv.home.roof}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Access:</span><span className="font-medium">{node.insights.cv.home.access}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Occupancy:</span><span className="font-medium">{node.insights.cv.home.occupancy}</span></div>
            <div className="flex gap-1 mt-2">
              {node.insights.cv.home.assets.map((asset, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">{asset}</span>
              ))}
            </div>
            <div className="mt-4 border-t pt-3">
              <button onClick={(e) => {
              e.stopPropagation()
              setImagePopup({ isOpen: true, imageUrl: homePreviewUrl, title: "Home Image - " + node.header.name })
            }} className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors overflow-hidden flex items-center justify-center">
                {homePreviewUrl ? (
                  <img src={homePreviewUrl} alt="Home Image" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-sm text-gray-600">View Home Image</div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Business Insight */}
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h5 className="text-sm font-bold text-gray-900 uppercase">BIZ INSIGHT</h5>
            <div className={`ml-auto px-2 py-1 text-xs font-bold rounded ${node.insights.cv.biz.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {node.insights.cv.biz.status}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium">{node.insights.cv.biz.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Stability:</span><span className="font-medium">{node.insights.cv.biz.stability}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Traffic:</span><span className="font-medium">{node.insights.cv.biz.traffic}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Digital:</span><span className="font-medium">{node.insights.cv.biz.digital}</span></div>
            <div className="flex gap-1 mt-2">
              {node.insights.cv.biz.inventory.map((item, index) => (
                <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-medium">{item}</span>
              ))}
            </div>
            <div className="mt-4 border-t pt-3">
              <button onClick={(e) => {
              e.stopPropagation()
              setImagePopup({ isOpen: true, imageUrl: bizPreviewUrl, title: "Business Image - " + node.header.name })
            }} className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors overflow-hidden flex items-center justify-center">
                {bizPreviewUrl ? (
                  <img src={bizPreviewUrl} alt="Business Image" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-sm text-gray-600">View Business Image</div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Popup Modal */}
      {imagePopup.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={(e) => {
          e.stopPropagation()
          setImagePopup({ isOpen: false, imageUrl: "", title: "" })
        }}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{imagePopup.title}</h3>
              <button onClick={(e) => {
                e.stopPropagation()
                setImagePopup({ isOpen: false, imageUrl: "", title: "" })
              }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <img src={imagePopup.imageUrl} alt={imagePopup.title} className="w-full h-auto max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsTab;
