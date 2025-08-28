'use client';

import React from 'react';
import ModuleGridHome from '@/components/ModuleGridHome';

export default function DashboardHome() {
  return <ModuleGridHome />;
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