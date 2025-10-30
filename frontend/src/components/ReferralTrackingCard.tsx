interface ReferralTrackingCardProps {
  invited: number;
  bonus: number;
  safetyScore: number; // should be between 0 and 10
}

export const ReferralTrackingCard = ({ invited, bonus, safetyScore }: ReferralTrackingCardProps) => {
  // Clamp safetyScore between 0 and 10 to avoid rendering issues
  const safeScore = Math.max(0, Math.min(10, safetyScore));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 10) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[230px]">
      <p className="text-gray-700 text-sm">Referral Tracking</p>
      <div className="flex flex-1 items-center mt-4 justify-between w-full h-full">
        <div className="flex flex-col justify-center">
          <div>
            <p className="text-gray-700 text-sm">Invited</p>
            <p className="text-black text-2xl font-bold mt-1">{invited} <span className="font-normal">people</span></p>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 text-sm">Bonus</p>
            <p className="text-black text-2xl font-bold mt-1">{bonus}</p>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center h-full">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full block" viewBox="0 0 100 100">
              <circle
                className="text-gray-300"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
              />
              <circle
                className="text-green-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <text 
                x="50"
                y="55"
                fill="#000"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="2.5rem"
                fontWeight={700}
                dominantBaseline="middle"
              >
                {safeScore}
              </text>
              <text
                x="50"
                y="74"
                fill="#4B5563"
                textAnchor="middle"
                fontSize="1rem"
                alignmentBaseline="middle"
                dominantBaseline="middle"
                fontWeight={500}
                opacity={0.7}
              >
                Total Score
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
