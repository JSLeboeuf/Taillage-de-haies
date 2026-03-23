'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type JobStatus = 'scheduled' | 'in_progress' | 'completed';

interface Job {
  uuid: string;
  job_address: string;
  scheduled_start: string;
  scheduled_end: string;
  description: string;
  status: JobStatus;
  hedge_type?: string;
  notes?: string;
}

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeId = searchParams.get('id');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    // Mock data for now - replace with API call to ServiceM8
    setTimeout(() => {
      setJobs([
        {
          uuid: '123e4567-e89b-12d3-a456-426614174000',
          job_address: '1234 Rue Principale, Longueuil',
          scheduled_start: new Date().toISOString(),
          scheduled_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          description: 'Taille haie de cèdres',
          status: 'in_progress',
          hedge_type: 'Cèdres',
          notes: 'Client demande une taille basse',
        },
        {
          uuid: '123e4567-e89b-12d3-a456-426614174001',
          job_address: '5678 Avenue du Parc, Boucherville',
          scheduled_start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          scheduled_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          description: 'Taille haie + nettoyage',
          status: 'scheduled',
          hedge_type: 'Thuya',
        },
        {
          uuid: '123e4567-e89b-12d3-a456-426614174002',
          job_address: '910 Boulevard Taschereau, Greenfield Park',
          scheduled_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          scheduled_end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          description: 'Taille haie résidentielle',
          status: 'completed',
          hedge_type: 'Cèdres',
        },
      ]);
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

  const getStatusInfo = (status: JobStatus) => {
    switch (status) {
      case 'scheduled':
        return {
          label: 'À venir',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'in_progress':
        return {
          label: 'En cours',
          color: 'bg-haie-green-100 text-haie-green-800 border-haie-green-200',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        };
      case 'completed':
        return {
          label: 'Complété',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-haie-cream-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-haie-green-700 to-haie-green-800 text-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Mes jobs</h1>
        <p className="mt-1 text-haie-green-50 text-sm">
          {new Date().toLocaleDateString('fr-CA', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </header>

      {/* Jobs List */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-haie-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Aucun job</h3>
            <p className="mt-2 text-gray-600">Pas de jobs planifiés pour aujourd&apos;hui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const statusInfo = getStatusInfo(job.status);
              return (
                <div
                  key={job.uuid}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatTime(job.scheduled_start)} - {formatTime(job.scheduled_end)}
                    </span>
                  </div>

                  {/* Address */}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {job.job_address}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3">
                    {job.description}
                  </p>

                  {/* Hedge Type */}
                  {job.hedge_type && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      {job.hedge_type}
                    </div>
                  )}

                  {/* Notes */}
                  {job.notes && (
                    <div className="bg-haie-cream-50 border border-haie-cream-200 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Note: </span>
                        {job.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {job.status !== 'completed' && (
                    <Link
                      href={`/employee/upsell?id=${employeeId}&job=${job.uuid}`}
                      className="flex items-center justify-center gap-2 w-full bg-haie-green-700 text-white font-medium py-3 rounded-lg hover:bg-haie-green-800 active:scale-[0.98] transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Flagger upsell
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={null}>
      <JobsContent />
    </Suspense>
  );
}
