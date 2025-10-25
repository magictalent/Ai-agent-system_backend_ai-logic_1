'use client'

import { useState } from 'react'
import { Search, Filter, Send, Phone, Video } from 'lucide-react'

interface MessageThread {
  id: string
  leadName: string
  lastMessage: string
  time: string
  unread: boolean
  channel: 'whatsapp' | 'email' | 'sms'
}

const threads: MessageThread[] = [
  {
    id: '1',
    leadName: 'John Doe',
    lastMessage: 'Yes! What\'s your asking price?',
    time: '2h ago',
    unread: false,
    channel: 'whatsapp'
  },
  {
    id: '2',
    leadName: 'Sarah Li',
    lastMessage: 'Can you send me more photos?',
    time: '1 day ago',
    unread: true,
    channel: 'email'
  },
  {
    id: '3',
    leadName: 'Mike Johnson',
    lastMessage: 'I\'m available tomorrow at 3 PM',
    time: '5h ago',
    unread: false,
    channel: 'whatsapp'
  }
]

export default function Messages() {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(threads[0])
  const [message, setMessage] = useState('')

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-100 text-green-800'
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'sms': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="h-full flex">
      {/* Threads List */}
      <div className="w-1/3 border-r border-gray-200 pr-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              New Message
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  selectedThread?.id === thread.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                } ${thread.unread ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{thread.leadName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(thread.channel)}`}>
                    {thread.channel}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{thread.lastMessage}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{thread.time}</span>
                  {thread.unread && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 pl-6">
        {selectedThread ? (
          <div className="h-full flex flex-col">
            {/* Thread Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-600">
                      {selectedThread.leadName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedThread.leadName}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(selectedThread.channel)}`}>
                        {selectedThread.channel}
                      </span>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Video size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto mb-6">
              {/* AI Messages */}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 max-w-[70%]">
                  <div className="text-sm text-blue-700">
                    Hi {selectedThread.leadName.split(' ')[0]}, I saw you're interested in our Toyota 2008. What would you like to know?
                  </div>
                  <div className="text-xs text-blue-600 mt-2">2 hours ago</div>
                </div>
              </div>

              {/* Lead Messages */}
              <div className="flex space-x-3 justify-end">
                <div className="bg-gray-100 rounded-lg p-4 max-w-[70%]">
                  <div className="text-sm text-gray-700">
                    {selectedThread.lastMessage}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">1 hour ago</div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedThread.leadName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 max-w-[70%]">
                  <div className="text-sm text-blue-700">
                    The asking price is $2500. It's in excellent condition with low mileage. Would you like to schedule a test drive?
                  </div>
                  <div className="text-xs text-blue-600 mt-2">Just now</div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
                  <Send size={20} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}