'use client'

import { Conversation } from '@/types/message'
import { useState } from 'react'
import MessageCard from './MessageCard'

interface ConversationCardProps {
  conversation: Conversation
  onSelect?: (conversation: Conversation) => void
}

export default function ConversationCard({ conversation, onSelect }: ConversationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬'
      case 'email': return '📧'
      case 'sms': return '📱'
      default: return '💬'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 mb-4">
      {/* Conversation Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {conversation.lead_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{conversation.lead_name}</h3>
              <p className="text-sm text-gray-600">{conversation.lead_email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getChannelIcon(conversation.channel)}</span>
                <span className="text-sm text-gray-600">{conversation.campaign_name}</span>
              </div>
              <p className="text-xs text-gray-500">
                {formatLastMessageTime(conversation.last_message_at)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                {conversation.status}
              </span>
              <span className="text-xs text-gray-500">
                {conversation.message_count} messages
              </span>
            </div>
            
            <div className="text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Messages */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversation.messages.map((message, index) => (
              <MessageCard
                key={message.id}
                message={message}
                isLastInGroup={index === conversation.messages.length - 1}
              />
            ))}
          </div>
          
          {conversation.messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No messages in this conversation yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
