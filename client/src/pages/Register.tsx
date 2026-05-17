import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'wouter'
import { Loader2, CheckCircle2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { accountType: 'company' }
  })

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

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${ (await supabase.auth.getSession()).data.session?.access_token }`
        }
      })

      if (checkoutError || !checkoutData?.url) {
        throw new Error(checkoutError?.message || 'Checkout session creation failed')
      }

      // Redirect to Stripe
      window.location.href = checkoutData.url
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
          <p className="text-slate-600 mb-8">You are being redirected to Stripe to complete your setup.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Your Account</h1>
          <p className="text-slate-500 mt-2">Join ProSource CRM and start sourcing</p>
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

          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="radio" value="company" {...register('accountType')} className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Company</span>
              </label>
              <label className="relative flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="radio" value="personal" {...register('accountType')} className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Personal</span>
              </label>
            </div>
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
