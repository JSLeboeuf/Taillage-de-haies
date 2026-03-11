'use client';

import { useEffect, useState } from 'react';

interface PipelineStage {
  count: number;
  total_value: number;
  leads: Array<{
    id: string;
    name: string;
    created_at: string;
    quote_amount?: number;
  }>;
}

interface PipelineData {
  by_status: {
    new: PipelineStage;
    contacted: PipelineStage;
    qualified: PipelineStage;
    quoted: PipelineStage;
    won: PipelineStage;
    lost: PipelineStage;
  };
  metrics: {
    total_leads: number;
    total_value: number;
    conversion_rate: number;
    win_rate: number;
  };
}

interface StageCardProps {
  title: string;
  count: number;
  value: number;
  color: string;
  loading?: boolean;
}

function StageCard({ title, count, value, color, loading }: StageCardProps) {
  return (
    <div className={`bg-dark-card border-2 ${color} rounded-lg p-4 flex-shrink-0 w-40 sm:w-48 transition-all duration-150 hover:scale-105`}>
      <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
      {loading ? (
        <>
          <div className="h-8 bg-dark-hover rounded animate-pulse w-16 mb-2"></div>
          <div className="h-4 bg-dark-hover rounded animate-pulse w-24"></div>
        </>
      ) : (
        <>
          <p className="text-3xl font-bold font-mono text-white mb-1">{count}</p>
          <p className="text-xs text-gray-400 font-mono">
            {value > 0 ? `${(value / 1000).toFixed(1)}k$` : '0$'}
          </p>
        </>
      )}
    </div>
  );
}

export default function PipelineView() {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPipeline() {
      try {
        setLoading(true);
        const response = await fetch('/api/commercial/pipeline');
        const data = await response.json();

        if (data.success) {
          setPipeline(data.pipeline);
          setError(null);
        } else {
          setError('Erreur lors du chargement du pipeline');
        }
      } catch (err) {
        console.error('Pipeline fetch error:', err);
        setError('Impossible de charger le pipeline');
      } finally {
        setLoading(false);
      }
    }

    fetchPipeline();
    // Refresh every 2 minutes
    const interval = setInterval(fetchPipeline, 120000);
    return () => clearInterval(interval);
  }, []);

  if (error && !pipeline) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Pipeline commercial</h2>
        <p className="text-sm text-gray-400">⚠️ {error}</p>
        <p className="text-xs text-gray-500 mt-2">En attente de connexion Supabase</p>
      </div>
    );
  }

  const stages = [
    { key: 'new', title: 'Nouveau', color: 'border-accent-blue' },
    { key: 'contacted', title: 'Contacté', color: 'border-accent-blue' },
    { key: 'qualified', title: 'Qualifié', color: 'border-accent-blue' },
    { key: 'quoted', title: 'Soumissionné', color: 'border-yellow-500' },
    { key: 'won', title: 'Gagné', color: 'border-accent-green' },
    { key: 'lost', title: 'Perdu', color: 'border-accent-red' },
  ] as const;

  return (
    <div id="pipeline">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Pipeline commercial</h2>
        <p className="text-sm text-gray-400">
          Funnel de conversion • {pipeline?.metrics.total_leads || 0} leads actifs
        </p>
      </div>

      {/* Metrics bar */}
      {pipeline && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total leads</p>
            <p className="text-xl font-bold font-mono text-white">{pipeline.metrics.total_leads}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Valeur totale</p>
            <p className="text-xl font-bold font-mono text-accent-blue">
              {(pipeline.metrics.total_value / 1000).toFixed(0)}k$
            </p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Taux de conversion</p>
            <p className="text-xl font-bold font-mono text-accent-green">
              {pipeline.metrics.conversion_rate}%
            </p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Win rate</p>
            <p className="text-xl font-bold font-mono text-accent-green">
              {pipeline.metrics.win_rate}%
            </p>
          </div>
        </div>
      )}

      {/* Pipeline stages - horizontal scroll on mobile */}
      <div className="relative">
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {stages.map((stage) => (
              <StageCard
                key={stage.key}
                title={stage.title}
                count={pipeline?.by_status[stage.key]?.count || 0}
                value={pipeline?.by_status[stage.key]?.total_value || 0}
                color={stage.color}
                loading={loading}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator for mobile */}
        <div className="sm:hidden absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
          ← Glissez →
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
