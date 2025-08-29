'use client';

import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useMood } from '@/modules/mood/MoodContext';
import { useDashboard } from '../DashboardContext';
import { getPersonalizedAnalyticsInsights } from '@/lib/personalizedDashboard';

export default function PersonalizedAnalytics() {
  const { profile } = useProfile();
  const { currentMood, getMoodConfig } = useMood();
  const { setView } = useDashboard();
  const moodConfig = getMoodConfig();

  const analyticsInsights = getPersonalizedAnalyticsInsights(profile);

  if (analyticsInsights.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📈</span>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Analytics & Insights</h3>
            <p className="text-sm text-gray-600 mb-4">
              Découvre tes patterns personnels et optimise ton quotidien
            </p>
            <button
              onClick={() => setView('analytics')}
              className={`px-4 py-2 text-sm rounded-lg ${moodConfig.bgColor} ${moodConfig.textColor} hover:scale-105 transition-transform`}
            >
              Voir mes stats →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topInsight = analyticsInsights[0];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all cursor-pointer"
         onClick={() => setView('analytics')}>
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">📈</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800">Mes Analytics ADHD</h3>
            {profile.true && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Personnalisées
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Insights basés sur TON profil personnel
          </p>
        </div>
      </div>

      {/* Insight principal */}
      <div className={`p-4 rounded-xl mb-4 ${
        topInsight.type === 'medication' ? 'bg-blue-50 border border-blue-200' :
        topInsight.type === 'chronotype' ? 'bg-orange-50 border border-orange-200' :
        topInsight.type === 'challenges' ? 'bg-purple-50 border border-purple-200' :
        'bg-green-50 border border-green-200'
      }`}>
        <h4 className={`font-medium mb-1 ${
          topInsight.type === 'medication' ? 'text-blue-800' :
          topInsight.type === 'chronotype' ? 'text-orange-800' :
          topInsight.type === 'challenges' ? 'text-purple-800' :
          'text-green-800'
        }`}>
          🎯 {topInsight.title}
        </h4>
        <p className={`text-sm ${
          topInsight.type === 'medication' ? 'text-blue-700' :
          topInsight.type === 'chronotype' ? 'text-orange-700' :
          topInsight.type === 'challenges' ? 'text-purple-700' :
          'text-green-700'
        }`}>
          {topInsight.description}
        </p>
      </div>

      {/* Aperçu autres insights */}
      {analyticsInsights.length > 1 && (
        <div className="space-y-2 mb-4">
          {analyticsInsights.slice(1, 3).map((insight, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              {insight.title}
            </div>
          ))}
          {analyticsInsights.length > 3 && (
            <div className="text-xs text-gray-500">
              +{analyticsInsights.length - 3} autres insights...
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {analyticsInsights.length} insight{analyticsInsights.length > 1 ? 's' : ''} personnalisé{analyticsInsights.length > 1 ? 's' : ''}
        </div>
        <button className={`px-3 py-1 text-xs rounded-lg ${moodConfig.bgColor} ${moodConfig.textColor} hover:scale-105 transition-transform`}>
          Voir tout →
        </button>
      </div>
    </div>
  );
}