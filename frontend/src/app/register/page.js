'use client'
import { useState } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleRegister() {
    try {
      await api.post('/api/auth/register', { username, email, password })
      router.push('/login')
    } catch (err) {
      setError('Registration failed. Email may already exist.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500 text-white">
      <div className="bg-black-1000 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          className="w-full bg-gray-600 p-3 rounded-lg mb-4 outline-none"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-gray-600 p-3 rounded-lg mb-4 outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-gray-600 p-3 rounded-lg mb-6 outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          Register
        </button>
        <p className="text-gray-400 text-center mt-4">
          Already have an account? <Link href="/login" className="text-blue-400">Login</Link>
        </p>
      </div>
    </div>
  )
}