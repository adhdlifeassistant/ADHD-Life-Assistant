'use client';

import React, { useState } from 'react';
import { useFinance, CATEGORY_CONFIG } from './FinanceContext';
import { WishlistItem, ExpenseCategory } from '@/types/finance';

export function Wishlist() {
  const { wishlist, addToWishlist, removeFromWishlist, updateWishlistItem, addExpense } = useFinance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'pleasure' as ExpenseCategory,
    priority: 'medium' as 'low' | 'medium' | 'high',
    reflection: ''
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;

    addToWishlist({
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      priority: newItem.priority,
      reflection: newItem.reflection || undefined
    });

    setNewItem({
      name: '',
      price: '',
      category: 'pleasure',
      priority: 'medium',
      reflection: ''
    });
    setShowAddForm(false);
  };

  const handleBuyNow = (item: WishlistItem) => {
    addExpense({
      amount: item.price,
      category: item.category,
      description: item.name,
      mood: undefined
    });
    removeFromWishlist(item.id);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
    }
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
    }
  };

  const sortedWishlist = [...wishlist].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.addedDate - a.addedDate;
  });

  const totalWishlistValue = wishlist.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Ma Wishlist</h2>
          <p className="text-sm text-gray-600 mt-1">
            {wishlist.length} article{wishlist.length !== 1 ? 's' : ''} • Total: {totalWishlistValue.toFixed(0)}€
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span>
          Ajouter
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'article
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Nouveau casque audio"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(CATEGORY_CONFIG).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">🟢 Basse</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="high">🔴 Haute</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Réflexion (optionnel)
              </label>
              <textarea
                value={newItem.reflection}
                onChange={(e) => setNewItem(prev => ({ ...prev, reflection: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Pourquoi je veux cet article ? En ai-je vraiment besoin ?"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter à la wishlist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des articles */}
      {sortedWishlist.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">🎁</span>
          <p>Votre wishlist est vide</p>
          <p className="text-sm mt-2">
            Ajoutez vos envies d'achat pour y réfléchir à tête reposée !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedWishlist.map(item => {
            const categoryConfig = CATEGORY_CONFIG[item.category];
            return (
              <div key={item.id} className="bg-white p-4 rounded-lg border hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{categoryConfig.emoji}</span>
                      <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                        {getPriorityLabel(item.priority)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="font-semibold">{item.price.toFixed(2)}€</span>
                      <span className={`${categoryConfig.textColor}`}>{categoryConfig.label}</span>
                      <span>{formatTimeAgo(item.addedDate)}</span>
                    </div>

                    {item.reflection && (
                      <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 italic">
                        "{item.reflection}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleBuyNow(item)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Acheter maintenant
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Conseils wishlist */}
      {wishlist.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Conseils wishlist ADHD</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Attendez 24h avant d'acheter un article de votre wishlist</p>
            <p>• Relisez votre réflexion avant de décider</p>
            <p>• Privilégiez les articles haute priorité et dans votre budget</p>
            <p>• N'hésitez pas à supprimer les articles qui ne vous font plus envie !</p>
          </div>
        </div>
      )}
    </div>
  );
}