interface StatCardProps {
  title: string;
  value: string;
  percentage: string;
  icon: React.ReactNode;
}


export const StatCard = ({ title, value, percentage, icon }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center space-x-4 shadow-lg">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-gray-900 text-2xl font-bold mt-1">{value}</p>
        <p className="text-green-600 text-sm">{percentage}</p>
      </div>
    </div>
  );
};
