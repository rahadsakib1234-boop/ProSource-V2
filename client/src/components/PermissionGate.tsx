import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { canAccessModule, getModuleForPath } from '@/services/accessControl';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function PermissionGate({ children }: { children: React.ReactNode }) {
  const { auth } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const module = getModuleForPath(pathname);
  const hasAccess = canAccessModule(auth.user, module);

  if (!hasAccess) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-lg p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have the necessary permissions to access this section of the CRM.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm"
            >
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
