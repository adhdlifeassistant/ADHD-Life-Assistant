'use client';

import React, { useState } from 'react';
import { useFinance, CATEGORY_CONFIG } from './FinanceContext';
import { useMood } from '../mood/MoodContext';
import { ExpenseCategory, ExpenseFormData } from '@/types/finance';
import { ImpulseReflectionModal } from './ImpulseReflectionModal';
import { a11yService } from '@/lib/notificationService';

interface ExpenseFormProps {
  onSuccess: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    category: 'essential',
    description: '',
    receiptPhoto: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<{
    amount: number;
    category: ExpenseCategory;
    description: string;
  } | null>(null);

  const { addExpense, shouldTriggerReflection, addToWishlist } = useFinance();
  const { currentMood } = useMood();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!formData.amount || !formData.description) {
      if (!formData.amount) {
        a11yService.announceFormError('Montant', 'Le montant est requis');
      }
      if (!formData.description) {
        a11yService.announceFormError('Description', 'La description est requise');
      }
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      a11yService.announceFormError('Montant', 'Veuillez entrer un montant valide supérieur à zéro');
      return;
    }

    setIsSubmitting(true);
    a11yService.announceLoading('Ajout de la dépense en cours');

    try {
      // Vérifier si on doit déclencher la réflexion anti-impulsif
      if (shouldTriggerReflection(amount, formData.category)) {
        setPendingExpense({
          amount,
          category: formData.category,
          description: formData.description
        });
        setShowReflectionModal(true);
        a11yService.announce('Modal de réflexion ouverte pour cette dépense');
        setIsSubmitting(false);
        return;
      }

      // Ajouter directement la dépense si pas de réflexion nécessaire
      await addExpenseDirectly(amount, formData.category, formData.description);
      a11yService.announceFormSuccess('Dépense ajoutée avec succès');
    } catch (error) {
      console.error('Error adding expense:', error);
      a11yService.announceFormError('Système', 'Erreur lors de l\'ajout de la dépense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExpenseDirectly = async (amount: number, category: ExpenseCategory, description: string) => {
    addExpense({
      amount,
      category,
      description,
      receiptPhoto: formData.receiptPhoto || undefined,
      mood: currentMood
    });

    // Reset form
    setFormData({
      amount: '',
      category: 'essential',
      description: '',
      receiptPhoto: ''
    });

    onSuccess();
  };

  const handleReflectionDecision = async (decision: 'buy_now' | 'add_to_wishlist' | 'cancel') => {
    if (!pendingExpense) return;

    switch (decision) {
      case 'buy_now':
        await addExpenseDirectly(pendingExpense.amount, pendingExpense.category, pendingExpense.description);
        break;
      case 'add_to_wishlist':
        addToWishlist({
          name: pendingExpense.description,
          price: pendingExpense.amount,
          category: pendingExpense.category,
          priority: 'medium'
        });
        // Reset form
        setFormData({
          amount: '',
          category: 'essential',
          description: '',
          receiptPhoto: ''
        });
        onSuccess();
        break;
      case 'cancel':
        // Reset form
        setFormData({
          amount: '',
          category: 'essential',
          description: '',
          receiptPhoto: ''
        });
        onSuccess();
        break;
    }

    setPendingExpense(null);
    setShowReflectionModal(false);
  };

  return (
    <div className="p-6">
      <h2 id="expense-form-title" className="text-xl font-semibold mb-6 text-gray-800">
        Ajouter une dépense
      </h2>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        aria-labelledby="expense-form-title"
        noValidate
      >
        {/* Montant */}
        <div>
          <label htmlFor="amount-input" className="block text-sm font-medium text-gray-700 mb-2">
            Montant (€)
          </label>
          <input
            id="amount-input"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            required
            aria-describedby="amount-help"
            aria-invalid={formData.amount !== '' && (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0)}
          />
          <p id="amount-help" className="mt-1 text-xs text-gray-500">
            Entrez le montant en euros avec les centimes si nécessaire
          </p>
        </div>

        {/* Catégorie */}
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Catégorie de dépense">
              {Object.values(CATEGORY_CONFIG).map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`p-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.category === category.id
                      ? `border-${category.color} ${category.bgColor}`
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  role="radio"
                  aria-checked={formData.category === category.id}
                  aria-label={`${category.label}: ${category.description || ''}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl" role="img" aria-hidden="true">{category.emoji}</span>
                    <span className={`text-xs font-medium ${
                      formData.category === category.id ? category.textColor : 'text-gray-600'
                    }`}>
                      {category.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description-input" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            id="description-input"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Courses Carrefour, Resto avec Paul..."
            required
            aria-describedby="description-help"
            aria-invalid={formData.description === ''}
          />
          <p id="description-help" className="mt-1 text-xs text-gray-500">
            Décrivez brièvement cette dépense pour vous y retrouver plus tard
          </p>
        </div>

        {/* Photo ticket (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo du ticket (optionnel)
          </label>
          <button
            type="button"
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-describedby="photo-help"
            disabled
          >
            <span className="text-2xl mb-2 block" role="img" aria-label="Caméra">📷</span>
            <p className="text-sm text-gray-600">
              Cliquez pour ajouter une photo
            </p>
            <p id="photo-help" className="text-xs text-gray-500 mt-1">
              (Fonctionnalité à venir)
            </p>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onSuccess}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.amount || !formData.description}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-describedby="submit-help"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter la dépense'}
          </button>
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isSubmitting && 'Ajout de la dépense en cours'}
        </div>
        <p id="submit-help" className="text-xs text-gray-500 text-center mt-2">
          {!formData.amount || !formData.description 
            ? 'Veuillez remplir tous les champs obligatoires pour continuer'
            : 'Cliquez pour enregistrer votre dépense'}
        </p>
      </form>

      {/* Modal de réflexion anti-impulsif */}
      {pendingExpense && (
        <ImpulseReflectionModal
          isOpen={showReflectionModal}
          onClose={() => setShowReflectionModal(false)}
          expenseData={pendingExpense}
          onDecision={handleReflectionDecision}
        />
      )}
    </div>
  );
}