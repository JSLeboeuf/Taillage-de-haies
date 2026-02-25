'use client';

import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  type: 'weather' | 'lead' | 'review' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actionable?: boolean;
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);

        // For now, generate mock alerts
        // In production, this would aggregate from multiple sources:
        // - Weather API
        // - Leads without follow-up (from Supabase)
        // - Recent reviews (from Google/Facebook)
        const mockAlerts: Alert[] = [];

        // Weather alert (mock)
        const weather = {
          id: 'weather-1',
          type: 'weather' as const,
          severity: 'warning' as const,
          title: 'Météo',
          message: 'Risque de pluie cet après-midi (60%)',
          timestamp: new Date().toISOString(),
          actionable: false,
        };
        mockAlerts.push(weather);

        // Leads without follow-up
        try {
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

          // This would query Supabase for leads without recent contact
          // For now, show a placeholder
          mockAlerts.push({
            id: 'lead-1',
            type: 'lead',
            severity: 'warning',
            title: 'Leads en attente',
            message: 'Vérifier les leads sans follow-up depuis 48h',
            timestamp: new Date().toISOString(),
            actionable: true,
          });
        } catch (err) {
          console.error('Leads check error:', err);
        }

        setAlerts(mockAlerts);
      } catch (err) {
        console.error('Alerts fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    // Refresh every 10 minutes
    const interval = setInterval(fetchAlerts, 600000);
    return () => clearInterval(interval);
  }, []);

  const severityStyles = {
    info: 'border-accent-blue bg-accent-blue/5',
    warning: 'border-yellow-500 bg-yellow-500/5',
    critical: 'border-accent-red bg-accent-red/5',
  };

  const severityIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
  };

  const typeIcons = {
    weather: '🌦️',
    lead: '📋',
    review: '⭐',
    system: '⚙️',
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Alertes actives</h2>
        <p className="text-sm text-gray-400">
          Notifications importantes • Mise à jour toutes les 10 min
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-dark-hover rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm text-gray-400">Aucune alerte active</p>
          <p className="text-xs text-gray-500 mt-1">Tout roule!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 transition-all duration-150 hover:bg-dark-hover ${
                severityStyles[alert.severity]
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 text-2xl">
                  {typeIcons[alert.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">
                      {alert.title}
                    </h3>
                    <span className="text-lg">{severityIcons[alert.severity]}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleTimeString('fr-CA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Action button */}
                {alert.actionable && (
                  <button
                    className="flex-shrink-0 px-3 py-1.5 bg-accent-blue text-white text-xs font-medium rounded-lg hover:bg-accent-blue/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
                    onClick={() => {
                      // Navigate to relevant section
                      if (alert.type === 'lead') {
                        document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Voir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick stats */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-dark-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total alertes actives</span>
            <span className="font-bold font-mono text-white">{alerts.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-400">Critiques</span>
            <span className="font-bold font-mono text-accent-red">
              {alerts.filter(a => a.severity === 'critical').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
