import { useMemo } from 'react';
import { useDetectionStore } from '../store/detectionStore';

interface BandExplorerProps {
  band: number;
  setBand: (b: number) => void;
}

export function BandExplorer({ band, setBand }: BandExplorerProps) {
  const { uploadResult } = useDetectionStore();
  const totalBands = uploadResult?.shape.bands ?? 186;
  const noisy = uploadResult?.noisy_bands_detected ?? [];

  const wavelength = useMemo(() => Math.round(400 + (band / totalBands) * 1500), [band, totalBands]);

  const thumbs = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 12; i++) arr.push(Math.round((i / 11) * (totalBands - 1)));
    return arr;
  }, [totalBands]);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>
      <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
        ◈ SPECTRAL BAND EXPLORER
      </div>

      {/* Active band */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            BAND
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 40,
              color: 'var(--cyan)',
              textShadow: '0 0 20px rgba(0,229,255,0.4)',
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {String(band).padStart(3, '0')}
          </span>
        </div>
        <div className="font-mono" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          λ = {wavelength} nm
        </div>
        <div style={{ width: '100%', height: 2, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(band / (totalBands - 1)) * 100}%`,
              background: 'var(--cyan)',
              boxShadow: '0 0 6px var(--cyan)',
              transition: 'width 150ms ease',
            }}
          />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={totalBands - 1}
        value={band}
        onChange={(e) => setBand(Number(e.target.value))}
      />

      {/* Thumbnails */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {thumbs.map((b) => {
          const isActive = b === band;
          const isNoisy = noisy.includes(b);
          return (
            <button
              key={b}
              onClick={() => setBand(b)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                background: `linear-gradient(${135 + b}deg, var(--surface2) 0%, var(--surface3) 100%)`,
                borderRadius: 4,
                border: isActive ? '1px solid var(--cyan)' : '1px solid var(--border)',
                boxShadow: isActive ? '0 0 8px rgba(0,229,255,0.3)' : 'none',
                padding: 0,
                overflow: 'hidden',
                transition: 'all 200ms',
              }}
            >
              <span
                className="font-mono"
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 5,
                  fontSize: 9,
                  color: isActive ? 'var(--cyan)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {b}
              </span>
              {isNoisy && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 5,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--red)',
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at ${30 + (b % 50)}% ${40 + (b % 30)}%, rgba(0,229,255,${0.05 + (b % 7) * 0.02}) 0%, transparent 70%)`,
                }}
              />
            </button>
          );
        })}
      </div>

      {noisy.length > 0 && (
        <div
          style={{
            background: 'rgba(255,45,85,0.07)',
            border: '1px solid rgba(255,45,85,0.2)',
            borderRadius: 4,
            padding: '10px 12px',
          }}
        >
          <div className="font-mono" style={{ fontSize: 9, color: 'var(--red)', marginBottom: 4, letterSpacing: '0.08em' }}>
            ⚠ WATER ABSORPTION REGIONS
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            Bands 104–113 · 150–170 excluded from analysis
          </div>
        </div>
      )}
    </div>
  );
}
