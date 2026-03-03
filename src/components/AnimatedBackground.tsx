import React from "react";
import { motion } from "framer-motion";

const orbs = [
  { x: "10%", y: "15%", size: "w-72 h-72", color: "bg-primary/8", delay: 0, duration: 20 },
  { x: "75%", y: "10%", size: "w-96 h-96", color: "bg-accent/6", delay: 2, duration: 25 },
  { x: "60%", y: "70%", size: "w-80 h-80", color: "bg-primary/6", delay: 4, duration: 22 },
  { x: "20%", y: "75%", size: "w-64 h-64", color: "bg-accent/8", delay: 1, duration: 18 },
  { x: "45%", y: "40%", size: "w-56 h-56", color: "bg-info/5", delay: 3, duration: 24 },
];

export const AnimatedBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradient mesh base */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />

      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute ${orb.size} ${orb.color} rounded-full blur-3xl`}
          style={{ left: orb.x, top: orb.y }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" 
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
