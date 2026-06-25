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
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin Panel', icon: '🛡️' }] : []),
  ]

  return (
    <div
      className="w-64 min-h-screen text-white flex flex-col py-8 px-5 border-r border-slate-700/50 shrink-0"
      style={{ background: 'linear-gradient(180deg, #0d1b2a 0%, #0f172a 100%)' }}
    >
      {/* Logo */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-lg font-extrabold text-black shadow-lg shadow-amber-500/30">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">MoneyGuard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Fraud Detection AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 px-2">Menu</p>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
              pathname === link.href
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700/50 pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-medium"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </div>
  )
}
