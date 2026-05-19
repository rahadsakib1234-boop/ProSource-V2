import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { alertService } from '@/services/alertService';

export default function Billing() {
  const { auth } = useApp();
  const [subscription, setSubscription] = useState<any>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!auth.user?.organizationId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', auth.user.organizationId)
          .single();
        setSubscription(data);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, [auth.user?.organizationId]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${auth.session?.access_token ?? (await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
        },
      });

      if (error || !data?.url) {
        throw new Error(error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      alertService.alertSyncFailed(error instanceof Error ? error.message : 'Upgrade failed');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your plan and payment methods</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-3xl">
          <h3 className="font-semibold text-foreground mb-4">Current Plan</h3>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-xl border border-border">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {subscription?.plan ? 'Pro Plan' : 'Free Plan'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Status: <span className={`capitalize ${subscription?.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {subscription?.status || 'No active subscription'}
                    </span>
                  </div>
                </div>

                {subscription?.status !== 'active' && (
                  <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="px-6 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpgrading ? '⏳ Processing...' : 'Upgrade to Pro'}
                  </button>
                )}
              </div>

              {subscription?.status === 'active' && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  ✓ Your account is currently on the Pro plan. You have full access to all premium features.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-xl">
                  <div className="text-sm font-medium text-foreground mb-2">Next Billing Date</div>
                  <div className="text-lg font-semibold">
                    {subscription?.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
                <div className="p-4 border border-border rounded-xl">
                  <div className="text-sm font-medium text-foreground mb-2">Customer ID</div>
                  <div className="text-lg font-semibold truncate">
                    {subscription?.stripe_customer_id || 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-3xl">
          <h3 className="font-semibold text-foreground mb-4">Plan Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Feature</th>
                  <th className="px-4 py-3">Free Plan</th>
                  <th className="px-4 py-3 rounded-tr-lg">Pro Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 font-medium">Basic CRM Tools</td>
                  <td className="px-4 py-3 text-green-600">✓</td>
                  <td className="px-4 py-3 text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Cloud Backup</td>
                  <td className="px-4 py-3 text-red-600">✗</td>
                  <td className="px-4 py-3 text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Team Management</td>
                  <td className="px-4 py-3 text-red-600">✗</td>
                  <td className="px-4 py-3 text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Advanced Analytics</td>
                  <td className="px-4 py-3 text-red-600">✗</td>
                  <td className="px-4 py-3 text-green-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
