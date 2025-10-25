'use client'

import { Message } from '@/types/message'
import { useState } from 'react'

interface MessageCardProps {
  message: Message
  isLastInGroup?: boolean
}

export default function MessageCard({ message, isLastInGroup = false }: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'read': return 'bg-purple-100 text-purple-800'
      case 'replied': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬'
      case 'email': return '📧'
      case 'sms': return '📱'
      default: return '💬'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className={`${message.direction === 'outbound' ? 'ml-8' : 'mr-8'} mb-3`}>
      <div className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.direction === 'outbound' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {/* Message Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {getChannelIcon(message.channel)}
              </span>
              <span className="text-xs opacity-75">
                {message.direction === 'outbound' ? 'AI Agent' : message.lead_name}
              </span>
            </div>
            <span className="text-xs opacity-75">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* Message Content */}
          <div className="text-sm">
            {isExpanded || message.content.length <= 200 ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <p className="whitespace-pre-wrap">
                {message.content.substring(0, 200)}...
              </p>
            )}
          </div>

          {/* Message Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                {message.status}
              </span>
              {message.content.length > 200 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs opacity-75 hover:opacity-100 underline"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
