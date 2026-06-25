'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS = ['#22c55e', '#ef4444']

export default function Analytics() {
  const router = useRouter()
  const [summary, setSummary] = useState(null)
  const [byDate, setByDate] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchAnalytics(token)
  }, [])

  async function fetchAnalytics(token) {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [summaryRes, byDateRes] = await Promise.all([
        api.get('/api/analytics/summary', { headers }),
        api.get('/api/analytics/by-date', { headers })
      ])
      setSummary(summaryRes.data)
      setByDate(byDateRes.data)
    } catch (err) {
      router.push('/login')
    }
  }

  if (!summary) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 text-sm">Loading analytics...</div>
    </div>
  )

  const pieData = [
    { name: 'Clean', value: summary.clean },
    { name: 'Fraud', value: summary.fraud }
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-slate-400 text-sm mt-1">Overview of your transaction activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-slate-800 border border-slate-700/60 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Total Amount</p>
          <p className="text-2xl font-bold text-white">${summary.total_amount.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">All transactions combined</p>
        </div>
        <div className="bg-linear-to-br from-emerald-900/70 to-emerald-800/30 border border-emerald-700/40 p-6 rounded-2xl">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">Clean Amount</p>
          <p className="text-2xl font-bold text-white">${summary.clean_amount.toLocaleString()}</p>
          <p className="text-xs text-emerald-500/70 mt-1">Verified legitimate</p>
        </div>
        <div className="bg-linear-to-br from-rose-900/70 to-red-800/30 border border-rose-700/40 p-6 rounded-2xl">
          <p className="text-rose-400 text-xs font-semibold uppercase tracking-wide mb-2">Fraud Amount</p>
          <p className="text-2xl font-bold text-white">${summary.fraud_amount.toLocaleString()}</p>
          <p className="text-xs text-rose-500/70 mt-1">Flagged &amp; blocked</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">Fraud vs Clean</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">Transactions Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={byDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Total" />
              <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Fraud" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
