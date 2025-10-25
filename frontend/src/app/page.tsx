import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Sales Agents</span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Automate Your Sales with
            <span className="text-blue-600"> AI Agents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Deploy intelligent AI sales agents that work 24/7 to engage leads, 
            qualify prospects, and book meetings automatically across WhatsApp, 
            Email, and SMS.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition text-lg"
            >
              Demo Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Intelligent conversations that feel human and drive results.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Operation</h3>
            <p className="text-gray-600">
              Never miss a lead with round-the-clock engagement.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">
              Track performance and optimize your sales funnel.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}