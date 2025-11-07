"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { TimeSeriesData } from "@/types/log";

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const colors = {
    ERROR: { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.1)", gradient: "rgba(239, 68, 68, 0.2)" },
    WARN: { stroke: "#eab308", fill: "rgba(234, 179, 8, 0.1)", gradient: "rgba(234, 179, 8, 0.2)" },
    INFO: { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.1)", gradient: "rgba(59, 130, 246, 0.2)" },
    DEBUG: { stroke: "#6b7280", fill: "rgba(107, 114, 128, 0.1)", gradient: "rgba(107, 114, 128, 0.2)" },
  };

  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
          className="text-gray-700 dark:text-gray-300"
        >
          <defs>
            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.ERROR.stroke} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.ERROR.stroke} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.WARN.stroke} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.WARN.stroke} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.INFO.stroke} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.INFO.stroke} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDebug" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.DEBUG.stroke} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.DEBUG.stroke} stopOpacity={0}/>
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
            cursor={{ stroke: "currentColor", strokeWidth: 1, opacity: 0.3 }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="ERROR"
            stroke={colors.ERROR.stroke}
            strokeWidth={2.5}
            fill="url(#colorError)"
            fillOpacity={1}
            dot={{ r: 3, fill: colors.ERROR.stroke }}
            activeDot={{ r: 5, stroke: colors.ERROR.stroke, strokeWidth: 2 }}
            name="ERROR"
          />
          <Area
            type="monotone"
            dataKey="WARN"
            stroke={colors.WARN.stroke}
            strokeWidth={2.5}
            fill="url(#colorWarn)"
            fillOpacity={1}
            dot={{ r: 3, fill: colors.WARN.stroke }}
            activeDot={{ r: 5, stroke: colors.WARN.stroke, strokeWidth: 2 }}
            name="WARN"
          />
          <Area
            type="monotone"
            dataKey="INFO"
            stroke={colors.INFO.stroke}
            strokeWidth={2.5}
            fill="url(#colorInfo)"
            fillOpacity={1}
            dot={{ r: 3, fill: colors.INFO.stroke }}
            activeDot={{ r: 5, stroke: colors.INFO.stroke, strokeWidth: 2 }}
            name="INFO"
          />
          <Area
            type="monotone"
            dataKey="DEBUG"
            stroke={colors.DEBUG.stroke}
            strokeWidth={2.5}
            fill="url(#colorDebug)"
            fillOpacity={1}
            dot={{ r: 3, fill: colors.DEBUG.stroke }}
            activeDot={{ r: 5, stroke: colors.DEBUG.stroke, strokeWidth: 2 }}
            name="DEBUG"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

