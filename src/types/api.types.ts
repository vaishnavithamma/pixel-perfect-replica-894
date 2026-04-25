export interface BandThumbnail {
  band_id: string;
  wavelength: string;
  thumbnail_b64: string;
}

export interface UploadResponse {
  status: string;
  file_hash: string;
  shape: { height: number; width: number; bands: number };
  format: string;
  rgb_preview: string;
  estimated_processing_seconds: number;
  noisy_bands_detected: number[];
  bands?: BandThumbnail[];
}

export interface AnomalyRegion {
  id: number;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  centroid: { x: number; y: number };
  confidence: number;
  pixel_count: number;
  mean_score: number;
}

export interface PipelineMeta {
  bands_removed: number[];
  pca_variance_retained: number;
  unet_final_loss: number;
  total_anomalous_pixels: number;
}

export interface DetectResponse {
  status: string;
  processing_time_ms: number;
  rgb_image: string;
  heatmap_raw: string;
  heatmap_overlay: string;
  anomaly_mask: string;
  anomaly_regions: AnomalyRegion[];
  pipeline_metadata: PipelineMeta;
}
