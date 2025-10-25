const campaigns = [
    {
      name: 'Campaign 1',
      leads: 54,
      appointments: 12,
      responseRate: '30%',
    },
    {
      name: 'Campaign 2',
      leads: 32,
      appointments: 8,
      responseRate: '40%',
    },
    {
      name: 'Campaign 3',
      leads: 19,
      appointments: 5,
      responseRate: '36%',
    },
  ]
  
  export default function CampaignsTable() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Leads</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">App</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Response</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{campaign.name}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{campaign.leads}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{campaign.appointments}</td>
                <td className="py-4 px-4 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {campaign.responseRate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }