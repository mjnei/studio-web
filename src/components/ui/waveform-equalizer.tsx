"use client";

import React from "react";

interface WaveformEqualizerProps {
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
  color?: string;
}

export function WaveformEqualizer({
  isPlaying = false,
  barCount = 4,
  className = "",
  color = "bg-accent-primary",
}: WaveformEqualizerProps) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className={`flex items-end gap-0.5 h-4 px-1 ${className}`} aria-hidden>
      {bars.map((i) => {
        // Stagger animation delays for natural equalizer effect
        const delay = (i * 0.15) % 0.6;
        const duration = 0.6 + ((i * 0.2) % 0.4);

        return (
          <span
            key={i}
            className={`w-0.5 rounded-full transition-all ${color} ${
              isPlaying ? "animate-pulse" : "h-1.5 opacity-40"
            }`}
            style={
              isPlaying
                ? {
                    height: `${30 + ((i * 27) % 70)}%`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    animationIterationCount: "infinite",
                  }
                : { height: "4px" }
            }
          />
        );
      })}
    </div>
  );
}
