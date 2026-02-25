'use client';

import { useEffect, useState } from 'react';

interface KPIData {
  revenue: {
    today: number;
    mtd: number;
    target: number;
    progress: number;
    trend: number;
  };
  jobs: {
    today: number;
    week: number;
    mtd: number;
    trend: number;
  };
  leads: {
    mtd: number;
  };
  conversion: {
    rate: number;
  };
  ticket: {
    avg: number;
  };
  quotes: {
    mtd: number;
  };
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  status?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
}

function KPICard({ title, value, subtitle, trend, status = 'neutral', loading }: KPICardProps) {
  const statusColors = {
    positive: 'text-accent-green',
    negative: 'text-accent-red',
    neutral: 'text-accent-blue',
  };

  const trendIcon = trend !== undefined
    ? trend > 0 ? '↑' : trend < 0 ? '↓' : '→'
    : null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 sm:p-6 transition-all duration-150 hover:border-dark-hover hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
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
        {trend !== undefined && trendIcon && !loading && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend > 0 ? 'bg-accent-green/10' : trend < 0 ? 'bg-accent-red/10' : 'bg-gray-700'
          }`}>
            <span className={`text-lg ${
              trend > 0 ? 'text-accent-green' : trend < 0 ? 'text-accent-red' : 'text-gray-400'
            }`}>
              {trendIcon}
            </span>
            <span className={`text-sm font-mono font-semibold ${
              trend > 0 ? 'text-accent-green' : trend < 0 ? 'text-accent-red' : 'text-gray-400'
            }`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KPICards() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/kpis');
        const data = await response.json();

        if (data.success) {
          setKpis(data.kpis);
          setError(null);
        } else {
          setError(data.error || 'Erreur lors du chargement des KPIs');
          // Use fallback data
          setKpis(data.kpis);
        }
      } catch (err) {
        console.error('KPIs fetch error:', err);
        setError('Impossible de charger les KPIs');
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
    // Refresh every 60 seconds
    const interval = setInterval(fetchKPIs, 60000);
    return () => clearInterval(interval);
  }, []);

  if (error && !kpis) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <p className="text-sm text-gray-400">⚠️ {error}</p>
        <p className="text-xs text-gray-500 mt-2">En attente de connexion Supabase</p>
      </div>
    );
  }

  const revenueStatus = kpis?.revenue.progress
    ? kpis.revenue.progress >= 80 ? 'positive' : kpis.revenue.progress >= 50 ? 'neutral' : 'negative'
    : 'neutral';

  const conversionStatus = kpis?.conversion.rate
    ? kpis.conversion.rate >= 30 ? 'positive' : kpis.conversion.rate >= 20 ? 'neutral' : 'negative'
    : 'neutral';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Métriques clés</h2>
        <p className="text-sm text-gray-400">Mise à jour en temps réel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <KPICard
          title="Revenue MTD"
          value={kpis ? `${(kpis.revenue.mtd / 1000).toFixed(1)}k$` : '0$'}
          subtitle={kpis ? `Objectif: ${(kpis.revenue.target / 1000).toFixed(0)}k$ (${kpis.revenue.progress}%)` : 'Chargement...'}
          trend={kpis?.revenue.trend}
          status={revenueStatus}
          loading={loading}
        />

        <KPICard
          title="Jobs complétés"
          value={kpis ? `${kpis.jobs.mtd}` : '0'}
          subtitle={kpis ? `Cette semaine: ${kpis.jobs.week} • Aujourd'hui: ${kpis.jobs.today}` : 'Chargement...'}
          trend={kpis?.jobs.trend}
          status={kpis && kpis.jobs.trend > 0 ? 'positive' : 'neutral'}
          loading={loading}
        />

        <KPICard
          title="Leads dans le pipeline"
          value={kpis ? `${kpis.leads.mtd}` : '0'}
          subtitle={kpis ? `Soumissions: ${kpis.quotes.mtd}` : 'Chargement...'}
          status="neutral"
          loading={loading}
        />

        <KPICard
          title="Taux de conversion"
          value={kpis ? `${kpis.conversion.rate}%` : '0%'}
          subtitle="Leads → Jobs fermés"
          status={conversionStatus}
          loading={loading}
        />

        <KPICard
          title="Ticket moyen"
          value={kpis ? `${kpis.ticket.avg}$` : '0$'}
          subtitle="Par job complété"
          status="neutral"
          loading={loading}
        />

        <KPICard
          title="Revenue aujourd'hui"
          value={kpis ? `${kpis.revenue.today}$` : '0$'}
          subtitle={kpis ? `Jobs: ${kpis.jobs.today}` : 'Chargement...'}
          status={kpis && kpis.revenue.today > 5000 ? 'positive' : 'neutral'}
          loading={loading}
        />
      </div>
    </div>
  );
}
