import { useEffect, useState } from 'react';
import { Atmosphere, CornerBrackets, HexagonLogo } from './Atmosphere';
import { useDetectionStore } from '../store/detectionStore';
import { mockDetect } from '../lib/mockData';
import type { DetectResponse } from '../types/api.types';
import { API_BASE } from '../lib/api';
const STAGES = [
  { name: 'PREPROCESSING', sub: 'Normalizing spectral bands · band-pass filter applied' },
  { name: 'PCA REDUCTION', sub: '186 → 30 components · 99.2% variance retained' },
  { name: 'U-NET INFERENCE', sub: 'Reconstructing spectral cube · 50 epochs' },
  { name: 'RX DETECTOR', sub: 'Computing Mahalanobis distances · full covariance' },
  { name: 'SCORE FUSION', sub: 'Blending U-Net ×0.6 + RX ×0.4' },
  { name: 'SPATIAL FILTER', sub: 'Applying 5×5 neighborhood smoothing' },
];

interface PipelineProps {
  onComplete: () => void;
}

export function PipelineProgress({ onComplete }: PipelineProps) {
  const { uploadResult, setDetectionResult } = useDetectionStore();
  const [stageIdx, setStageIdx] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const totalEst = uploadResult?.estimated_processing_seconds ?? 12;

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (done) return;
    const stageDuration = (totalEst * 1000) / STAGES.length;
    const tick = 50;
    const inc = (tick / stageDuration) * 100;
    const t = setInterval(() => {
      setStageProgress((p) => {
        const next = p + inc;
        if (next >= 100) {
          setStageIdx((idx) => {
            if (idx + 1 >= STAGES.length) {
              setDone(true);
              return idx;
            }
            return idx + 1;
          });
          return 0;
        }
        return next;
      });
    }, tick);
    return () => clearInterval(t);
  }, [done, totalEst]);

  const runDetect = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_hash: uploadResult?.file_hash }),
      });
      if (!res.ok) throw new Error('detect failed');
      const data: DetectResponse = await res.json();
      setDetectionResult(data);
      onComplete();
    } catch (err) {
      setError('Backend offline or detection failed. Check terminal.');
    }
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="fade-in" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <Atmosphere />

      {/* LEFT */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          width: 380,
          padding: '48px 40px',
          borderRight: '1px solid var(--border)',
          background: 'rgba(10,10,20,0.4)',
          backdropFilter: 'blur(8px)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HexagonLogo size={22} />
          <div className="font-mono" style={{ fontSize: 13, color: 'var(--cyan)', letterSpacing: '0.12em' }}>
            PIPELINE EXECUTING<span className="blink">_</span>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

        <div
          className="font-mono"
          style={{
            fontSize: 48,
            color: 'var(--cyan)',
            textShadow: '0 0 20px rgba(0,229,255,0.5)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {mm}:{ss}
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginTop: 4 }}>
          ELAPSED · EST. {totalEst}s TOTAL
        </div>

        <div style={{ marginTop: 32 }}>
          {STAGES.map((stage, i) => {
            const state: 'pending' | 'active' | 'done' = done || i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'pending';
            return (
              <div key={stage.name}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    height: 64,
                    padding: '12px 16px',
                    background: state === 'active' ? 'rgba(0,229,255,0.04)' : 'transparent',
                    borderLeft:
                      state === 'active'
                        ? '2px solid var(--cyan)'
                        : state === 'done'
                          ? '2px solid rgba(0,214,143,0.4)'
                          : '2px solid transparent',
                    borderRadius: '0 4px 4px 0',
                    transition: 'all 400ms ease',
                  }}
                >
                  <div
                    className={state === 'active' ? 'pulse-dot' : ''}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background:
                        state === 'pending'
                          ? 'rgba(255,255,255,0.15)'
                          : state === 'active'
                            ? 'var(--cyan)'
                            : 'var(--success)',
                      boxShadow: state === 'active' ? '0 0 8px var(--cyan)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {state === 'done' && (
                      <svg width="6" height="6" viewBox="0 0 6 6">
                        <polyline points="1,3 2.5,4.5 5,1.5" fill="none" stroke="white" strokeWidth="1" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="font-display"
                      style={{
                        fontSize: 13,
                        color:
                          state === 'pending'
                            ? 'rgba(255,255,255,0.3)'
                            : state === 'done'
                              ? 'var(--success)'
                              : 'white',
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {stage.name}
                    </div>
                    <div
                      className="font-mono"
                      style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}
                    >
                      {stage.sub}
                    </div>
                  </div>
                </div>
                {i < STAGES.length - 1 && <div style={{ height: 0.5, background: 'var(--border)' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          gap: 32,
        }}
      >
        {/* Live preview card */}
        <div
          style={{
            position: 'relative',
            width: 360,
            height: 280,
            background: 'var(--surface1)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* top bar */}
          <div
            style={{
              height: 32,
              background: 'var(--surface2)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
            <div style={{ flex: 1 }} />
            <div className="font-mono blink" style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
              ● LIVE FEED
            </div>
          </div>

          {/* image area */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              background: 'linear-gradient(135deg, var(--surface2) 0%, var(--surface3) 100%)',
              overflow: 'hidden',
            }}
          >
            {uploadResult?.rgb_preview ? (
              <img
                src={`data:image/jpeg;base64,${uploadResult.rgb_preview}`}
                alt="spectral preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(0,229,255,0.15) 0px, rgba(0,229,255,0.15) 1px, transparent 1px, transparent 8px)',
                    animation: 'scan-pattern 1.2s linear infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="font-mono"
                >
                  <span style={{ fontSize: 11, color: 'rgba(0,229,255,0.5)', letterSpacing: '0.15em' }}>
                    ACQUIRING SPECTRAL DATA
                  </span>
                </div>
              </>
            )}
            <CornerBrackets size={12} opacity={0.5} />
          </div>

          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface2)',
            }}
            className="font-mono"
          >
            <span style={{ fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.08em' }}>
              PROCESSING STAGE {Math.min(stageIdx + 1, STAGES.length)} / {STAGES.length}
            </span>
          </div>
        </div>

        {/* progress bar */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${done ? 100 : stageProgress}%`,
                background: 'var(--cyan)',
                boxShadow: '0 0 8px var(--cyan)',
                transition: 'width 100ms linear',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }} className="font-mono">
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>0%</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>100%</span>
          </div>
        </div>

        {done && !error && (
          <button
            onClick={runDetect}
            disabled={analyzing}
            className="pulse-cyan fade-in font-mono"
            style={{
              width: '100%',
              maxWidth: 360,
              height: 52,
              background: 'linear-gradient(135deg, var(--cyan) 0%, #00b8d9 100%)',
              color: '#020209',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.12em',
              borderRadius: 2,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            {analyzing ? (
              <>
                <Spinner /> ANALYZING ANOMALIES...
              </>
            ) : (
              'RUN ANOMALY DETECTION →'
            )}
          </button>
        )}

        {error && (
          <div
            className="font-mono"
            style={{
              padding: 16,
              border: '1px solid var(--red)',
              background: 'rgba(255,45,85,0.08)',
              color: 'var(--red)',
              borderRadius: 2,
              maxWidth: 360,
              fontSize: 12,
            }}
          >
            PIPELINE ERROR: {error}
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="rotate-slow" style={{ animationDuration: '1s' }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="#020209" strokeWidth="2" strokeDasharray="20 20" opacity="0.6" />
    </svg>
  );
}
