import { useState } from 'react';
import { Atmosphere, HexagonLogo } from './Atmosphere';
import { useDetectionStore } from '../store/detectionStore';
import { BandExplorer } from './BandExplorer';
import { SplitViewer } from './SplitViewer';
import { MetricsPanel } from './MetricsPanel';
import { AnomalyDetail } from './AnomalyDetail';
import type { AnomalyRegion } from '../types/api.types';

interface DashboardProps {
  onNewAnalysis: () => void;
}

export function Dashboard({ onNewAnalysis }: DashboardProps) {
  const { uploadResult, detectionResult } = useDetectionStore();
  const [band, setBand] = useState(47);
  const [selectedRegion, setSelectedRegion] = useState<AnomalyRegion | null>(null);

  if (!detectionResult || !uploadResult) return null;

  return (
    <div className="fade-in" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Atmosphere />

      {/* Top navbar */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          height: 52,
          background: 'var(--surface1)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HexagonLogo size={24} />
          <span className="font-mono" style={{ fontSize: 16, color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.12em' }}>
            SPECTRASHIELD
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              color: 'var(--cyan)',
              background: 'var(--cyan-dim)',
              border: '1px solid var(--border-act)',
              padding: '2px 8px',
              borderRadius: 20,
            }}
          >
            v2.1
          </span>
        </div>

        <div style={{ flex: 1, textAlign: 'center' }} className="font-mono">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
            {uploadResult.file_hash}.{uploadResult.format.toLowerCase()} · {uploadResult.shape.height}×{uploadResult.shape.width}×{uploadResult.shape.bands}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onNewAnalysis}
            className="font-display"
            style={{
              height: 32,
              padding: '0 16px',
              borderRadius: 2,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.06em',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-act)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            NEW ANALYSIS
          </button>
          <button
            className="font-mono"
            style={{
              height: 32,
              padding: '0 16px',
              borderRadius: 2,
              background: 'var(--cyan)',
              color: '#020209',
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              letterSpacing: '0.08em',
              boxShadow: '0 0 12px rgba(0,229,255,0.3)',
            }}
          >
            EXPORT REPORT
          </button>
        </div>
      </div>

      {/* 3-column body */}
      <div style={{ position: 'relative', zIndex: 5, height: 'calc(100vh - 52px)', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 280, background: 'var(--surface1)', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          <BandExplorer band={band} setBand={setBand} />
        </div>

        <SplitViewer
          rgb={detectionResult.rgb_image}
          heatmap={detectionResult.heatmap_raw}
          overlay={detectionResult.heatmap_overlay}
          mask={detectionResult.anomaly_mask}
          regions={detectionResult.anomaly_regions}
          imgWidth={uploadResult.shape.width}
          imgHeight={uploadResult.shape.height}
          onSelectRegion={setSelectedRegion}
        />

        <div style={{ width: 300, background: 'var(--surface1)', borderLeft: '1px solid var(--border)', overflow: 'hidden' }}>
          <MetricsPanel result={detectionResult} onSelectRegion={setSelectedRegion} />
        </div>
      </div>

      {selectedRegion && <AnomalyDetail region={selectedRegion} onClose={() => setSelectedRegion(null)} />}
    </div>
  );
}
