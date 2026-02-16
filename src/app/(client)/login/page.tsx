'use client'

import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { login } from '@/lib/auth-api'
import { useAuthStore } from '@/store/authStore'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>()

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const u = data.user
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          role: u.role as 'super_admin' | 'admin' | 'user',
          permissions: u.permissions ?? undefined,
        })
        toast.success('Signed in successfully')
        router.replace('/table')
      }
    },
    onError: (err: Error) => {
      setError('root', { message: err.message })
      toast.error('Login failed', { description: err.message })
    },
  })

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-xl"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        <div className="mb-8 flex items-center gap-3">
          <img
            alt="Selise Super League"
            src="/assets/ssl-logo.png"
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-[#004556]">Super League</h1>
            <p className="text-sm text-[#605e5c]">Admin Portal</p>
          </div>
        </div>
        <h2 className="mb-6 text-lg font-semibold text-[#201f1e]">Sign in</h2>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#201f1e]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#201f1e] focus:border-[#267c93] focus:outline-none focus:ring-1 focus:ring-[#267c93]"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#201f1e]">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#201f1e] focus:border-[#267c93] focus:outline-none focus:ring-1 focus:ring-[#267c93]"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          {errors.root && (
            <p className="text-sm text-red-600">{errors.root.message}</p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-[#267c93] px-4 py-2.5 font-medium text-white transition hover:bg-[#1e6375] disabled:opacity-60"
          >
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}