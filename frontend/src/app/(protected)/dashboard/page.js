'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('transfer')
  const [explanation, setExplanation] = useState(null)
  const [loadingExplain, setLoadingExplain] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchTransactions(token)
    fetchBalance(token)
  }, [])

  async function fetchBalance(token) {
    try {
      const res = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBalance(res.data.balance)
    } catch (err) {}
  }

  async function fetchTransactions(token) {
    try {
      const res = await api.get('/api/transactions/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(res.data)
    } catch (err) {
      setError('Failed to load transactions')
    }
  }

  async function handleAddTransaction() {
    const token = localStorage.getItem('token')
    setError('')
    try {
      await api.post('/api/transactions/',
        { amount: parseFloat(amount), transaction_type: type },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAmount('')
      fetchTransactions(token)
      fetchBalance(token)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add transaction'
      setError(msg)
    }
  }

  async function handleExplain(txId) {
    const token = localStorage.getItem('token')
    setLoadingExplain(true)
    setExplanation(null)
    try {
      const res = await api.get(`/api/transactions/${txId}/explain`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExplanation(res.data)
    } catch (err) {
      setError('Failed to load explanation')
    } finally {
      setLoadingExplain(false)
    }
  }

  const totalTransactions = transactions.length
  const totalFraud = transactions.filter(tx => tx.is_fraud).length
  const totalClean = totalTransactions - totalFraud

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Monitor and manage your transactions</p>
      </div>

      {error && (
        <div className="bg-rose-900/40 border border-rose-700/50 text-rose-300 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="bg-linear-to-br from-amber-900/60 to-amber-800/20 border border-amber-700/40 p-6 rounded-2xl">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">Account Balance</p>
          <p className="text-3xl font-bold text-white">
            {balance !== null ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700/60 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Total Transactions</p>
          <p className="text-3xl font-bold text-white">{totalTransactions}</p>
        </div>
        <div className="bg-linear-to-br from-emerald-900/70 to-emerald-800/30 border border-emerald-700/40 p-6 rounded-2xl">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">Clean</p>
          <p className="text-3xl font-bold text-white">{totalClean}</p>
        </div>
        <div className="bg-linear-to-br from-rose-900/70 to-red-800/30 border border-rose-700/40 p-6 rounded-2xl">
          <p className="text-rose-400 text-xs font-semibold uppercase tracking-wide mb-2">Fraud</p>
          <p className="text-3xl font-bold text-white">{totalFraud}</p>
        </div>
      </div>

      {/* Add Transaction */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Add Transaction</h3>
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="$ Amount"
            className="bg-slate-900 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-xl outline-none flex-1 focus:border-amber-500 transition-colors"
            value={amount ? `$${amount}` : ''}
            onChange={e => {
              const val = e.target.value.replace('$', '')
              if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val)
            }}
          />
          <select
            className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-amber-500 transition-colors"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="transfer">Transfer</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="payment">Payment</option>
          </select>
          <button
            onClick={handleAddTransaction}
            className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-amber-500/20"
          >
            Add
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">Transaction Feed</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-700">
              <th className="pb-3">ID</th>
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
                <td className="py-3 font-medium">${tx.amount.toLocaleString()}</td>
                <td className="py-3 capitalize text-slate-300 text-sm">{tx.transaction_type}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.is_fraud ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {tx.is_fraud ? '⚠ Fraud' : '✓ Clean'}
                  </span>
                  {tx.is_fraud && (
                    <button
                      onClick={() => handleExplain(tx.id)}
                      className="ml-2 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    >
                      Why?
                    </button>
                  )}
                </td>
                <td className="py-3 text-slate-400 text-sm">{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="text-slate-500 text-center mt-8 text-sm">No transactions yet. Add one above.</p>
        )}
      </div>

      {/* Loading overlay */}
      {loadingExplain && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl px-8 py-6 text-center">
            <div className="text-amber-400 text-2xl mb-2">⏳</div>
            <p className="text-white text-sm">Analyzing transaction...</p>
          </div>
        </div>
      )}

      {/* Explain Modal */}
      {explanation && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Why was this flagged?</h3>
            <p className="text-slate-400 text-sm mb-1">
              Transaction #{explanation.transaction_id} — ${explanation.amount.toLocaleString()} ({explanation.transaction_type})
            </p>
            <div className="inline-block bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              Fraud Probability: {(explanation.fraud_probability * 100).toFixed(0)}%
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {explanation.reasons.map((r, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-amber-400 font-semibold text-sm">{r.feature}</span>
                    <span className="text-slate-400 text-xs">Impact: {(r.importance * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{r.explanation}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setExplanation(null)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-xl font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
