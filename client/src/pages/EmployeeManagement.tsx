/*
 * Employee Management Page
 * Admin-only page to manage team members and roles
 */

import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';

export default function EmployeeManagement() {
  const { auth } = useApp();

  if (auth.user?.accountType !== 'company') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-lg p-6 text-center space-y-3">
            <h2 className="text-xl font-bold text-foreground">No employee system in personal workspaces</h2>
            <p className="text-muted-foreground">This workspace is personal, so there are no employees to manage.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee System</h1>
          <p className="text-muted-foreground mt-1">Company admins manage employees from Team Access.</p>
        </div>

        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">How it works</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>The company admin creates employees from the Team Access page.</li>
            <li>Each employee gets their own login.</li>
            <li>Admin chooses exactly which screens and actions each employee can access.</li>
            <li>Personal workspaces do not show employee management.</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
