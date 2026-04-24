export function Atmosphere() {
  return (
    <>
      {/* Nebula glows */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            'radial-gradient(ellipse 800px 600px at 15% 20%, rgba(0,229,255,0.04) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            'radial-gradient(ellipse 1000px 700px at 85% 80%, rgba(123,94,167,0.05) 0%, transparent 70%)',
        }}
      />
      {/* Grid overlay */}
      <svg
        className="fixed inset-0 pointer-events-none"
        width="100%"
        height="100%"
        style={{ zIndex: 1, opacity: 0.035 }}
        aria-hidden
      >
        <defs>
          <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>
      {/* Scanline */}
      <div
        className="scanline-anim"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent, var(--cyan), transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

export function CornerBrackets({ color = 'var(--cyan)', opacity = 0.5, size = 14 }: { color?: string; opacity?: number; size?: number }) {
  const s = size;
  const style: React.CSSProperties = {
    position: 'absolute',
    width: s,
    height: s,
    borderColor: color,
    opacity,
    pointerEvents: 'none',
  };
  return (
    <>
      <div style={{ ...style, top: 6, left: 6, borderTop: '1px solid', borderLeft: '1px solid' }} />
      <div style={{ ...style, top: 6, right: 6, borderTop: '1px solid', borderRight: '1px solid' }} />
      <div style={{ ...style, bottom: 6, left: 6, borderBottom: '1px solid', borderLeft: '1px solid' }} />
      <div style={{ ...style, bottom: 6, right: 6, borderBottom: '1px solid', borderRight: '1px solid' }} />
    </>
  );
}

export function HexagonLogo({ size = 60, spinning = true }: { size?: number; spinning?: boolean }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        className={spinning ? 'rotate-slow' : ''}
        style={{ position: 'absolute', inset: 0 }}
      >
        <polygon
          points="30,4 52,17 52,43 30,56 8,43 8,17"
          fill="none"
          stroke="var(--cyan)"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        style={{ position: 'absolute', inset: 0 }}
      >
        <polygon
          points="30,16 44,23 44,37 30,44 16,37 16,23"
          fill="none"
          stroke="var(--cyan)"
          strokeWidth="1"
          opacity="0.6"
        />
        <circle cx="30" cy="30" r="2" fill="var(--cyan)" />
      </svg>
    </div>
  );
}
