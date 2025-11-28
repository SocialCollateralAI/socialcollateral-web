import React, { useState } from "react";
import { Node } from "../types";
import formatCurrency from "../../../utils/formatCurrency";

interface OverviewTabProps {
   node: Node;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ node }) => {
   const [radarSort, setRadarSort] = useState("toxic-first");
   const [showAllNeighbors, setShowAllNeighbors] = useState(false);

   // Helper untuk warna progress bar
   // const getProgressColor = (score: number) => {
   //    if (score > 80) return "bg-emerald-500";
   //    if (score >= 25) return "bg-yellow-500";
   //    return "bg-red-500";
   // };

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
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
               </div>
               <div className="relative">
                  <div className="flex bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                     <div
                        className={`h-4 transition-all duration-700 ${
                           node.header.trust_score > 80
                              ? "bg-blue-500"
                              : node.header.trust_score >= 25
                                ? "bg-yellow-500"
                                : "bg-yellow-500"
                        }`}
                        style={{
                           width: `${node.overview.primary_driver.payment_score}%`,
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
                                   ? "bg-yellow-500"
                                   : "bg-yellow-500"
                           }`}
                        ></div>
                        <span className="text-xs text-gray-700 font-bold">
                           {node.overview.primary_driver.payment_score}%
                        </span>
                     </div>
                  </div>
               </div>
               <div className="flex justify-between text-gray-600 gap-3">
                  <span className="text-xs font-bold uppercase tracking-wide">
                     Social Context
                  </span>
               </div>
               <div className="relative">
                  <div className="flex bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                     <div
                        className={`h-4 transition-all duration-700 ${
                           node.header.trust_score > 80
                              ? "bg-emerald-500"
                              : node.header.trust_score >= 25
                                ? "bg-red-500"
                                : "bg-red-500"
                        }`}
                        style={{
                           width: `${node.overview.primary_driver.social_score}%`,
                        }}
                     ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-700 font-bold">
                           {node.overview.primary_driver.social_score}%
                        </span>
                        <div
                           className={`w-3 h-3 rounded-full ${
                              node.header.trust_score > 80
                                 ? "bg-emerald-500"
                                 : node.header.trust_score >= 25
                                   ? "bg-red-500"
                                   : "bg-red-500"
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
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
               <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">
                  CYCLE
               </div>
               <div className="text-3xl font-bold text-gray-900">
                  {node.overview.metrics.cycle}
               </div>
               <div className="text-xs text-gray-500">Times Borrowed</div>
            </div>

            {/* Repayment Card */}
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
               <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
                  REPAYMENT
               </div>
               <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-2">
                  <svg
                     className="w-20 h-20 transform -rotate-90 drop-shadow-sm"
                     viewBox="0 0 80 80"
                  >
                     <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="#f3f4f6"
                        strokeWidth="8"
                        fill="none"
                     />
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
                        strokeDasharray={`${(node.overview.metrics.repayment_rate / 100) * 201} 201`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                     />
                  </svg>
                  <div
                     className={`absolute text-lg font-bold ${node.header.trust_score > 80 ? "text-green-700" : node.header.trust_score >= 25 ? "text-amber-700" : "text-red-700"}`}
                  >
                     {node.overview.metrics.repayment_rate}%
                  </div>
               </div>
            </div>

            {/* Avg Delay Card */}
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
               <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
                  AVG DELAY
               </div>
               <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                     className={`w-3 h-3 rounded-full ${node.overview.metrics.repayment_rate >= 95 ? "bg-green-500" : "bg-gray-200"}`}
                  ></div>
                  <div
                     className={`w-3 h-3 rounded-full ${node.overview.metrics.repayment_rate >= 85 && node.overview.metrics.repayment_rate < 95 ? "bg-yellow-500" : "bg-gray-200"}`}
                  ></div>
                  <div
                     className={`w-3 h-3 rounded-full ${node.overview.metrics.repayment_rate < 85 ? "bg-red-500" : "bg-gray-200"}`}
                  ></div>
               </div>
               <div className="text-2xl font-bold text-gray-900">
                  {node.overview.metrics.avg_delay}
               </div>
            </div>
         </div>

         {/* TOTAL PINJAMAN */}
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
                  <span className="text-xs text-gray-500 ml-2">
                     ({node.overview.neighbors.length} relasi)
                  </span>
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

            <div className="space-y-3 max-h-96 overflow-y-auto">
               {node.overview.neighbors
                  .sort((a, b) => {
                     if (radarSort === "toxic-first") {
                        // Urutan tetap: TOXIC → MEDIUM → HEALTHY (lengkap, tidak skip)
                        const riskOrder = { toxic: 0, medium: 1, healthy: 2 };
                        const riskA = riskOrder[a.risk as keyof typeof riskOrder] ?? 3;
                        const riskB = riskOrder[b.risk as keyof typeof riskOrder] ?? 3;
                        if (riskA !== riskB) return riskA - riskB;
                        // Secondary: by distance
                        const distanceA = parseFloat(a.distance.replace("km", ""));
                        const distanceB = parseFloat(b.distance.replace("km", ""));
                        return distanceA - distanceB;
                     } else if (radarSort === "health-first") {
                        // Urutan: HEALTHY → MEDIUM → TOXIC (lengkap, tidak skip)
                        const riskOrder = { healthy: 0, medium: 1, toxic: 2 };
                        const riskA = riskOrder[a.risk as keyof typeof riskOrder] ?? 3;
                        const riskB = riskOrder[b.risk as keyof typeof riskOrder] ?? 3;
                        if (riskA !== riskB) return riskA - riskB;
                        // Secondary: by distance
                        const distanceA = parseFloat(a.distance.replace("km", ""));
                        const distanceB = parseFloat(b.distance.replace("km", ""));
                        return distanceA - distanceB;
                     } else if (radarSort === "location") {
                        // Primary: by distance, secondary: by risk (toxic first)
                        const distanceA = parseFloat(a.distance.replace("km", ""));
                        const distanceB = parseFloat(b.distance.replace("km", ""));
                        if (distanceA !== distanceB) return distanceA - distanceB;
                        // Secondary: by risk (toxic first)
                        const riskOrder = { toxic: 0, medium: 1, healthy: 2 };
                        const riskA = riskOrder[a.risk as keyof typeof riskOrder] ?? 3;
                        const riskB = riskOrder[b.risk as keyof typeof riskOrder] ?? 3;
                        return riskA - riskB;
                     }
                     return 0;
                  })
                  .map((neighbor, index) => (
                     <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                           neighbor.risk === "toxic"
                              ? "bg-red-50 border border-red-100"
                              : neighbor.risk === "medium"
                                ? "bg-yellow-50 border border-yellow-100"
                                : "bg-green-50 border border-green-100"
                        }`}
                     >
                        <div className="flex items-center gap-3">
                           <div
                              className={`w-2 h-2 rounded-full ${
                                 neighbor.risk === "toxic"
                                    ? "bg-red-500"
                                    : neighbor.risk === "medium"
                                      ? "bg-yellow-500"
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
                        {neighbor.risk === "medium" && (
                           <div className="px-2 py-1 bg-yellow-100 border border-yellow-400 text-yellow-700 text-xs font-semibold rounded uppercase">
                              MEDIUM RISK
                           </div>
                        )}
                     </div>
                  ))}
            </div>
         </div>
      </div>
   );
};

export default OverviewTab;
