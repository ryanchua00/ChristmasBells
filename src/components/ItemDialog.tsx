'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Link, DollarSign, Image } from 'lucide-react';
import { CreateItemData, UpdateItemData, Item } from '../types';

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateItemData | UpdateItemData) => void;
  item?: Item;
  title: string;
}

export default function ItemDialog({ isOpen, onClose, onSubmit, item, title }: ItemDialogProps) {
  const [formData, setFormData] = useState({
    item_name: '',
    link: '',
    price_range: '',
    image_url: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name,
        link: item.link || '',
        price_range: item.price_range || '',
        image_url: item.image_url || '',
      });
    } else {
      setFormData({
        item_name: '',
        link: '',
        price_range: '',
        image_url: '',
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      link: formData.link || undefined,
      price_range: formData.price_range || undefined,
      image_url: formData.image_url || undefined,
    };

    if (item) {
      onSubmit({ ...submitData, id: item.id } as UpdateItemData);
    } else {
      onSubmit(submitData as CreateItemData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="christmas-card p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-christmas-red flex items-center">
            <Gift className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Gift className="inline w-4 h-4 mr-1" />
              Gift Name *
            </label>
            <input
              type="text"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              className="christmas-input"
              placeholder="What would you like for Christmas?"
              maxLength={255}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link className="inline w-4 h-4 mr-1" />
              Link (Optional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="christmas-input"
              placeholder="https://example.com/gift"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Price Range (Optional)
            </label>
            <input
              type="text"
              value={formData.price_range}
              onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              className="christmas-input"
              placeholder="$10-50, Under $100, etc."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="inline w-4 h-4 mr-1" />
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="christmas-input"
              placeholder="https://example.com/image.jpg"
              maxLength={500}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[48px] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="christmas-button flex-1 min-h-[48px] text-sm sm:text-base"
            >
              {item ? '🎁 Update Gift' : '🎄 Add to Wishlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
