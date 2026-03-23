export const runtime = 'edge';

import { redirect } from 'next/navigation';
import KPICards from './components/KPICards';
import PipelineView from './components/PipelineView';
import RevenueChart from './components/RevenueChart';
import EmployeeLeaderboard from './components/EmployeeLeaderboard';
import AlertsPanel from './components/AlertsPanel';

/**
 * COO Dashboard for Haie Lite
 * Real-time business metrics and operational oversight
 * Protected by DASHBOARD_KEY environment variable
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Basic authentication via query param
  const params = await searchParams;
  const providedKey = params.key;
  const validKey = process.env.DASHBOARD_KEY;

  // Check authentication
  if (!validKey || providedKey !== validKey) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Dashboard COO
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Vue d'ensemble opérationnelle • Objectif 2026: 2M$ de revenus
        </p>
      </div>

      {/* KPI Cards Grid */}
      <section>
        <KPICards />
      </section>

      {/* Pipeline View */}
      <section>
        <PipelineView />
      </section>

      {/* Two-column layout for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <section>
          <RevenueChart />
        </section>

        {/* Alerts Panel */}
        <section>
          <AlertsPanel />
        </section>
      </div>

      {/* Employee Leaderboard */}
      <section>
        <EmployeeLeaderboard />
      </section>

      {/* Footer stats */}
      <footer className="pt-8 pb-20 lg:pb-8 border-t border-dark-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Dernière mise à jour</p>
            <p className="text-sm font-mono text-gray-300">
              {new Date().toLocaleTimeString('fr-CA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Version</p>
            <p className="text-sm font-mono text-gray-300">1.0.0</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Auto-refresh</p>
            <p className="text-sm font-mono text-accent-green">Actif</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="text-sm font-mono text-accent-green">● En ligne</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
