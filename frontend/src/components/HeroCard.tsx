import { useEffect, useState } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
interface HeroCardProps {
  message: string;
  imageUrl: string;
  name?: string; // Make name optional since we will detect logged in user
}

// The source of the logged in user could be via API, context, or localStorage.
// For demonstration, let's try to get user name from localStorage under 'userName' key.
export const HeroCard = ({ message, imageUrl, name }: HeroCardProps) => {
  const [userName, setUserName] = useState<string>(name || "");

  useEffect(() => {
    if (!name) {
      // Try to fetch logged-in user's name from localStorage
      const storedUserName = localStorage.getItem("userName");
      if (storedUserName) {
        setUserName(storedUserName);
      }
    }
  }, [name]);

  // Only show a user name that actually exists
  if (!userName) return null;

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-lg flex items-center justify-between overflow-hidden">
      <div className="relative z-10">
        <p className="text-gray-900 text-lg">Welcome back,</p>
        <p className="text-gray-900 text-4xl font-bold mt-1">
          {userName}
        </p>
        <p className="text-gray-600 text-sm mt-2">{message}</p>
        <button className="mt-6 flex items-center text-blue-600 text-sm">
          Tap to record <span className="ml-2">→</span>
        </button>
      </div>
      <div className="absolute right-0 top-0 h-full w-1/2">
        <DotLottieReact
          src="https://lottie.host/c87890af-62e3-48b9-bcbb-505776f4a650/oNEqsIrTWK.lottie"
          autoplay
          loop
          className="h-full w-full"
        />
      </div>
    </div>
  );
};
