interface SatisfactionRateCardProps {
  rate: number;
  description: string;
}

export const SatisfactionRateCard = ({ rate, description }: SatisfactionRateCardProps) => {
  const circumference = 2 * Math.PI * 40; // 40 is the radius
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
      <p className="text-gray-600 text-sm">Satisfaction Rate</p>
      <p className="text-gray-600 text-xs mt-1">From all projects</p>
      <div className="relative w-28 h-28 mt-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className="text-blue-500"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <text x="50" y="50" fill="#374151" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold">
            {rate}%
          </text>
          <text x="50" y="65" fill="#6B7280" textAnchor="middle" dominantBaseline="middle" className="text-xs">
            😊
          </text>
        </svg>
      </div>
      <p className="text-gray-900 text-3xl font-bold mt-4">{rate}%</p>
      <p className="text-gray-600 text-sm mt-1">{description}</p>
    </div>
  );
};
