import React, { useState } from 'react';
import { INDUSTRY_PROFILES } from '../services/industries';
import { IndustryProfile } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface OnboardingWizardProps {
  onComplete: (industryId: string) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [selectedId, setSelectedId] = useState<string>('sourcing');

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleFinish = () => {
    onComplete(selectedId);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full space-y-8 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome to ProSource <span className="text-blue-600">CRM</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Let's customize your workspace. Select the industry that best describes your business to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDUSTRY_PROFILES.map((profile: IndustryProfile) => (
            <Card
              key={profile.id}
              onClick={() => handleSelect(profile.id)}
              className={`p-5 cursor-pointer transition-all border-2 hover:border-blue-500/50 ${
                selectedId === profile.id ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-border'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="text-3xl p-3 bg-white rounded-xl shadow-sm border border-border">
                  {profile.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground">{profile.name}</h3>
                  <p className="text-xs text-muted-foreground leading-tight h-8 overflow-hidden">
                    {profile.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap justify-center gap-1">
                {profile.defaultModules.slice(0, 3).map(mod => (
                  <span key={mod} className="text-[8px] uppercase tracking-tighter font-bold px-1.5 py-0.5 bg-white border border-border rounded text-muted-foreground">
                    {mod}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            size="lg" 
            className="px-12 py-6 text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/20"
            onClick={handleFinish}
          >
            Finish Setup & Launch CRM
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can always change these settings later in the configuration panel.
        </p>
      </div>
    </div>
  );
}
