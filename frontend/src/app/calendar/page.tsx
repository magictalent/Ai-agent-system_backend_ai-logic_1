'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Video, Phone, User, MapPin } from 'lucide-react'

// --- Google Calendar Related Imports ----
import { useEffect } from 'react'

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

// For demonstration, Google Events will be loaded here
const HARDCODED_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    title: 'Car Viewing - Toyota 2008',
    leadName: 'John Doe',
    type: 'in-person',
    date: '2025-11-15',
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
    date: '2025-11-16',
    time: '2:30 PM',
    duration: '30 min',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Test Drive',
    leadName: 'Mike Johnson',
    type: 'in-person',
    date: '2025-11-16',
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

// Google Calendar API settings - demo clientId
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '[YOUR_GOOGLE_CLIENT_ID]'
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '[YOUR_GOOGLE_API_KEY]'
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

// Utility: convert RFC3339/ISO date/time to 'YYYY-MM-DD' and time (ex: '14:00')
function extractDateTime(iso: string) {
  const date = new Date(iso)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours() % 12 || 12
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = date.getHours() < 12 ? 'AM' : 'PM'
  return {
    date: `${y}-${m}-${d}`,
    clock: `${hours}:${minutes} ${ampm}`
  }
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState('15')
  const [googleSignedIn, setGoogleSignedIn] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [googleAppointments, setGoogleAppointments] = useState<Appointment[]>([])
  const [showGooglePrompt, setShowGooglePrompt] = useState(false)

  // Initialization for Google API
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    // Load gapi if not loaded
    if (!(window as any).gapi) {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.onload = () => {
        (window as any).gapi.load('client:auth2', initClient)
      }
      document.body.appendChild(script)
    } else {
      (window as any).gapi.load('client:auth2', initClient)
    }
    // eslint-disable-next-line
  }, [])

  // Google API initialization function
  function initClient() {
    const gapi = (window as any).gapi
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)
          // Handle current sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
        },
        function (error: any) {
          setGoogleError('Failed to initialize Google API.')
        }
      )
  }

  // Updates when sign-in state changes
  function updateSigninStatus(isSignedIn: boolean) {
    setGoogleSignedIn(isSignedIn)
    if (isSignedIn) {
      listUpcomingEvents()
    }
  }

  // Handle Google Sign-in
  function handleGoogleSignIn() {
    setGoogleLoading(true)
    const gapi = (window as any).gapi
    gapi.auth2.getAuthInstance().signIn().then(
      () => {
        setGoogleLoading(false)
      },
      (err: any) => {
        setGoogleLoading(false)
        setGoogleError('Google Sign-in failed')
      }
    )
  }

  // Handle Google Sign-out
  function handleGoogleSignOut() {
    setGoogleLoading(true)
    const gapi = (window as any).gapi
    gapi.auth2.getAuthInstance().signOut().then(
      () => {
        setGoogleLoading(false)
        setGoogleAppointments([])
      },
      (err: any) => {
        setGoogleLoading(false)
        setGoogleError('Google Sign-out failed')
      }
    )
  }

  // Fetch next 10 upcoming events
  function listUpcomingEvents() {
    setGoogleLoading(true)
    const gapi = (window as any).gapi
    gapi.client.calendar.events
      .list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime'
      })
      .then(function (response: any) {
        const events: any[] = response.result.items || []
        // Transform Google events to Appointment[] shape
        const slots: Appointment[] = events.map(event => {
          // Start and end times
          const { date: startDate, clock: startTime } = extractDateTime(event.start.dateTime || event.start.date)
          let durationText = ''
          if (event.end && event.start && event.end.dateTime && event.start.dateTime) {
            const diffMs = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()
            if (diffMs < 0) durationText = ''
            else {
              const mins = Math.round(diffMs / 60000)
              durationText =
                mins < 60 ? `${mins} min` : `${(mins / 60).toFixed(1)} hours`
            }
          }
          // Find a type by keyword
          let type: 'video'|'phone'|'in-person' = 'video'
          if (/phone|call/i.test(event.summary)) type = 'phone'
          else if (/meet|in-person|onsite|office|location/i.test(event.summary)) type = 'in-person'

          return {
            id: event.id,
            title: event.summary || event.description || 'Google Event',
            leadName: event.creator?.email || 'N/A',
            type,
            date: startDate,
            time: startTime,
            duration: durationText || 'N/A',
            status: 'scheduled',
            location: event.location
          }
        })
        setGoogleAppointments(slots)
        setGoogleLoading(false)
        setGoogleError(null)
      }, () => {
        setGoogleLoading(false)
        setGoogleError('Failed to retrieve Google Calendar events')
      })
  }

  // For demonstration, merge hardcoded appointments with Google ones.
  const combinedAppointments = googleSignedIn
    ? [...HARDCODED_APPOINTMENTS, ...googleAppointments]
    : HARDCODED_APPOINTMENTS

  const getAppointmentsForDate = (date: string) => {
    // This works for Jan 2024 mock UI, adjust as needed for real calendar
    return combinedAppointments.filter(app => app.date === `2025-11-${date}`)
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
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
            <Plus size={20} />
            <span>New Appointment</span>
          </button>
          {/* Google Calendar Sync Button */}
          {!googleSignedIn ? (
            <button
              className="bg-green-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center space-x-2"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              title="Sync with your Google Calendar"
            >
              <svg height="20" width="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden><g><rect width="20" height="20" rx="4" fill="#FFF"/><path d="M10 3v2M16 6h-12" stroke="#4285f4" strokeWidth="1.3"/><rect x="3" y="6" width="14" height="11" rx="2" stroke="#4285f4" strokeWidth="1.3" fill="none"/><circle cx="7" cy="10" r="1" fill="#4285f4"/><circle cx="10" cy="10" r="1" fill="#34a853"/><circle cx="13" cy="10" r="1" fill="#fbbc05"/></g></svg>
              <span>{googleLoading ? 'Connecting...' : 'Sync Google'}</span>
            </button>
          ) : (
            <button
              className="bg-gray-200 text-gray-600 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              onClick={handleGoogleSignOut}
              disabled={googleLoading}
            >
              Disconnect Google
            </button>
          )}
        </div>
      </div>
      {/* Google Sync Feedback */}
      {googleError && (
        <div className="bg-red-50 text-red-500 px-4 py-2 rounded font-medium">{googleError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">November 2025</h2>
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
                {(hasAppointments ||
                  getAppointmentsForDate(date).length > 0) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Appointments for Selected Date */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Appointments for November {selectedDate}, 2025
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
              {combinedAppointments
                .filter(app => app.status === 'scheduled')
                .sort((a, b) => {
                  // Sort by date and time ascending
                  // Concatenate date and 24h time for comparison
                  const getKey = (app: Appointment) => {
                    // '2024-01-15T10:00 AM'
                    let t = app.time
                    if (t) {
                      // Convert "10:00 AM" to 24hr
                      let [hhmm, ampm] = t.split(' ')
                      let [hh, mm] = hhmm.split(':').map(Number)
                      if (ampm === 'PM' && hh !== 12) hh += 12
                      if (ampm === 'AM' && hh === 12) hh = 0
                      return new Date(`${app.date}T${hh.toString().padStart(2, '0')}:${mm}:00`).getTime()
                    }
                    return new Date(app.date).getTime()
                  }
                  return getKey(a) - getKey(b)
                })
                .slice(0, 3)
                .map(appointment => (
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
            {googleSignedIn && googleLoading && (
              <div className="text-center text-gray-400 mt-3">
                Fetching Google events...
              </div>
            )}
            {googleSignedIn && !googleLoading && googleAppointments.length === 0 && (
              <div className="text-center text-gray-400 mt-3">No Google Calendar events found.</div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-semibold text-gray-900">
                  {combinedAppointments.filter(a => a.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-gray-900">
                  {combinedAppointments.filter(a => a.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-semibold text-gray-900">
                  {combinedAppointments.filter(a => a.status === 'canceled').length}
                </span>
              </div>
            </div>
            {googleError && (
              <div className="mt-4 text-red-500 text-sm">{googleError}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}