import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-500 text-white bg-cover bg-center"
   
    >
      <div className=" bg-gray-900 p-25 rounded-xl">
        <h1 className="text-4xl font-bold mb-2">AI-MoneyGuard</h1>

        <p className="text-gray-300 mb-8">
          AI-Powered Fraud Detection Platform
        </p>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}