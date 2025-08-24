'use client';

import React, { useState } from 'react';
import { useCleaning, MOOD_CLEANING_PLANS, ROOMS } from './CleaningContext';
import { useMood } from '../mood/MoodContext';
import { RoomType } from '@/types/cleaning';

interface MoodPlanSelectorProps {
  onPlanSelected: () => void;
}

export function MoodPlanSelector({ onPlanSelected }: MoodPlanSelectorProps) {
  const { createTasksFromPlan, getMoodPlan } = useCleaning();
  const { currentMood, getMoodConfig } = useMood();
  
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const moodConfig = getMoodConfig();
  const plan = getMoodPlan(currentMood);

  const handleRoomToggle = (room: RoomType) => {
    if (room === 'all') {
      setSelectedRooms(['all']);
    } else {
      setSelectedRooms(prev => {
        const newRooms = prev.filter(r => r !== 'all');
        if (newRooms.includes(room)) {
          return newRooms.filter(r => r !== room);
        } else {
          return [...newRooms, room];
        }
      });
    }
  };

  const handleCreateTasks = async () => {
    setIsCreating(true);
    try {
      const roomsToUse = selectedRooms.length > 0 ? selectedRooms : plan.focusAreas;
      createTasksFromPlan(currentMood, roomsToUse);
      onPlanSelected();
    } catch (error) {
      console.error('Error creating tasks:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const recommendedRooms = plan.focusAreas;

  return (
    <div className="p-6 space-y-6">
      {/* Plan pour le mood actuel */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">{moodConfig.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {plan.title}
        </h2>
        <p className="text-gray-600 mb-4">
          {plan.description}
        </p>
        <div className={`inline-block px-4 py-2 ${moodConfig.bgColor} ${moodConfig.textColor} rounded-full text-sm`}>
          {plan.motivationalMessage}
        </div>
      </div>

      {/* Infos du plan */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-800">{plan.maxTasks}</div>
            <div className="text-sm text-gray-600">tâches max</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {plan.recommendedTimer === 'pomodoro' ? '25min' :
               plan.recommendedTimer === 'sprint' ? '10min' : '5min'}
            </div>
            <div className="text-sm text-gray-600">sessions recommandées</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {recommendedRooms.length}
            </div>
            <div className="text-sm text-gray-600">pièces ciblées</div>
          </div>
        </div>
      </div>

      {/* Sélection des pièces */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Choisir les pièces à nettoyer
        </h3>
        <div className="text-sm text-gray-600 mb-4">
          {selectedRooms.length === 0 
            ? `Recommandé pour ton mood : ${recommendedRooms.map(r => ROOMS[r].name).join(', ')}`
            : `${selectedRooms.length} pièce${selectedRooms.length > 1 ? 's' : ''} sélectionnée${selectedRooms.length > 1 ? 's' : ''}`
          }
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(ROOMS).map(room => {
            const isSelected = selectedRooms.includes(room.id);
            const isRecommended = recommendedRooms.includes(room.id);
            
            return (
              <button
                key={room.id}
                onClick={() => handleRoomToggle(room.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `border-${room.color} ${room.bgColor} ${room.textColor}`
                    : isRecommended
                    ? `border-${room.color} border-opacity-50 bg-gray-50 hover:${room.bgColor}`
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{room.emoji}</span>
                  <span className={`text-sm font-medium ${
                    isSelected ? room.textColor : 'text-gray-700'
                  }`}>
                    {room.name}
                  </span>
                  {isRecommended && !isSelected && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      Recommandé
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conseils selon le mood */}
      <div className={`p-4 rounded-lg ${moodConfig.bgColor} border`}>
        <h4 className={`font-medium ${moodConfig.textColor} mb-2`}>
          💡 Conseils pour ton mood
        </h4>
        <div className={`text-sm ${moodConfig.textColor} opacity-80 space-y-1`}>
          {currentMood === 'energetic' && (
            <>
              <p>• Profite de ton énergie pour les tâches lourdes</p>
              <p>• N'hésite pas à utiliser le timer Pomodoro 25min</p>
              <p>• Tu peux viser plusieurs pièces aujourd'hui !</p>
            </>
          )}
          {currentMood === 'normal' && (
            <>
              <p>• Focus sur 1-2 pièces pour rester motivé(e)</p>
              <p>• Les sprints de 10min sont parfaits</p>
              <p>• Commence par les tâches satisfaisantes</p>
            </>
          )}
          {currentMood === 'tired' && (
            <>
              <p>• Garde tes forces, choisis 1 seule pièce</p>
              <p>• Les micro-sessions de 5min sont idéales</p>
              <p>• Même faire son lit est une victoire !</p>
            </>
          )}
          {currentMood === 'stressed' && (
            <>
              <p>• Les tâches répétitives vont t'apaiser</p>
              <p>• Privilégie le rangement à l'aspirateur</p>
              <p>• Prends ton temps, pas de pression</p>
            </>
          )}
          {currentMood === 'sad' && (
            <>
              <p>• Une seule tâche suffit, tu es courageux(se)</p>
              <p>• Commence par ton lit, c'est réconfortant</p>
              <p>• Chaque petit geste compte énormément ❤️</p>
            </>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleCreateTasks}
          disabled={isCreating}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            isCreating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : `bg-${moodConfig.color} text-white hover:bg-${moodConfig.color.replace('-500', '-600')}`
          }`}
        >
          {isCreating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Création...
            </div>
          ) : (
            <>🚀 C'est parti ! Créer mes tâches</>
          )}
        </button>
      </div>
    </div>
  );
}