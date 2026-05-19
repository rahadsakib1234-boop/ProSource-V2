import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { alertService } from '@/services/alertService';

export default function Onboarding() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alertService.alertSyncFailed('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      alertService.alertSyncFailed(error instanceof Error ? error.message : 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Welcome to ProSource CRM</h1>
          <p className="text-sm text-muted-foreground">
            You have been invited to join your company's workspace. Please set your password to get started.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center text-sm">
            Password set successfully! You can now access your dashboard.
            <div className="mt-4">
              <a href="/dashboard" className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors inline-block">
                Go to Dashboard
              </a>
            </div>
          </div>
        ) : (
          <Card className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white hover:bg-blue-700"
              >
                {loading ? '⏳ Saving...' : 'Set Password & Start'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
}
