"use client";

import { useMemo } from "react";

// Generate random star positions
function generateStars(count: number): string {
  const stars: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    stars.push(`${x}px ${y}px #FFF`);
  }
  return stars.join(", ");
}

export function StarfieldBackground() {
  // Memoize star positions so they don't regenerate on every render
  const smallStars = useMemo(() => generateStars(700), []);
  const mediumStars = useMemo(() => generateStars(200), []);
  const largeStars = useMemo(() => generateStars(100), []);

  return (
    <>
      <style jsx global>{`
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }
      `}</style>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Background gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)",
          }}
        />
        
        {/* Small stars - fastest */}
        <div
          style={{
            width: "1px",
            height: "1px",
            background: "transparent",
            boxShadow: smallStars,
            animation: "animStar 50s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2000px",
              width: "1px",
              height: "1px",
              background: "transparent",
              boxShadow: smallStars,
            }}
          />
        </div>
        
        {/* Medium stars */}
        <div
          style={{
            width: "2px",
            height: "2px",
            background: "transparent",
            boxShadow: mediumStars,
            animation: "animStar 100s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2000px",
              width: "2px",
              height: "2px",
              background: "transparent",
              boxShadow: mediumStars,
            }}
          />
        </div>
        
        {/* Large stars - slowest */}
        <div
          style={{
            width: "3px",
            height: "3px",
            background: "transparent",
            boxShadow: largeStars,
            animation: "animStar 150s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2000px",
              width: "3px",
              height: "3px",
              background: "transparent",
              boxShadow: largeStars,
            }}
          />
        </div>
      </div>
    </>
  );
}

