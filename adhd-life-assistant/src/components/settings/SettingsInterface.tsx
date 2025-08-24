'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PersonalProfileSection } from './PersonalProfileSection';
import { MedicationsSection } from './MedicationsSection';
import { PreferencesSection } from './PreferencesSection';
import { AppSettingsSection } from './AppSettingsSection';
import { DataSection } from './DataSection';

type SettingsSection = 'profile' | 'medications' | 'preferences' | 'app' | 'data';

const SETTINGS_SECTIONS = [
  {
    id: 'profile' as SettingsSection,
    title: 'Profil Personnel',
    icon: '🏷️',
    description: 'Nom, âge, avatar'
  },
  {
    id: 'medications' as SettingsSection,
    title: 'Médications',
    icon: '💊',
    description: 'Gérer vos traitements'
  },
  {
    id: 'preferences' as SettingsSection,
    title: 'Préférences',
    icon: '⏰',
    description: 'Chronotype, défis, notifications'
  },
  {
    id: 'app' as SettingsSection,
    title: 'Paramètres App',
    icon: '🔧',
    description: 'Interface, sons, thème'
  },
  {
    id: 'data' as SettingsSection,
    title: 'Données',
    icon: '💾',
    description: 'Export, import, sauvegarde'
  }
];

export function SettingsInterface() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <PersonalProfileSection />;
      case 'medications':
        return <MedicationsSection />;
      case 'preferences':
        return <PreferencesSection />;
      case 'app':
        return <AppSettingsSection />;
      case 'data':
        return <DataSection />;
      default:
        return <PersonalProfileSection />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            ← Retour
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">⚙️ Paramètres</h1>
            <p className="text-gray-600">Personnalisez votre expérience ADHD</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Navigation sidebar */}
        <div className="lg:col-span-1">
          <div className="card-elevated p-6 sticky top-8">
            <nav className="space-y-2">
              {SETTINGS_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-50 border-2 border-blue-200 text-blue-800'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold mb-1">{section.title}</div>
                      <div className="text-sm opacity-70">{section.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Raccourci vers onboarding */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push('/onboarding')}
                className="w-full p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                🔄 Refaire l'onboarding
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <div className="card-elevated p-6 min-h-[600px]">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}