import StatsCards from '../../components/StatsCards'
import CampaignsTable from '../../components/CampaignsTable'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">AI Sales Agents Performance Overview</p>
        </div>
        <div className="flex space-x-4">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Start New Campaign
          </button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Import Leads
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-700">1,247</div>
          <div className="text-sm text-blue-600">Total Leads</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-700">86</div>
          <div className="text-sm text-green-600">Active Conversations</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-700">42%</div>
          <div className="text-sm text-purple-600">Avg. Response Rate</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-700">23</div>
          <div className="text-sm text-orange-600">Meetings This Week</div>
        </div>
      </div>

      {/* Main Stats and Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StatsCards />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">WhatsApp Agents</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Email Agents</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">SMS Agents</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">AI Response Engine</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Active Campaigns</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View All Campaigns →
          </button>
        </div>
        <CampaignsTable />
      </div>
    </div>
  )
}