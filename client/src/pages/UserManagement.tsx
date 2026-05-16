import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function UserManagement() {
  const { auth } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
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

    const added = await auth.addUser(username, password, role);
    if (added) {
      setSuccess(`User ${username} added successfully!`);
      setUsername('');
      setPassword('');
    } else {
      setError('Failed to add user. Username might already exist.');
    }
  };

  if (auth.user?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground font-medium">You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage team accounts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add User Form */}
          <Card className="p-6 space-y-6 h-fit border-border/50">
            <h3 className="font-bold text-lg text-foreground">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="john_doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'employee')}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              {success && <p className="text-xs text-green-600 font-medium">{success}</p>}

              <Button type="submit" className="w-full py-5 font-bold rounded-lg">
                Create Account
              </Button>
            </form>
          </Card>

          {/* User List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-lg text-foreground px-1">Active Team Members</h3>
            <div className="grid grid-cols-1 gap-3">
              {users.map((user) => (
                <Card key={user.id} className="p-4 flex items-center justify-between border-border/50 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{user.username}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                        {user.role} {auth.user?.id === user.id && '(You)'}
                      </p>
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
