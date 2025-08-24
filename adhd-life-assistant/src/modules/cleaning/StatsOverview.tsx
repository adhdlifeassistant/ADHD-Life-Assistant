'use client';

import React from 'react';
import { useCleaning, ROOMS } from './CleaningContext';
import { RoomType } from '@/types/cleaning';

export function StatsOverview() {
  const { getStats, streak, achievements, tasks } = useCleaning();
  
  const stats = getStats();

  const getRoomStats = () => {
    const roomCounts: Record<RoomType, number> = {
      kitchen: 0,
      bedroom: 0,
      living: 0,
      bathroom: 0,
      office: 0,
      all: 0
    };

    tasks.filter(t => t.isCompleted).forEach(task => {
      roomCounts[task.room]++;
    });

    return Object.entries(roomCounts)
      .filter(([roomId]) => roomId !== 'all')
      .map(([roomId, count]) => ({
        room: ROOMS[roomId as RoomType],
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getTimeOfDayStats = () => {
    const timeSlots = {
      morning: 0,   // 6h-12h
      afternoon: 0, // 12h-18h
      evening: 0    // 18h-24h
    };

    tasks.filter(t => t.isCompleted && t.completedAt).forEach(task => {
      const hour = new Date(task.completedAt!).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else timeSlots.evening++;
    });

    return Object.entries(timeSlots).map(([period, count]) => ({
      period,
      count,
      label: period === 'morning' ? '🌅 Matin' : 
             period === 'afternoon' ? '☀️ Après-midi' : 
             '🌙 Soir'
    })).sort((a, b) => b.count - a.count);
  };

  const roomStats = getRoomStats();
  const timeStats = getTimeOfDayStats();
  const recentTasks = tasks
    .filter(t => t.isCompleted)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tes statistiques de ménage
        </h2>
        <p className="text-gray-600">
          Regarde tout ce que tu accomplis ! 🌟
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.today.tasksCompleted}</div>
          <div className="text-sm text-blue-700">Tâches aujourd'hui</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.today.pointsEarned}</div>
          <div className="text-sm text-green-700">Points aujourd'hui</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.thisWeek.streak}</div>
          <div className="text-sm text-purple-700">Jours de suite</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.today.timeSpent}min</div>
          <div className="text-sm text-yellow-700">Temps aujourd'hui</div>
        </div>
      </div>

      {/* Stats de la semaine */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cette semaine</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.thisWeek.tasksCompleted}</div>
            <div className="text-sm text-gray-600">Tâches terminées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.thisWeek.pointsEarned}</div>
            <div className="text-sm text-gray-600">Points gagnés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {Math.round(stats.thisWeek.timeSpent / 60 * 10) / 10}h
            </div>
            <div className="text-sm text-gray-600">Temps investi</div>
          </div>
        </div>
      </div>

      {/* Pièces favorites */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tes pièces favorites</h3>
        {roomStats.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Commence à nettoyer pour voir tes statistiques !
          </p>
        ) : (
          <div className="space-y-3">
            {roomStats.slice(0, 3).map(({ room, count }, index) => (
              <div key={room.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-xl">{room.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{room.name}</div>
                  <div className="text-sm text-gray-600">{count} tâche{count > 1 ? 's' : ''} terminée{count > 1 ? 's' : ''}</div>
                </div>
                <div className="text-right">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${roomStats.length > 0 ? (count / roomStats[0].count) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moments préférés */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tes moments préférés</h3>
        {timeStats.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Pas encore de données sur tes horaires préférés
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {timeStats.map(({ period, count, label }) => (
              <div key={period} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{label.split(' ')[0]}</div>
                <div className="font-semibold text-gray-800">{count}</div>
                <div className="text-sm text-gray-600">{label.split(' ')[1]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tes succès</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {achievements.map(achievement => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl">{achievement.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{achievement.name}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </div>
                <div className="text-sm font-medium text-yellow-700">
                  +{achievement.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique récent */}
      {recentTasks.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernières victoires</h3>
          <div className="space-y-2">
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 py-2">
                <span className="text-lg">{task.emoji}</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{task.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({ROOMS[task.room].name})
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {task.completedAt && new Date(task.completedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message d'encouragement */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg text-center">
        <h4 className="font-semibold text-purple-800 mb-2">🌟 Continue comme ça !</h4>
        <p className="text-purple-700">
          {stats.allTime.tasksCompleted === 0
            ? 'Ta première tâche t\'attend ! Chaque petit pas compte.'
            : stats.allTime.tasksCompleted < 10
            ? `${stats.allTime.tasksCompleted} tâche${stats.allTime.tasksCompleted > 1 ? 's' : ''} terminée${stats.allTime.tasksCompleted > 1 ? 's' : ''} ! Tu prends de bonnes habitudes 💪`
            : `${stats.allTime.tasksCompleted} tâches au total ! Tu es devenu(e) un(e) pro du ménage 🏆`
          }
        </p>
      </div>
    </div>
  );
}