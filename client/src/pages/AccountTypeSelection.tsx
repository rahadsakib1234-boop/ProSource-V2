import React, { useState } from 'react'
import { useNavigate } from 'wouter'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, User } from 'lucide-react'

const AccountTypeSelection = () => {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<'company' | 'personal' | null>(null)

  const handleContinue = () => {
    if (selectedType) {
      navigate(`/app/register?accountType=${selectedType}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h1>
          <p className="text-slate-500">Choose the account type that best fits your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`p-6 cursor-pointer border-2 transition-all ${
              selectedType === 'company'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
            onClick={() => setSelectedType('company')}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Company Account</h3>
            </div>
            <p className="text-slate-600 mb-4">Perfect for teams and businesses</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Create employee accounts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Set permissions for each team member
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Centralized billing and management
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                All Pro features included
              </li>
            </ul>
          </Card>

          <Card
            className={`p-6 cursor-pointer border-2 transition-all ${
              selectedType === 'personal'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
            onClick={() => setSelectedType('personal')}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Personal Account</h3>
            </div>
            <p className="text-slate-600 mb-4">For individual use</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Use all CRM features yourself
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                No employee management
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Limited to one user
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Basic feature set
              </li>
            </ul>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            Continue with {selectedType === 'company' ? 'Company' : selectedType === 'personal' ? 'Personal' : 'Selected'} Account
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AccountTypeSelection