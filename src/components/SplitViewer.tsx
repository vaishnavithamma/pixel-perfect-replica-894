import { useEffect, useRef, useState } from 'react';
import { CornerBrackets } from './Atmosphere';
import type { AnomalyRegion } from '../types/api.types';

type Mode = 'rgb' | 'overlay' | 'heatmap' | 'mask';

interface SplitViewerProps {
  rgb: string;
  rgbFallback?: string;
  heatmap: string;
  overlay: string;
  mask: string;
  regions: AnomalyRegion[];
  imgWidth: number;
  imgHeight: number;
  onSelectRegion: (r: AnomalyRegion) => void;
}

const toSrc = (b64: string) => (b64 && b64.length > 0 ? `data:image/jpeg;base64,${b64}` : null);

export function SplitViewer({
  rgb,
  rgbFallback,
  heatmap,
  overlay,
  mask,
  regions,
  imgWidth,
  imgHeight,
  onSelectRegion,
}: SplitViewerProps) {
  const [splitPct, setSplitPct] = useState(50);
  const [mode, setMode] = useState<Mode>('overlay');
  const [opacity, setOpacity] = useState(80);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(90, Math.max(10, pct)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  const rgbSrc = toSrc(rgb) ?? toSrc(rgbFallback ?? '');
  const rightRawSrc =
    mode === 'rgb'
      ? rgbSrc
      : mode === 'overlay'
        ? toSrc(overlay)
        : mode === 'heatmap'
          ? toSrc(heatmap)
          : toSrc(mask);

  const rightLabel =
    mode === 'heatmap'
      ? '◈ ANOMALY HEATMAP'
      : mode === 'overlay'
        ? '◈ OVERLAY'
        : mode === 'mask'
          ? '◈ MASK'
          : '◉ RGB COMPOSITE';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* image area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        <CornerBrackets size={20} opacity={0.4} />

        {/* LEFT: RGB (clipped to left side) */}
        {rgbSrc ? (
          <img
            src={rgbSrc}
            alt="RGB"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              clipPath: `inset(0 ${100 - splitPct}% 0 0)`,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}>
            <MockRGB regions={regions} imgWidth={imgWidth} imgHeight={imgHeight} />
          </div>
        )}

        {/* RIGHT BASE: RGB underneath the heatmap (clipped to right side) */}
        {rgbSrc ? (
          <img
            src={rgbSrc}
            alt="base"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              clipPath: `inset(0 0 0 ${splitPct}%)`,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${splitPct}%)` }}>
            <MockRGB regions={mode === 'rgb' ? regions : []} imgWidth={imgWidth} imgHeight={imgHeight} />
          </div>
        )}

        {/* RIGHT OVERLAY: heatmap/overlay/mask on top with opacity */}
        {mode !== 'rgb' && (
          rightRawSrc ? (
            <img
              src={rightRawSrc}
              alt="anomaly"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                clipPath: `inset(0 0 0 ${splitPct}%)`,
                opacity: mode === 'overlay' ? opacity / 100 : 1,
                mixBlendMode: mode === 'overlay' ? 'screen' : 'normal',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(0 0 0 ${splitPct}%)`,
                opacity: mode === 'overlay' ? opacity / 100 : 1,
                mixBlendMode: mode === 'overlay' ? 'screen' : 'normal',
                pointerEvents: 'none',
              }}
            >
              <MockAnomaly variant={mode} />
            </div>
          )
        )}

        {/* SVG bounding boxes overlay (full container, clipped to right) */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
          viewBox={`0 0 ${imgWidth} ${imgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {regions.map((r) => {
            const x = r.bbox.x1;
            const y = r.bbox.y1;
            const w = r.bbox.x2 - r.bbox.x1;
            const h = r.bbox.y2 - r.bbox.y1;
            const color = r.confidence >= 0.9 ? '#ff2d55' : r.confidence >= 0.7 ? '#ff6b35' : '#ffb347';
            return (
              <g key={r.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => onSelectRegion(r)}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  opacity={0.85}
                />
                <rect x={x} y={y - 16} width={Math.max(w, 60)} height={16} fill={color} opacity={0.9} />
                <text
                  x={x + 4}
                  y={y - 4}
                  fill="#020209"
                  fontSize={9}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={600}
                >
                  R{String(r.id).padStart(2, '0')} · {(r.confidence * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Labels */}
        <Label position="left">◉ RGB COMPOSITE</Label>
        <Label position="right">{rightLabel}</Label>

        {/* Divider */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${splitPct}%`,
            width: 4,
            background: 'var(--cyan)',
            transform: 'translateX(-50%)',
            cursor: 'col-resize',
            boxShadow: '0 0 12px rgba(0,229,255,0.6), 0 0 30px rgba(0,229,255,0.2)',
            zIndex: 11,
          }}
        >
          <div
            className="pulse-cyan"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--cyan)',
              color: '#020209',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ⇔
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div
        style={{
          height: 52,
          background: 'var(--surface1)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 16,
        }}
      >
        {(['rgb', 'overlay', 'heatmap', 'mask'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="font-mono"
            style={{
              height: 28,
              padding: '0 14px',
              borderRadius: 2,
              fontSize: 11,
              fontWeight: mode === m ? 700 : 500,
              letterSpacing: '0.08em',
              background: mode === m ? 'var(--cyan)' : 'transparent',
              color: mode === m ? '#020209' : 'rgba(255,255,255,0.5)',
              border: mode === m ? '1px solid var(--cyan)' : '1px solid var(--border)',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              if (mode !== m) {
                e.currentTarget.style.borderColor = 'var(--border-act)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== m) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="font-mono">
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>OPACITY</span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            style={{ width: 80, accentColor: 'var(--cyan)' }}
          />
          <span style={{ fontSize: 13, color: 'var(--cyan)', minWidth: 38 }}>{opacity}%</span>
        </div>
      </div>
    </div>
  );
}

function Label({ position, children }: { position: 'left' | 'right'; children: React.ReactNode }) {
  return (
    <div
      className="font-mono"
      style={{
        position: 'absolute',
        top: 12,
        [position]: 12,
        background: 'rgba(0,0,0,0.75)',
        border: '1px solid var(--border-act)',
        borderRadius: 3,
        color: 'var(--cyan)',
        padding: '4px 10px',
        fontSize: 10,
        letterSpacing: '0.08em',
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ───────── Mock placeholders (visible & beautiful when offline) ───────── */

function MockRGB({
  regions,
  imgWidth,
  imgHeight,
}: {
  regions: AnomalyRegion[];
  imgWidth: number;
  imgHeight: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 25% 35%, rgba(40,80,60,0.35), transparent 55%),
          radial-gradient(ellipse at 75% 70%, rgba(30,60,50,0.4), transparent 55%),
          radial-gradient(ellipse at 50% 90%, rgba(50,90,70,0.3), transparent 50%),
          linear-gradient(135deg, #0d1a14 0%, #1a2a1f 60%, #0a140f 100%)
        `,
      }}
    >
      {/* grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,214,143,0.05) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(0,214,143,0.05) 0 1px, transparent 1px 32px)',
        }}
      />
      {/* anomaly hotspots painted in the RGB to match bboxes */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox={`0 0 ${imgWidth} ${imgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {regions.map((r) => (
          <rect
            key={r.id}
            x={r.bbox.x1}
            y={r.bbox.y1}
            width={r.bbox.x2 - r.bbox.x1}
            height={r.bbox.y2 - r.bbox.y1}
            fill="rgba(255,45,85,0.25)"
            stroke="rgba(255,107,53,0.5)"
            strokeWidth={1}
            strokeDasharray="3 2"
          />
        ))}
      </svg>
      <div
        className="font-mono"
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          fontSize: 10,
          color: 'var(--success)',
          letterSpacing: '0.12em',
          textShadow: '0 0 8px rgba(0,214,143,0.5)',
        }}
      >
        ◉ RGB COMPOSITE · MOCK MODE
      </div>
    </div>
  );
}

function MockAnomaly({ variant }: { variant: Mode }) {
  if (variant === 'mask') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 11% 28%, white 0 1.2%, transparent 1.5%),
            radial-gradient(circle at 41% 22%, white 0 1%, transparent 1.3%),
            radial-gradient(circle at 70% 63%, white 0 0.9%, transparent 1.2%),
            radial-gradient(circle at 31% 89%, white 0 0.8%, transparent 1.1%),
            radial-gradient(circle at 86% 38%, white 0 0.7%, transparent 1%),
            #000
          `,
        }}
      />
    );
  }
  // heatmap & overlay both use the glowing red/orange synthetic field
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 11% 28%, rgba(255,45,85,0.95) 0%, rgba(255,107,53,0.55) 8%, rgba(255,179,71,0.25) 18%, transparent 28%),
          radial-gradient(circle at 41% 22%, rgba(255,107,53,0.85) 0%, rgba(255,179,71,0.45) 10%, transparent 22%),
          radial-gradient(circle at 70% 63%, rgba(255,179,71,0.75) 0%, transparent 18%),
          radial-gradient(circle at 31% 89%, rgba(255,107,53,0.7) 0%, transparent 18%),
          radial-gradient(circle at 86% 38%, rgba(255,179,71,0.55) 0%, transparent 14%),
          linear-gradient(135deg, #0a0a14 0%, #14140a 100%)
        `,
      }}
    />
  );
}
