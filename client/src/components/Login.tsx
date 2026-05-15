import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { INDUSTRY_PROFILES } from '../services/industries';
import { buildIndustryTemplateSettings } from '../services/templateCustomization';
import { IndustryProfile } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function Login() {
  const { auth, settings } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('sourcing');
  const [error, setError] = useState('');

  const adminExists = auth.hasAdmin();
  const isFirstTimeSetup = !adminExists;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFirstTimeSetup) {
      if (!selectedIndustry) {
        setError('Please choose an industry to continue.');
        return;
      }

      const success = await auth.registerAdmin(username, password);
      if (!success) {
        setError('Failed to create the admin account.');
        return;
      }

      const saved = settings.saveSettings(
        buildIndustryTemplateSettings(settings.settings, selectedIndustry)
      );

      if (!saved) {
        setError('Admin created, but industry settings could not be saved. You can change them later in Settings.');
      }
      return;
    }

    const success = await auth.login(username, password);
    if (!success) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-background flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full p-8 space-y-6 shadow-2xl border-border/50">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isFirstTimeSetup ? 'Setup Admin Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isFirstTimeSetup
              ? 'Create the first administrator account and pick your industry template.'
              : 'Sign in with your existing account to access your ProSource workspace.'}
          </p>
        </div>

        {isFirstTimeSetup && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Choose your industry</h2>
                <p className="text-xs text-muted-foreground">You can change this later in Settings.</p>
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                Selected: <span className="text-foreground">{INDUSTRY_PROFILES.find(p => p.id === selectedIndustry)?.name || 'None'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {INDUSTRY_PROFILES.map((profile: IndustryProfile) => {
                const active = selectedIndustry === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedIndustry(profile.id)}
                    className={`text-left rounded-2xl border p-4 transition-all ${
                      active
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-border bg-card hover:border-blue-500/60 hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl leading-none">{profile.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm text-foreground truncate">{profile.name}</h3>
                          {active && <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Selected</span>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{profile.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {profile.defaultModules.slice(0, 3).map((mod) => (
                            <span key={mod} className="text-[10px] uppercase tracking-tighter font-bold px-2 py-0.5 bg-white border border-border rounded text-muted-foreground">
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
            {isFirstTimeSetup ? 'Create Admin & Continue' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {isFirstTimeSetup ? 'First-time setup' : 'ProSource CRM v2 Secure Login'}
          </p>
        </div>
      </Card>
    </div>
  );
}
