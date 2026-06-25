'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (!token) { router.push('/login'); return }
    if (role !== 'admin') { router.push('/dashboard'); return }
    fetchAdminData(token)
  }, [])

  async function fetchAdminData(token) {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [txRes, summaryRes, usersRes] = await Promise.all([
        api.get('/api/transactions/all', { headers }),
        api.get('/api/analytics/admin/summary', { headers }),
        api.get('/api/auth/admin/users', { headers }),
      ])
      setTransactions(txRes.data)
      setSummary(summaryRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      setError('Access denied or failed to load data')
    }
  }

  async function handleRoleChange(userId, newRole) {
    const token = localStorage.getItem('token')
    try {
      await api.patch(`/api/auth/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      setError('Failed to update role')
    }
  }

  if (error) return (
    <div className="bg-rose-900/40 border border-rose-700/50 text-rose-300 text-sm px-4 py-3 rounded-xl">
      {error}
    </div>
  )

  if (!summary) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 text-sm">Loading admin panel...</div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        <p className="text-slate-400 text-sm mt-1">Platform-wide overview and user management</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-slate-800 border border-slate-700/60 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Total Transactions</p>
          <p className="text-3xl font-bold text-white">{summary.total}</p>
          <p className="text-xs text-slate-500 mt-1">Platform-wide</p>
        </div>
        <div className="bg-linear-to-br from-emerald-900/70 to-emerald-800/30 border border-emerald-700/40 p-6 rounded-2xl">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">Clean</p>
          <p className="text-3xl font-bold text-white">{summary.clean}</p>
          <p className="text-xs text-emerald-500/70 mt-1">Verified legitimate</p>
        </div>
        <div className="bg-linear-to-br from-rose-900/70 to-red-800/30 border border-rose-700/40 p-6 rounded-2xl">
          <p className="text-rose-400 text-xs font-semibold uppercase tracking-wide mb-2">Fraud</p>
          <p className="text-3xl font-bold text-white">{summary.fraud}</p>
          <p className="text-xs text-rose-500/70 mt-1">Flagged transactions</p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">User Management</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-700">
              <th className="pb-3">ID</th>
              <th className="pb-3">Username</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-3 text-slate-400 text-sm">#{u.id}</td>
                <td className="py-3 font-medium text-white">{u.username}</td>
                <td className="py-3 text-slate-300 text-sm">{u.email}</td>
                <td className="py-3">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="bg-slate-900 border border-slate-600 text-white text-sm p-2 rounded-lg outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="user">user</option>
                    <option value="analyst">analyst</option>
                    <option value="compliance_officer">compliance_officer</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* All Transactions */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">All Transactions — Platform-wide</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-700">
              <th className="pb-3">ID</th>
              <th className="pb-3">User ID</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-3 text-slate-400 text-sm">#{tx.id}</td>
                <td className="py-3 text-slate-400 text-sm">#{tx.user_id}</td>
                <td className="py-3 font-medium">${tx.amount.toLocaleString()}</td>
                <td className="py-3 capitalize text-slate-300 text-sm">{tx.transaction_type}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${tx.is_fraud ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                    {tx.is_fraud ? '⚠ Fraud' : '✓ Clean'}
                  </span>
                </td>
                <td className="py-3 text-slate-400 text-sm">{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="text-slate-500 text-center mt-8 text-sm">No transactions on the platform yet.</p>
        )}
      </div>
    </div>
  )
}
