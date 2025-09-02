'use client';

import React, { useState } from 'react';
import { UserChecklist, ChecklistItem, ChecklistType } from '@/types/checklists';
import { useChecklists } from './ChecklistContext';
import { useMood } from '@/modules/mood/MoodContext';

interface ChecklistEditorProps {
  checklist?: UserChecklist;
  onSave: (checklist: UserChecklist) => void;
  onCancel: () => void;
}

const CHECKLIST_TYPES: { value: ChecklistType; label: string; emoji: string }[] = [
  { value: 'work', label: 'Travail', emoji: '🏢' },
  { value: 'shopping', label: 'Courses', emoji: '🛒' },
  { value: 'sport', label: 'Sport', emoji: '🏃‍♀️' },
  { value: 'appointment', label: 'Rendez-vous', emoji: '👥' },
  { value: 'travel', label: 'Voyage', emoji: '✈️' },
  { value: 'custom', label: 'Personnalisé', emoji: '✨' }
];

const COLOR_OPTIONS = [
  'blue', 'green', 'orange', 'purple', 'indigo', 'pink', 'red', 'yellow', 'gray'
];

const COMMON_EMOJIS = [
  '✅', '📋', '📝', '🎯', '🏃‍♀️', '🏢', '🛒', '👥', '✈️', '🏠', 
  '💊', '🥪', '💻', '🔑', '📱', '🌦️', '💧', '📅', '💳', '🛍️'
];

export function ChecklistEditor({ checklist, onSave, onCancel }: ChecklistEditorProps) {
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();
  
  const [formData, setFormData] = useState({
    name: checklist?.name || '',
    emoji: checklist?.emoji || '📋',
    description: checklist?.description || '',
    type: checklist?.type || 'custom' as ChecklistType,
    color: checklist?.color || 'blue',
    estimatedTime: checklist?.estimatedTime || 5,
    items: checklist?.items || [] as ChecklistItem[]
  });
  
  const [newItem, setNewItem] = useState({
    text: '',
    emoji: '✅',
    isRequired: false,
    category: ''
  });
  
  const [showItemForm, setShowItemForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'Au moins un item est requis';
    }
    
    if (formData.estimatedTime <= 0) {
      newErrors.estimatedTime = 'Le temps estimé doit être positif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const savedChecklist: UserChecklist = {
      id: checklist?.id || `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      emoji: formData.emoji,
      description: formData.description.trim(),
      type: formData.type,
      items: formData.items,
      color: formData.color,
      estimatedTime: formData.estimatedTime,
      isTemplate: false,
      isCustom: true,
      createdAt: checklist?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: 'user',
      timesUsed: checklist?.timesUsed || 0,
      lastUsedAt: checklist?.lastUsedAt
    };
    
    onSave(savedChecklist);
  };

  const addItem = () => {
    if (!newItem.text.trim()) return;
    
    const item: ChecklistItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newItem.text.trim(),
      emoji: newItem.emoji,
      isChecked: false,
      isRequired: newItem.isRequired,
      isCustom: true,
      category: newItem.category || undefined
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    
    setNewItem({
      text: '',
      emoji: '✅',
      isRequired: false,
      category: ''
    });
    
    setShowItemForm(false);
    
    // Clear items error
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }));
    }
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, updates: Partial<ChecklistItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const items = [...formData.items];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    
    setFormData(prev => ({ ...prev, items }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
          {checklist ? 'Modifier la checklist' : 'Créer une nouvelle checklist'}
        </h2>
        <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
          Personnalise ta checklist selon tes besoins ADHD
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white/70 p-6 rounded-xl border border-white/20 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Informations générales</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la checklist *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Départ bureau matinal"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emoji
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <div className="flex flex-wrap gap-1">
                  {COMMON_EMOJIS.slice(0, 8).map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                      className="w-8 h-8 text-sm hover:bg-gray-100 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="Description de ta checklist..."
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ChecklistType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {CHECKLIST_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {COLOR_OPTIONS.map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps estimé (min) *
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 5 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedTime ? 'border-red-300' : 'border-gray-300'
                }`}
                min="1"
                max="60"
              />
              {errors.estimatedTime && <p className="text-sm text-red-600 mt-1">{errors.estimatedTime}</p>}
            </div>
          </div>
        </div>

        {/* Gestion des items */}
        <div className="bg-white/70 p-6 rounded-xl border border-white/20 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Items de la checklist ({formData.items.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowItemForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Ajouter item
            </button>
          </div>
          
          {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
          
          {/* Liste des items */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {formData.items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.text}</span>
                    {item.isRequired && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        Essentiel
                      </span>
                    )}
                    {item.category && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveItem(index, index - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Monter"
                    >
                      ↑
                    </button>
                  )}
                  {index < formData.items.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveItem(index, index + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Descendre"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { isRequired: !item.isRequired })}
                    className={`p-1 ${item.isRequired ? 'text-red-600' : 'text-gray-400'}`}
                    title="Marquer comme essentiel"
                  >
                    ⭐
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Formulaire ajout item */}
          {showItemForm && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <h4 className="font-medium text-blue-800">Nouvel item</h4>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={newItem.text}
                    onChange={(e) => setNewItem(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Texte de l'item..."
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem.emoji}
                    onChange={(e) => setNewItem(prev => ({ ...prev, emoji: e.target.value }))}
                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Catégorie..."
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newItem.isRequired}
                    onChange={(e) => setNewItem(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="rounded"
                  />
                  Item essentiel
                </label>
                
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowItemForm(false)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--mood-primary)' }}
          >
            {checklist ? 'Mettre à jour' : 'Créer la checklist'}
          </button>
        </div>
      </form>
    </div>
  );
}