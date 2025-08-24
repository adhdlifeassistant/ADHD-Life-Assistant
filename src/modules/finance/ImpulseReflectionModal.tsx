'use client';

import React, { useState } from 'react';
import { useFinance, CATEGORY_CONFIG, REFLECTION_QUESTIONS } from './FinanceContext';
import { useMood } from '../mood/MoodContext';
import { ImpulseReflectionData, ExpenseCategory } from '@/types/finance';

interface ImpulseReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseData: {
    amount: number;
    category: ExpenseCategory;
    description: string;
  };
  onDecision: (decision: 'buy_now' | 'add_to_wishlist' | 'cancel') => void;
}

export function ImpulseReflectionModal({ 
  isOpen, 
  onClose, 
  expenseData, 
  onDecision 
}: ImpulseReflectionModalProps) {
  const { getFinancialAdvice, getCurrentMonthStats, budget } = useFinance();
  const { currentMood, getMoodConfig } = useMood();
  
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const advice = getFinancialAdvice(currentMood);
  const moodConfig = getMoodConfig();
  const stats = getCurrentMonthStats();
  const categoryConfig = CATEGORY_CONFIG[expenseData.category];
  
  // Filtrer les questions selon le contexte
  const relevantQuestions = REFLECTION_QUESTIONS.filter(q => 
    q.mood === 'all' || 
    q.mood === expenseData.category ||
    (expenseData.amount >= 50 && q.id === 'regret')
  );

  const currentQuestion = relevantQuestions[currentStep];
  const isLastQuestion = currentStep === relevantQuestions.length - 1;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setReflectionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Afficher le résumé et les options
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDecision = (decision: 'buy_now' | 'add_to_wishlist' | 'cancel') => {
    onDecision(decision);
    onClose();
  };

  const getBudgetWarning = () => {
    const categorySpent = stats.byCategory[expenseData.category];
    const categoryBudget = budget[expenseData.category];
    const newTotal = categorySpent + expenseData.amount;
    const percentageUsed = (newTotal / categoryBudget) * 100;

    if (percentageUsed >= 100) {
      return {
        level: 'danger',
        message: `Cet achat dépasserait votre budget ${categoryConfig.label} de ${(newTotal - categoryBudget).toFixed(0)}€`
      };
    } else if (percentageUsed >= 80) {
      return {
        level: 'warning',
        message: `Cet achat utiliserait ${percentageUsed.toFixed(0)}% de votre budget ${categoryConfig.label}`
      };
    }
    return null;
  };

  const budgetWarning = getBudgetWarning();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-4 ${moodConfig.bgColor} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤔</span>
              <div>
                <h3 className={`font-semibold ${moodConfig.textColor}`}>
                  Pause réflexion
                </h3>
                <p className={`text-sm ${moodConfig.textColor} opacity-75`}>
                  Prenons le temps d'y réfléchir
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Informations sur l'achat */}
          <div className={`p-4 rounded-lg ${categoryConfig.bgColor} mb-6`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{categoryConfig.emoji}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{expenseData.description}</h4>
                <p className={`text-sm ${categoryConfig.textColor}`}>{categoryConfig.label}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">{expenseData.amount.toFixed(2)}€</div>
              </div>
            </div>
            
            {budgetWarning && (
              <div className={`mt-3 p-2 rounded text-sm ${
                budgetWarning.level === 'danger' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                ⚠️ {budgetWarning.message}
              </div>
            )}
          </div>

          {/* Conseil mood */}
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span>{moodConfig.emoji}</span>
              <span className="font-medium text-purple-800">Conseil selon votre mood</span>
            </div>
            <p className="text-sm text-purple-700">{advice.message}</p>
          </div>

          {/* Questions de réflexion */}
          {currentStep < relevantQuestions.length ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Question {currentStep + 1} sur {relevantQuestions.length}</span>
                <span>{Math.round((currentStep / relevantQuestions.length) * 100)}%</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">
                  {currentQuestion?.question}
                </h4>
                <textarea
                  value={reflectionAnswers[currentQuestion?.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion?.id, e.target.value)}
                  placeholder="Prenez le temps de réfléchir et écrivez votre réponse..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isLastQuestion ? 'Terminer la réflexion' : 'Question suivante'}
                </button>
              </div>
            </div>
          ) : (
            /* Résumé et décision */
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Résumé de votre réflexion</h4>
                <div className="space-y-3">
                  {relevantQuestions.map(question => (
                    <div key={question.id} className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700">{question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {reflectionAnswers[question.id] || "Pas de réponse"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Que voulez-vous faire ?</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => handleDecision('buy_now')}
                    className="w-full p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg hover:bg-green-100 text-left"
                  >
                    <div className="font-medium">💳 Acheter maintenant</div>
                    <div className="text-sm opacity-75">J'ai réfléchi, j'en ai besoin</div>
                  </button>
                  
                  <button
                    onClick={() => handleDecision('add_to_wishlist')}
                    className="w-full p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-100 text-left"
                  >
                    <div className="font-medium">🎁 Ajouter à ma wishlist</div>
                    <div className="text-sm opacity-75">J'y repenserai plus tard</div>
                  </button>
                  
                  <button
                    onClick={() => handleDecision('cancel')}
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-100 text-left"
                  >
                    <div className="font-medium">❌ Annuler l'achat</div>
                    <div className="text-sm opacity-75">Finalement, je n'en ai pas besoin</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleBack}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Retour aux questions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}