'use client';

import React, { useState } from 'react';
import { useHealth } from './HealthContext';
import { useMood } from '../mood/MoodContext';
import { QuickWellbeing } from './QuickWellbeing';
import { MedicationTracker } from './MedicationTracker';
import { ActivityLogger } from './ActivityLogger';
import { AppointmentManager } from './AppointmentManager';
import { HealthVisualization } from './HealthVisualization';

type HealthView = 'overview' | 'wellbeing' | 'medications' | 'activity' | 'appointments' | 'patterns';

export function HealthInterface() {
  const [currentView, setCurrentView] = useState<HealthView>('overview');
  const { getStats, getTodayWellbeing, getTodayActivities, getUpcomingAppointments } = useHealth();
  const { getMoodConfig } = useMood();

  const stats = getStats();
  const moodConfig = getMoodConfig();
  const todayWellbeing = getTodayWellbeing();
  const todayActivities = getTodayActivities();
  const upcomingAppointments = getUpcomingAppointments();

  const renderView = () => {
    switch (currentView) {
      case 'wellbeing':
        return <QuickWellbeing />;
      case 'medications':
        return <MedicationTracker />;
      case 'activity':
        return <ActivityLogger />;
      case 'appointments':
        return <AppointmentManager />;
      case 'patterns':
        return <HealthVisualization />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tableau de bord santé
        </h2>
        <p className="text-gray-600">
          Suivi simple et bienveillant de votre bien-être
        </p>
      </div>

      {/* Stats du jour */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${todayWellbeing ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl">😌</span>
            <div className="text-right">
              <div className={`font-bold ${todayWellbeing ? 'text-green-600' : 'text-gray-500'}`}>
                {todayWellbeing ? '✓' : '○'}
              </div>
              <div className="text-xs text-gray-600">Bien-être</div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${todayActivities.length > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl">🏃‍♂️</span>
            <div className="text-right">
              <div className={`font-bold ${todayActivities.length > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                {todayActivities.length}
              </div>
              <div className="text-xs text-gray-600">Activité</div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${stats.today.medicationsTaken === stats.today.totalMedications ? 'bg-purple-50' : 'bg-orange-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl">💊</span>
            <div className="text-right">
              <div className={`font-bold ${stats.today.medicationsTaken === stats.today.totalMedications ? 'text-purple-600' : 'text-orange-600'}`}>
                {stats.today.medicationsTaken}/{stats.today.totalMedications}
              </div>
              <div className="text-xs text-gray-600">Médications</div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${upcomingAppointments.length > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl">📅</span>
            <div className="text-right">
              <div className={`font-bold ${upcomingAppointments.length > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
                {upcomingAppointments.length}
              </div>
              <div className="text-xs text-gray-600">RDV à venir</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid md:grid-cols-2 gap-4">
        {!todayWellbeing && (
          <button
            onClick={() => setCurrentView('wellbeing')}
            className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg text-left hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">😌</span>
              <div>
                <h3 className="font-medium text-gray-800">Logger mon bien-être</h3>
                <p className="text-sm text-gray-600">30 secondes pour noter comment ça va</p>
              </div>
            </div>
          </button>
        )}

        {todayActivities.length === 0 && (
          <button
            onClick={() => setCurrentView('activity')}
            className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg text-left hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏃‍♂️</span>
              <div>
                <h3 className="font-medium text-gray-800">J'ai bougé aujourd'hui ?</h3>
                <p className="text-sm text-gray-600">Noter une activité physique</p>
              </div>
            </div>
          </button>
        )}

        {stats.today.medicationsTaken < stats.today.totalMedications && (
          <button
            onClick={() => setCurrentView('medications')}
            className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-left hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💊</span>
              <div>
                <h3 className="font-medium text-gray-800">Médications</h3>
                <p className="text-sm text-gray-600">Noter la prise et effets</p>
              </div>
            </div>
          </button>
        )}

        {upcomingAppointments.length > 0 && (
          <button
            onClick={() => setCurrentView('appointments')}
            className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-left hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="font-medium text-gray-800">RDV à venir</h3>
                <p className="text-sm text-gray-600">Préparer mes consultations</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Résumé de la semaine */}
      {(stats.week.wellbeingDays > 0 || stats.week.activityDays > 0) && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Cette semaine</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.week.wellbeingDays}</div>
              <div className="text-sm text-gray-600">jours de suivi bien-être</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.week.activityDays}</div>
              <div className="text-sm text-gray-600">jours d'activité</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.week.avgWellbeing.energy > 0 ? Math.round(stats.week.avgWellbeing.energy * 10) / 10 : '-'}
              </div>
              <div className="text-sm text-gray-600">énergie moyenne</div>
            </div>
          </div>
          
          {stats.week.wellbeingDays >= 5 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
              <span className="text-green-800">🎉 Excellent suivi cette semaine !</span>
            </div>
          )}
        </div>
      )}

      {/* Premier usage */}
      {stats.week.wellbeingDays === 0 && stats.week.activityDays === 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg text-center">
          <h3 className="font-semibold text-gray-800 mb-2">Bienvenue dans votre suivi santé !</h3>
          <p className="text-gray-600 mb-4">
            Commencez par noter comment vous vous sentez aujourd'hui. 
            Rien de compliqué, juste 30 secondes pour vous écouter.
          </p>
          <button
            onClick={() => setCurrentView('wellbeing')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            🚀 Commencer mon suivi
          </button>
        </div>
      )}
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', emoji: '🏠' },
    { id: 'wellbeing', label: 'Bien-être', emoji: '😌', badge: !todayWellbeing },
    { id: 'medications', label: 'Médications', emoji: '💊', badge: stats.today.medicationsTaken < stats.today.totalMedications },
    { id: 'activity', label: 'Activité', emoji: '🏃‍♂️', badge: todayActivities.length === 0 },
    { id: 'appointments', label: 'RDV', emoji: '📅', badge: upcomingAppointments.length > 0 },
    { id: 'patterns', label: 'Tendances', emoji: '📈' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header avec message mood */}
      <div className={`p-4 rounded-lg ${moodConfig.bgColor} border-l-4`} 
           style={{ borderLeftColor: moodConfig.color }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{moodConfig.emoji}</span>
          <div>
            <h3 className={`font-medium ${moodConfig.textColor}`}>
              Suivi santé adapté à ton mood
            </h3>
            <p className={`text-sm ${moodConfig.textColor} opacity-80`}>
              {moodConfig.label === 'Énergique' ? 'Super forme ! Note tes bonnes sensations ✨' :
               moodConfig.label === 'Normal' ? 'Tracking de routine, comment ça va ? 📊' :
               moodConfig.label === 'Fatigué' ? 'Fatigué... c\'est important de le noter aussi 💤' :
               moodConfig.label === 'Stressé' ? 'Anxiété élevée, tracking pour comprendre 🤗' :
               'Période difficile, on surveille ensemble ❤️'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as HealthView)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors relative ${
              currentView === item.id
                ? `bg-${moodConfig.color.replace('-500', '-100')} text-${moodConfig.color.replace('-500', '-700')}`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{item.emoji}</span>
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg border min-h-[400px]">
        {renderView()}
      </div>
    </div>
  );
}