'use client';

import React from 'react';
import { ChecklistTemplate } from '@/types/checklists';
import { CHECKLIST_TEMPLATES } from '@/lib/checklistTemplates';
import { useMood } from '@/modules/mood/MoodContext';

interface ChecklistSelectorProps {
  onTemplateSelect: (template: ChecklistTemplate) => void;
}

export default function ChecklistSelector({ onTemplateSelect }: ChecklistSelectorProps) {
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();

  const getColorClasses = (color: string, isHovered: boolean = false) => {
    const colors = {
      blue: isHovered ? 'bg-blue-100 border-blue-300' : 'bg-blue-50 border-blue-200',
      green: isHovered ? 'bg-green-100 border-green-300' : 'bg-green-50 border-green-200',
      orange: isHovered ? 'bg-orange-100 border-orange-300' : 'bg-orange-50 border-orange-200',
      purple: isHovered ? 'bg-purple-100 border-purple-300' : 'bg-purple-50 border-purple-200',
      indigo: isHovered ? 'bg-indigo-100 border-indigo-300' : 'bg-indigo-50 border-indigo-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTimeColor = (time: number) => {
    if (time <= 3) return 'text-green-600 bg-green-100';
    if (time <= 5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
          Tu pars où aujourd'hui ? 🚀
        </h2>
        <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
          Choisis ton type de sortie pour avoir ta checklist anti-oublis ADHD
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CHECKLIST_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className={`
              p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95
              ${getColorClasses(template.color)} hover:${getColorClasses(template.color, true)}
              hover:shadow-lg text-left
            `}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{template.emoji}</div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {template.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${getTimeColor(template.estimatedTime)}`}>
                    ⏱️ ~{template.estimatedTime} min
                  </span>
                  <span className="text-slate-500">
                    📋 {template.items.length} items
                  </span>
                  <span className="text-slate-500">
                    ⭐ {template.items.filter(item => item.isRequired).length} essentiels
                  </span>
                </div>

                {/* Preview des premiers items */}
                <div className="mt-3 text-xs text-slate-500">
                  <p className="font-medium mb-1">Aperçu :</p>
                  <div className="space-y-1">
                    {template.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-1">
                        <span>{item.emoji}</span>
                        <span>{item.text}</span>
                        {item.isRequired && <span className="text-red-500">*</span>}
                      </div>
                    ))}
                    {template.items.length > 3 && (
                      <p className="text-slate-400">+{template.items.length - 3} autres...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Message d'encouragement */}
      <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
        <p className="text-sm opacity-80" style={{ color: 'var(--mood-text)' }}>
          💡 Ces checklists sont conçues spécialement pour éviter les oublis typiques ADHD.
          <br />
          Tu peux les personnaliser selon tes besoins !
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white/70 rounded-xl">
          <div className="text-2xl mb-1">📋</div>
          <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
            {CHECKLIST_TEMPLATES.length}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Checklists
          </div>
        </div>
        
        <div className="text-center p-4 bg-white/70 rounded-xl">
          <div className="text-2xl mb-1">✅</div>
          <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
            {CHECKLIST_TEMPLATES.reduce((total, template) => total + template.items.length, 0)}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Items total
          </div>
        </div>
        
        <div className="text-center p-4 bg-white/70 rounded-xl">
          <div className="text-2xl mb-1">⭐</div>
          <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
            {CHECKLIST_TEMPLATES.reduce((total, template) => 
              total + template.items.filter(item => item.isRequired).length, 0
            )}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Essentiels
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