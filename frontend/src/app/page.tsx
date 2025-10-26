'use client'

import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center"> */}
              <img
                src="/logo.png"
                alt="AI Sales Agents Logo"
                className="w-20 h-20 object-contain"
              />
              {/* <span className="text-white text-sm font-bold">AI</span>
            </div> */}
            <span className="text-xl font-semibold text-gray-900">AI Sales Agents</span>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="text-gray-700 px-5 py-2 hover:text-blue-600 font-medium transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 py-20">
        {/* Animation (left) */}
        <div className="w-full lg:w-1/2 flex justify-center mb-10 lg:mb-0">
          <div className="w-72 h-72 md:w-96 md:h-96">
            <DotLottieReact
              src="https://lottie.host/972f5692-c538-4c9d-8b49-a95f962d21e3/ET4TOwMNEM.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Text (right) */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Automate Your Sales with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Agents
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
            Deploy intelligent AI sales agents that engage leads, qualify prospects, 
            and book meetings automatically across WhatsApp, Email, and SMS — 
            <span className="font-medium text-gray-800"> 24/7.</span>
          </p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition"
            >
              Demo Login
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <span className="text-blue-600 text-2xl">🤖</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Conversations</h3>
          <p className="text-gray-600">Intelligent, human-like chats that convert leads into clients.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <span className="text-green-600 text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Always On</h3>
          <p className="text-gray-600">Your AI agents work nonstop — even when you sleep.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <span className="text-purple-600 text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Live Analytics</h3>
          <p className="text-gray-600">See performance in real time and optimize your sales funnel.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/60 backdrop-blur-md py-6">
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Sales Agents — All rights reserved.
        </p>
      </footer>
    </div>
  )
}
