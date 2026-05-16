import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { INDUSTRY_PROFILES } from '../services/industries';
import { buildIndustryTemplateSettings } from '../services/templateCustomization';
import type { IndustryProfile } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function Login() {
  const { auth, settings } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(settings.settings.industry || 'sourcing');
  const [error, setError] = useState('');
  const [setupStep, setSetupStep] = useState<'admin' | 'industry' | 'login' | 'loading'>('loading');

  useEffect(() => {
    if (settings.loading || auth.loading) {
      setSetupStep('loading');
      return;
    }

    const configured = Boolean(settings.settings.isConfigured);
    setSetupStep(configured ? 'login' : 'admin');
  }, [auth.loading, settings.loading, settings.settings.isConfigured]);

  const currentProfile = INDUSTRY_PROFILES.find((profile) => profile.id === selectedIndustry) || INDUSTRY_PROFILES[0];

  const showAdminSetup = setupStep === 'admin';
  const showIndustrySetup = setupStep === 'industry';

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await auth.registerAdmin(email, password);
    if (!result.success) {
      setError(result.error || 'Failed to create the admin account.');
      return;
    }

    if (result.organizationId) {
      settings.saveSettings({
        ...settings.settings,
        organizationId: result.organizationId,
      });
    }

    setSetupStep('industry');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await auth.login(email, password);
    if (!success) {
      setError('Invalid email or password.');
    }
  };

  const handleFinishSetup = () => {
    setError('');
    const nextSettings = buildIndustryTemplateSettings(
      {
        ...settings.settings,
        industry: selectedIndustry,
        isConfigured: true,
        authEnabled: true,
      },
      selectedIndustry
    );
    const saved = settings.saveSettings(nextSettings);
    if (!saved) {
      setError('Could not save the selected industry. Please try again.');
    }
  };

  const renderIndustryPicker = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Choose your industry</h2>
          <p className="text-xs text-muted-foreground">You can change this later in Settings.</p>
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          Selected: <span className="text-foreground">{currentProfile.name}</span>
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
                      <span
                        key={mod}
                        className="text-[10px] uppercase tracking-tighter font-bold px-2 py-0.5 bg-white border border-border rounded text-muted-foreground"
                      >
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
  );

  return (
    <div className="fixed inset-0 z-[110] bg-background flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full p-8 space-y-6 shadow-2xl border-border/50">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {showAdminSetup ? 'Setup Admin Account' : showIndustrySetup ? 'Choose Your Industry' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {showAdminSetup
              ? 'Create the first administrator account to unlock your workspace.'
              : showIndustrySetup
                ? 'Your admin is ready. Pick the industry template for this workspace.'
                : 'Sign in with your existing account to access your ProSource workspace.'}
          </p>
        </div>

        {showIndustrySetup ? (
          <>
            {renderIndustryPicker()}
            {error && (
              <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                {error}
              </p>
            )}
            <Button type="button" onClick={handleFinishSetup} className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-blue-500/20">
              Finish Setup & Launch CRM
            </Button>
          </>
        ) : (
          <form onSubmit={showAdminSetup ? handleAdminSubmit : handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="name@company.com"
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
              {showAdminSetup ? 'Create Admin' : 'Sign In'}
            </Button>
          </form>
        )}

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {showAdminSetup ? 'First-time setup' : 'ProSource CRM v2 Secure Login'}
          </p>
        </div>
      </Card>
    </div>
  );
}
