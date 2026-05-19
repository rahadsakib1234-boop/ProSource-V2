/*
 * Employee Management Page
 * Admin-only page to manage team members and roles
 */

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { alertService } from '@/services/alertService';
import { User } from '@/types';

export default function EmployeeManagement() {
  const { auth } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    password: '',
    role: 'employee',
    permissions: [],
  });

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const data = await auth.getUsers();
      setUsers(data);
      setLoading(false);
    }
    loadUsers();
  }, [auth]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const success = await auth.addUser(
        newEmployee.email,
        newEmployee.password,
        newEmployee.role as 'admin' | 'employee',
        newEmployee.permissions
      );
      if (success) {
        alertService.alertSyncCompleted('Employee added successfully');
        setNewEmployee({ email: '', password: '', role: 'employee', permissions: [] });
        await loadUsers();
      } else {
        throw new Error('Failed to add employee');
      }
    } catch (error) {
      alertService.alertSyncFailed(error instanceof Error ? error.message : 'Employee addition failed');
    } finally {
      setIsAdding(false);
    }
  };

  async function loadUsers() {
    setLoading(true);
    const data = await auth.getUsers();
    setUsers(data);
    setLoading(false);
  }

  const handleUpdateRole = async (id: string, role: 'admin' | 'employee', permissions: string[]) => {
    try {
      const success = await auth.updateUserRole(id, role, permissions);
      if (success) {
        alertService.alertSyncCompleted('User updated successfully');
        await loadUsers();
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      alertService.alertSyncFailed(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const success = await auth.deleteUser(id);
      if (success) {
        alertService.alertSyncCompleted('User deleted successfully');
        await loadUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      alertService.alertSyncFailed(error instanceof Error ? error.message : 'Deletion failed');
    }
  };

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
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee System</h1>
            <p className="text-muted-foreground mt-1">Manage team members and their access levels</p>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-accent text-white hover:bg-blue-700"
          >
            {isAdding ? 'Cancel' : '+ Add Employee'}
          </Button>
        </div>

        {isAdding && (
          <Card className="p-6 space-y-4 bg-secondary/30 border-accent/50">
            <h2 className="text-lg font-semibold text-foreground">Add New Employee</h2>
            <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                  placeholder="employee@company.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Temporary Password</label>
                <Input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <Select
                  value={newEmployee.role}
                  onValueChange={(val) => setNewEmployee({ ...newEmployee, role: val as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-accent text-white hover:bg-blue-700"
                >
                  {isAdding ? '⏳ Adding...' : 'Create Employee'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {users.length === 0 ? (
              <Card className="p-12 text-center space-y-2">
                <p className="text-muted-foreground">No employees found.</p>
                <p className="text-xs text-muted-foreground">Start by adding your first team member.</p>
              </Card>
            ) : (
              users.map((user) => (
                <Card key={user.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{user.username}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(val) => handleUpdateRole(user.id, val as any, user.permissions || [])}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === auth.user?.id}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
