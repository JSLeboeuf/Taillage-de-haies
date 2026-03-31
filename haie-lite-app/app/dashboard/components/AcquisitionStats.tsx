'use client';

import { useEffect, useState } from 'react';

interface AcquisitionStatsData {
  total_prospects: number;
  contacted: number;
  awaiting_response: number;
  offers_sent: number;
  loi_signed: number;
  deals_closed: number;
  emails_last_7_days: number;
  response_rate: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
  icon?: string;
}

function StatCard({ title, value, subtitle, status = 'neutral', loading, icon }: StatCardProps) {
  const statusColors = {
    positive: 'text-accent-green',
    negative: 'text-accent-red',
    neutral: 'text-accent-blue',
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 sm:p-6 transition-all duration-150 hover:border-dark-hover hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium mb-1 flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            {title}
          </p>
          {loading ? (
            <div className="h-8 bg-dark-hover rounded animate-pulse w-24 mb-2"></div>
          ) : (
            <p className={`text-3xl sm:text-4xl font-bold font-mono mb-1 ${statusColors[status]}`}>
              {value}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcquisitionStats() {
  const [stats, setStats] = useState<AcquisitionStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/acquisitions/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
          setError(null);
        } else {
          setError(data.error || 'Erreur lors du chargement des statistiques');
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 120000);
    return () => clearInterval(interval);
  }, []);

  if (error && !stats) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <p className="text-sm text-gray-400">⚠️ {error}</p>
        <p className="text-xs text-gray-500 mt-2">Données de fallback en attente</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Statistiques du pipeline</h2>
        <p className="text-sm text-gray-400">Vue d'ensemble des acquisitions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total de prospects"
          value={stats?.total_prospects || 0}
          subtitle="Cibles d'acquisition"
          icon="🎯"
          status="neutral"
          loading={loading}
        />

        <StatCard
          title="Contactés"
          value={stats?.contacted || 0}
          subtitle={stats ? `${((stats.contacted / (stats.total_prospects || 1)) * 100).toFixed(0)}% du total` : 'Chargement...'}
          icon="📞"
          status="neutral"
          loading={loading}
        />

        <StatCard
          title="En attente de réponse"
          value={stats?.awaiting_response || 0}
          subtitle="Suivi requis"
          icon="⏳"
          status="neutral"
          loading={loading}
        />

        <StatCard
          title="Offres envoyées"
          value={stats?.offers_sent || 0}
          subtitle="En négociation"
          icon="📝"
          status={stats && stats.offers_sent > 0 ? 'positive' : 'neutral'}
          loading={loading}
        />

        <StatCard
          title="LOI signées"
          value={stats?.loi_signed || 0}
          subtitle="Accord de principe"
          icon="✍️"
          status={stats && stats.loi_signed > 0 ? 'positive' : 'neutral'}
          loading={loading}
        />

        <StatCard
          title="Deals fermés"
          value={stats?.deals_closed || 0}
          subtitle="Acquisitions complétées"
          icon="🏆"
          status={stats && stats.deals_closed > 0 ? 'positive' : 'neutral'}
          loading={loading}
        />

        <StatCard
          title="Emails (7 derniers jours)"
          value={stats?.emails_last_7_days || 0}
          subtitle="Séquences de prospection"
          icon="✉️"
          status="neutral"
          loading={loading}
        />

        <StatCard
          title="Taux de réponse"
          value={stats ? `${stats.response_rate}%` : '0%'}
          subtitle="Taux global"
          icon="📊"
          status={stats && stats.response_rate >= 25 ? 'positive' : stats && stats.response_rate >= 15 ? 'neutral' : 'negative'}
          loading={loading}
        />
      </div>
    </div>
  );
}
