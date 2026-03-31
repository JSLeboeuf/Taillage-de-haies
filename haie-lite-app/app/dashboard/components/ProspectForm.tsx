'use client';

import { useState } from 'react';

interface FormData {
  company_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  territory: string;
  source: string;
  sequence_type: string;
  notes: string;
}

const territories = [
  'Rive-Nord',
  'Rive-Sud',
  'Île de Montréal',
  'Gatineau',
  'Trois-Rivières',
  'Autre',
];

const sources = [
  'cold_outreach',
  'referral',
  'broker',
  'industry_contact',
  'linkedin',
  'other',
];

const sourceLabels: Record<string, string> = {
  cold_outreach: 'Prospection froide',
  referral: 'Recommandation',
  broker: 'Courtier M&A',
  industry_contact: 'Contact industrie',
  linkedin: 'LinkedIn',
  other: 'Autre',
};

const sequenceTypes = [
  { value: 'cold', label: 'Cold (Prospection froide)' },
  { value: 'warm', label: 'Warm (Chaud)' },
  { value: 'referral', label: 'Referral (Recommandation)' },
  { value: 'inbound', label: 'Inbound (Entrant)' },
];

export default function ProspectForm() {
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    territory: 'Rive-Nord',
    source: 'cold_outreach',
    sequence_type: 'cold',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.company_name.trim()) {
      setError('Le nom de l\'entreprise est requis');
      return;
    }
    if (!formData.owner_name.trim()) {
      setError('Le nom du propriétaire est requis');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/acquisitions/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${new URLSearchParams(window.location.search).get('key')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          company_name: '',
          owner_name: '',
          owner_email: '',
          owner_phone: '',
          territory: 'Rive-Nord',
          source: 'cold_outreach',
          sequence_type: 'cold',
          notes: '',
        });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Erreur lors de l\'ajout du prospect');
      }
    } catch (err) {
      console.error('Form submit error:', err);
      setError('Impossible d\'ajouter le prospect');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setError('Veuillez coller le JSON');
      return;
    }

    try {
      setImportLoading(true);
      const prospects = JSON.parse(importData);
      const prospectArray = Array.isArray(prospects) ? prospects : [prospects];

      const response = await fetch('/api/acquisitions/prospects/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${new URLSearchParams(window.location.search).get('key')}`,
        },
        body: JSON.stringify({ prospects: prospectArray }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setImportData('');
        setShowImportModal(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Erreur lors de l\'import');
      }
    } catch (err) {
      setError('JSON invalide ou erreur lors de l\'import');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Ajouter un prospect</h2>
        <p className="text-sm text-gray-400">Créer une nouvelle cible d'acquisition</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
              <p className="text-sm text-accent-red">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-accent-green/10 border border-accent-green/30 rounded-lg p-4">
              <p className="text-sm text-accent-green">✓ Prospect ajouté avec succès</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150"
                placeholder="Nom de l'entreprise"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Propriétaire / PDG *
              </label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150"
                placeholder="Prénom Nom"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email du propriétaire
              </label>
              <input
                type="email"
                name="owner_email"
                value={formData.owner_email}
                onChange={handleChange}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone du propriétaire
              </label>
              <input
                type="tel"
                name="owner_phone"
                value={formData.owner_phone}
                onChange={handleChange}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150"
                placeholder="+1 (514) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Territoire
              </label>
              <select
                name="territory"
                value={formData.territory}
                onChange={handleChange}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150"
              >
                {territories.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150"
              >
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {sourceLabels[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type de séquence
            </label>
            <select
              name="sequence_type"
              value={formData.sequence_type}
              onChange={handleChange}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150"
            >
              {sequenceTypes.map((seq) => (
                <option key={seq.value} value={seq.value}>
                  {seq.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150 resize-none"
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-accent-green text-dark-bg font-semibold py-2 px-4 rounded-lg hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le prospect'}
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex-1 bg-accent-blue/20 text-accent-blue font-semibold py-2 px-4 rounded-lg hover:bg-accent-blue/30 transition-all duration-150"
            >
              Importer CSV/JSON
            </button>
          </div>
        </form>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Importer des prospects</h3>
            <p className="text-sm text-gray-400 mb-4">
              Collez un tableau JSON avec un tableau de prospects ou un objet unique.
            </p>

            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all duration-150 resize-none mb-4 font-mono text-sm"
              placeholder='[{"company_name": "ABC Inc", "owner_name": "John Doe", ...}]'
            />

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={importLoading || !importData.trim()}
                className="flex-1 bg-accent-green text-dark-bg font-semibold py-2 px-4 rounded-lg hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {importLoading ? 'Import en cours...' : 'Importer'}
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                }}
                className="flex-1 bg-dark-hover text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-dark-border transition-all duration-150"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
