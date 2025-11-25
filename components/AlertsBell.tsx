
import React from 'react';
import { Bell } from 'lucide-react';
import { Alert } from '../types';

interface AlertsBellProps {
  alerts: Alert[];
  onClick: () => void;
}

export const AlertsBell: React.FC<AlertsBellProps> = ({ alerts, onClick }) => {
  const unreadCount = alerts.filter(a => !a.readAt).length;
  return (
    <button onClick={onClick} className="p-2 text-secondary hover:text-white hover:bg-surfaceHighlight transition-colors relative group">
      <Bell size={20} className={unreadCount > 0 ? 'animate-pulse-slow' : ''} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-loss rounded-full border border-[#020617] shadow-neon-loss flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-loss opacity-75"></span>
        </span>
      )}
    </button>
  );
};
