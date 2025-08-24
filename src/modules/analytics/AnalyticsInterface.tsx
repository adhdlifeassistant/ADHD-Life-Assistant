'use client';

import React, { useState, useEffect } from 'react';
import { useAnalytics } from './AnalyticsContext';
import { InsightCategory, Pattern, Correlation, Insight, ActionSuggestion } from '@/types/analytics';

export function AnalyticsInterface() {
  const {
    patterns,
    correlations,
    insights,
    actionSuggestions,
    getDailyInsightSummary,
    getTopInsights,
    enabledCategories,
    setEnabledCategories,
    refreshAnalysis
  } = useAnalytics();

  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const dailySummary = getDailyInsightSummary();
  const topInsights = getTopInsights(selectedCategory === 'all' ? undefined : selectedCategory, 3);

  const handleRefreshAnalysis = async () => {
    setIsRefreshing(true);
    try {
      await refreshAnalysis();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderInsightCard = (insight: Insight, compact = false) => (
    <div key={insight.id} className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow ${compact ? 'text-sm' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{insight.emoji}</div>
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-800 mb-2 ${compact ? 'text-sm' : ''}`}>
            {insight.title}
          </h3>
          <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            {insight.message}
          </p>
          
          {!compact && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Confiance: {Math.round(insight.confidence * 100)}%</span>
                <span>Pertinence: {Math.round(insight.relevanceScore * 100)}%</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  insight.category === 'mood' ? 'bg-purple-100 text-purple-700' :
                  insight.category === 'health' ? 'bg-green-100 text-green-700' :
                  insight.category === 'finance' ? 'bg-blue-100 text-blue-700' :
                  insight.category === 'productivity' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {insight.category}
                </span>
              </div>
              
              {insight.supportingData.pattern && (
                <button
                  onClick={() => setShowDetails(showDetails === insight.id ? null : insight.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showDetails === insight.id ? 'Masquer les détails' : 'Voir le pattern détaillé'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showDetails === insight.id && insight.supportingData.pattern && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <div className="font-medium text-gray-700 mb-2">Pattern détecté:</div>
          <div className="space-y-1 text-gray-600">
            <p><strong>Type:</strong> {insight.supportingData.pattern.type}</p>
            <p><strong>Description:</strong> {insight.supportingData.pattern.description}</p>
            <p><strong>Points de données:</strong> {insight.supportingData.pattern.dataPoints.length}</p>
            {insight.supportingData.pattern.metadata.frequency && (
              <p><strong>Fréquence:</strong> {insight.supportingData.pattern.metadata.frequency}</p>
            )}
            {insight.supportingData.pattern.metadata.strength && (
              <p><strong>Force:</strong> {Math.round(insight.supportingData.pattern.metadata.strength * 100)}%</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderActionSuggestion = (suggestion: ActionSuggestion) => (
    <div key={suggestion.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-xl">{suggestion.emoji}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-800 mb-1">{suggestion.title}</h4>
          <p className="text-sm text-blue-700 mb-3">{suggestion.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span className={`px-2 py-1 rounded ${
                suggestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                suggestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {suggestion.difficulty === 'easy' ? '🟢 Facile' :
                 suggestion.difficulty === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
              </span>
              <span>⏱️ {suggestion.timeCommitment}</span>
              <span>Impact: {Math.round(suggestion.estimatedImpact * 100)}%</span>
            </div>
            
            {suggestion.specificActions.length > 0 && (
              <div className="text-xs">
                <div className="font-medium text-blue-700 mb-1">Actions concrètes:</div>
                <ul className="list-disc list-inside text-blue-600 space-y-0.5">
                  {suggestion.specificActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCorrelation = (correlation: Correlation) => (
    <div key={correlation.id} className="bg-white border rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-lg">🔗</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{correlation.name}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">{correlation.variableA.name}</span>
            <span className="mx-2">↔</span>
            <span className="font-medium">{correlation.variableB.name}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded text-sm ${
            correlation.strength === 'strong' ? 'bg-red-100 text-red-700' :
            correlation.strength === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {correlation.strength === 'strong' ? 'Forte' :
             correlation.strength === 'moderate' ? 'Modérée' : 'Faible'}
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            correlation.direction === 'positive' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {correlation.direction === 'positive' ? '📈 Positive' : '📉 Négative'}
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Coefficient: {correlation.coefficient.toFixed(3)} | 
          Échantillon: {correlation.sampleSize} points | 
          Période: {correlation.timeframe} jours
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          📊 Vos insights personnels
        </h2>
        <p className="text-gray-600">
          Découvrez les patterns cachés dans votre quotidien
        </p>
      </div>

      {/* Refresh button */}
      <div className="text-center">
        <button
          onClick={handleRefreshAnalysis}
          disabled={isRefreshing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? '🔄 Analyse en cours...' : '🔍 Analyser maintenant'}
        </button>
      </div>

      {/* Daily Summary */}
      {dailySummary && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 text-center">
            ✨ Résumé du jour
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-purple-700 mb-3">Insight principal</h4>
              {renderInsightCard(dailySummary.mainInsight, true)}
            </div>
            
            <div>
              <h4 className="font-medium text-purple-700 mb-3">Métriques clés</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white bg-opacity-70 p-3 rounded text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {dailySummary.keyMetrics.wellbeingAvg.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Bien-être moyen</div>
                </div>
                <div className="bg-white bg-opacity-70 p-3 rounded text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {dailySummary.keyMetrics.tasksCompleted}
                  </div>
                  <div className="text-xs text-gray-600">Tâches terminées</div>
                </div>
                <div className="bg-white bg-opacity-70 p-3 rounded text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {dailySummary.keyMetrics.expenseTotal}€
                  </div>
                  <div className="text-xs text-gray-600">Dépenses</div>
                </div>
                <div className="bg-white bg-opacity-70 p-3 rounded text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {dailySummary.keyMetrics.activitiesLogged}
                  </div>
                  <div className="text-xs text-gray-600">Activités</div>
                </div>
              </div>
            </div>
          </div>

          {dailySummary.actionSuggestion && (
            <div className="mt-6">
              <h4 className="font-medium text-purple-700 mb-3">💡 Action suggérée</h4>
              {renderActionSuggestion(dailySummary.actionSuggestion)}
            </div>
          )}
        </div>
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {['all', 'mood', 'productivity', 'health', 'finance', 'lifestyle'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as InsightCategory | 'all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? '🔍 Tout' :
             category === 'mood' ? '💭 Humeur' :
             category === 'productivity' ? '⚡ Productivité' :
             category === 'health' ? '🏥 Santé' :
             category === 'finance' ? '💰 Finances' :
             '🌟 Style de vie'}
          </button>
        ))}
      </div>

      {/* Top Insights */}
      {topInsights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center">
            🎯 Insights les plus pertinents
          </h3>
          <div className="grid gap-4">
            {topInsights.map(insight => renderInsightCard(insight))}
          </div>
        </div>
      )}

      {/* Action Suggestions */}
      {actionSuggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center">
            💡 Suggestions d'actions
          </h3>
          <div className="grid gap-4">
            {actionSuggestions.slice(0, 3).map(renderActionSuggestion)}
          </div>
        </div>
      )}

      {/* Correlations */}
      {correlations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center">
            🔗 Corrélations découvertes
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {correlations.slice(0, 6).map(renderCorrelation)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {insights.length === 0 && patterns.length === 0 && correlations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">🔍</span>
          <p>Pas encore assez de données pour générer des insights</p>
          <p className="text-sm mt-2">
            Continuez à utiliser l'app pendant quelques jours pour voir apparaître vos patterns !
          </p>
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <h4 className="font-medium text-green-800 mb-2">🌱 Votre progression</h4>
        <p className="text-sm text-green-700">
          Chaque données que vous loggez enrichit votre compréhension personnelle. 
          Ces insights sont générés pour VOUS, par rapport à VOS patterns uniques !
        </p>
      </div>
    </div>
  );
}