import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { Node } from "../types";

interface TrendsTabProps {
   node: Node;
}

const TrendsTab: React.FC<TrendsTabProps> = ({ node }) => {
   const assetMax = Math.max(0, ...(node.trends.asset_growth || []).map((a) => a.value));
   const assetYAxisMax = assetMax > 0 ? Math.ceil(assetMax * 1.15) : 10;

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
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
               className={`h-52 w-full rounded ${node.header.trust_score > 80 ? "bg-gradient-to-b from-green-50/30 to-transparent" : node.header.trust_score >= 25 ? "bg-gradient-to-b from-amber-50/30 to-transparent" : "bg-gradient-to-b from-red-50/30 to-transparent"}`}
            >
               <LineChart
                  dataset={node.trends.repayment_history}
                  xAxis={[
                     {
                        scaleType: "point",
                        dataKey: "month",
                        tickLabelStyle: { fontSize: 10, fill: "#9ca3af" },
                     },
                  ]}
                  yAxis={[
                     {
                        min: 0,
                        max: 100,
                        tickLabelStyle: { fontSize: 10, fill: "#9ca3af" },
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
                  slotProps={{ legend: { hidden: true } as any }}
                  sx={{
                     "& .MuiChartsAxis-line": { stroke: "#e5e7eb", strokeWidth: 1 },
                     "& .MuiChartsAxis-tick": { stroke: "transparent" },
                     "& .MuiLineElement-root": { strokeWidth: 2.5 },
                     "& .MuiAreaElement-root": {
                        fillOpacity: 0.15,
                     },
                  }}
               />
            </div>
         </div>

         {/* METRICS CARDS (Streak, Last Default, Trend) */}
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
                     <div className="text-xs text-black-400 uppercase tracking-wide font-medium mb-1">
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
                  {/* Icon Box */}
                  <div className="flex-shrink-0">
                     <div className="w-10 h-10 rounded-lg bg-grey-200 flex items-center justify-center">
                        <svg
                           className="w-6 h-6 text-gray-600"
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

                  {/* Text Section */}
                  <div className="flex-1 min-w-0">
                     <div className="text-xs text-black-400 uppercase tracking-wide font-medium mb-1">
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
                  <div
                     className={`w-10 h-10 rounded-lg ${node.trends.stats.trend_dir === "up" ? "bg-green-50" : "bg-red-50"} flex items-center justify-center`}
                  >
                     <svg
                        className={`w-6 h-6 ${node.trends.stats.trend_dir === "up" ? "text-green-500" : "text-red-500"}`}
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
                  <div className="flex-1 min-w-0">
                     <div className="text-xs text-black-400 uppercase tracking-wide font-medium mb-1">
                        TREND 6M
                     </div>
                     <div
                        className={`text-sm font-bold ${node.trends.stats.trend_dir === "up" ? "text-green-600" : "text-red-600"}`}
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
                  Avg: {node.trends.stats.avg_rate}% | Best: {node.trends.stats.best_rate}%
               </div>
            </div>

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
                     "& .MuiChartsAxis-line": { stroke: "#e5e7eb", strokeWidth: 1 },
                     "& .MuiChartsGrid-line": { stroke: "#f3f4f6", strokeDasharray: "3 3" },
                     "& .MuiChartsLegend-series": { fontSize: "11px", fill: "#6b7280" },
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
         {/*<div className="bg-white border border-gray-200 rounded-lg p-6">
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

            <div className="grid grid-cols-12 gap-2 mb-3">
               {node.trends.seasonality_heatmap.map((level, i) => {
                  const getHeatmapColor = (value: number) => {
                     if (value === 1) return "#86efac";
                     if (value === 2) return "#fde047";
                     if (value === 3) return "#fca5a5";
                     return "#e5e7eb";
                  };
                  return (
                     <div
                        key={i}
                        className="h-10 rounded transition-all hover:opacity-80 cursor-pointer"
                        style={{ backgroundColor: getHeatmapColor(level) }}
                        title={`Month ${i + 1}: Level ${level}`}
                     />
                  );
               })}
            </div>
            <div className="text-xs text-gray-500 italic">
               Heatmap indicates payment latency intensity per month.
            </div>
         </div>*/}
      </div>
   );
};

export default TrendsTab;
