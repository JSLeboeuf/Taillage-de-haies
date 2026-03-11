'use client';

import { useEffect, useState } from 'react';

interface EmployeeStats {
  employee_id: string;
  employee_name: string;
  total_hours: number;
  bonuses: number;
  revenue_per_hour: number;
  total_revenue: number;
}

export default function EmployeeLeaderboard() {
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployeeStats() {
      try {
        setLoading(true);

        // Calculate current week dates
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(now);

        const startDate = weekStart.toISOString().split('T')[0];
        const endDate = weekEnd.toISOString().split('T')[0];

        const response = await fetch(
          `/api/payroll/export?start_date=${startDate}&end_date=${endDate}&format=json`
        );
        const data = await response.json();

        if (data.success && data.employees) {
          // Transform and sort by revenue
          const stats: EmployeeStats[] = data.employees.map((emp: any) => ({
            employee_id: emp.employee_id,
            employee_name: emp.employee_name,
            total_hours: emp.total_hours || 0,
            bonuses: emp.bonuses || 0,
            revenue_per_hour: emp.total_hours > 0
              ? Math.round((emp.base_pay || 0) / emp.total_hours)
              : 0,
            total_revenue: emp.base_pay || 0,
          }));

          // Sort by total revenue and take top 5
          const topEmployees = stats
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, 5);

          setEmployees(topEmployees);
          setError(null);
        } else {
          setError('Aucune donnée disponible');
          setEmployees([]);
        }
      } catch (err) {
        console.error('Employee stats error:', err);
        setError('Impossible de charger les stats employés');
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeeStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchEmployeeStats, 300000);
    return () => clearInterval(interval);
  }, []);

  if (error && employees.length === 0) {
    return (
      <div id="employees" className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Top employés</h2>
        <p className="text-sm text-gray-400">⚠️ {error}</p>
        <p className="text-xs text-gray-500 mt-2">En attente de connexion Supabase</p>
      </div>
    );
  }

  return (
    <div id="employees" className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Top employés</h2>
        <p className="text-sm text-gray-400">Cette semaine • Par revenue généré</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-dark-hover rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">Aucune donnée pour cette semaine</p>
          <p className="text-gray-500 text-xs mt-2">Les stats apparaîtront dès qu'il y aura des timesheets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((employee, index) => (
            <div
              key={employee.employee_id}
              className="bg-dark-bg border border-dark-border rounded-lg p-4 transition-all duration-150 hover:border-accent-green hover:bg-dark-hover"
            >
              <div className="flex items-center gap-4">
                {/* Rank badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500 text-dark-bg' :
                  index === 1 ? 'bg-gray-400 text-dark-bg' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-dark-border text-gray-400'
                }`}>
                  {index + 1}
                </div>

                {/* Employee info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {employee.employee_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {employee.total_hours.toFixed(1)}h travaillées
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold font-mono text-accent-green">
                    {employee.total_revenue.toFixed(0)}$
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {employee.revenue_per_hour}$/h
                  </p>
                  {employee.bonuses > 0 && (
                    <span className="text-xs font-mono text-yellow-500">
                      +{employee.bonuses}$ bonus
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-dark-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    index === 0 ? 'bg-accent-green' : 'bg-accent-blue'
                  }`}
                  style={{
                    width: `${Math.min(100, (employee.total_revenue / (employees[0]?.total_revenue || 1)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
