'use client';

import React from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { getPersonalizedGreeting, getMotivationalMessage, getSupportiveMessage } from '@/lib/moodGreetings';
import { getRecommendedModules } from '@/lib/moodPriorities';
import { 
  getPersonalizedDashboardGreeting, 
  getChronotypeTimingSuggestions,
  getPriorityModulesForChallenges,
  getTodayMedications,
  getPersonalizedChatTeaser,
  getPersonalizedAnalyticsInsights
} from '@/lib/personalizedDashboard';
import { useDashboard } from './DashboardContext';
import QuickReminders from './widgets/QuickReminders';
import QuickActions from './widgets/QuickActions';
import PersonalizedChatTeaser from './widgets/PersonalizedChatTeaser';
import PersonalizedAnalytics from './widgets/PersonalizedAnalytics';

export default function DashboardHome() {
  const { currentMood, getMoodConfig } = useMood();
  const { profile } = useProfile();
  const { settings } = useAppSettings();
  const { setView } = useDashboard();
  const moodConfig = getMoodConfig();

  const currentTime = new Date();
  const dateFormatted = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Contexte personnalisé
  const dashboardContext = {
    profile,
    currentMood,
    currentTime
  };

  // Modules recommandés : personnalisés si profil complet, sinon mood standard
  const recommendedModules = profile.onboardingCompleted && profile.challenges.length > 0
    ? getPriorityModulesForChallenges(profile.challenges)
    : getRecommendedModules(currentMood);

  // Médications du jour
  const todayMedications = getTodayMedications(profile);
  
  // Suggestions chronotype
  const chronotypeSuggestion = getChronotypeTimingSuggestions(dashboardContext);
  
  // Analytics personnalisées
  const personalizedAnalytics = getPersonalizedAnalyticsInsights(profile);

  return (
    <div className="space-y-8">
      {/* Header avec salutation personnalisée */}
      <div className={`text-center p-8 rounded-3xl glow-${currentMood}`} style={{ backgroundColor: 'var(--mood-secondary)' }}>
        <div className={`text-4xl mb-4 animated-emoji`}>
          {settings.avatar || moodConfig.emoji}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--mood-text)' }}>
          {profile.name && profile.onboardingCompleted 
            ? getPersonalizedDashboardGreeting(dashboardContext)
            : getPersonalizedGreeting(currentMood)
          }
        </h1>
        <p className="text-sm opacity-60" style={{ color: 'var(--mood-text)' }}>
          {dateFormatted}
          {profile.name && (
            <> • Salut {profile.name} ! Comment tu te sens aujourd'hui ?</>
          )}
        </p>
      </div>

      {/* Rappels médications personnels */}
      {todayMedications.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-800">
            <span className="text-xl">💊</span>
            Mes rappels aujourd'hui ({todayMedications.length})
          </h3>
          
          <div className="grid gap-3">
            {todayMedications.map(med => (
              <div 
                key={med.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  med.status === 'now' ? 'bg-orange-100 border-orange-300' :
                  med.status === 'missed' ? 'bg-red-100 border-red-300' :
                  med.status === 'taken' ? 'bg-green-100 border-green-300' :
                  'bg-white border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${
                    med.status === 'now' ? '⏰' :
                    med.status === 'missed' ? '⚠️' :
                    med.status === 'taken' ? '✅' :
                    '💊'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800">{med.name}</p>
                    <p className="text-sm text-gray-600">{med.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    med.status === 'now' ? 'text-orange-700' :
                    med.status === 'missed' ? 'text-red-700' :
                    med.status === 'taken' ? 'text-green-700' :
                    'text-blue-700'
                  }`}>
                    {med.timeUntil}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion chronotype */}
      {chronotypeSuggestion && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">Timing optimal</h3>
              <p className="text-sm text-orange-700">{chronotypeSuggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modules prioritaires selon défis ADHD ou mood */}
      {recommendedModules.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--mood-text)' }}>
            <span className="text-xl">🎯</span>
            {profile.onboardingCompleted && profile.challenges.length > 0 
              ? 'Mes modules prioritaires (selon tes défis ADHD)'
              : `Recommandé pour ton mood ${moodConfig.label}`
            }
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedModules.map(module => {
              const moduleId = (module as any).moduleId || (module as any).id;
              const reason = (module as any).reason;
              
              return (
                <button
                  key={moduleId}
                  onClick={() => setView(moduleId)}
                  className={`
                    p-4 rounded-xl border-2 transition-all hover:scale-105
                    ${moodConfig.bgColor} ${moodConfig.textColor} border-current
                    hover:shadow-lg
                  `}
                >
                  <div className="text-left">
                    <p className="font-medium mb-1">
                      {getModuleLabel(moduleId)}
                    </p>
                    <p className="text-sm opacity-80">
                      {reason}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Métriques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl ${moodConfig.bgColor} ${moodConfig.textColor}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💪</span>
            <div>
              <p className="font-semibold">Mode {moodConfig.label}</p>
              <p className="text-sm opacity-80">{moodConfig.description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-semibold" style={{ color: 'var(--mood-text)' }}>Aujourd'hui</p>
              <p className="text-sm opacity-70" style={{ color: 'var(--mood-text)' }}>
                {currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold" style={{ color: 'var(--mood-text)' }}>
                {profile.onboardingCompleted && profile.challenges.length > 0
                  ? `Focus: ${profile.challenges[0].replace('-', ' ')}`
                  : 'Focus du jour'
                }
              </p>
              <p className="text-sm opacity-70" style={{ color: 'var(--mood-text)' }}>
                {profile.onboardingCompleted && profile.challenges.length > 0
                  ? 'Ton défi prioritaire'
                  : 'Prendre soin de soi'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets personnalisés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalizedChatTeaser />
        <PersonalizedAnalytics />
      </div>
      
      {/* Widgets secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickReminders />
        <QuickActions />
      </div>

      {/* Messages motivationnel et de soutien */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${moodConfig.bgColor} ${moodConfig.textColor}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💪</span>
            <div>
              <h3 className="font-semibold mb-2">Message motivationnel</h3>
              <p className="text-sm opacity-90">
                {getMotivationalMessage(currentMood)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl bg-white/70 backdrop-blur-sm border`} style={{ borderColor: 'var(--mood-border)' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤗</span>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--mood-text)' }}>
                Message de soutien
              </h3>
              <p className="text-sm opacity-80" style={{ color: 'var(--mood-text)' }}>
                {getSupportiveMessage(currentMood)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prochaines actions suggérées */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--mood-text)' }}>
          <span className="text-xl">🚀</span>
          Suggestions pour aujourd'hui
        </h3>
        
        <div className="space-y-3">
          {getSuggestions(currentMood).map((suggestion, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <span className="text-lg">{suggestion.icon}</span>
              <p className="text-sm text-slate-700">{suggestion.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getMoodTip(mood: string): string {
  const tips = {
    energetic: "Profite de cette énergie ! C'est le moment parfait pour tacler les tâches importantes et créatives. N'oublie pas de prendre des pauses pour ne pas t'épuiser.",
    normal: "Tu es dans un bon équilibre aujourd'hui. C'est parfait pour avancer sur tes projets de façon régulière et prendre soin de toi.",
    tired: "C'est ok d'être fatigué. Concentre-toi sur les essentiels et n'hésite pas à te reposer. Ton corps et ton esprit ont besoin de récupérer.",
    stressed: "Respire profondément. Priorise ce qui est vraiment urgent et laisse le reste pour plus tard. Une chose à la fois, tu y arriveras.",
    sad: "Sois doux/douce avec toi-même aujourd'hui. Il n'y a pas de pression à être productif/ve. Fais ce qui te fait du bien et demande de l'aide si besoin."
  };
  return tips[mood as keyof typeof tips] || tips.normal;
}

function getModuleLabel(moduleId: string): string {
  const labels: Record<string, string> = {
    'chat': '💬 Chat Claude',
    'reminders': '⏰ Rappels',
    'cooking': '🍳 Cuisine',
    'checklists': '📋 Checklists',
    'finance': '💰 Finances',
    'cleaning': '🧹 Ménage',
    'health': '🏥 Santé',
    'analytics': '📈 Analytics',
    'tasks': '✅ Tâches',
    'focus': '🎯 Focus'
  };
  return labels[moduleId] || moduleId;
}

function getSuggestions(mood: string): Array<{icon: string, text: string}> {
  const suggestions = {
    energetic: [
      { icon: '🎯', text: 'Commence une session de focus sur ton projet principal' },
      { icon: '📝', text: 'Écris tes idées créatives du moment' },
      { icon: '🏃‍♀️', text: 'Profite de cette énergie pour bouger un peu' }
    ],
    normal: [
      { icon: '📋', text: 'Révise ta liste de tâches et priorise' },
      { icon: '💬', text: 'Parle à Claude de tes objectifs du jour' },
      { icon: '🧘‍♀️', text: 'Prends 5 minutes pour méditer' }
    ],
    tired: [
      { icon: '☕', text: 'Bois un verre d\'eau ou une tisane' },
      { icon: '🛏️', text: 'Accorde-toi une sieste de 20 minutes' },
      { icon: '🎵', text: 'Écoute de la musique relaxante' }
    ],
    stressed: [
      { icon: '🫁', text: 'Fais 3 respirations profondes maintenant' },
      { icon: '📝', text: 'Écris ce qui te stresse pour vider ta tête' },
      { icon: '🚶‍♀️', text: 'Sors prendre l\'air 5 minutes' }
    ],
    sad: [
      { icon: '🤗', text: 'Contacte un proche qui te fait du bien' },
      { icon: '🎬', text: 'Regarde quelque chose qui te réconforte' },
      { icon: '🛁', text: 'Prends un bain ou une douche chaude' }
    ]
  };
  return suggestions[mood as keyof typeof suggestions] || suggestions.normal;
}