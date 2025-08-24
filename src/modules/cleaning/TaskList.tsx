'use client';

import React, { useState } from 'react';
import { useCleaning, ROOMS } from './CleaningContext';
import { useMood } from '../mood/MoodContext';
import { CleaningTask, RoomType } from '@/types/cleaning';

export function TaskList() {
  const { 
    tasks, 
    completeTask, 
    uncompleteTask, 
    deleteTask, 
    clearCompletedTasks, 
    startTimer,
    addCustomTask,
    getStats 
  } = useCleaning();
  const { getMoodConfig } = useMood();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [roomFilter, setRoomFilter] = useState<RoomType | 'all_rooms'>('all_rooms');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const moodConfig = getMoodConfig();
  const stats = getStats();

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === 'all' || 
                         (filter === 'active' && !task.isCompleted) ||
                         (filter === 'completed' && task.isCompleted);
    
    const matchesRoom = roomFilter === 'all_rooms' || task.room === roomFilter;
    
    return matchesStatus && matchesRoom;
  });

  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const room = task.room;
    if (!groups[room]) {
      groups[room] = [];
    }
    groups[room].push(task);
    return groups;
  }, {} as Record<RoomType, CleaningTask[]>);

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const getDifficultyColor = (difficulty: CleaningTask['difficulty']) => {
    switch (difficulty) {
      case 'micro': return 'bg-green-100 text-green-800';
      case 'easy': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'heavy': return 'bg-red-100 text-red-800';
    }
  };

  const handleAddCustomTask = () => {
    if (!newTaskName.trim()) return;
    
    addCustomTask({
      name: newTaskName.trim(),
      room: roomFilter === 'all_rooms' ? 'living' : roomFilter as RoomType,
      difficulty: 'easy',
      estimatedMinutes: 10,
      points: 2,
      emoji: '✨'
    });
    
    setNewTaskName('');
    setShowAddTask(false);
  };

  const handleTaskAction = (task: CleaningTask) => {
    if (task.isCompleted) {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Mes tâches de ménage</h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeTasks.length} active{activeTasks.length !== 1 ? 's' : ''} • 
            {completedTasks.length} terminée{completedTasks.length !== 1 ? 's' : ''} • 
            {stats.today.pointsEarned} points aujourd'hui
          </p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Tâche custom
        </button>
      </div>

      {/* Formulaire d'ajout rapide */}
      {showAddTask && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Nom de la tâche..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTask()}
            />
            <button
              onClick={handleAddCustomTask}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAddTask(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {[
            { id: 'active', label: 'À faire', count: activeTasks.length },
            { id: 'completed', label: 'Terminées', count: completedTasks.length },
            { id: 'all', label: 'Toutes', count: tasks.length }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        <div className="border-l pl-4 flex gap-2">
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value as any)}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all_rooms">Toutes les pièces</option>
            {Object.values(ROOMS).filter(r => r.id !== 'all').map(room => (
              <option key={room.id} value={room.id}>
                {room.emoji} {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions rapides */}
      {completedTasks.length > 0 && (
        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
          <div className="text-green-800">
            🎉 {completedTasks.length} tâche{completedTasks.length !== 1 ? 's' : ''} terminée{completedTasks.length !== 1 ? 's' : ''} !
          </div>
          <button
            onClick={clearCompletedTasks}
            className="text-sm text-green-700 hover:text-green-800 underline"
          >
            Nettoyer la liste
          </button>
        </div>
      )}

      {/* Liste des tâches par pièce */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">🧹</span>
          <p>Aucune tâche trouvée</p>
          <p className="text-sm mt-2">
            Commencez par créer un plan adapté à votre mood !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([roomId, roomTasks]) => {
            const room = ROOMS[roomId as RoomType];
            const completedInRoom = roomTasks.filter(t => t.isCompleted).length;
            const totalInRoom = roomTasks.length;
            const progressPercent = totalInRoom > 0 ? (completedInRoom / totalInRoom) * 100 : 0;

            return (
              <div key={roomId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{room.emoji}</span>
                    <h3 className="font-semibold text-gray-800">{room.name}</h3>
                    <span className="text-sm text-gray-500">
                      {completedInRoom}/{totalInRoom}
                    </span>
                  </div>
                  {totalInRoom > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{Math.round(progressPercent)}%</span>
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  {roomTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        task.isCompleted
                          ? 'bg-green-50 border-green-200 opacity-75'
                          : 'bg-white border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => handleTaskAction(task)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {task.isCompleted && '✓'}
                        </button>

                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xl">{task.emoji}</span>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
                            }`}>
                              {task.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(task.difficulty)}`}>
                                {task.difficulty}
                              </span>
                              <span>{task.estimatedMinutes}min</span>
                              <span>{task.points} pts</span>
                              {task.completedAt && (
                                <span className="text-green-600">
                                  ✓ {new Date(task.completedAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!task.isCompleted && (
                          <button
                            onClick={() => startTimer('sprint', task.id)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            ⏰ Timer
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Encouragement */}
      {activeTasks.length > 0 && (
        <div className={`p-4 rounded-lg ${moodConfig.bgColor} text-center`}>
          <p className={`${moodConfig.textColor}`}>
            {activeTasks.length === 1 
              ? 'Plus qu\'une tâche ! Tu y es presque 🎯'
              : `${activeTasks.length} tâches restantes. Chaque action compte ! 💪`
            }
          </p>
        </div>
      )}
    </div>
  );
}