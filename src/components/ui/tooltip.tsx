"use client";

import { useState, ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
    }
    setIsVisible(false);
  };

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  const arrowPositions = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-surface-elevated",
    right: "right-full top-1/2 -translate-y-1/2 border-r-surface-elevated",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-surface-elevated",
    left: "left-full top-1/2 -translate-y-1/2 border-l-surface-elevated",
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}

      {isVisible && (
        <div
          className={`absolute ${positionStyles[position]} px-3 py-2 bg-surface-elevated text-text-primary text-xs font-medium rounded-lg shadow-lg border border-border-default whitespace-nowrap z-50 animate-fade-in`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-surface-elevated ${arrowPositions[position]} border border-border-default`}
            style={{
              borderRadius: "1px",
            }}
          />
        </div>
      )}
    </div>
  );
}
