import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { alertService } from '@/services/alertService';

export default function VerifyEmail() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token,
        type: 'email',
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      alertService.alertSyncFailed(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground">
            Please enter the verification code sent to your email.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center text-sm">
            Your email has been successfully verified!
            <div className="mt-4">
              <a href="/dashboard" className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors inline-block">
                Go to Dashboard
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex justify-center gap-2">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                maxLength={6}
                className="w-full px-3 py-2 border border-border rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="123456"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Verifying...' : 'Verify Email'}
            </button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Didn't receive a code? <a href="#" className="text-accent hover:underline">Resend code</a>
              </p>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
