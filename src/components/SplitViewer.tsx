import { useEffect, useRef, useState } from 'react';
import { CornerBrackets } from './Atmosphere';
import type { AnomalyRegion } from '../types/api.types';

type Mode = 'rgb' | 'overlay' | 'heatmap' | 'mask';

interface SplitViewerProps {
  rgb: string;
  heatmap: string;
  overlay: string;
  mask: string;
  regions: AnomalyRegion[];
  imgWidth: number;
  imgHeight: number;
  onSelectRegion: (r: AnomalyRegion) => void;
}

export function SplitViewer({ rgb, heatmap, overlay, mask, regions, imgWidth, imgHeight, onSelectRegion }: SplitViewerProps) {
  const [splitPct, setSplitPct] = useState(50);
  const [mode, setMode] = useState<Mode>('overlay');
  const [opacity, setOpacity] = useState(80);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.max(10, Math.min(90, pct)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const rightImg = mode === 'heatmap' ? heatmap : mode === 'overlay' ? overlay : mode === 'mask' ? mask : rgb;
  const rightLabel = mode === 'heatmap' ? '◈ ANOMALY HEATMAP' : mode === 'overlay' ? '◈ OVERLAY' : mode === 'mask' ? '◈ MASK' : '◉ RGB COMPOSITE';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* image area */}
      <div
        ref={containerRef}
        style={{ flex: 1, position: 'relative', overflow: 'hidden', userSelect: dragging ? 'none' : 'auto' }}
      >
        <CornerBrackets size={20} opacity={0.4} />

        {/* LEFT (RGB) */}
        <ImagePane
          src={rgb}
          placeholderText="NO RGB PREVIEW"
          clip={`inset(0 ${100 - splitPct}% 0 0)`}
          variant="rgb"
        />
        {/* RIGHT (heatmap/overlay/mask) */}
        <ImagePane
          src={rightImg}
          placeholderText={mode === 'heatmap' ? 'SYNTHETIC HEATMAP' : mode === 'mask' ? 'ANOMALY MASK' : 'ANOMALY OVERLAY'}
          clip={`inset(0 0 0 ${splitPct}%)`}
          variant={mode}
          opacity={mode === 'overlay' ? opacity / 100 : 1}
          regions={regions}
          imgWidth={imgWidth}
          imgHeight={imgHeight}
          onSelectRegion={onSelectRegion}
          showRegions
        />

        {/* Labels */}
        <div
          className="font-mono"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
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
          ◉ RGB COMPOSITE
        </div>
        <div
          className="font-mono"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
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
          {rightLabel}
        </div>

        {/* Divider */}
        <div
          onMouseDown={() => setDragging(true)}
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
            style={{ width: 80 }}
          />
          <span style={{ fontSize: 13, color: 'var(--cyan)', minWidth: 38 }}>{opacity}%</span>
        </div>
      </div>
    </div>
  );
}

function ImagePane({
  src,
  placeholderText,
  clip,
  variant,
  opacity = 1,
  regions = [],
  imgWidth,
  imgHeight,
  onSelectRegion,
  showRegions,
}: {
  src: string;
  placeholderText: string;
  clip: string;
  variant: Mode | 'rgb';
  opacity?: number;
  regions?: AnomalyRegion[];
  imgWidth?: number;
  imgHeight?: number;
  onSelectRegion?: (r: AnomalyRegion) => void;
  showRegions?: boolean;
}) {
  const hasImg = src && src.length > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        clipPath: clip,
        background: hasImg ? '#000' : 'linear-gradient(135deg, var(--surface2) 0%, var(--surface3) 100%)',
        opacity,
      }}
    >
      {hasImg ? (
        <img
          src={`data:image/jpeg;base64,${src}`}
          alt={placeholderText}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <SyntheticView variant={variant} text={placeholderText} regions={showRegions ? regions : []} imgWidth={imgWidth} imgHeight={imgHeight} onSelectRegion={onSelectRegion} />
      )}
    </div>
  );
}

function SyntheticView({
  variant,
  text,
  regions = [],
  imgWidth = 614,
  imgHeight = 512,
  onSelectRegion,
}: {
  variant: string;
  text: string;
  regions?: AnomalyRegion[];
  imgWidth?: number;
  imgHeight?: number;
  onSelectRegion?: (r: AnomalyRegion) => void;
}) {
  // Synthetic display backgrounds for each mode
  const bgByVariant: Record<string, string> = {
    rgb: `
      radial-gradient(ellipse at 30% 40%, rgba(60,80,120,0.6), transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(80,60,90,0.5), transparent 60%),
      radial-gradient(ellipse at 50% 80%, rgba(40,60,80,0.7), transparent 50%),
      linear-gradient(135deg, #0a1424 0%, #1a2438 100%)
    `,
    overlay: `
      radial-gradient(circle at 30% 40%, rgba(255,45,85,0.7) 0%, transparent 12%),
      radial-gradient(circle at 70% 60%, rgba(255,107,53,0.6) 0%, transparent 14%),
      radial-gradient(circle at 50% 80%, rgba(255,179,71,0.5) 0%, transparent 10%),
      radial-gradient(ellipse at 30% 40%, rgba(60,80,120,0.6), transparent 50%),
      linear-gradient(135deg, #0a1424 0%, #1a2438 100%)
    `,
    heatmap: `
      radial-gradient(circle at 30% 40%, rgba(255,45,85,0.95) 0%, rgba(255,107,53,0.6) 8%, rgba(255,179,71,0.3) 18%, transparent 28%),
      radial-gradient(circle at 70% 60%, rgba(255,107,53,0.85) 0%, rgba(255,179,71,0.5) 10%, transparent 22%),
      radial-gradient(circle at 50% 80%, rgba(255,179,71,0.7) 0%, transparent 18%),
      radial-gradient(circle at 80% 25%, rgba(0,229,255,0.4) 0%, transparent 14%),
      linear-gradient(135deg, #02050d 0%, #0a1024 100%)
    `,
    mask: `
      radial-gradient(circle at 30% 40%, white 0%, white 6%, transparent 7%),
      radial-gradient(circle at 70% 60%, white 0%, white 5%, transparent 6%),
      radial-gradient(circle at 50% 80%, white 0%, white 4%, transparent 5%),
      radial-gradient(circle at 25% 90%, white 0%, white 3%, transparent 4%),
      radial-gradient(circle at 85% 35%, white 0%, white 3%, transparent 4%),
      #000
    `,
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: bgByVariant[variant] ?? bgByVariant.rgb,
      }}
    >
      {/* scanning lines for atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,229,255,0.04) 0, rgba(0,229,255,0.04) 1px, transparent 1px, transparent 4px)',
          pointerEvents: 'none',
        }}
      />

      {/* anomaly bounding boxes */}
      {regions.map((r) => {
        const xPct = (r.bbox.x1 / imgWidth) * 100;
        const yPct = (r.bbox.y1 / imgHeight) * 100;
        const wPct = ((r.bbox.x2 - r.bbox.x1) / imgWidth) * 100;
        const hPct = ((r.bbox.y2 - r.bbox.y1) / imgHeight) * 100;
        const color = r.confidence >= 0.9 ? 'var(--red)' : r.confidence >= 0.7 ? 'var(--orange)' : 'var(--amber)';
        return (
          <div
            key={r.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectRegion?.(r);
            }}
            style={{
              position: 'absolute',
              left: `${xPct}%`,
              top: `${yPct}%`,
              width: `${wPct}%`,
              height: `${hPct}%`,
              border: `1px solid ${color}`,
              boxShadow: `0 0 10px ${color}`,
              borderRadius: 1,
              cursor: 'pointer',
            }}
          >
            <div
              className="font-mono"
              style={{
                position: 'absolute',
                top: -16,
                left: -1,
                fontSize: 9,
                color,
                background: 'rgba(0,0,0,0.7)',
                padding: '1px 5px',
                letterSpacing: '0.08em',
              }}
            >
              R{String(r.id).padStart(2, '0')} · {(r.confidence * 100).toFixed(0)}%
            </div>
          </div>
        );
      })}

      <div
        className="font-mono"
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.1em',
        }}
      >
        {text}
      </div>
    </div>
  );
}
