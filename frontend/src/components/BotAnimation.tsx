'use client';
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function BotAnimation() {
  return (
    <div className="flex justify-center items-center w-64 h-64">
      <DotLottieReact
        src="https://lottie.host/3fa7c7ce-2d46-458f-a619-1491308f9e52/ZBaDtASLz5.lottie"
        loop
        autoplay
      />
    </div>
  );
}
