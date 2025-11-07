"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Log, LogLevel } from "@/types/log";

interface AnalyticsDashboardProps {
  logs: Log[];
}

export function AnalyticsDashboard({ logs }: AnalyticsDashboardProps) {
  // Calculate hourly distribution
  const hourlyDistribution = useMemo(() => {
    const hours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hours[i] = 0;
    }

    logs.forEach((log) => {
      const hour = new Date(log.created_at).getHours();
      hours[hour]++;
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
    }));
  }, [logs]);

  // Calculate level distribution
  const levelDistribution = useMemo(() => {
    const levels: Record<LogLevel, number> = {
      ERROR: 0,
      WARN: 0,
      INFO: 0,
      DEBUG: 0,
    };

    logs.forEach((log) => {
      levels[log.level]++;
    });

    return Object.entries(levels).map(([level, count]) => ({
      level,
      count,
    }));
  }, [logs]);

  // Calculate error rate by hour
  const errorRateByHour = useMemo(() => {
    const hourly: Record<number, { errors: number; total: number }> = {};
    for (let i = 0; i < 24; i++) {
      hourly[i] = { errors: 0, total: 0 };
    }

    logs.forEach((log) => {
      const hour = new Date(log.created_at).getHours();
      hourly[hour].total++;
      if (log.level === "ERROR") {
        hourly[hour].errors++;
      }
    });

    return Object.entries(hourly).map(([hour, data]) => ({
      hour: `${hour}:00`,
      errorRate: data.total > 0 ? (data.errors / data.total) * 100 : 0,
      errors: data.errors,
      total: data.total,
    }));
  }, [logs]);

  const COLORS = ["#ef4444", "#eab308", "#3b82f6", "#6b7280"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Hourly Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-shadow hover:shadow-xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Log Volume by Hour
          </h3>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
        </div>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} className="dark:opacity-20" />
              <XAxis
                dataKey="hour"
                tick={false}
                axisLine={false}
                height={20}
              />
              <YAxis tick={{ fill: "currentColor", fontSize: 12 }} stroke="currentColor" opacity={0.6} />
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
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              />
              <Bar 
                dataKey="count" 
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Level Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-shadow hover:shadow-xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Log Level Distribution
          </h3>
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        </div>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={levelDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: Record<string, unknown>) => {
                  const level = props.level as string;
                  const percent = props.percent as number;
                  return `${level}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={90}
                innerRadius={40}
                fill="#8884d8"
                dataKey="count"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={2}
              >
                {levelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#pieGradient${index})`} />
                ))}
              </Pie>
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
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Rate by Hour */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-shadow hover:shadow-xl lg:col-span-2">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Error Rate by Hour
          </h3>
          <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
        </div>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorRateByHour} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} className="dark:opacity-20" />
              <XAxis
                dataKey="hour"
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
                cursor={{ fill: "rgba(239, 68, 68, 0.1)" }}
              />
              <Legend />
              <Bar 
                dataKey="errorRate" 
                fill="url(#errorBarGradient)"
                name="Error Rate (%)"
                radius={[8, 8, 0, 0]}
              >
                <defs>
                  <linearGradient id="errorBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

