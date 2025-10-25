'use client'

import { useState } from 'react'
import { Save, Mail, MessageCircle, Calendar, Shield, Database, Bell } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    // AI Settings
    aiModel: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    
    // Messaging Settings
    workingHours: { start: '09:00', end: '17:00' },
    timezone: 'UTC-5',
    followUpDelay: 48,
    
    // Integration Settings
    openaiApiKey: '',
    twilioEnabled: true,
    sendgridEnabled: true,
    
    // Notification Settings
    emailNotifications: true,
    slackNotifications: false,
    dailyReports: true
  })

  const handleSave = () => {
    // Save settings logic
    console.log('Saving settings:', settings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your AI Sales Agents system</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {[
              { id: 'ai', icon: Shield, label: 'AI Configuration' },
              { id: 'messaging', icon: MessageCircle, label: 'Messaging' },
              { id: 'integrations', icon: Database, label: 'Integrations' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' }
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                <select 
                  value={settings.aiModel}
                  onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-2">Claude 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                <input 
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                <input 
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Messaging Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Messaging Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours Start</label>
                <input 
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, start: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours End</label>
                <input 
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, end: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Delay (hours)</label>
                <input 
                  type="number"
                  value={settings.followUpDelay}
                  onChange={(e) => setSettings({...settings, followUpDelay: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key</label>
                <input 
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({...settings, openaiApiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Twilio Integration</label>
                  <p className="text-sm text-gray-500">Enable WhatsApp & SMS messaging</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.twilioEnabled}
                  onChange={(e) => setSettings({...settings, twilioEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SendGrid Integration</label>
                  <p className="text-sm text-gray-500">Enable email messaging</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.sendgridEnabled}
                  onChange={(e) => setSettings({...settings, sendgridEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}