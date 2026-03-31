'use client';

import { useEffect, useState } from 'react';
import ProspectCard from './ProspectCard';

interface Prospect {
  id: string;
  company_name: string;
  owner_name: string;
  status: string;
  priority: 'hot' | 'warm' | 'cold';
  last_activity: string;
  next_email_scheduled?: string;
}

interface PipelineData {
  [key: string]: Prospect[];
}

const columnConfig = [
  { key: 'new', label: 'Nouveau', color: 'border-accent-blue' },
  { key: 'contacted', label: 'Contacté', color: 'border-accent-blue' },
  { key: 'discussion', label: 'En discussion', color: 'border-yellow-500' },
  { key: 'offer', label: 'Offre', color: 'border-accent-blue' },
  { key: 'advanced', label: 'Avancé', color: 'border-accent-green' },
  { key: 'closed', label: 'Gagné/Perdu', color: 'border-accent-red' },
  { key: 'nurture', label: 'Nurture', color: 'border-gray-500' },
];

const priorityColors = {
  hot: 'bg-accent-red/20 border-accent-red/50 text-accent-red',
  warm: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500',
  cold: 'bg-accent-blue/20 border-accent-blue/50 text-accent-blue',
};

const priorityLabels = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
};

export default function PipelineKanban() {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    async function fetchPipeline() {
      try {
        setLoading(true);
        const response = await fetch('/api/acquisitions/pipeline');
        const data = await response.json();

        if (data.success) {
          setPipeline(data.pipeline);
          setError(null);
        } else {
          setError(data.error || 'Erreur lors du chargement du pipeline');
        }
      } catch (err) {
        console.error('Pipeline fetch error:', err);
        setError('Impossible de charger le pipeline');
      } finally {
        setLoading(false);
      }
    }

    fetchPipeline();
    const interval = setInterval(fetchPipeline, 120000);
    return () => clearInterval(interval);
  }, []);

  if (error && !pipeline) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Pipeline Kanban</h2>
        <p className="text-sm text-gray-400">⚠️ {error}</p>
        <p className="text-xs text-gray-500 mt-2">Acquisition pipeline</p>
      </div>
    );
  }

  return (
    <div id="pipeline-kanban">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Pipeline Kanban</h2>
        <p className="text-sm text-gray-400">
          Progression des acquisitions • {
            pipeline
              ? Object.values(pipeline).reduce((sum, col) => sum + col.length, 0)
              : 0
          } prospects
        </p>
      </div>

      <div className="relative">
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {columnConfig.map((column) => (
              <div
                key={column.key}
                className={`bg-dark-hover border-2 ${column.color} rounded-lg p-4 flex-shrink-0 w-80 transition-all duration-150`}
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-border">
                  <h3 className="text-sm font-semibold text-white">{column.label}</h3>
                  <span className="bg-dark-card px-2 py-1 rounded text-xs font-mono text-gray-400">
                    {loading ? 0 : (pipeline?.[column.key] || []).length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {loading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-dark-card border border-dark-border rounded-lg p-4 animate-pulse"
                        >
                          <div className="h-4 bg-dark-hover rounded mb-2 w-24"></div>
                          <div className="h-3 bg-dark-hover rounded mb-3 w-32"></div>
                          <div className="h-3 bg-dark-hover rounded w-20"></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {(pipeline?.[column.key] || []).map((prospect) => (
                        <ProspectCard
                          key={prospect.id}
                          prospect={prospect}
                          onSelect={() => setSelectedProspect(prospect)}
                          priorityColors={priorityColors}
                          priorityLabels={priorityLabels}
                        />
                      ))}
                      {(pipeline?.[column.key] || []).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-xs text-gray-500">Aucun prospect</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:hidden absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
          <- Glissez ->
        </div>
      </div>

      {selectedProspect && (
        <ProspectDetailPanel
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          priorityColors={priorityColors}
          priorityLabels={priorityLabels}
        />
      )}

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

interface ProspectDetailPanelProps {
  prospect: Prospect;
  onClose: () => void;
  priorityColors: Record<string, string>;
  priorityLabels: Record<string, string>;
}

function ProspectDetailPanel({
  prospect,
  onClose,
  priorityColors,
  priorityLabels,
}: ProspectDetailPanelProps) {
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailData, setDetailData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await fetch(`/api/acquisitions/prospects/${prospect.id}`);
        const data = await response.json();
        if (data.success) {
          setDetailData(data.prospect);
        }
      } catch (err) {
        console.error('Detail fetch error:', err);
      } finally {
        setDetailLoading(false);
      }
    }

    fetchDetail();
  }, [prospect.id]);

  const handleAction = async (action: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/acquisitions/prospects/${prospect.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setDetailData(data.prospect);
      }
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-card border border-dark-border rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-dark-border">
          <div>
            <h3 className="text-2xl font-bold text-white">{prospect.company_name}</h3>
            <p className="text-sm text-gray-400 mt-1">Proprietaire: {prospect.owner_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            X
          </button>
        </div>

        {detailLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-dark-hover rounded animate-pulse w-32"></div>
            <div className="h-4 bg-dark-hover rounded animate-pulse w-48"></div>
          </div>
        ) : detailData ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Priorite</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                    priorityColors[prospect.priority]
                  }`}
                >
                  {priorityLabels[prospect.priority]}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Statut</p>
                <p className="text-sm font-mono text-white">{detailData.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-300 break-all">{detailData.owner_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Telephone</p>
                <p className="text-sm text-gray-300">{detailData.owner_phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Derniere activite</p>
                <p className="text-sm text-gray-300">
                  {new Date(detailData.last_activity).toLocaleDateString('fr-CA')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Prochain email</p>
                <p className="text-sm text-gray-300">
                  {detailData.next_email_scheduled
                    ? new Date(detailData.next_email_scheduled).toLocaleDateString('fr-CA')
                    : 'A planifier'}
                </p>
              </div>
            </div>

            {detailData.notes && (
              <div className="mb-6 p-4 bg-dark-hover rounded-lg border border-dark-border">
                <p className="text-xs text-gray-500 mb-2">Notes</p>
                <p className="text-sm text-gray-300">{detailData.notes}</p>
              </div>
            )}

            {detailData.activities && detailData.activities.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-3 font-semibold">Historique</p>
                <div className="space-y-2">
                  {detailData.activities.slice(0, 5).map((activity: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-dark-hover rounded-lg border border-dark-border/50 text-xs"
                    >
                      <p className="text-gray-400">
                        <span className="text-gray-500">{activity.type}</span> •{' '}
                        {new Date(activity.date).toLocaleDateString('fr-CA')}
                      </p>
                      {activity.details && <p className="text-gray-500 mt-1">{activity.details}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-dark-border">
              <button
                onClick={() => handleAction('change_status')}
                disabled={actionLoading}
                className="flex-1 text-sm bg-accent-blue/20 text-accent-blue font-semibold py-2 px-3 rounded-lg hover:bg-accent-blue/30 disabled:opacity-50 transition-all duration-150"
              >
                Changer statut
              </button>
              <button
                onClick={() => handleAction('email_now')}
                disabled={actionLoading}
                className="flex-1 text-sm bg-accent-green/20 text-accent-green font-semibold py-2 px-3 rounded-lg hover:bg-accent-green/30 disabled:opacity-50 transition-all duration-150"
              >
                Relancer maintenant
              </button>
              <button
                onClick={() => handleAction('archive')}
                disabled={actionLoading}
                className="flex-1 text-sm bg-accent-red/20 text-accent-red font-semibold py-2 px-3 rounded-lg hover:bg-accent-red/30 disabled:opacity-50 transition-all duration-150"
              >
                Archiver
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Erreur lors du chargement des details</p>
        )}
      </div>
    </div>
  );
}
