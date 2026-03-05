'use client';

import { useState, useTransition } from 'react';
import { Flag, LogIn, ShieldAlert } from 'lucide-react';
import { loginUser } from '@/actions/authActions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginUser(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sm:p-10 flex flex-col items-center">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 text-[#0f172a]">
            {/* Using a solid-filled flag icon by increasing strokeWidth or using fill */}
            <Flag size={48} strokeWidth={1.5} fill="#0f172a" stroke="#0f172a" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-1">TPI Accounting</h1>
          <p className="text-sm font-semibold text-gray-400 tracking-wider">SYSTEM LOGIN</p>
        </div>

        {/* Login Form */}
        <form action={handleSubmit} className="w-full space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0f172a]" htmlFor="identifier">
              Username/Email
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="Enter your credentials"
              required
              disabled={isPending}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-semibold text-[#0f172a]" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] active:bg-[#020617] text-white py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
          >
            {isPending ? 'Signing In...' : 'Sign In'}
            {!isPending && <LogIn size={16} />}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 flex flex-col items-center text-xs text-gray-500 space-y-1.5">
          <p>Internal Tracking System &copy; {new Date().getFullYear()}</p>
          <p>
            Forgot Password? <span className="font-semibold text-[#0f172a] ml-1">Contact IT Support</span>
          </p>
        </div>
      </div>

      {/* Access Warning */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium tracking-wider">
        <ShieldAlert size={12} />
        <p>AUTHORIZED PERSONNEL ACCESS ONLY</p>
      </div>
    </div>
  );
}
