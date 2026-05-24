import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CircularScoreProps {
  score: number;
  animate?: boolean;
}

export const CircularScore = ({ score, animate = true }: CircularScoreProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * score);
      
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };

    animateScore();
  }, [score, animate]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 70) return "stroke-success";
    if (score >= 40) return "stroke-warning";
    return "stroke-destructive";
  };

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="fill-none stroke-muted"
          strokeWidth="12"
        />
        {/* Animated progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className={cn("fill-none transition-all duration-500", getStrokeColor(displayScore))}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: "drop-shadow(0 0 8px currentColor)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-5xl font-bold", getScoreColor(displayScore))}>
          {displayScore}
        </span>
        <span className="text-sm text-muted-foreground font-medium mt-1">Match Score</span>
      </div>
    </div>
  );
};
