// Lightweight ROC chart placeholder kept for future use
export function ROCChart() {
  return (
    <svg width="100%" height="120" viewBox="0 0 200 120">
      <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <line x1="20" y1="10" x2="20" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <line x1="20" y1="100" x2="180" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="3 3" />
      <path
        d="M 20 100 Q 30 50, 80 25 T 180 10"
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="2"
      />
    </svg>
  );
}
