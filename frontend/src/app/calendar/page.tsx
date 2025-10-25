'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Video, Phone, User, MapPin } from 'lucide-react'

interface Appointment {
  id: string
  title: string
  leadName: string
  type: 'video' | 'phone' | 'in-person'
  date: string
  time: string
  duration: string
  status: 'scheduled' | 'completed' | 'canceled'
  location?: string
}

const appointments: Appointment[] = [
  {
    id: '1',
    title: 'Car Viewing - Toyota 2008',
    leadName: 'John Doe',
    type: 'in-person',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: '1 hour',
    status: 'scheduled',
    location: 'AutoMart Showroom'
  },
  {
    id: '2',
    title: 'Price Negotiation',
    leadName: 'Sarah Li',
    type: 'video',
    date: '2024-01-15',
    time: '2:30 PM',
    duration: '30 min',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Test Drive',
    leadName: 'Mike Johnson',
    type: 'in-person',
    date: '2024-01-16',
    time: '11:00 AM',
    duration: '2 hours',
    status: 'scheduled',
    location: 'Downtown Location'
  }
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dates = [
  { date: '14', day: 'Sun' },
  { date: '15', day: 'Mon', current: true, hasAppointments: true },
  { date: '16', day: 'Tue', hasAppointments: true },
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
          <p className="text-gray-600 mt-2">Manage your appointments and meetings</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
          <Plus size={20} />
          <span>New Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
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
            {dates.map(({ date, day, current, hasAppointments }) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg text-center transition relative ${
                  selectedDate === date
                    ? 'bg-blue-600 text-white'
                    : current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm">{day}</div>
                <div className="text-lg font-semibold">{date}</div>
                {hasAppointments && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
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
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(appointment.type)}`}>
                      {getTypeIcon(appointment.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                      <p className="text-sm text-gray-600">{appointment.leadName}</p>
                      {appointment.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                          <MapPin size={14} />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{appointment.time}</div>
                    <div className="text-sm text-gray-600">{appointment.duration}</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </div>
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

        {/* Upcoming Appointments */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
            <div className="space-y-4">
              {appointments.filter(app => app.status === 'scheduled').slice(0, 3).map(appointment => (
                <div key={appointment.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{appointment.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                      {appointment.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{appointment.leadName}</p>
                  <div className="text-xs text-gray-500">
                    {appointment.date} • {appointment.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-semibold text-gray-900">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-semibold text-gray-900">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}