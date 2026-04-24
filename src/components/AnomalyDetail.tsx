import { useMemo } from 'react';
import type { AnomalyRegion } from '../types/api.types';

interface AnomalyDetailProps {
  region: AnomalyRegion;
  onClose: () => void;
}

export function AnomalyDetail({ region, onClose }: AnomalyDetailProps) {
  const color = region.confidence >= 0.9 ? 'var(--red)' : region.confidence >= 0.7 ? 'var(--orange)' : 'var(--amber)';

  const peakBand = useMemo(() => 50 + ((region.id * 7) % 30), [region.id]);
  const peakWavelength = 400 + peakBand * 5;

  // Generate spectral signature points
  const { normalPoints, anomalyPoints, peakX } = useMemo(() => {
    const pts = 30;
    const w = 280;
    const h = 100;
    const pad = 10;
    const normal: string[] = [];
    const anomaly: string[] = [];
    const peakIdx = Math.floor(pts * 0.55);
    for (let i = 0; i < pts; i++) {
      const x = pad + (i / (pts - 1)) * (w - 2 * pad);
      const seed = (region.id * 13 + i * 7) % 100;
      const baseY = 50 + Math.sin(i * 0.5 + region.id) * 12 + (seed % 8);
      normal.push(`${x.toFixed(1)},${(baseY + 10).toFixed(1)}`);
      let aY = baseY - 4 - (seed % 6);
      if (i === peakIdx) aY = 8;
      else if (i === peakIdx - 1 || i === peakIdx + 1) aY = 24;
      anomaly.push(`${x.toFixed(1)},${aY.toFixed(1)}`);
    }
    const peakX = pad + (peakIdx / (pts - 1)) * (w - 2 * pad);
    return { normalPoints: normal.join(' '), anomalyPoints: anomaly.join(' '), peakX };
  }, [region.id]);

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          left: 0,
          right: 360,
          top: 52,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 99,
        }}
      />

      <div
        className="slide-right"
        style={{
          position: 'fixed',
          right: 0,
          top: 52,
          bottom: 0,
          width: 360,
          background: 'rgba(10,10,20,0.98)',
          borderLeft: '1px solid var(--border-act)',
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          overflowY: 'auto',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 20,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className="font-display" style={{ fontSize: 16, color: 'var(--cyan)', fontWeight: 600, letterSpacing: '0.06em' }}>
            ◉ REGION {String(region.id).padStart(2, '0')}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 24,
              height: 24,
              border: '1px solid var(--border)',
              borderRadius: 2,
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
              lineHeight: 1,
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-act)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Location chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip label={`X:${region.bbox.x1}–${region.bbox.x2}`} />
            <Chip label={`Y:${region.bbox.y1}–${region.bbox.y2}`} />
            <Chip label={`${region.pixel_count} PIXELS`} />
            <Chip label={`(${region.centroid.x}, ${region.centroid.y}) CENTROID`} />
          </div>

          {/* Confidence */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
              ANOMALY CONFIDENCE
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: 56,
                color,
                textShadow: `0 0 30px ${color}`,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {(region.confidence * 100).toFixed(1)}%
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
              MEAN SCORE: {region.mean_score.toFixed(4)}
            </div>
          </div>

          {/* Spectral signature */}
          <div>
            <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 8 }}>
              ◈ SPECTRAL SIGNATURE
            </div>
            <svg width="100%" height="140" viewBox="0 0 300 120" style={{ background: 'var(--surface2)', borderRadius: 4, border: '1px solid var(--border)' }}>
              {/* grid */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="10" x2="290" y1={10 + i * 25} y2={10 + i * 25} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              ))}
              {/* normal */}
              <polyline points={normalPoints} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              {/* anomaly */}
              <polyline points={anomalyPoints} fill="none" stroke="var(--cyan)" strokeWidth="2.5" />
              {/* peak deviation */}
              <line x1={peakX} x2={peakX} y1="5" y2="115" stroke="var(--red)" strokeWidth="1" strokeDasharray="3 3" />
              {/* axis labels */}
              <text x="10" y="118" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">400nm</text>
              <text x="265" y="118" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">900nm</text>
              <text x="6" y="65" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono" transform="rotate(-90 6 65)">REFLECTANCE</text>
            </svg>
            <div className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
              Peak deviation at Band {peakBand} (λ={peakWavelength}nm)
            </div>
          </div>

          {/* Material candidates */}
          <div>
            <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 8 }}>
              ◎ MATERIAL CANDIDATES
            </div>
            <Material name="Metal surface" pct={68} />
            <Material name="Synthetic fabric" pct={21} />
            <Material name="Unknown substrate" pct={11} />
          </div>
        </div>
      </div>
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div
      className="font-mono"
      style={{
        fontSize: 10,
        border: '1px solid var(--border)',
        borderRadius: 2,
        padding: '4px 10px',
        background: 'var(--surface2)',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </div>
  );
}

function Material({ name, pct }: { name: string; pct: number }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="font-display" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
        {name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 60, height: 2, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
        </div>
        <span className="font-mono" style={{ fontSize: 13, color: 'var(--cyan)', minWidth: 32, textAlign: 'right' }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}
