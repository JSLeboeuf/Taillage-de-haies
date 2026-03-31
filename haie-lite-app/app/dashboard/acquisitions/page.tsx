'use client';

import { useState } from 'react';
import PipelineKanban from '../components/PipelineKanban';
import AcquisitionStats from '../components/AcquisitionStats';
import ProspectForm from '../components/ProspectForm';

export default function AcquisitionsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pipeline Acquisition M&A</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            {showForm ? 'Fermer' : '+ Nouveau prospect'}
          </button>
        </div>

        {showForm && <ProspectForm />}

        <AcquisitionStats />

        <PipelineKanban />
      </div>
    </div>
  );
}
