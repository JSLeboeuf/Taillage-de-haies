'use client';

interface Prospect {
  id: string;
  company_name: string;
  owner_name: string;
  priority: 'hot' | 'warm' | 'cold';
  last_activity: string;
  next_email_scheduled?: string;
  status: string;
}

interface ProspectCardProps {
  prospect: Prospect;
  onSelect: () => void;
  priorityColors: Record<string, string>;
  priorityLabels: Record<string, string>;
}

export default function ProspectCard({
  prospect,
  onSelect,
  priorityColors,
  priorityLabels,
}: ProspectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }

    return date.toLocaleDateString('fr-CA', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <button
      onClick={onSelect}
      className="w-full bg-dark-card border border-dark-border rounded-lg p-3 text-left transition-all duration-150 hover:border-accent-green hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green"
    >
      <h4 className="text-sm font-semibold text-white mb-2 truncate">
        {prospect.company_name}
      </h4>

      <p className="text-xs text-gray-400 mb-3 truncate">
        {prospect.owner_name}
      </p>

      <div className="mb-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${
            priorityColors[prospect.priority]
          }`}
        >
          {priorityLabels[prospect.priority]}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Dernière activité</span>
          <span className="text-gray-400">{formatDate(prospect.last_activity)}</span>
        </div>

        {prospect.next_email_scheduled && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Prochain email</span>
            <span className="text-gray-400">{formatDate(prospect.next_email_scheduled)}</span>
          </div>
        )}
      </div>

      <div className="text-right pt-2 text-gray-600">
        <span className="text-xs">→</span>
      </div>
    </button>
  );
}
