import { HiOutlineEmojiHappy } from "react-icons/hi";

interface SatisfactionRateCardProps {
  rate: number;
  description: string;
}

export const SatisfactionRateCard = ({ rate, description }: SatisfactionRateCardProps) => {
  const radius = 45;
  const stroke = 10;
  const normalizedRate = Math.max(0, Math.min(rate, 100));
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalizedRate / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-7 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all duration-300">
      {/* Progress Circle */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-4 md:mb-0">
        <svg className="w-full h-full" viewBox="0 0 110 110">
          {/* Track */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)' }}
          />
          {/* Icon */}
          <g>
            <text
              x="55"
              y="52"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: "2.2rem", fill: "#2563eb" }}
            >
              {/* <tspan dy="12">😊</tspan> */}
            </text>
          </g>
        </svg>
        {/* Absolute main rate in circle center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-gray-900 leading-7" style={{lineHeight:1}}>{normalizedRate}%</span>
          <span className="text-xs text-gray-500 font-medium mt-1 tracking-wide uppercase">Happy Clients</span>
        </div>
      </div>
      {/* Info */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-[240px]">
        <span className="text-gray-900 text-2xl md:text-3xl font-bold mb-2">
          {normalizedRate}% Satisfied
        </span>
        <span className="text-gray-600 text-base md:text-lg mb-3">{description}</span>
        <div className="flex flex-row items-center mt-1 gap-2 opacity-80">
          <HiOutlineEmojiHappy className="text-blue-500 text-xl" />
          <span className="text-gray-500 text-sm font-medium">Satisfaction Rate</span>
        </div>
        <span className="text-gray-400 text-xs mt-2">From all projects</span>
      </div>
    </div>
  );
};
