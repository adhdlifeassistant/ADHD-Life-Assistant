'use client';

import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useMood } from '@/modules/mood/MoodContext';
import { useDashboard } from '../DashboardContext';
import { getPersonalizedChatTeaser } from '@/lib/personalizedDashboard';

export default function PersonalizedChatTeaser() {
  const { profile } = useProfile();
  const { settings } = useAppSettings();
  const { currentMood, getMoodConfig } = useMood();
  const { setView } = useDashboard();
  const moodConfig = getMoodConfig();

  const dashboardContext = {
    profile,
    currentMood,
    currentTime: new Date()
  };

  const chatTeaser = profile.onboardingCompleted 
    ? getPersonalizedChatTeaser(dashboardContext)
    : "Parle avec Claude, ton assistant IA adaptatif !";

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all cursor-pointer"
         onClick={() => setView('chat')}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${moodConfig.bgColor} flex items-center justify-center`}>
            <span className="text-xl">{settings.avatar || moodConfig.emoji}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">
              🤖 Chat {profile.name ? `avec ${profile.name}` : 'Claude'}
            </h3>
            {profile.onboardingCompleted && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Personnalisé
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {chatTeaser}
          </p>
          
          {profile.onboardingCompleted && (
            <div className="flex flex-wrap gap-1">
              {profile.challenges.slice(0, 3).map(challengeId => (
                <span key={challengeId} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                  {challengeId.replace('-', ' ')}
                </span>
              ))}
              {profile.medications.length > 0 && (
                <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">
                  {profile.medications.length} méd.
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${moodConfig.bgColor}`}></span>
              Mode {moodConfig.label}
            </div>
            <button className={`px-3 py-1 text-xs rounded-lg ${moodConfig.bgColor} ${moodConfig.textColor} hover:scale-105 transition-transform`}>
              Ouvrir →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}