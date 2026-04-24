import { useEffect, useState } from 'react';
import type { AnomalyRegion, DetectResponse } from '../types/api.types';

interface MetricsPanelProps {
  result: DetectResponse;
  onSelectRegion: (r: AnomalyRegion) => void;
}

export function MetricsPanel({ result, onSelectRegion }: MetricsPanelProps) {
  const maxConf = Math.max(...result.anomaly_regions.map((r) => r.confidence)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Metrics */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 12 }}>
          ◈ DETECTION METRICS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Stat label="ANOMALY REGIONS" value={result.anomaly_regions.length} />
          <Stat label="MAX CONFIDENCE" value={maxConf} suffix="%" decimals={1} />
          <Stat label="ANOMALOUS PX" value={result.pipeline_metadata.total_anomalous_pixels} />
          <Stat label="PCA VARIANCE" value={result.pipeline_metadata.pca_variance_retained * 100} suffix="%" decimals={1} />
        </div>
      </div>

      {/* Anomalies list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 10 }}>
          ◉ DETECTED ANOMALIES
        </div>
        {result.anomaly_regions.map((r, i) => {
          const color = r.confidence >= 0.9 ? 'var(--red)' : r.confidence >= 0.7 ? 'var(--orange)' : 'var(--amber)';
          return (
            <div
              key={r.id}
              onClick={() => onSelectRegion(r)}
              className="fade-in"
              style={{
                animationDelay: `${i * 60}ms`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 4,
                background: 'var(--surface2)',
                marginBottom: 6,
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-act)';
                e.currentTarget.style.background = 'var(--surface3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface2)';
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-display" style={{ fontSize: 12, color: 'white', fontWeight: 500 }}>
                  Region {String(r.id).padStart(2, '0')}
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                  ({r.centroid.x}, {r.centroid.y}) · {r.pixel_count}px
                </div>
              </div>
              <div className="font-mono" style={{ fontSize: 13, color, fontWeight: 600 }}>
                {(r.confidence * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--surface2)',
          borderTop: '1px solid var(--border)',
        }}
        className="font-mono"
      >
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
          U-Net Loss: {result.pipeline_metadata.unet_final_loss.toFixed(5)}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
          Bands removed: {result.pipeline_metadata.bands_removed.length}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
          Processing: {result.processing_time_ms}ms
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix = '', decimals = 0 }: { label: string; value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(value * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const fmt =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <div
      style={{
        background: 'var(--surface2)',
        borderRadius: 4,
        padding: '10px 12px',
        border: '1px solid var(--border)',
        transition: 'all 200ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-act)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(0,229,255,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="font-mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: 22,
          color: 'var(--cyan)',
          textShadow: '0 0 12px rgba(0,229,255,0.3)',
          fontWeight: 600,
          lineHeight: 1.1,
        }}
      >
        {fmt}
        {suffix}
      </div>
    </div>
  );
}
