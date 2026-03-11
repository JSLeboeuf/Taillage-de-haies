'use client';

import { useEffect, useState } from 'react';

interface MonthData {
  month: string;
  revenue: number;
  target: number;
}

export default function RevenueChart() {
  const [chartData, setChartData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/kpis');
        const data = await response.json();

        // For now, generate mock data for 12 months
        // In production, this would come from the API
        const months = [
          'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
          'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
        ];

        const currentMonth = new Date().getMonth();
        const mockData: MonthData[] = months.map((month, index) => {
          // Only show data up to current month
          const revenue = index <= currentMonth
            ? Math.floor(Math.random() * 100000) + 100000
            : 0;

          return {
            month,
            revenue,
            target: 166667,
          };
        });

        setChartData(mockData);
      } catch (err) {
        console.error('Revenue chart error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="h-6 bg-dark-hover rounded animate-pulse w-48 mb-6"></div>
        <div className="h-64 bg-dark-hover rounded animate-pulse"></div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => Math.max(d.revenue, d.target)));
  const scale = maxValue > 0 ? 250 / maxValue : 1;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Revenue mensuel</h2>
        <p className="text-sm text-gray-400">12 derniers mois • Objectif: 166,667$ / mois</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent-green"></div>
          <span className="text-gray-400">Revenue réel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent-red border-2 border-accent-red bg-opacity-20"></div>
          <span className="text-gray-400">Objectif</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 overflow-x-auto">
        <div className="flex items-end justify-between gap-2 h-full min-w-max px-2">
          {chartData.map((data, index) => {
            const barHeight = data.revenue * scale;
            const targetHeight = data.target * scale;
            const isAboveTarget = data.revenue >= data.target;

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 flex-1 min-w-[40px] sm:min-w-[60px]"
              >
                {/* Bars container */}
                <div className="relative w-full h-full flex items-end justify-center">
                  {/* Target line */}
                  {data.revenue > 0 && (
                    <div
                      className="absolute left-0 right-0 border-2 border-dashed border-accent-red opacity-40"
                      style={{ bottom: `${targetHeight}px` }}
                    ></div>
                  )}

                  {/* Revenue bar */}
                  {data.revenue > 0 && (
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer group relative ${
                        isAboveTarget ? 'bg-accent-green' : 'bg-accent-blue'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {(data.revenue / 1000).toFixed(0)}k$
                      </div>
                    </div>
                  )}
                </div>

                {/* Month label */}
                <span className="text-xs text-gray-400 font-medium">{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Y-axis labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-500 font-mono">
        <span>0$</span>
        <span>{(maxValue / 2 / 1000).toFixed(0)}k$</span>
        <span>{(maxValue / 1000).toFixed(0)}k$</span>
      </div>
    </div>
  );
}
