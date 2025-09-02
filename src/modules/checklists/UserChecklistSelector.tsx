'use client';

import React, { useState } from 'react';
import { useChecklists } from './ChecklistContext';
import { ChecklistEditor } from './ChecklistEditor';
import { useMood } from '@/modules/mood/MoodContext';
import { UserChecklist } from '@/types/checklists';

interface UserChecklistSelectorProps {
  onChecklistSelect: (checklistId: string) => void;
}

export function UserChecklistSelector({ onChecklistSelect }: UserChecklistSelectorProps) {
  const { 
    userChecklists, 
    usageStats, 
    createChecklist, 
    updateChecklist, 
    deleteChecklist, 
    duplicateChecklist,
    getSystemTemplates,
    createFromTemplate,
    getPersonalizedRecommendations 
  } = useChecklists();
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();
  
  const [view, setView] = useState<'selector' | 'editor' | 'stats'>('selector');
  const [editingChecklist, setEditingChecklist] = useState<UserChecklist | null>(null);
  const [filter, setFilter] = useState<'all' | 'custom' | 'system'>('all');
  
  const recommendations = getPersonalizedRecommendations();
  const systemTemplates = getSystemTemplates();
  
  // Filtrer et trier les checklists
  const filteredChecklists = userChecklists
    .filter(checklist => {
      if (filter === 'custom') return checklist.isCustom;
      if (filter === 'system') return !checklist.isCustom;
      return true;
    })
    .sort((a, b) => {
      // Templates système d'abord, puis par usage
      if (!a.isCustom && b.isCustom) return -1;
      if (a.isCustom && !b.isCustom) return 1;
      return b.timesUsed - a.timesUsed;
    });

  const getColorClasses = (color: string, isHovered: boolean = false) => {
    const colors = {
      blue: isHovered ? 'bg-blue-100 border-blue-300' : 'bg-blue-50 border-blue-200',
      green: isHovered ? 'bg-green-100 border-green-300' : 'bg-green-50 border-green-200',
      orange: isHovered ? 'bg-orange-100 border-orange-300' : 'bg-orange-50 border-orange-200',
      purple: isHovered ? 'bg-purple-100 border-purple-300' : 'bg-purple-50 border-purple-200',
      indigo: isHovered ? 'bg-indigo-100 border-indigo-300' : 'bg-indigo-50 border-indigo-200',
      pink: isHovered ? 'bg-pink-100 border-pink-300' : 'bg-pink-50 border-pink-200',
      red: isHovered ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200',
      yellow: isHovered ? 'bg-yellow-100 border-yellow-300' : 'bg-yellow-50 border-yellow-200',
      gray: isHovered ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTimeColor = (time: number) => {
    if (time <= 3) return 'text-green-600 bg-green-100';
    if (time <= 5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const handleCreateNew = () => {
    setEditingChecklist(null);
    setView('editor');
  };

  const handleEdit = (checklist: UserChecklist) => {
    setEditingChecklist(checklist);
    setView('editor');
  };

  const handleSave = (checklist: UserChecklist) => {
    if (editingChecklist) {
      updateChecklist(checklist.id, checklist);
    } else {
      createChecklist(checklist);
    }
    setView('selector');
    setEditingChecklist(null);
  };

  const handleDuplicate = (checklist: UserChecklist) => {
    duplicateChecklist(checklist.id, `${checklist.name} (Copie)`);
  };

  const handleDelete = (checklist: UserChecklist) => {
    if (confirm(`Supprimer "${checklist.name}" ? Cette action est irréversible.`)) {
      deleteChecklist(checklist.id);
    }
  };

  const handleCreateFromTemplate = (templateId: string) => {
    const template = systemTemplates.find(t => t.id === templateId);
    if (template) {
      createFromTemplate(templateId, {
        name: `${template.name} (Personnalisé)`,
        description: `Basé sur le template "${template.name}"`
      });
    }
  };

  if (view === 'editor') {
    return (
      <ChecklistEditor
        checklist={editingChecklist || undefined}
        onSave={handleSave}
        onCancel={() => setView('selector')}
      />
    );
  }

  if (view === 'stats') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('selector')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
            📊 Tes statistiques checklists
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
              {usageStats.totalChecklistsCreated}
            </div>
            <div className="text-sm opacity-70" style={{ color: 'var(--mood-text)' }}>
              Checklists créées
            </div>
          </div>

          <div className="bg-white/70 p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
              {usageStats.totalChecklistsCompleted}
            </div>
            <div className="text-sm opacity-70" style={{ color: 'var(--mood-text)' }}>
              Sessions terminées
            </div>
          </div>

          <div className="bg-white/70 p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
              {usageStats.completionStreak}
            </div>
            <div className="text-sm opacity-70" style={{ color: 'var(--mood-text)' }}>
              Jours d'affilée
            </div>
          </div>

          <div className="bg-white/70 p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
              {Math.round(usageStats.averageCompletionTime / 60)}min
            </div>
            <div className="text-sm opacity-70" style={{ color: 'var(--mood-text)' }}>
              Temps moyen
            </div>
          </div>
        </div>

        {usageStats.mostUsedChecklist && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">🌟 Checklist favorite</h3>
            <p className="text-purple-700">
              <strong>{usageStats.mostUsedChecklist.name}</strong> - utilisée {usageStats.mostUsedChecklist.timesUsed} fois
            </p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Recommandations</h3>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <p key={index} className="text-green-700 flex items-start gap-2">
                  <span>•</span>
                  <span>{rec}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
          Tes checklists personnelles 🚀
        </h2>
        <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
          Utilise tes templates ou crée-en de nouveaux selon tes besoins
        </p>
      </div>

      {/* Actions principales */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{ backgroundColor: 'var(--mood-primary)' }}
        >
          ✨ Créer nouvelle checklist
        </button>
        <button
          onClick={() => setView('stats')}
          className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
        >
          📊 Mes statistiques
        </button>
      </div>

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">💡 Pour toi</h3>
          <div className="text-sm text-green-700 space-y-1">
            {recommendations.map((rec, index) => (
              <p key={index}>• {rec}</p>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 justify-center">
        {[
          { value: 'all', label: '🔍 Toutes' },
          { value: 'custom', label: '✨ Mes créations' },
          { value: 'system', label: '📋 Templates' }
        ].map(filterOption => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value as any)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === filterOption.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Templates système suggérés pour création */}
      {filter === 'all' && systemTemplates.length > 0 && (
        <div className="bg-white/50 p-4 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Créer depuis un template</h3>
          <div className="flex flex-wrap gap-2">
            {systemTemplates.slice(0, 3).map(template => (
              <button
                key={template.id}
                onClick={() => handleCreateFromTemplate(template.id)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm border border-blue-200"
              >
                {template.emoji} {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChecklists.map((checklist) => (
          <div
            key={checklist.id}
            className={`
              p-6 rounded-xl border-2 transition-all
              ${getColorClasses(checklist.color)} hover:${getColorClasses(checklist.color, true)}
              hover:shadow-lg relative group
            `}
          >
            {/* Actions dropdown */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button className="p-1 text-gray-500 hover:text-gray-700">⋮</button>
                <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg p-2 space-y-1 min-w-32 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => onChecklistSelect(checklist.id)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  >
                    🚀 Utiliser
                  </button>
                  <button
                    onClick={() => handleEdit(checklist)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDuplicate(checklist)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  >
                    📋 Dupliquer
                  </button>
                  {checklist.isCustom && (
                    <button
                      onClick={() => handleDelete(checklist)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-red-100 text-red-600 rounded"
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">{checklist.emoji}</div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-800">
                    {checklist.name}
                  </h3>
                  {!checklist.isCustom && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                      Template
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 mb-3">
                  {checklist.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className={`px-2 py-1 rounded-full ${getTimeColor(checklist.estimatedTime)}`}>
                    ⏱️ ~{checklist.estimatedTime} min
                  </span>
                  <span className="text-slate-500">
                    📋 {checklist.items.length} items
                  </span>
                  <span className="text-slate-500">
                    ⭐ {checklist.items.filter(item => item.isRequired).length} essentiels
                  </span>
                </div>

                {checklist.timesUsed > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>🔥 Utilisée {checklist.timesUsed} fois</span>
                    {checklist.lastUsedAt && (
                      <span>• Dernière: {new Date(checklist.lastUsedAt).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                )}

                {/* Preview des premiers items */}
                <div className="text-xs text-slate-500">
                  <p className="font-medium mb-1">Aperçu :</p>
                  <div className="space-y-1">
                    {checklist.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-1">
                        <span>{item.emoji}</span>
                        <span>{item.text}</span>
                        {item.isRequired && <span className="text-red-500">*</span>}
                      </div>
                    ))}
                    {checklist.items.length > 3 && (
                      <p className="text-slate-400">+{checklist.items.length - 3} autres...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onChecklistSelect(checklist.id)}
              className="w-full px-4 py-2 bg-white/80 hover:bg-white text-slate-800 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              🚀 Utiliser cette checklist
            </button>
          </div>
        ))}
      </div>

      {filteredChecklists.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">
            {filter === 'custom' ? 'Aucune checklist personnelle' : 'Aucune checklist trouvée'}
          </h3>
          <p className="mb-6">
            {filter === 'custom' 
              ? 'Crée ta première checklist sur mesure !' 
              : 'Commence par créer une nouvelle checklist.'
            }
          </p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: 'var(--mood-primary)' }}
          >
            ✨ Créer ma première checklist
          </button>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white/70 rounded-xl">
          <div className="text-2xl mb-1">📋</div>
          <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
            {userChecklists.length}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Checklists dispo
          </div>
        </div>
        
        <div className="text-center p-4 bg-white/70 rounded-xl">
          <div className="text-2xl mb-1">✅</div>
          <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
            {usageStats.totalChecklistsCompleted}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Sessions terminées
          </div>
        </div>
        
        <div className="text-center p-4 bg-white/70 rounded-xl">
          <div className="text-2xl mb-1">🔥</div>
          <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
            {usageStats.completionStreak}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Série actuelle
          </div>
        </div>
        
        <div className="text-center p-4 bg-white/70 rounded-xl">
          <div className="text-2xl mb-1">🧠</div>
          <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
            ADHD
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Friendly
          </div>
        </div>
      </div>
    </div>
  );
}