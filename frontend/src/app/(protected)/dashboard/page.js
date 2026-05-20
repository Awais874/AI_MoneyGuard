'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('transfer')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTransactions(token)
  }, [])

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
    try {
      await api.post('/api/transactions/',
        { amount: parseFloat(amount), transaction_type: type },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAmount('')
      fetchTransactions(token)
    } catch (err) {
      setError('Failed to add transaction')
    }
  }

  const totalTransactions = transactions.length
  const totalFraud = transactions.filter(tx => tx.is_fraud).length
  const totalClean = totalTransactions - totalFraud

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-700 p-6 rounded-xl text-center">
          <p className="text-gray-400 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold">{totalTransactions}</p>
        </div>
        <div className="bg-green-700 p-6 rounded-xl text-center">
          <p className="text-gray-200 mb-1">Clean</p>
          <p className="text-3xl font-bold">{totalClean}</p>
        </div>
        <div className="bg-red-700 p-6 rounded-xl text-center">
          <p className="text-gray-200 mb-1">Fraud</p>
          <p className="text-3xl font-bold">{totalFraud}</p>
        </div>
      </div>

    
      <div className="bg-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
        <div className="flex gap-4">
          <input
            type="text"
            inputMode="numeric"
            placeholder="$ Amount"
            className="bg-gray-600 p-3 rounded-lg outline-none flex-1"
            value={amount ? `$${amount}` : ''}
            onChange={e => {
              const val = e.target.value.replace('$', '')
              if (val === '' || (/^\d*\.?\d*$/.test(val))) {
                setAmount(val)
              }
            }}
          />
          <select
            className="bg-gray-600 p-3 rounded-lg outline-none"
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
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Add
          </button>
        </div>
      </div>

      
      <div className="bg-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction Feed</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-600">
              <th className="pb-3">ID</th>
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
        {transactions.length === 0 && <p className="text-gray-400 text-center mt-4">No transactions yet.</p>}
      </div>
    </div>
  )
}