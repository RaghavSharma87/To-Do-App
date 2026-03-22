import { useMemo } from "react";



function Hero() {
  const dots = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="relative h-64 bg-slate-900 overflow-hidden rounded-xl mb-6 flex items-center justify-center">
      {/* Floating Dots */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-50 animate-pulse"
          style={{
            left: dot.left,
            top: dot.top,
            animationDuration: `${dot.duration}s`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
      
      <h1 className="text-4xl font-bold text-white z-10">Raghav's To-Do</h1>
    </div>
  );
}

export default Hero;