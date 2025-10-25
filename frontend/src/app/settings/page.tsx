'use client'

import { useState } from 'react'
import { Save, Mail, MessageCircle, Calendar, Shield, Bell, User } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    // Profile
    businessName: 'AutoMart Co.',
    contactEmail: 'contact@automart.com',
    phoneNumber: '+1 (555) 123-4567',
    
    // AI Settings
    aiPersonality: 'professional',
    responseSpeed: 'balanced',
    workingHours: { start: '09:00', end: '17:00' },
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    newLeadAlerts: true,
    appointmentReminders: true,
    
    // Integration Settings
    calendarSync: true,
    crmSync: false
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
          <p className="text-gray-600 mt-2">Configure your AI agent and preferences</p>
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
              { id: 'profile', icon: User, label: 'Business Profile' },
              { id: 'ai', icon: Shield, label: 'AI Agent Settings' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'integrations', icon: Calendar, label: 'Integrations' }
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
          {/* Business Profile */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input 
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input 
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* AI Agent Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Personality</label>
                <select 
                  value={settings.aiPersonality}
                  onChange={(e) => setSettings({...settings, aiPersonality: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Speed</label>
                <select 
                  value={settings.responseSpeed}
                  onChange={(e) => setSettings({...settings, responseSpeed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fast">Fast (Immediate)</option>
                  <option value="balanced">Balanced (1-5 minutes)</option>
                  <option value="delayed">Delayed (5-15 minutes)</option>
                </select>
              </div>
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
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive text message alerts</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Lead Alerts</label>
                  <p className="text-sm text-gray-500">Get notified of new leads</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.newLeadAlerts}
                  onChange={(e) => setSettings({...settings, newLeadAlerts: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Appointment Reminders</label>
                  <p className="text-sm text-gray-500">Reminders before meetings</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.appointmentReminders}
                  onChange={(e) => setSettings({...settings, appointmentReminders: e.target.checked})}
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