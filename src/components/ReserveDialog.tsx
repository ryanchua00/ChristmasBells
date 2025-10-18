'use client';

import { X, Gift, User } from 'lucide-react';
import { Item } from '../types';

interface ReserveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: Item | null;
  currentUser: string;
}

export default function ReserveDialog({ isOpen, onClose, onConfirm, item, currentUser }: ReserveDialogProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="christmas-card p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-christmas-green flex items-center">
            <Gift className="mr-2" />
            Reserve Gift
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.item_name}
            </h3>
            {item.author && (
              <p className="text-gray-600 flex items-center justify-center">
                <User className="w-4 h-4 mr-1" />
                Requested by {item.author.name}
              </p>
            )}
          </div>

          {item.price_range && (
            <div className="bg-christmas-gold/10 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Price Range:</strong> {item.price_range}
              </p>
            </div>
          )}

          {item.link && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Link:</strong>{' '}
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Item
                </a>
              </p>
            </div>
          )}

          <div className="bg-christmas-green/10 p-4 rounded-lg border border-christmas-green/20">
            <p className="text-center text-gray-700">
              🎅 Are you sure you want to be the secret Santa for this gift?
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              This will mark the item as reserved by you.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="christmas-button-secondary flex-1"
            >
              🎄 Yes, I'll Get This!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
