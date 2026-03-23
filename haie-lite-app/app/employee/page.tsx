'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  current_period_revenue: number;
  current_period_incentive: number;
  total_jobs_completed_ytd: number;
  quality_score?: number;
}

function EmployeeContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setError('ID employé manquant');
      setLoading(false);
      return;
    }

    // Mock data for now - replace with API call
    setTimeout(() => {
      setEmployee({
        id: employeeId,
        first_name: 'Marc',
        last_name: 'Tremblay',
        current_period_revenue: 8500,
        current_period_incentive: 285,
        total_jobs_completed_ytd: 47,
        quality_score: 92,
      });
      setLoading(false);
    }, 500);
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Erreur</h2>
          <p className="mt-2 text-gray-600">{error || 'Employé non trouvé'}</p>
          <p className="mt-4 text-sm text-gray-500">Utilisez ?id=votre-uuid dans l&apos;URL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-green-600 to-green-700 text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold">
          Bonjour, {employee.first_name}
        </h1>
        <p className="mt-1 text-green-50 text-sm">
          {new Date().toLocaleDateString('fr-CA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </header>

      {/* Stats Summary */}
      <div className="px-6 -mt-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {employee.current_period_incentive}$
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Bonus ce mois
              </div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {employee.quality_score || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Score
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {employee.total_jobs_completed_ytd}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Jobs complétés
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="px-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h2>

        <Link
          href={`/employee/upsell?id=${employeeId}`}
          className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-green-600 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Flagger un upsell</div>
              <div className="text-sm text-gray-600">Gagner une commission</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href={`/employee/jobs?id=${employeeId}`}
          className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-green-600 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Mes jobs</div>
              <div className="text-sm text-gray-600">Jobs du jour</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href={`/employee/score?id=${employeeId}`}
          className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-green-600 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Mon score</div>
              <div className="text-sm text-gray-600">Performance détaillée</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function EmployeePage() {
  return (
    <Suspense fallback={null}>
      <EmployeeContent />
    </Suspense>
  );
}
