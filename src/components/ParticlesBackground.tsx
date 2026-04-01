import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { type ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

export const ParticlesBackground = () => {
  // v3 API: engine must be initialized once via initParticlesEngine()
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setEngineReady(true);
    });
  }, []);

  const particlesLoaded = useCallback(async () => {
    // engine loaded — no-op needed for typing
  }, []);

  const options: ISourceOptions = {
    background: {
      color: { value: 'transparent' },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick:  { enable: false },
        onHover:  { enable: true, mode: 'bubble' },
        resize:   { enable: true, delay: 0.5 },
      },
      modes: {
        bubble: { distance: 150, size: 3, duration: 2, opacity: 0.8 },
      },
    },
    particles: {
      color: { value: '#4c1d95' },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'out' },
        random: true,
        speed: 0.4,
        straight: false,
      },
      number: {
        density: { enable: true, width: 800, height: 800 },
        value: 120,
      },
      opacity: {
        value: { min: 0.1, max: 0.6 },
      },
      shape: { type: 'circle' },
      size: {
        value: { min: 0.5, max: 2.5 },
      },
    },
    detectRetina: true,
  };

  if (!engineReady) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={options}
      className="absolute inset-0 opacity-70"
    />
  );
};
