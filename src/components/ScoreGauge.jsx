import React from 'react';

export default function ScoreGauge({ score }) {
  // Map score (300 to 900) to percentage (0 to 100)
  const minScore = 300;
  const maxScore = 900;
  const percentage = Math.max(0, Math.min(100, ((score - minScore) / (maxScore - minScore)) * 100));
  
  // Arc math: Radius = 80. Path length of semi-circle = Math.PI * r ≈ 251.2
  const r = 80;
  const circumference = Math.PI * r;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on score
  let strokeColor = "var(--danger)";
  let scoreCategory = "Poor";
  
  if (score >= 720) {
    strokeColor = "var(--success)";
    scoreCategory = "Excellent";
  } else if (score >= 650) {
    strokeColor = "var(--success)";
    scoreCategory = "Good";
  } else if (score >= 600) {
    strokeColor = "var(--primary)";
    scoreCategory = "Fair";
  } else {
    strokeColor = "var(--danger)";
    scoreCategory = "Poor";
  }

  return (
    <div className="gauge-wrapper">
      <svg width="220" height="120" viewBox="0 0 200 110">
        {/* Background Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Active Colored Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.8s ease-out",
          }}
        />

        {/* Floating Indicator Dot */}
        {/* Math to position dot at the tip of progress */}
        {(() => {
          const angleRad = Math.PI - (percentage / 100) * Math.PI;
          const cx = 100 + r * Math.cos(angleRad);
          const cy = 100 - r * Math.sin(angleRad);
          return (
            <circle
              cx={cx}
              cy={cy}
              r="8"
              fill={strokeColor}
              stroke="#fff"
              strokeWidth="2"

              style={{
                transition: "cx 0.8s ease-out, cy 0.8s ease-out, fill 0.8s ease-out",
              }}
            />
          );
        })()}
      </svg>

      <div className="gauge-center-text">
        <span className="gauge-score" style={{ color: strokeColor }}>
          {score}
        </span>
        <span className="gauge-label" style={{ color: strokeColor }}>
          {scoreCategory}
        </span>
      </div>
    </div>
  );
}
