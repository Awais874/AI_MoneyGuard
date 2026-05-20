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
    if (!token) {
      router.push('/login')
      return
    }
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

  if (!summary) return <div className="text-white">Loading...</div>

  const pieData = [
    { name: 'Clean', value: summary.clean },
    { name: 'Fraud', value: summary.fraud }
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-700 p-6 rounded-xl text-center">
          <p className="text-gray-400 mb-1">Total Amount</p>
          <p className="text-2xl font-bold">${summary.total_amount.toLocaleString()}</p>
        </div>
        <div className="bg-green-700 p-6 rounded-xl text-center">
          <p className="text-gray-200 mb-1">Clean Amount</p>
          <p className="text-2xl font-bold">${summary.clean_amount.toLocaleString()}</p>
        </div>
        <div className="bg-red-700 p-6 rounded-xl text-center">
          <p className="text-gray-200 mb-1">Fraud Amount</p>
          <p className="text-2xl font-bold">${summary.fraud_amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">

        {/* Pie Chart */}
        <div className="bg-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Fraud vs Clean</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Transactions Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={byDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#eab308" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} name="Fraud" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}