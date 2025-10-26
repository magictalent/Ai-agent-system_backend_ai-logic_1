import React from 'react';
import { Particles } from '@tsparticles/react';
import { loadAll } from '@tsparticles/all';

const StarryBackground = () => {
  const particlesInit = async (main: any) => {
    await loadAll(main);
  };
  return (
    <Particles
      id="starry-bg"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: '#090b17' },
        particles: {
          number: { value: 150, density: { enable: true, area: 1000 } },
          color: { value: '#fff' },
          shape: { type: 'circle' },
          opacity: { value: 0.7, random: true },
          size: { value: 1.5, random: { enable: true, minimumValue: 0.5 } },
          move: { enable: true, speed: 0.15 },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
          },
          modes: {
            repulse: { distance: 100 },
            push: { quantity: 3 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default StarryBackground;
