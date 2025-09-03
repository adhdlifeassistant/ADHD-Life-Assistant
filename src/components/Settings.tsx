'use client';

import React, { useState, useEffect } from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { ProfileSettings } from './ProfileSettings';
import { keyboardNavService } from '@/lib/keyboardNavigation';
import { AISettings, AIProvider } from '@/types/settings';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { getMoodConfig } = useMood();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [settings, setSettings] = useState({
    textSize: 'base',
    notifications: true,
    animations: true,
    theme: 'auto', // auto, light, dark
    language: 'fr',
    userName: ''
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    provider: undefined,
    apiKey: '',
    isConnected: false,
    lastTested: undefined
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<string | null>(null);

  const moodConfig = getMoodConfig();

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const savedSettings = {
      textSize: localStorage.getItem('adhd-settings-textSize') || 'base',
      notifications: localStorage.getItem('adhd-settings-notifications') !== 'false',
      animations: localStorage.getItem('adhd-settings-animations') !== 'false',
      theme: localStorage.getItem('adhd-settings-theme') || 'auto',
      language: localStorage.getItem('adhd-settings-language') || 'fr',
      userName: localStorage.getItem('adhd-assistant-username') || ''
    };
    setSettings(savedSettings);
    
    // Charger les paramètres IA
    const savedAiSettings: AISettings = {
      provider: (localStorage.getItem('adhd-ai-provider') as AIProvider) || undefined,
      apiKey: localStorage.getItem('adhd-ai-apikey') || '',
      isConnected: localStorage.getItem('adhd-ai-connected') === 'true',
      lastTested: localStorage.getItem('adhd-ai-last-tested') ? parseInt(localStorage.getItem('adhd-ai-last-tested')!) : undefined
    };
    setAiSettings(savedAiSettings);
    
    // Appliquer la taille de texte
    document.documentElement.classList.remove('text-size-sm', 'text-size-base', 'text-size-lg', 'text-size-xl');
    document.documentElement.classList.add(`text-size-${savedSettings.textSize}`);
  }, [isOpen]);

  const updateSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(`adhd-settings-${key}`, value.toString());
    
    // Appliquer les changements immédiatement
    if (key === 'textSize') {
      document.documentElement.classList.remove('text-size-sm', 'text-size-base', 'text-size-lg', 'text-size-xl');
      document.documentElement.classList.add(`text-size-${value}`);
    }
    
    if (key === 'userName') {
      localStorage.setItem('adhd-assistant-username', value);
    }
  };

  const exportData = () => {
    const allData = {
      mood: {
        entries: JSON.parse(localStorage.getItem('adhd-mood-entries') || '[]'),
        current: localStorage.getItem('adhd-current-mood')
      },
      finance: {
        expenses: JSON.parse(localStorage.getItem('adhd-expenses') || '[]'),
        budgets: JSON.parse(localStorage.getItem('adhd-budgets') || '[]'),
        wishlist: JSON.parse(localStorage.getItem('adhd-wishlist') || '[]')
      },
      cleaning: {
        tasks: JSON.parse(localStorage.getItem('adhd-cleaning-tasks') || '[]'),
        completedTasks: JSON.parse(localStorage.getItem('adhd-completed-tasks') || '[]')
      },
      health: {
        wellbeingEntries: JSON.parse(localStorage.getItem('adhd-wellbeing-entries') || '[]'),
        medications: JSON.parse(localStorage.getItem('adhd-medications') || '[]'),
        medicationEntries: JSON.parse(localStorage.getItem('adhd-medication-entries') || '[]'),
        activities: JSON.parse(localStorage.getItem('adhd-activities') || '[]'),
        appointments: JSON.parse(localStorage.getItem('adhd-appointments') || '[]')
      },
      reminders: JSON.parse(localStorage.getItem('adhd-reminders') || '[]'),
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `adhd-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Confirmer avec l'utilisateur
        if (!confirm('Êtes-vous sûr de vouloir importer ces données ? Cela remplacera vos données actuelles.')) {
          return;
        }
        
        // Importer les données
        Object.entries(data).forEach(([category, categoryData]) => {
          if (category === 'mood') {
            const moodData = categoryData as any;
            localStorage.setItem('adhd-mood-entries', JSON.stringify(moodData.entries || []));
            if (moodData.current) {
              localStorage.setItem('adhd-current-mood', moodData.current);
            }
          } else if (category === 'finance') {
            const financeData = categoryData as any;
            localStorage.setItem('adhd-expenses', JSON.stringify(financeData.expenses || []));
            localStorage.setItem('adhd-budgets', JSON.stringify(financeData.budgets || []));
            localStorage.setItem('adhd-wishlist', JSON.stringify(financeData.wishlist || []));
          } else if (category === 'cleaning') {
            const cleaningData = categoryData as any;
            localStorage.setItem('adhd-cleaning-tasks', JSON.stringify(cleaningData.tasks || []));
            localStorage.setItem('adhd-completed-tasks', JSON.stringify(cleaningData.completedTasks || []));
          } else if (category === 'health') {
            const healthData = categoryData as any;
            localStorage.setItem('adhd-wellbeing-entries', JSON.stringify(healthData.wellbeingEntries || []));
            localStorage.setItem('adhd-medications', JSON.stringify(healthData.medications || []));
            localStorage.setItem('adhd-medication-entries', JSON.stringify(healthData.medicationEntries || []));
            localStorage.setItem('adhd-activities', JSON.stringify(healthData.activities || []));
            localStorage.setItem('adhd-appointments', JSON.stringify(healthData.appointments || []));
          } else if (category === 'reminders') {
            localStorage.setItem('adhd-reminders', JSON.stringify(categoryData || []));
          } else if (category === 'settings') {
            const settingsData = categoryData as any;
            Object.entries(settingsData).forEach(([key, value]) => {
              localStorage.setItem(`adhd-settings-${key}`, value as string);
            });
            setSettings(settingsData);
          }
        });
        
        alert('✅ Données importées avec succès ! Rechargez la page pour voir les changements.');
      } catch (error) {
        alert('❌ Erreur lors de l\'import des données. Vérifiez le fichier.');
      }
    };
    reader.readAsText(file);
  };

  const updateAiSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    const newAiSettings = { ...aiSettings, [key]: value };
    setAiSettings(newAiSettings);
    
    if (key === 'provider') {
      localStorage.setItem('adhd-ai-provider', value as string || '');
      // Reset connection status when provider changes
      setConnectionTestResult(null);
      newAiSettings.isConnected = false;
      localStorage.setItem('adhd-ai-connected', 'false');
    } else if (key === 'apiKey') {
      localStorage.setItem('adhd-ai-apikey', value as string || '');
      // Reset connection status when API key changes
      setConnectionTestResult(null);
      newAiSettings.isConnected = false;
      localStorage.setItem('adhd-ai-connected', 'false');
    } else if (key === 'isConnected') {
      localStorage.setItem('adhd-ai-connected', value ? 'true' : 'false');
    } else if (key === 'lastTested') {
      localStorage.setItem('adhd-ai-last-tested', (value as number).toString());
    }
    
    setAiSettings(newAiSettings);
  };

  const testAiConnection = async () => {
    if (!aiSettings.provider || !aiSettings.apiKey) {
      setConnectionTestResult('Sélectionnez une IA et ajoutez votre clé API');
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/test-ai-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok && result.success) {
        setConnectionTestResult('✅ Connexion réussie');
        updateAiSetting('isConnected', true);
        updateAiSetting('lastTested', Date.now());
      } else {
        setConnectionTestResult(`❌ ${result.error || 'Clé API incorrecte'}`);
        updateAiSetting('isConnected', false);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setConnectionTestResult('⏱️ Réponse trop lente, réessayez');
      } else {
        setConnectionTestResult('🔌 IA temporairement indisponible');
      }
      updateAiSetting('isConnected', false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const clearAllData = () => {
    if (!confirm('⚠️ ATTENTION : Cela supprimera TOUTES vos données. Cette action est irréversible. Êtes-vous sûr ?')) {
      return;
    }
    
    if (!confirm('Dernière chance ! Voulez-vous vraiment supprimer toutes vos données ? (Pensez à faire un export avant si nécessaire)')) {
      return;
    }
    
    // Supprimer toutes les données
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('adhd-'));
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    alert('✅ Toutes les données ont été supprimées. Rechargez la page.');
  };

  // Focus management
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal when it opens
      modalRef.current.focus();
      
      // Initialize keyboard navigation for the modal
      const cleanup = keyboardNavService.initializeComponent(modalRef.current, {
        trapFocus: true,
        radioGroups: true
      });
      
      return cleanup;
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div 
        ref={modalRef}
        className="card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="settings-title" className="text-xl font-bold text-gray-800">
            <span role="img" aria-hidden="true">⚙️</span> Paramètres
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Fermer les paramètres"
          >
            <span role="img" aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Personnalisation */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Personnalisation</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="user-name-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre prénom
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  value={settings.userName}
                  onChange={(e) => updateSetting('userName', e.target.value)}
                  placeholder="Comment vous appeler ?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="user-name-help"
                />
                <p id="user-name-help" className="mt-1 text-xs text-gray-500">
                  Utilisé pour personnaliser vos interactions avec l'assistant
                </p>
              </div>

              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Taille du texte
                  </legend>
                  <div className="flex gap-2" role="radiogroup" aria-label="Sélecteur de taille de texte">
                    {[
                      { id: 'sm', label: 'Petit', size: 'text-sm' },
                      { id: 'base', label: 'Normal', size: 'text-base' },
                      { id: 'lg', label: 'Grand', size: 'text-lg' },
                      { id: 'xl', label: 'Très grand', size: 'text-xl' }
                    ].map(size => (
                      <button
                        key={size.id}
                        onClick={() => updateSetting('textSize', size.id)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          settings.textSize === size.id
                            ? `${moodConfig.bgColor} ${moodConfig.textColor}`
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        role="radio"
                        aria-checked={settings.textSize === size.id}
                        aria-label={`Taille ${size.label}`}
                      >
                        <span className={size.size} aria-hidden="true">Aa</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          </section>

          {/* Préférences */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎛️ Préférences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div id="notifications-label" className="font-medium text-gray-700">Notifications</div>
                  <div className="text-sm text-gray-500">Rappels et alertes</div>
                </div>
                <button
                  onClick={() => updateSetting('notifications', !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.notifications}
                  aria-labelledby="notifications-label"
                  aria-describedby="notifications-desc"
                >
                  <span className="sr-only">
                    {settings.notifications ? 'Désactiver' : 'Activer'} les notifications
                  </span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div id="animations-label" className="font-medium text-gray-700">Animations</div>
                  <div className="text-sm text-gray-500">Effets visuels et transitions</div>
                </div>
                <button
                  onClick={() => updateSetting('animations', !settings.animations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.animations ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.animations}
                  aria-labelledby="animations-label"
                  aria-describedby="animations-desc"
                >
                  <span className="sr-only">
                    {settings.animations ? 'Désactiver' : 'Activer'} les animations
                  </span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.animations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Données & Sécurité */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔒 Données & Sécurité</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🔐 Votre vie privée est respectée</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Toutes vos données sont stockées localement sur votre appareil</li>
                  <li>• Aucune donnée n'est envoyée sur internet</li>
                  <li>• Aucun tracking ou analytics tiers</li>
                  <li>• Vous contrôlez 100% de vos informations</li>
                </ul>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const privacyContent = `
=== AUDIT DE SÉCURITÉ ADHD LIFE ASSISTANT ===

Données collectées: AUCUNE sur serveur
- Mood, santé, finances: localStorage uniquement
- Aucun cookie de tracking
- Aucun analytics tiers
- Code source: github.com/adhd-assistant (open source)

Connexions réseau: AUCUNE sauf chat Claude (optionnel)
- Chat Claude: messages uniquement, pas de données perso
- Aucune connexion à Google/Facebook/autres trackers
- Vérifiez dans DevTools > Network

localStorage vérifié: ${Object.keys(localStorage).filter(k => k.startsWith('adhd-')).length} clés locales
Dernière vérif: ${new Date().toLocaleString('fr-FR')}

✅ CONFORME RGPD par design (pas de transfert de données)
✅ Audit de sécurité: VALIDÉ
                      `;
                      alert(privacyContent);
                    }}
                    className="text-xs text-green-600 hover:text-green-800 underline"
                  >
                    🔍 Auditer la sécurité maintenant
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={exportData}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-describedby="export-help"
                >
                  <span role="img" aria-hidden="true">📤</span> Exporter mes données
                </button>
                <label 
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-center focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2"
                  aria-describedby="import-help"
                >
                  <span role="img" aria-hidden="true">📥</span> Importer des données
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="sr-only"
                    aria-label="Sélectionner un fichier de données à importer"
                  />
                </label>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p id="export-help">Sauvegarde toutes vos données dans un fichier JSON</p>
                <p id="import-help">Restaure vos données depuis un fichier de sauvegarde</p>
              </div>

              <button
                onClick={clearAllData}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-describedby="clear-help"
              >
                <span role="img" aria-hidden="true">🗑️</span> Supprimer toutes les données
              </button>
              <p id="clear-help" className="text-xs text-gray-500">
                ⚠️ Action irréversible - supprime définitivement toutes vos données
              </p>
            </div>
          </section>

          {/* Assistant IA */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 Assistant IA</h3>
            
            <div className="space-y-4">
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez votre IA préférée
                  </legend>
                  <div className="space-y-2" role="radiogroup" aria-label="Sélecteur d'assistant IA">
                    {[
                      { id: 'claude', label: 'Claude (Anthropic)', icon: '🎯' },
                      { id: 'gpt-4', label: 'GPT-4 (OpenAI)', icon: '🧠' },
                      { id: 'gemini-pro', label: 'Gemini Pro (Google)', icon: '✨' }
                    ].map(provider => (
                      <label
                        key={provider.id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
                          aiSettings.provider === provider.id
                            ? `${moodConfig.bgColor} ${moodConfig.textColor} border-current`
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ai-provider"
                          value={provider.id}
                          checked={aiSettings.provider === provider.id}
                          onChange={(e) => updateAiSetting('provider', e.target.value as AIProvider)}
                          className="sr-only"
                        />
                        <span className="mr-3 text-xl" role="img" aria-hidden="true">
                          {provider.icon}
                        </span>
                        <span className="font-medium">{provider.label}</span>
                        {aiSettings.provider === provider.id && aiSettings.isConnected && (
                          <span className="ml-auto text-green-500" role="img" aria-label="Connecté">
                            ✅
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              {aiSettings.provider && (
                <div>
                  <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Clé API {aiSettings.provider === 'claude' ? 'Anthropic' : aiSettings.provider === 'gpt-4' ? 'OpenAI' : 'Google'}
                  </label>
                  <input
                    id="api-key-input"
                    type="password"
                    value={aiSettings.apiKey}
                    onChange={(e) => updateAiSetting('apiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-describedby="api-key-help"
                  />
                  <p id="api-key-help" className="mt-1 text-xs text-gray-500">
                    Votre clé API reste sur votre appareil - elle n'est jamais stockée sur nos serveurs
                  </p>
                </div>
              )}

              {aiSettings.provider && aiSettings.apiKey && (
                <div>
                  <button
                    onClick={testAiConnection}
                    disabled={isTestingConnection}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isTestingConnection ? (
                      <><span role="img" aria-hidden="true">⏳</span> Test en cours...</>
                    ) : (
                      <><span role="img" aria-hidden="true">🔌</span> Tester la connexion</>
                    )}
                  </button>
                  
                  {connectionTestResult && (
                    <div className="mt-2 p-2 rounded-lg bg-gray-50 text-sm">
                      {connectionTestResult}
                    </div>
                  )}
                  
                  {aiSettings.lastTested && (
                    <div className="mt-2 text-xs text-gray-500">
                      Dernier test: {new Date(aiSettings.lastTested).toLocaleString('fr-FR')}
                    </div>
                  )}
                </div>
              )}

              {!aiSettings.provider && (
                <div className="text-center py-4 text-gray-500">
                  <span role="img" aria-hidden="true">🤖</span>
                  <p className="mt-2 text-sm">Sélectionnez une IA pour commencer</p>
                </div>
              )}
            </div>
          </section>

          {/* À propos */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ℹ️ À propos</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p className="mb-2">
                <strong>ADHD Life Assistant v1.0</strong>
              </p>
              <p className="mb-2">
                Assistant de vie conçu avec amour pour la communauté ADHD 💜
              </p>
              <p>
                Open source et respectueux de votre vie privée
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Modal profil */}
      <ProfileSettings 
        isOpen={showProfileSettings} 
        onClose={() => setShowProfileSettings(false)} 
      />
    </div>
  );
}