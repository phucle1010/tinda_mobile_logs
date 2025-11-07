"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ErrorRateData } from "@/types/log";

interface ErrorRateChartProps {
  data: ErrorRateData[];
}

export function ErrorRateChart({ data }: ErrorRateChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
          className="text-gray-700 dark:text-gray-300"
        >
          <defs>
            <linearGradient id="colorErrorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="currentColor" 
            opacity={0.1}
            className="dark:opacity-20"
          />
          <XAxis
            dataKey="date"
            tick={false}
            axisLine={false}
            height={20}
          />
          <YAxis
            tick={{ fill: "currentColor", fontSize: 12 }}
            stroke="currentColor"
            opacity={0.6}
            label={{ 
              value: "Error Rate (%)", 
              angle: -90, 
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "currentColor", opacity: 0.7 }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              padding: "12px",
            }}
            labelStyle={{ color: "#1f2937", fontWeight: 600, marginBottom: "4px" }}
            itemStyle={{ color: "#374151" }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, "Error Rate"]}
            cursor={{ stroke: "#ef4444", strokeWidth: 1, opacity: 0.3 }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            formatter={() => <span className="text-sm text-gray-700 dark:text-gray-300">Error Rate (%)</span>}
          />
          <Area
            type="monotone"
            dataKey="errorRate"
            stroke="#ef4444"
            strokeWidth={3}
            fill="url(#colorErrorRate)"
            fillOpacity={1}
            dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2, fill: "#fff" }}
            name="Error Rate (%)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

