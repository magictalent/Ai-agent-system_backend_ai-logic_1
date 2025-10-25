'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Video, Phone, User } from 'lucide-react'

interface Appointment {
  id: string
  title: string
  client: string
  type: 'video' | 'phone' | 'in-person'
  date: string
  time: string
  duration: string
  status: 'scheduled' | 'completed' | 'canceled'
}

const appointments: Appointment[] = [
  {
    id: '1',
    title: 'Product Demo',
    client: 'TechCorp Inc.',
    type: 'video',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: '30 min',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Sales Consultation',
    client: 'StartupXYZ',
    type: 'phone',
    date: '2024-01-15',
    time: '2:30 PM',
    duration: '45 min',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Strategy Session',
    client: 'Global Solutions',
    type: 'video',
    date: '2024-01-16',
    time: '11:00 AM',
    duration: '60 min',
    status: 'scheduled'
  },
  {
    id: '4',
    title: 'Onboarding Call',
    client: 'Innovate Labs',
    type: 'phone',
    date: '2024-01-16',
    time: '3:00 PM',
    duration: '30 min',
    status: 'scheduled'
  }
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dates = [
  { date: '14', day: 'Sun' },
  { date: '15', day: 'Mon', current: true },
  { date: '16', day: 'Tue' },
  { date: '17', day: 'Wed' },
  { date: '18', day: 'Thu' },
  { date: '19', day: 'Fri' },
  { date: '20', day: 'Sat' }
]

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState('15')

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(app => app.date === `2024-01-${date}`)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={16} />
      case 'phone': return <Phone size={16} />
      case 'in-person': return <User size={16} />
      default: return <Video size={16} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-700'
      case 'phone': return 'bg-blue-100 text-blue-700'
      case 'in-person': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Manage appointments and meetings</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
          <Plus size={20} />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">January 2024</h2>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {days.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          {dates.map(({ date, day, current }) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-lg text-center transition ${
                selectedDate === date
                  ? 'bg-blue-600 text-white'
                  : current
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm">{day}</div>
              <div className="text-lg font-semibold">{date}</div>
            </button>
          ))}
        </div>

        {/* Appointments for Selected Date */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointments for January {selectedDate}, 2024
          </h3>
          <div className="space-y-3">
            {getAppointmentsForDate(selectedDate).map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(appointment.type)}`}>
                    {getTypeIcon(appointment.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                    <p className="text-sm text-gray-600">{appointment.client}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{appointment.time}</div>
                  <div className="text-sm text-gray-600">{appointment.duration}</div>
                </div>
              </div>
            ))}
            {getAppointmentsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No appointments scheduled for this date
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}