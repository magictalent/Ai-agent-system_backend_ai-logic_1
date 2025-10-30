'use client'

import { useState } from 'react'
import { Save, Calendar, Shield, Bell, User } from 'lucide-react'

const navItems = [
  { id: 'profile', icon: User, label: 'Business Profile' },
  { id: 'ai', icon: Shield, label: 'AI Agent Settings' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'integrations', icon: Calendar, label: 'Integrations' }
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [settings, setSettings] = useState({
    businessName: 'AutoMart Co.',
    contactEmail: 'contact@automart.com',
    phoneNumber: '+1 (555) 123-4567',
    aiPersonality: 'professional',
    responseSpeed: 'balanced',
    workingHours: { start: '09:00', end: '17:00' },
    emailNotifications: true,
    smsNotifications: false,
    newLeadAlerts: true,
    appointmentReminders: true,
    calendarSync: true,
    crmSync: false
  })

  const handleSave = () => {
    // Save settings logic
    console.log('Saving settings:', settings)
  }

  // Section group rendering
  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="bg-gradient-to-tr from-blue-50 via-white to-blue-100 rounded-2xl border border-blue-100 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
              <User className="inline-block text-blue-500" size={22} /> Business Profile
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Business Name</label>
                <input 
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Contact Email</label>
                <input 
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Phone Number</label>
                <input 
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg transition"
                />
              </div>
            </div>
          </div>
        )
      case 'ai':
        return (
          <div className="bg-gradient-to-tr from-indigo-50 via-white to-indigo-100 rounded-2xl border border-indigo-100 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-indigo-900 mb-6 flex items-center gap-2">
              <Shield className="inline-block text-indigo-500" size={22} /> AI Agent Settings
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-indigo-700 mb-2">AI Personality</label>
                <select 
                  value={settings.aiPersonality}
                  onChange={(e) => setSettings({...settings, aiPersonality: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg transition"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-700 mb-2">Response Speed</label>
                <select 
                  value={settings.responseSpeed}
                  onChange={(e) => setSettings({...settings, responseSpeed: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg transition"
                >
                  <option value="fast">Fast (Immediate)</option>
                  <option value="balanced">Balanced (1-5 minutes)</option>
                  <option value="delayed">Delayed (5-15 minutes)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-700 mb-2">Working Hours Start</label>
                <input 
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, start: e.target.value}})}
                  className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-700 mb-2">Working Hours End</label>
                <input 
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, end: e.target.value}})}
                  className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg transition"
                />
              </div>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="bg-gradient-to-tr from-pink-50 via-white to-pink-100 rounded-2xl border border-pink-100 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-pink-900 mb-6 flex items-center gap-2">
              <Bell className="inline-block text-pink-500" size={22} /> Notification Settings
            </h3>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-pink-100 pb-4">
                <div>
                  <label className="block text-base font-semibold text-pink-700">Email Notifications</label>
                  <p className="text-sm text-pink-500">Receive updates via email</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="toggle toggle-lg accent-pink-500"
                  style={{ width: 32, height: 18 }}
                />
              </div>
              <div className="flex items-center justify-between border-b border-pink-100 pb-4">
                <div>
                  <label className="block text-base font-semibold text-pink-700">SMS Notifications</label>
                  <p className="text-sm text-pink-500">Receive text message alerts</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  className="toggle toggle-lg accent-pink-500"
                  style={{ width: 32, height: 18 }}
                />
              </div>
              <div className="flex items-center justify-between border-b border-pink-100 pb-4">
                <div>
                  <label className="block text-base font-semibold text-pink-700">New Lead Alerts</label>
                  <p className="text-sm text-pink-500">Get notified of new leads</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.newLeadAlerts}
                  onChange={(e) => setSettings({...settings, newLeadAlerts: e.target.checked})}
                  className="toggle toggle-lg accent-pink-500"
                  style={{ width: 32, height: 18 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-base font-semibold text-pink-700">Appointment Reminders</label>
                  <p className="text-sm text-pink-500">Reminders before meetings</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.appointmentReminders}
                  onChange={(e) => setSettings({...settings, appointmentReminders: e.target.checked})}
                  className="toggle toggle-lg accent-pink-500"
                  style={{ width: 32, height: 18 }}
                />
              </div>
            </div>
          </div>
        )
      case 'integrations':
        return (
          <div className="bg-gradient-to-tr from-green-50 via-white to-green-100 rounded-2xl border border-green-100 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-green-900 mb-6 flex items-center gap-2">
              <Calendar className="inline-block text-green-500" size={22} /> Integrations
            </h3>
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-base font-semibold text-green-700">Calendar Sync</label>
                  <p className="text-sm text-green-500">
                    {settings.calendarSync
                      ? "Your calendar is connected."
                      : "Connect your calendar for smooth scheduling"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.calendarSync}
                  onChange={(e) => setSettings({...settings, calendarSync: e.target.checked})}
                  className="toggle toggle-lg accent-green-500"
                  style={{ width: 32, height: 18 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-base font-semibold text-green-700">CRM Integration</label>
                  <p className="text-sm text-green-500">
                    {settings.crmSync
                      ? "CRM is connected."
                      : "Enable CRM sync for full automation"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.crmSync}
                  onChange={(e) => setSettings({...settings, crmSync: e.target.checked})}
                  className="toggle toggle-lg accent-green-500"
                  style={{ width: 32, height: 18 }}
                />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full mx-auto max-w-5xl py-10 px-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-blue-600 to-indigo-800 text-transparent bg-clip-text">Settings</h1>
          <p className="text-gray-500 mt-1 text-lg">Configure your AI agent and preferences</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-gradient-to-b from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl shadow-lg font-semibold hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Save size={22} className="mr-1" />
          <span className="tracking-wide">Save Changes</span>
        </button>
      </div>

      <div className="flex gap-8 w-full">
        {/* Navigation */}
        <nav className="flex flex-col gap-2 w-full max-w-xs">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-lg rounded-xl border transition-all duration-150 font-semibold ${
                  isActive
                    ? 'bg-gradient-to-tl from-blue-100 to-blue-50 border-blue-400 text-blue-800 shadow'
                    : 'bg-white border-blue-100 text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Icon size={22} className={`${isActive ? 'text-blue-600' : 'text-blue-400'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex-1">{renderSection()}</div>
      </div>
    </div>
  )
}