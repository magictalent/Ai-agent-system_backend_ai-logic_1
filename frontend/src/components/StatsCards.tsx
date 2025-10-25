import { TrendingUp, Users, Calendar, MessageCircle } from 'lucide-react'

const stats = [
  {
    title: 'Active Campaigns',
    value: '4',
    icon: TrendingUp,
    color: 'bg-blue-500',
  },
  {
    title: 'Leads Contacted',
    value: '217',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    title: 'Appointments Booked',
    value: '36',
    icon: Calendar,
    color: 'bg-purple-500',
  },
  {
    title: 'Response Rate',
    value: '42%',
    icon: MessageCircle,
    color: 'bg-orange-500',
  },
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}