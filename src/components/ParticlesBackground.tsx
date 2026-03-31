import { useCallback, useMemo } from 'react';
import Particles from '@tsparticles/react';
import { type Container, type Engine } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

export const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // Listo
  }, []);

  const options = useMemo(() => ({
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: false },
        onHover: { enable: true, mode: 'bubble' },
        resize: { enable: true, delay: 0.5 }
      },
      modes: {
        bubble: { distance: 150, size: 3, duration: 2, opacity: 0.8 },
      },
    },
    particles: {
      color: {
        value: "#4c1d95", // Indigo/Plum profundo
      },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: { default: "out" as const },
        random: true,
        speed: 0.4, // Lentamente flotando
        straight: false,
      },
      number: {
        density: { enable: true, width: 800, height: 800 },
        value: 120, // Partículas de polvo abundantes
      },
      opacity: {
        value: { min: 0.1, max: 0.6 },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 0.5, max: 2.5 },
      },
    },
    detectRetina: true,
  }), []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={options}
      className="absolute inset-0 opacity-70"
    />
  );
};
