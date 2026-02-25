'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ScoreData {
  overall_score: number;
  revenue_per_hour: number;
  jobs_completed: number;
  bonuses_earned: number;
  review_rate: number;
  ranking: number;
  total_employees: number;
  bonus_history: Array<{
    date: string;
    amount: number;
    reason: string;
  }>;
}

export default function ScorePage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');

  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    // Mock data for now - replace with API call
    setTimeout(() => {
      setScoreData({
        overall_score: 92,
        revenue_per_hour: 145,
        jobs_completed: 47,
        bonuses_earned: 1285,
        review_rate: 4.8,
        ranking: 2,
        total_employees: 8,
        bonus_history: [
          { date: '2026-02-18', amount: 25, reason: 'Upsell fertilisation accepté' },
          { date: '2026-02-15', amount: 20, reason: 'Upsell pest treatment accepté' },
          { date: '2026-02-12', amount: 50, reason: 'Review 5 étoiles (3x)' },
          { date: '2026-02-08', amount: 15, reason: 'Upsell mulching accepté' },
          { date: '2026-02-05', amount: 25, reason: 'Upsell winter protection accepté' },
        ],
      });
      setLoading(false);
    }, 500);
  }, [employeeId]);

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <p className="text-red-600 font-semibold">ID employé manquant</p>
          <p className="text-sm text-gray-600 mt-2">Utilisez ?id=votre-uuid dans l&apos;URL</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-haie-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const scorePercentage = (scoreData.overall_score / 100) * 100;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-haie-cream-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-haie-green-700 to-haie-green-800 text-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Mon score</h1>
        <p className="mt-1 text-haie-green-50 text-sm">
          Performance ce mois-ci
        </p>
      </header>

      {/* Overall Score Circle */}
      <div className="px-6 -mt-8 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="54"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="54"
                  stroke="#16a34a"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-haie-green-700">
                  {scoreData.overall_score}
                </div>
                <div className="text-sm text-gray-600">/ 100</div>
              </div>
            </div>

            {/* Ranking */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 mb-1">Classement</div>
              <div className="text-2xl font-bold text-gray-900">
                #{scoreData.ranking} <span className="text-base font-normal text-gray-500">sur {scoreData.total_employees}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Détails</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Revenue per hour */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-haie-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-600">$/heure</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{scoreData.revenue_per_hour}$</div>
          </div>

          {/* Jobs completed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs font-medium text-gray-600">Jobs</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{scoreData.jobs_completed}</div>
          </div>

          {/* Bonuses earned */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-600">Bonus</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{scoreData.bonuses_earned}$</div>
          </div>

          {/* Review rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-600">Reviews</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{scoreData.review_rate.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Bonus History */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Historique des bonus</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 max-h-96 overflow-y-auto scrollbar-custom">
          {scoreData.bonus_history.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun bonus pour le moment
            </div>
          ) : (
            scoreData.bonus_history.map((bonus, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{bonus.reason}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(bonus.date).toLocaleDateString('fr-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-lg font-bold text-haie-green-700">
                  +{bonus.amount}$
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
