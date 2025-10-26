'use client'

import StatsCards from '../../components/StatsCards'
import CampaignsTable from '../../components/CampaignsTable'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-6 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Left: Text + Buttons */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Dashboard
            </span>
            <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
              Live
            </span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            AI Sales Agents Performance Overview
          </p>

          <div className="flex space-x-4 mt-6">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 shadow transition">
              Start New Campaign
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow transition">
              Import Leads
            </button>
          </div>
        </div>

        {/* Right: Lottie Animation */}
        <div className="mt-8 lg:mt-0 w-60 h-60">
          <DotLottieReact
            src="https://lottie.host/6654e70f-b870-4dd9-a2e9-c9aaeeb68c5a/bn7Uf8UKdm.lottie"
            loop
            autoplay
          />
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-4xl font-bold text-blue-700 mb-1">1,247</div>
          <div className="text-sm font-medium text-blue-600">Total Leads</div>
        </div>

        <div className="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-4xl font-bold text-green-700 mb-1">86</div>
          <div className="text-sm font-medium text-green-600">Active Conversations</div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-4xl font-bold text-purple-700 mb-1">42%</div>
          <div className="text-sm font-medium text-purple-600">Avg. Response Rate</div>
        </div>

        <div className="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-4xl font-bold text-orange-700 mb-1">23</div>
          <div className="text-sm font-medium text-orange-600">Meetings This Week</div>
        </div>
      </div>

      {/* Stats + Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StatsCards />
        </div>

        {/* Agent Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-600">⚙️</span> AI Agent Status
          </h3>

          <div className="space-y-3">
            {[
              ['WhatsApp Agents', 'Online', 'green'],
              ['Email Agents', 'Online', 'green'],
              ['SMS Agents', 'Online', 'green'],
              ['AI Response Engine', 'Active', 'blue'],
            ].map(([label, status, color]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-700">{label}</span>
                <span
                  className={`px-2 py-1 rounded text-sm bg-${color}-100 text-${color}-800 font-medium`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📢</span> Active Campaigns
          </h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View All Campaigns →
          </button>
        </div>

        <CampaignsTable />
      </div>
    </div>
  )
}
