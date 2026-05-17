import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation } from 'wouter'
import { Loader2, Lock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubscriptionGateProps {
  children: React.ReactNode
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    async function checkSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setHasAccess(false)
          return
        }

        // Get profile to get organization_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!profile?.organization_id) {
          setHasAccess(false)
          return
        }

        // Check subscription status
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status, current_period_end')
          .eq('organization_id', profile.organization_id)
          .single()

        const isActive = sub?.status === 'active' &&
          (sub.current_period_end ? new Date(sub.current_period_end) > new Date() : false)

        setHasAccess(isActive)
      } catch (error) {
        console.error('Subscription check failed:', error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verifying subscription...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Subscription Required</h2>
          <p className="text-slate-600 mb-8">
            To access the ProSource CRM, you need an active subscription.
            Get started by choosing a plan.
          </p>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-bold transition-all"
            onClick={() => navigate('/payment-setup')}
          >
            <div className="flex items-center gap-2">
              <CreditCard size={18} />
              Upgrade Now
            </div
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default SubscriptionGate
