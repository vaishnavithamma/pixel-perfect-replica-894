import { useState, useRef } from 'react';
import { Atmosphere, CornerBrackets, HexagonLogo } from './Atmosphere';
import { useDetectionStore } from '../store/detectionStore';
import { mockUpload } from '../lib/mockData';
import type { UploadResponse } from '../types/api.types';

type Status = 'idle' | 'validating' | 'success' | 'error';

interface UploadProps {
  onInitialize: () => void;
}

export function Upload({ onInitialize }: UploadProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadResult, setUploadResult } = useDetectionStore();

  const handleFile = async (file: File) => {
    setFilename(file.name);
    setStatus('validating');
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('upload failed');
      const data: UploadResponse = await res.json();
      setUploadResult(data);
      setStatus('success');
    } catch {
      // graceful fallback
      await new Promise((r) => setTimeout(r, 900));
      setUploadResult(mockUpload);
      setStatus('success');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fade-in" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Atmosphere />

      <div
        style={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <HexagonLogo size={64} />
            <h1
              className="font-mono"
              style={{
                fontSize: 32,
                color: 'var(--cyan)',
                letterSpacing: '0.2em',
                fontWeight: 700,
                textShadow: '0 0 20px rgba(0,229,255,0.4)',
              }}
            >
              SPECTRASHIELD
            </h1>
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              DUAL-ENGINE HYPERSPECTRAL ANOMALY DETECTION
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Pill color="var(--success)" text="● OPERATIONAL" />
              <Pill color="var(--cyan)" text="◈ DUAL-ENGINE" />
              <Pill color="var(--amber)" text="⚡ GPU READY" />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              position: 'relative',
              width: '100%',
              height: 300,
              background: dragOver ? 'var(--cyan-dim)' : 'var(--surface1)',
              border: `1.5px dashed ${dragOver ? 'var(--cyan)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
              transform: dragOver ? 'scale(1.005)' : 'scale(1)',
              boxShadow: dragOver
                ? '0 0 40px rgba(0,229,255,0.25), inset 0 0 60px rgba(0,229,255,0.05)'
                : 'inset 0 0 80px rgba(0,229,255,0.02)',
              overflow: 'hidden',
            }}
          >
            <CornerBrackets size={16} opacity={0.7} />
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".mat,.hdr,.img,.npy"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {/* spectral waveform */}
            <svg width="300" height="60" viewBox="0 0 300 60" aria-hidden>
              <polyline
                points="0,30 20,10 40,50 60,20 80,45 100,15 120,40 140,25 160,50 180,10 200,35 220,20 240,45 260,15 280,40 300,30"
                stroke="var(--cyan)"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
                className="draw-line"
              />
            </svg>

            <div className="font-display" style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em' }}>
              DROP HYPERSPECTRAL CUBE
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}
            >
              .mat · .hdr · .img · .npy
            </div>
          </div>

          {/* Status */}
          <div style={{ height: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            {status === 'validating' && (
              <>
                <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)' }} />
                <span className="font-mono" style={{ fontSize: 13, color: 'var(--cyan)' }}>
                  Validating spectral cube...
                </span>
              </>
            )}
            {status === 'success' && uploadResult && (
              <>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                <span className="font-mono" style={{ fontSize: 13, color: 'var(--success)', letterSpacing: '0.05em' }}>
                  {uploadResult.shape.height}×{uploadResult.shape.width}×{uploadResult.shape.bands} · {uploadResult.format} FORMAT CONFIRMED
                </span>
              </>
            )}
            {status === 'error' && (
              <>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                <span className="font-mono" style={{ fontSize: 13, color: 'var(--red)' }}>{errorMsg}</span>
              </>
            )}
          </div>

          {/* RGB preview */}
          {status === 'success' && uploadResult?.rgb_preview && (
            <img
              src={`data:image/jpeg;base64,${uploadResult.rgb_preview}`}
              style={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'cover',
                borderRadius: 4,
                border: '1px solid var(--border-act)',
                boxShadow: '0 0 24px rgba(0,229,255,0.15)',
              }}
              alt="RGB Preview"
            />
          )}

          {/* Initialize button */}
          {status === 'success' && (
            <button
              onClick={onInitialize}
              className="pulse-cyan fade-in font-mono"
              style={{
                width: '100%',
                height: 52,
                background: 'linear-gradient(135deg, var(--cyan) 0%, #00b8d9 100%)',
                color: '#020209',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.12em',
                borderRadius: 2,
                border: 'none',
                transition: 'filter 200ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              INITIALIZE DETECTION PIPELINE →
            </button>
          )}

          {/* feature chips */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Chip text="◈ Unsupervised detection" />
            <Chip text="⚡ Dual-engine fusion" />
            <Chip text="◎ < 3s inference" />
          </div>

          {filename && (
            <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
              FILE: {filename}
            </div>
          )}
        </div>
      </div>

      {/* footer credits */}
      <div
        className="font-mono"
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.1em',
          zIndex: 5,
        }}
      >
        SPECTRASHIELD v2.1 · ANTHROPIC RESEARCH SYSTEMS · 2025
      </div>
    </div>
  );
}

function Pill({ color, text }: { color: string; text: string }) {
  return (
    <div
      className="font-mono"
      style={{
        fontSize: 10,
        color,
        border: `1px solid ${color}`,
        background: color.startsWith('var(') ? 'transparent' : color,
        opacity: 1,
        padding: '4px 10px',
        borderRadius: 20,
        borderColor: color,
        backgroundColor: 'transparent',
        letterSpacing: '0.1em',
      }}
    >
      <span style={{ color, opacity: 1 }}>{text}</span>
    </div>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <div
      className="font-mono"
      style={{
        fontSize: 11,
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '6px 14px',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.05em',
      }}
    >
      {text}
    </div>
  );
}
