import Sidebar from '../components/sidebar'

export default function ProtectedLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-800 text-white">
      <Sidebar />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}