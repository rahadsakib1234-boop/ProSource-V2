/*
 * Employee Management Page
 * Admin-only page to manage team members and roles
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Users, Plus, Trash2, Edit2, Upload } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  joinDate: string;
  status: 'active' | 'inactive';
}

export default function EmployeeManagement() {
  const { auth } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'You',
      email: auth.user?.email || 'admin@company.com',
      role: 'admin',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{ name: string; email: string; role: Employee['role'] }>({
    name: '',
    email: '',
    role: 'employee',
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setEmployees([...employees, newEmployee]);
    setFormData({ name: '', email: '', role: 'employee' });
    setShowAddForm(false);
    setMessage({ type: 'success', text: 'Employee added successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteEmployee = (id: string) => {
    if (id === '1') {
      setMessage({ type: 'error', text: 'Cannot delete your own account' });
      return;
    }

    setEmployees(employees.filter(e => e.id !== id));
    setMessage({ type: 'success', text: 'Employee removed' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRoleChange = (id: string, newRole: Employee['role']) => {
    if (id === '1') {
      setMessage({ type: 'error', text: 'Cannot change your own role' });
      return;
    }

    setEmployees(employees.map(e => e.id === id ? { ...e, role: newRole } : e));
    setMessage({ type: 'success', text: 'Role updated' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const newEmployees: Employee[] = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const [name, email, role] = lines[i].split(',').map(s => s.trim());
          if (name && email) {
            newEmployees.push({
              id: `emp-${Date.now()}-${i}`,
              name,
              email,
              role: role === 'admin' ? 'admin' : 'employee',
              joinDate: new Date().toISOString().split('T')[0],
              status: 'active',
            });
          }
        }

        setEmployees([...employees, ...newEmployees]);
        setMessage({ type: 'success', text: `Imported ${newEmployees.length} employees` });
        setCsvFile(null);
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to parse CSV file' });
      }
    };
    reader.readAsText(file);
  };

  const adminCount = employees.filter(e => e.role === 'admin').length;
  const employeeCount = employees.filter(e => e.role === 'employee').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage employees and assign roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground">{employees.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-foreground">{adminCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Employees</p>
            <p className="text-2xl font-bold text-foreground">{employeeCount}</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add Employee Form */}
        {showAddForm && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Add New Employee</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                Add Employee
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bulk Import */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Bulk Import (CSV)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a CSV file with columns: Name, Email, Role (admin/employee)
          </p>
          <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Choose CSV file</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          {csvFile && <p className="text-xs text-muted-foreground mt-2">Selected: {csvFile.name}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>

        {/* Employees Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Join Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-secondary transition-colors">
                  <td className="px-6 py-3 text-sm text-foreground">{emp.name}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{emp.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <select
                      value={emp.role}
                      onChange={(e) => handleRoleChange(emp.id, e.target.value as 'admin' | 'employee')}
                      disabled={emp.id === '1'}
                      className="px-2 py-1 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{emp.joinDate}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        disabled={emp.id === '1'}
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
