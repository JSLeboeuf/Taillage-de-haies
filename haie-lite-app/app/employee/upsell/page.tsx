'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, ChangeEvent, FormEvent } from 'react';

type ServiceType =
  | 'fertilisation'
  | 'pest'
  | 'winter_protection'
  | 'cedar_replacement'
  | 'rejuvenation'
  | 'mulching';

interface ServiceOption {
  value: ServiceType;
  label: string;
  commission: number | string;
  icon: string;
}

const serviceOptions: ServiceOption[] = [
  { value: 'fertilisation', label: 'Fertilisation', commission: 15, icon: '🌱' },
  { value: 'pest', label: 'Traitement parasites', commission: 20, icon: '🐛' },
  { value: 'winter_protection', label: 'Protection hivernale', commission: 25, icon: '❄️' },
  { value: 'cedar_replacement', label: 'Remplacement cèdres', commission: '10$/unité', icon: '🌲' },
  { value: 'rejuvenation', label: 'Rajeunissement', commission: '3%', icon: '✂️' },
  { value: 'mulching', label: 'Paillis', commission: 15, icon: '🍂' },
];

function UpsellContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeId = searchParams.get('id');
  const prefilledJobId = searchParams.get('job');

  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [jobUuid, setJobUuid] = useState(prefilledJobId || '');
  const [notes, setNotes] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [commission, setCommission] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo trop grande (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!employeeId) {
      setError('ID employé manquant');
      return;
    }

    if (!serviceType || !jobUuid) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobUuid)) {
      setError('Format UUID invalide pour le job');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/upsell/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_uuid: jobUuid,
          employee_id: employeeId,
          service_type: serviceType,
          notes: notes || undefined,
          estimated_value: estimatedValue ? parseFloat(estimatedValue) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la soumission');
      }

      setCommission(data.commission_amount);
      setSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setServiceType('');
        setJobUuid(prefilledJobId || '');
        setNotes('');
        setEstimatedValue('');
        setPhoto(null);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-haie-green-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-haie-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-haie-green-700 mb-2">
            Bravo!
          </h2>
          <p className="text-gray-600 mb-4">
            Upsell flaggé avec succès
          </p>
          <div className="inline-block bg-haie-green-50 border-2 border-haie-green-600 rounded-xl px-6 py-3">
            <div className="text-sm text-haie-green-700 font-medium">Commission gagnée</div>
            <div className="text-3xl font-bold text-haie-green-700">{commission}$</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-haie-cream-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-haie-green-700 to-haie-green-800 text-white px-6 pt-12 pb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-haie-green-50 hover:text-white"
          aria-label="Retour"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <h1 className="text-2xl font-bold">Flagger un upsell</h1>
        <p className="mt-1 text-haie-green-50 text-sm">
          Gagnez une commission sur chaque opportunité
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Service Type Selection */}
        <div>
          <label htmlFor="service-type" className="block text-sm font-semibold text-gray-900 mb-3">
            Type de service
          </label>
          <div className="grid grid-cols-2 gap-3">
            {serviceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setServiceType(option.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  serviceType === option.value
                    ? 'border-haie-green-600 bg-haie-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-haie-green-300'
                }`}
                aria-pressed={serviceType === option.value}
              >
                <span className="text-2xl mb-2" aria-hidden="true">{option.icon}</span>
                <span className="text-xs font-medium text-gray-900 text-center leading-tight">
                  {option.label}
                </span>
                <span className="text-xs text-haie-green-700 font-semibold mt-1">
                  {typeof option.commission === 'number' ? `${option.commission}$` : option.commission}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Job UUID */}
        <div>
          <label htmlFor="job-uuid" className="block text-sm font-semibold text-gray-900 mb-2">
            Job UUID ou adresse client
          </label>
          <input
            id="job-uuid"
            type="text"
            value={jobUuid}
            onChange={(e) => setJobUuid(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-haie-green-600 focus:outline-none text-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Le UUID du job dans ServiceM8
          </p>
        </div>

        {/* Estimated Value (for percentage commissions) */}
        {serviceType === 'rejuvenation' && (
          <div>
            <label htmlFor="estimated-value" className="block text-sm font-semibold text-gray-900 mb-2">
              Valeur estimée ($)
            </label>
            <input
              id="estimated-value"
              type="number"
              min="0"
              step="0.01"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="250.00"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-haie-green-600 focus:outline-none text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Pour calculer votre commission de 3%
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Plusieurs cèdres morts sur le côté ouest, client intéressé..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-haie-green-600 focus:outline-none text-sm resize-none"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-semibold text-gray-900 mb-2">
            Photo (optionnel)
          </label>
          <div className="relative">
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="sr-only"
            />
            <label
              htmlFor="photo"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-haie-green-600 bg-gray-50"
            >
              {photo ? (
                <img
                  src={photo}
                  alt="Preview"
                  className="h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-2 text-xs text-gray-600">Ajouter une photo</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !serviceType || !jobUuid}
          className="w-full bg-haie-green-700 text-white font-semibold py-4 rounded-xl hover:bg-haie-green-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Soumission...
            </span>
          ) : (
            'Soumettre l\'upsell'
          )}
        </button>
      </form>
    </div>
  );
}

export default function UpsellPage() {
  return (
    <Suspense fallback={null}>
      <UpsellContent />
    </Suspense>
  );
}
