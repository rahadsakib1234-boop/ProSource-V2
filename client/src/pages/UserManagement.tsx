import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { APP_MODULES, MODULE_LABELS } from '@/services/accessControl';

export default function UserManagement() {
  const { auth } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  const [permissions, setPermissions] = useState<string[]>(['dashboard', 'clients', 'products', 'leads', 'pipeline', 'invoices', 'reports']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    auth.getUsers().then((list) => {
      if (mounted) setUsers(list || []);
    }).catch((err) => console.error(err));
    return () => { mounted = false; };
  }, [auth]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const added = await auth.addUser(email, password, role, role === 'employee' ? permissions : []);
    if (added) {
      setSuccess(`${email} added successfully.`);
      setEmail('');
      setPassword('');
      setPermissions(['dashboard', 'clients', 'products', 'leads', 'pipeline', 'invoices', 'reports']);
    } else {
      setError('Failed to add user.');
    }
  };

  if (auth.user?.accountType !== 'company') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-lg p-6 text-center space-y-3">
            <h2 className="text-xl font-bold text-foreground">Employee management is for company workspaces only</h2>
            <p className="text-muted-foreground">Personal workspaces stay single-user. Company admins can create employee accounts and limit what each employee can access.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (auth.user?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground font-medium">You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  const togglePermission = (key: string) => {
    setPermissions((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Team Access</h1>
          <p className="text-muted-foreground">Create employee accounts and decide which parts of the app they can use.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 space-y-6 h-fit border-border/50">
            <h3 className="font-bold text-lg text-foreground">Create employee account</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="employee@company.com" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="temporary password" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'employee')} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {APP_MODULES.filter((m) => m !== 'users').map((module) => (
                    <button key={module} type="button" onClick={() => togglePermission(module)} className={`rounded-xl border px-3 py-2 text-left text-sm transition ${permissions.includes(module) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-border bg-card text-foreground'}`}>
                      {MODULE_LABELS[module]}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              {success && <p className="text-xs text-green-600 font-medium">{success}</p>}

              <Button type="submit" className="w-full py-5 font-bold rounded-lg">
                Create Employee
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-lg text-foreground px-1">Current team</h3>
              <p className="text-xs text-muted-foreground px-1">Employees only see the modules you allow.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {users.map((user) => (
                <Card key={user.id} className="p-4 flex items-center justify-between border-border/50 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{user.username}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                        {user.role} {auth.user?.id === user.id && '(You)'}
                      </p>
                      {user.permissions?.length ? <p className="text-xs text-muted-foreground mt-1">Access: {user.permissions.map((p: string) => MODULE_LABELS[p as keyof typeof MODULE_LABELS] || p).join(', ')}</p> : null}
                    </div>
                  </div>

                  {auth.user?.id !== user.id && (
                    <Button 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${user.username}?`)) {
                          auth.deleteUser(user.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
