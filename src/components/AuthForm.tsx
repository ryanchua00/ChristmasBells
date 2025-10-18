'use client';

import { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRandomMessage } from '../lib/utils';

interface AuthFormProps {
  onLogin: (name: string) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('🎄 Please enter your name!');
      return;
    }
    
    if (password !== 'roodsthepoods') {
      toast.error('🎅 Wrong password! Ask Santa for the secret word!');
      return;
    }

    setLoading(true);
    
    try {
      // Store user session with normalized case
      const normalizedName = name.trim().toLowerCase();
      localStorage.setItem('currentUser', normalizedName);
      toast.success(getRandomMessage('success'));
      onLogin(normalizedName);
    } catch (error) {
      toast.error(getRandomMessage('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="christmas-card p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl mb-4">🎄</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-christmas-red mb-2">
            Christmas Gift Exchange
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome to our family wishlist! 🎁
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="christmas-input text-base"
              placeholder="Enter your name..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LogIn className="inline w-4 h-4 mr-1" />
              Family Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="christmas-input text-base"
              placeholder="Ask Santa for the password..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="christmas-button w-full min-h-[48px] text-base"
          >
            {loading ? '🎅 Checking with Santa...' : '🎄 Enter Christmas Magic'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔔 Jingle all the way to gift giving! 🔔</p>
        </div>
      </div>
    </div>
  );
}
