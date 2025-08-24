'use client';

import React, { useState } from 'react';
import { ChecklistItem, ChecklistStats, ActiveChecklist } from '@/types/checklists';
import { useMood } from '@/modules/mood/MoodContext';

interface InteractiveChecklistProps {
  checklist: ActiveChecklist;
  onToggleItem: (itemId: string) => void;
  onAddCustomItem: (text: string, emoji: string) => void;
  onRemoveCustomItem: (itemId: string) => void;
  onComplete: () => void;
  onBack: () => void;
  stats: ChecklistStats;
}

export default function InteractiveChecklist({
  checklist,
  onToggleItem,
  onAddCustomItem,
  onRemoveCustomItem,
  onComplete,
  onBack,
  stats
}: InteractiveChecklistProps) {
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();
  
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemEmoji, setNewItemEmoji] = useState('📝');

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddCustomItem(newItemText.trim(), newItemEmoji);
      setNewItemText('');
      setNewItemEmoji('📝');
      setShowAddItem(false);
    }
  };

  const getCategoryItems = (category: string) => {
    return checklist.items.filter(item => item.category === category);
  };

  const getUncategorizedItems = () => {
    return checklist.items.filter(item => !item.category || item.isCustom);
  };

  const categories = [
    ...new Set(checklist.items.filter(item => item.category && !item.isCustom).map(item => item.category).filter(Boolean))
  ] as string[];

  const renderItem = (item: ChecklistItem) => (
    <div
      key={item.id}
      className={`
        flex items-center gap-4 p-3 rounded-lg border transition-all
        ${item.isChecked 
          ? 'bg-green-50 border-green-200' 
          : item.isRequired 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-white border-slate-200'
        }
        hover:shadow-md
      `}
    >
      <button
        onClick={() => onToggleItem(item.id)}
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
          ${item.isChecked 
            ? 'bg-green-500 border-green-500 text-white' 
            : item.isRequired 
              ? 'border-orange-400 hover:bg-orange-50' 
              : 'border-slate-300 hover:bg-slate-50'
          }
        `}
      >
        {item.isChecked && '✓'}
      </button>
      
      <span className="text-2xl">{item.emoji}</span>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${item.isChecked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
            {item.text}
          </span>
          {item.isRequired && !item.isChecked && (
            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
              Essentiel
            </span>
          )}
          {item.isCustom && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Perso
            </span>
          )}
        </div>
        {item.tips && (
          <p className="text-xs text-slate-500 mt-1">💡 {item.tips}</p>
        )}
      </div>
      
      {item.isCustom && (
        <button
          onClick={() => onRemoveCustomItem(item.id)}
          className="text-red-400 hover:text-red-600 p-1"
        >
          🗑️
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/50 transition-colors"
        >
          ← Retour
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{checklist.name.includes('travail') ? '🏢' : 
                                        checklist.name.includes('courses') ? '🛒' : 
                                        checklist.name.includes('sport') ? '🏃‍♀️' : 
                                        checklist.name.includes('rendez-vous') ? '👥' : 
                                        checklist.name.includes('voyage') ? '✈️' : '📋'}</span>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
                {checklist.name}
              </h1>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Checklist anti-oublis ADHD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className={`p-6 rounded-xl ${moodConfig.bgColor} ${moodConfig.textColor}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            Progression : {stats.checkedItems}/{stats.totalItems}
          </h3>
          <span className="text-sm opacity-80">
            {Math.round(stats.progressPercentage)}% complété
          </span>
        </div>
        
        <div className="w-full bg-white/30 rounded-full h-3 mb-4">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>
            ⭐ Items essentiels : {stats.checkedRequiredItems}/{stats.requiredItems}
          </span>
          {stats.isReadyToGo && (
            <span className="font-bold animate-pulse">
              🚀 Prêt(e) à partir !
            </span>
          )}
        </div>
      </div>

      {/* Items par catégorie */}
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h4 className="font-semibold text-lg capitalize" style={{ color: 'var(--mood-text)' }}>
              📂 {category}
            </h4>
            <div className="space-y-3">
              {getCategoryItems(category).map((item) => renderItem(item))}
            </div>
          </div>
        ))}

        {/* Items sans catégorie et personnalisés */}
        {getUncategorizedItems().length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg" style={{ color: 'var(--mood-text)' }}>
              📝 Autres & Personnalisé
            </h4>
            <div className="space-y-3">
              {getUncategorizedItems().map(renderItem)}
            </div>
          </div>
        )}
      </div>

      {/* Ajout d'item personnalisé */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        {!showAddItem ? (
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-3 w-full p-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-slate-600">Ajouter un item personnalisé</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <select
                value={newItemEmoji}
                onChange={(e) => setNewItemEmoji(e.target.value)}
                className="w-16 p-2 rounded-lg border border-slate-200 text-center"
              >
                <option value="📝">📝</option>
                <option value="🎒">🎒</option>
                <option value="📱">📱</option>
                <option value="🔑">🔑</option>
                <option value="💳">💳</option>
                <option value="🧴">🧴</option>
                <option value="📄">📄</option>
                <option value="🎫">🎫</option>
              </select>
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="ex: Parapluie, Chargeur voiture..."
                className="flex-1 p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                disabled={!newItemText.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setShowAddItem(false);
                  setNewItemText('');
                  setNewItemEmoji('📝');
                }}
                className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bouton final */}
      {stats.isReadyToGo ? (
        <div className="text-center">
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-3 px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 hover:scale-105 transition-all shadow-lg animate-pulse"
          >
            🚀 C'EST PARTI !
          </button>
          <p className="text-sm mt-2 opacity-80" style={{ color: 'var(--mood-text)' }}>
            Tous les items essentiels sont cochés ! 🎉
          </p>
        </div>
      ) : (
        <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
          <p className="font-medium text-orange-800 mb-2">
            ⚠️ Il reste {stats.requiredItems - stats.checkedRequiredItems} item(s) essentiel(s)
          </p>
          <p className="text-sm text-orange-600">
            Coche les items marqués "Essentiel" avant de partir !
          </p>
        </div>
      )}

      {/* Message d'encouragement */}
      <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
        <p className="text-sm opacity-80" style={{ color: 'var(--mood-text)' }}>
          {getEncouragementMessage(stats.progressPercentage)}
        </p>
      </div>
    </div>
  );
}

function getEncouragementMessage(progress: number): string {
  if (progress === 100) return "🎉 Parfait ! Tu n'as rien oublié ! Passe une excellente journée !";
  if (progress >= 80) return "💪 Presque fini ! Plus que quelques détails et tu es paré(e) !";
  if (progress >= 50) return "👍 Tu avances bien ! Continue comme ça, tu y es presque !";
  if (progress >= 25) return "🌟 Bon début ! Prends ton temps, chaque item coché compte !";
  return "🚀 C'est parti ! Coche les items au fur et à mesure que tu les prépares !";
}