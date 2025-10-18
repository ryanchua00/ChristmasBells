'use client';

import { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (name: string) => {
    setCurrentUser(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

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

  if (!currentUser) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
}
