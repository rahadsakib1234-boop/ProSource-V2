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
  const [accountType, setAccountType] = useState<'company' | 'personal'>('company');
  const [selectedIndustry, setSelectedIndustry] = useState(settings.settings.industry || 'sourcing');
  const [error, setError] = useState('');
  const [setupStep, setSetupStep] = useState<'account' | 'industry' | 'login' | 'loading'>('loading');

  useEffect(() => {
    if (settings.loading || auth.loading) {
      setSetupStep('loading');
      return;
    }

    const configured = Boolean(settings.settings.isConfigured);
    setSetupStep(configured ? 'login' : 'account');
  }, [auth.loading, settings.loading, settings.settings.isConfigured]);

  const currentProfile = INDUSTRY_PROFILES.find((profile) => profile.id === selectedIndustry) || INDUSTRY_PROFILES[0];

  const showAccountSetup = setupStep === 'account';
  const showIndustrySetup = setupStep === 'industry';

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await auth.registerAccount(email, password, accountType);
    if (!result.success) {
      setError(result.error || 'Failed to create the account.');
      return;
    }

    if (result.organizationId) {
      await settings.saveSettings({
        ...settings.settings,
        organizationId: result.organizationId,
        authEnabled: true,
        isConfigured: accountType === 'personal',
      });
    }

    if (accountType === 'company') {
      setSetupStep('industry');
    }
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
          <h2 className="text-sm font-semibold text-foreground">Choose your company setup</h2>
          <p className="text-xs text-muted-foreground">This changes labels, shortcuts, and defaults for the workspace.</p>
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
      <Card className="max-w-4xl w-full p-8 space-y-6 shadow-2xl border-border/50">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Multi-tenant SaaS login
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {showAccountSetup ? 'Create your workspace' : showIndustrySetup ? 'Set up your company' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {showAccountSetup
                ? 'Start with a company workspace or a personal workspace. Company admins can later create employee accounts and limit what each employee can see.'
                : showIndustrySetup
                  ? 'Pick the company template that matches how you work. You can change this later.'
                  : 'Sign in to your own workspace.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company</div>
                <div className="mt-2 text-sm text-foreground">Admin creates employee accounts and permissions.</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Personal</div>
                <div className="mt-2 text-sm text-foreground">Private workspace for one user only.</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Permissions</div>
                <div className="mt-2 text-sm text-foreground">Admins choose which screens employees can open.</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background/60 p-5 space-y-4">
            {showIndustrySetup ? (
              <>
                {renderIndustryPicker()}
                {error && <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>}
                <Button type="button" onClick={handleFinishSetup} className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-blue-500/20">
                  Finish Setup & Open Workspace
                </Button>
              </>
            ) : (
              <form onSubmit={showAccountSetup ? handleAccountSubmit : handleLoginSubmit} className="space-y-4">
                {showAccountSetup && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Workspace type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setAccountType('company')} className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${accountType === 'company' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-border bg-card text-foreground'}`}>
                        Company
                      </button>
                      <button type="button" onClick={() => setAccountType('personal')} className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${accountType === 'personal' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-border bg-card text-foreground'}`}>
                        Personal
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder={accountType === 'company' ? 'name@company.com' : 'you@email.com'}
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

                {error && <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>}

                <Button type="submit" className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-blue-500/20">
                  {showAccountSetup ? (accountType === 'company' ? 'Create Company Workspace' : 'Create Personal Workspace') : 'Sign In'}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {showAccountSetup ? 'First-time setup' : 'ProSource CRM v2 Secure Login'}
          </p>
        </div>
      </Card>
    </div>
  );
}
