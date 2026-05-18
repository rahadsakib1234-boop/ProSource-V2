import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation } from 'wouter'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  accountType: z.enum(['company', 'personal']).default('company'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [accountType, setAccountType] = useState<'company' | 'personal'>('company')

  // Get account type from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const type = urlParams.get('accountType') as 'company' | 'personal' | null
    if (type === 'company' || type === 'personal') {
      setAccountType(type)
    }
  }, [])

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { accountType: 'company' }
  })

  // Set the account type in the form when it changes
  useEffect(() => {
    setValue('accountType', accountType)
  }, [accountType, setValue])

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    try {
      // 1. Call register-admin edge function
      const { data: regData, error: regError } = await supabase.functions.invoke('register-admin', {
        body: {
          email: values.email,
          password: values.password,
          accountType: values.accountType
        }
      })

      if (regError || !regData?.success) {
        throw new Error(regError?.message || regData?.error || 'Registration failed')
      }

      // 2. Now that user is created, trigger create-checkout
      // The user is now authenticated in Supabase Auth because register-admin
      // created the user and we can now sign in.
      // NOTE: For a seamless flow, the register-admin fn can return a token
      // or we sign in manually. Let's sign in first to get the session.

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (signInError) throw signInError

      // For now, we'll redirect to the app dashboard instead of Stripe
      // In a real implementation, you would integrate Stripe here
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-slate-600 mb-8">Welcome to ProSource CRM. You're being redirected to your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/account-type')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="text-sm text-slate-500">
            {accountType === 'company' ? 'Company Account' : 'Personal Account'}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Your Account</h1>
          <p className="text-slate-500 mt-2">
            {accountType === 'company'
              ? 'Set up your company account to start managing your team'
              : 'Create your personal account to start using ProSource CRM'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register('email')} placeholder="name@company.com" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>

          <input type="hidden" {...register('accountType')} value={accountType} />

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${accountType === 'company' ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
              <span className="text-sm font-medium text-slate-700">Company Account Features</span>
            </div>
            <ul className="text-xs text-slate-500 space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                Create employee accounts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                Set permissions for team members
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                Centralized billing and management
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-bold transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Creating Account...
              </span>
            ) : 'Get Started'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Register
