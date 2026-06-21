'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
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
      const [txRes, summaryRes] = await Promise.all([
        api.get('/api/transactions/all', { headers }),
        api.get('/api/analytics/admin/summary', { headers }),
      ])
      setTransactions(txRes.data)
      setSummary(summaryRes.data)
    } catch (err) {
      setError('Access denied or failed to load data')
    }
  }

  if (error) return <p className="text-red-400">{error}</p>
  if (!summary) return <p className="text-white">Loading...</p>

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Admin Panel</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-700 p-6 rounded-xl text-center">
          <p className="text-gray-400 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold">{summary.total}</p>
        </div>
        <div className="bg-green-700 p-6 rounded-xl text-center">
          <p className="text-gray-200 mb-1">Clean</p>
          <p className="text-3xl font-bold">{summary.clean}</p>
        </div>
        <div className="bg-red-700 p-6 rounded-xl text-center">
          <p className="text-gray-200 mb-1">Fraud</p>
          <p className="text-3xl font-bold">{summary.fraud}</p>
        </div>
      </div>

      <div className="bg-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">All Transactions (Platform-wide)</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-600">
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
              <tr key={tx.id} className="border-b border-gray-600 hover:bg-gray-600">
                <td className="py-3">{tx.id}</td>
                <td className="py-3">{tx.user_id}</td>
                <td className="py-3">${tx.amount.toLocaleString()}</td>
                <td className="py-3 capitalize">{tx.transaction_type}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tx.is_fraud ? 'bg-red-500' : 'bg-green-500'}`}>
                    {tx.is_fraud ? 'Fraud' : 'Clean'}
                  </span>
                </td>
                <td className="py-3">{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <p className="text-gray-400 text-center mt-4">No transactions found</p>}
      </div>
    </div>
  )
}
