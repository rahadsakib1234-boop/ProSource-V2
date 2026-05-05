import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function Login() {
  const { auth, settings } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const users = auth.getUsers();
  const hasAdmin = users.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering || !hasAdmin) {
      const success = auth.registerAdmin(username, password);
      if (!success) {
        setError('Failed to register admin. Admin might already exist.');
      }
    } else {
      const success = auth.login(username, password);
      if (!success) {
        setError('Invalid username or password.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl border-border/50">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {!hasAdmin ? 'Setup Admin Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {!hasAdmin 
              ? 'Create your primary administrator account to secure your CRM.' 
              : 'Sign in to access your ProSource workspace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-blue-500/20">
            {!hasAdmin ? 'Create Admin Account' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            ProSource CRM v2 Secure Login
          </p>
        </div>
      </Card>
    </div>
  );
}
