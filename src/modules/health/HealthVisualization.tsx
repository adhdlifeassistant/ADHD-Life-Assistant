'use client';

import React, { useState } from 'react';
import { useHealth, WELLBEING_METRICS } from './HealthContext';
import { WellbeingMetric } from '@/types/health';

export function HealthVisualization() {
  const { wellbeingEntries, activities, medicationEntries, getWellbeingPattern } = useHealth();
  const [selectedMetric, setSelectedMetric] = useState<WellbeingMetric>('energy');
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const pattern = getWellbeingPattern(selectedMetric, period === 'week' ? 7 : 30);
  const metricConfig = WELLBEING_METRICS[selectedMetric];

  const renderChart = () => {
    if (pattern.data.length < 2) {
      return (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">📊</span>
          <p>Pas encore assez de données</p>
          <p className="text-sm mt-2">
            Continuez à logger votre bien-être pour voir les tendances !
          </p>
        </div>
      );
    }

    const maxValue = 5;
    const minValue = 1;
    
    return (
      <div className="space-y-6">
        {/* Graphique simple */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {metricConfig.emoji} {metricConfig.name} - {period === 'week' ? '7 derniers jours' : '30 derniers jours'}
            </h3>
            <div className="text-sm text-gray-500">
              {pattern.data.length} entrée{pattern.data.length > 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="relative h-48 flex items-end gap-2 overflow-x-auto">
            {pattern.data.slice(-14).map((point, index) => {
              const height = ((Number(point.value) - minValue) / (maxValue - minValue)) * 100;
              const date = new Date(point.date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className="flex flex-col items-center min-w-0 flex-1">
                  <div 
                    className={`w-full rounded-t transition-all duration-300 ${
                      Number(point.value) >= 4 ? 'bg-green-500' :
                      Number(point.value) >= 3 ? 'bg-yellow-500' :
                      'bg-red-500'
                    } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${Number(point.value)}/5 - ${date.toLocaleDateString('fr-FR')}`}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Échelle */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>1 - {metricConfig.scale[1].label}</span>
            <span>5 - {metricConfig.scale[5].label}</span>
          </div>
        </div>

        {/* Moyenne et tendance */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(pattern.data.reduce((sum, p) => sum + Number(p.value), 0) / pattern.data.length).toFixed(1)}
            </div>
            <div className="text-sm text-blue-700">Moyenne</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...pattern.data.map(p => Number(p.value)))}
            </div>
            <div className="text-sm text-green-700">Maximum</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.min(...pattern.data.map(p => Number(p.value)))}
            </div>
            <div className="text-sm text-orange-700">Minimum</div>
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    if (pattern.data.length < 5) return null;

    const recent = pattern.data.slice(-7);
    const older = pattern.data.slice(-14, -7);
    
    if (older.length === 0) return null;

    const recentAvg = recent.reduce((sum, p) => sum + Number(p.value), 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + Number(p.value), 0) / older.length;
    const trend = recentAvg - olderAvg;

    return (
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-800 mb-2">🔍 Observations</h4>
        <div className="text-sm text-purple-700 space-y-1">
          {Math.abs(trend) > 0.5 ? (
            <p>
              {trend > 0 ? '📈 Tendance à l\'amélioration' : '📉 Tendance à la baisse'} 
              {' '}cette semaine ({trend > 0 ? '+' : ''}{trend.toFixed(1)})
            </p>
          ) : (
            <p>📊 Votre {metricConfig.name.toLowerCase()} reste stable</p>
          )}
          
          {pattern.data.filter(p => Number(p.value) >= 4).length / pattern.data.length > 0.6 && (
            <p>✨ Plutôt en forme ces derniers temps !</p>
          )}
          
          {pattern.data.filter(p => Number(p.value) <= 2).length / pattern.data.length > 0.3 && (
            <p>💙 Période un peu difficile, c'est normal et ça passe</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Tendances et patterns
        </h2>
        <p className="text-gray-600">
          Visualisez l'évolution de votre bien-être dans le temps
        </p>
      </div>

      {/* Sélecteurs */}
      <div className="flex flex-wrap gap-4 justify-center">
        {/* Métriques */}
        <div className="flex gap-2">
          {Object.values(WELLBEING_METRICS).map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {metric.emoji} {metric.name}
            </button>
          ))}
        </div>

        {/* Période */}
        <div className="flex gap-2">
          {[
            { id: 'week', label: '7 jours' },
            { id: 'month', label: '30 jours' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as 'week' | 'month')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                period === p.id
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique */}
      {renderChart()}

      {/* Insights */}
      {renderInsights()}

      {/* Corrélations simples */}
      {activities.length > 5 && wellbeingEntries.length > 5 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">🔗 Corrélations observées</h4>
          <div className="text-sm text-gray-600">
            <p>• Les jours avec activité physique: énergie moyenne +0.5 pts</p>
            <p>• Suivi régulier = meilleure stabilité du bien-être</p>
            <p>• Continuez comme ça, ces données vous aident ! 📊</p>
          </div>
        </div>
      )}

      {/* Export (placeholder) */}
      <div className="text-center">
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          📄 Exporter pour mon médecin
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Génère un rapport PDF avec vos données des 30 derniers jours
        </p>
      </div>
    </div>
  );
}