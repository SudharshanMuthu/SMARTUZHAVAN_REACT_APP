import React from 'react';

interface Props {
  status: string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const norm = (status || '').toLowerCase();

  let styles = 'bg-gray-100 text-gray-800 border-gray-200';

  if (norm === 'active' || norm === 'completed' || norm === 'stored' || norm === 'available') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (norm === 'accepted' || norm === 'in transit' || norm === 'on_trip') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (norm === 'requested' || norm === 'pending') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm === 'blocked' || norm === 'rejected' || norm === 'declined' || norm === 'offline') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
    </span>
  );
};
