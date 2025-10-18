'use client';

import { useState, useEffect } from 'react';
import { Plus, LogOut, Edit, Trash2, Gift, ExternalLink, DollarSign, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Item, CreateItemData, UpdateItemData } from '../types';
import { getRandomMessage } from '../lib/utils';
import ItemDialog from './ItemDialog';
import ReserveDialog from './ReserveDialog';

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemDialog, setItemDialog] = useState<{
    isOpen: boolean;
    item?: Item;
    title: string;
  }>({ isOpen: false, title: '' });
  const [reserveDialog, setReserveDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });

  useEffect(() => {
    fetchItems();
    // Register user in database
    registerUser();
  }, []);

  const registerUser = async () => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentUser }),
      });
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      toast.error(getRandomMessage('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (data: CreateItemData) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, author_name: currentUser }),
      });

      const result = await response.json();
      if (result.item) {
        setItems([result.item, ...items]);
        toast.success(getRandomMessage('success'));
        setItemDialog({ isOpen: false, title: '' });
      } else {
        toast.error(getRandomMessage('error'));
      }
    } catch (error) {
      toast.error(getRandomMessage('error'));
    }
  };

  const handleUpdateItem = async (data: UpdateItemData) => {
    try {
      const response = await fetch(`/api/items/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.item) {
        setItems(items.map(item => item.id === data.id ? result.item : item));
        toast.success(getRandomMessage('success'));
        setItemDialog({ isOpen: false, title: '' });
      } else {
        toast.error(getRandomMessage('error'));
      }
    } catch (error) {
      toast.error(getRandomMessage('error'));
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('🎄 Are you sure you want to remove this gift from your wishlist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
        toast.success(getRandomMessage('success'));
      } else {
        toast.error(getRandomMessage('error'));
      }
    } catch (error) {
      toast.error(getRandomMessage('error'));
    }
  };

  const handleReserveItem = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gifter_name: currentUser }),
      });

      const result = await response.json();
      if (result.item) {
        setItems(items.map(i => i.id === item.id ? result.item : i));
        toast.success('🎅 You\'re now the secret Santa for this gift!');
        setReserveDialog({ isOpen: false, item: null });
      } else {
        toast.error(getRandomMessage('error'));
      }
    } catch (error) {
      toast.error(getRandomMessage('error'));
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const authorName = item.author?.name || 'Unknown';
    if (!acc[authorName]) {
      acc[authorName] = [];
    }
    acc[authorName].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎄</div>
          <p className="text-xl text-white">Loading Christmas magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="christmas-card p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-christmas-red flex items-center">
                🎄 Christmas Gift Exchange
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <strong>{currentUser}</strong>! 🎅
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setItemDialog({ isOpen: true, title: 'Add New Gift' })}
                className="christmas-button flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Gift
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Items by User */}
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([authorName, userItems]) => (
            <div key={authorName} className="christmas-card p-6">
              <h2 className="text-2xl font-bold text-christmas-green mb-4 flex items-center">
                <User className="w-6 h-6 mr-2" />
                {authorName}'s Wishlist
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({userItems.length} {userItems.length === 1 ? 'item' : 'items'})
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      item.gifter_id
                        ? 'bg-gray-100 border-gray-300 opacity-75'
                        : 'bg-white border-christmas-gold/30 hover:border-christmas-gold/60 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <Gift className="w-4 h-4 mr-2 text-christmas-red" />
                        {item.item_name}
                      </h3>
                      
                      {item.author?.name === currentUser && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setItemDialog({
                              isOpen: true,
                              item,
                              title: 'Edit Gift'
                            })}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {item.image_url && (
                      <div className="mb-3">
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {item.price_range && (
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {item.price_range}
                      </p>
                    )}

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mb-3 flex items-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Item
                      </a>
                    )}

                    {item.gifter_id ? (
                      <div className="bg-christmas-green/20 p-2 rounded text-center">
                        <p className="text-sm font-medium text-christmas-green">
                          🎅 Reserved by {item.gifter?.name === currentUser ? 'You' : 'Someone'}
                        </p>
                      </div>
                    ) : item.author?.name !== currentUser ? (
                      <button
                        onClick={() => setReserveDialog({ isOpen: true, item })}
                        className="christmas-button-secondary w-full text-sm"
                      >
                        🎁 I'll Get This!
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="christmas-card p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No gifts yet!
            </h2>
            <p className="text-gray-600 mb-6">
              Start by adding your first Christmas wish to the list.
            </p>
            <button
              onClick={() => setItemDialog({ isOpen: true, title: 'Add Your First Gift' })}
              className="christmas-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Gift
            </button>
          </div>
        )}
      </div>

      <ItemDialog
        isOpen={itemDialog.isOpen}
        onClose={() => setItemDialog({ isOpen: false, title: '' })}
        onSubmit={(data) => {
          if (itemDialog.item) {
            handleUpdateItem(data as UpdateItemData);
          } else {
            handleCreateItem(data as CreateItemData);
          }
        }}
        item={itemDialog.item}
        title={itemDialog.title}
      />

      <ReserveDialog
        isOpen={reserveDialog.isOpen}
        onClose={() => setReserveDialog({ isOpen: false, item: null })}
        onConfirm={() => reserveDialog.item && handleReserveItem(reserveDialog.item)}
        item={reserveDialog.item}
        currentUser={currentUser}
      />
    </div>
  );
}
