'use client';

import React from 'react';
import { useCleaning } from './CleaningContext';

export function MicroVictories() {
  const { microVictories } = useCleaning();

  if (microVictories.length === 0) {
    return null;
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (60 * 1000));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎉</span>
        <h3 className="font-medium text-gray-800">Tes micro-victoires !</h3>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {microVictories.slice(0, 5).map(victory => (
          <div
            key={victory.id}
            className="min-w-0 flex-shrink-0 bg-white px-3 py-2 rounded-full border text-sm whitespace-nowrap"
          >
            <span className="mr-1">{victory.emoji}</span>
            <span className="font-medium text-gray-700">{victory.message}</span>
            <span className="text-gray-500 ml-2 text-xs">
              {formatTimeAgo(victory.timestamp)}
            </span>
          </div>
        ))}
      </div>
      
      {microVictories.length > 5 && (
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            +{microVictories.length - 5} autre{microVictories.length - 5 > 1 ? 's' : ''} victoire{microVictories.length - 5 > 1 ? 's' : ''} !
          </span>
        </div>
      )}
    </div>
  );
}