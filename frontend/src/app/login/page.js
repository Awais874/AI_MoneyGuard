'use client'
import { useState } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const token = res.data.access_token
      localStorage.setItem('token', token)
      const me = await api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      localStorage.setItem('role', me.data.role)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #0f172a 60%, #1a1040 100%)' }}
    >
      <div className="w-full max-w-md px-4">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-2xl font-extrabold text-black shadow-lg shadow-amber-500/30 mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold text-white">MoneyGuard</h1>
          <p className="text-slate-400 text-sm mt-1">Fraud Detection AI</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="bg-rose-900/40 border border-rose-700/50 text-rose-300 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-xl outline-none focus:border-amber-500 transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-xl outline-none focus:border-amber-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold p-3 rounded-xl mt-6 transition-colors shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-slate-400 text-sm text-center mt-5">
            Don't have an account?{' '}
            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
