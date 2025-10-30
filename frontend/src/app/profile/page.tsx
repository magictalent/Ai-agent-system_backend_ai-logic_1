
'use client'

import { useState } from 'react'
import { User, Mail, Phone, Save } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '+1 (800) 555-1234'
  });

  const [editMode, setEditMode] = useState(false);

  const handleChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
  };

  const handleSave = () => {
    // Profile saving logic here
    setEditMode(false);
    // Optionally: Show toast/notification about success
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-2xl px-8 py-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-blue-100 rounded-full p-3">
          <User className="text-blue-600" size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-600">Manage your personal details</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm text-gray-700 font-semibold mb-1" htmlFor="profile-name">
            Name
          </label>
          <div className="flex items-center gap-2">
            <User className="text-gray-400" size={20} />
            <input
              id="profile-name"
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg text-lg outline-none transition ${editMode ? "border-blue-400 focus:ring-2 focus:ring-blue-400" : "border-gray-200 bg-gray-100"}`}
              value={profile.name}
              onChange={e => handleChange('name', e.target.value)}
              type="text"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 font-semibold mb-1" htmlFor="profile-email">
            Email
          </label>
          <div className="flex items-center gap-2">
            <Mail className="text-gray-400" size={20} />
            <input
              id="profile-email"
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg text-lg outline-none transition ${editMode ? "border-blue-400 focus:ring-2 focus:ring-blue-400" : "border-gray-200 bg-gray-100"}`}
              value={profile.email}
              onChange={e => handleChange('email', e.target.value)}
              type="email"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 font-semibold mb-1" htmlFor="profile-phone">
            Phone
          </label>
          <div className="flex items-center gap-2">
            <Phone className="text-gray-400" size={20} />
            <input
              id="profile-phone"
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg text-lg outline-none transition ${editMode ? "border-blue-400 focus:ring-2 focus:ring-blue-400" : "border-gray-200 bg-gray-100"}`}
              value={profile.phone}
              onChange={e => handleChange('phone', e.target.value)}
              type="tel"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-8 gap-4">
        {!editMode ? (
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        ) : (
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition"
            onClick={handleSave}
          >
            <Save size={18} /> Save Changes
          </button>
        )}
      </div>
    </div>
  )
}
