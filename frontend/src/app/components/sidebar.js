'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: '🏠 Dashboard' },
    { href: '/analytics', label: '📊 Analytics' },
    ...(role === 'admin' ? [{ href: '/admin', label: '🛡️ Admin Panel' }] : []),
  ]

  return (
    <div className="w-72 min-h-screen bg-teal-950 text-white flex flex-col p-6">
      
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">💰 MoneyGuard</h1>
        <p className="text-teal-300 text-sm mt-1">Fraud Detection</p>
      </div>

      
      <nav className="flex flex-col gap-2 flex-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === link.href
                ? 'bg-yellow-500 text-black font-bold'
                : 'text-teal-200 hover:bg-teal-800 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      
      <button
        onClick={handleLogout}
        className="px-4 py-3 rounded-lg text-red-400 hover:bg-teal-800 hover:text-red-300 text-left font-medium"
      >
        🚪 Logout
      </button>
    </div>
  )
}