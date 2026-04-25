import type { UploadResponse, DetectResponse } from '../types/api.types';

export const mockUpload: UploadResponse = {
  status: 'success',
  file_hash: 'a3f9c2d1e8b4',
  shape: { height: 512, width: 614, bands: 186 },
  format: 'AVIRIS',
  rgb_preview: '',
  estimated_processing_seconds: 12,
  noisy_bands_detected: [
    104, 105, 106, 107, 108, 109, 110, 111, 112, 113,
    150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
    160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170,
  ],
  bands: [], 
};

export const mockDetect: DetectResponse = {
  status: 'success',
  processing_time_ms: 2847,
  rgb_image: '',
  heatmap_raw: '',
  heatmap_overlay: '',
  anomaly_mask: '',
  anomaly_regions: [
    { id: 1, bbox: { x1: 45, y1: 120, x2: 89, y2: 167 }, centroid: { x: 67, y: 143 }, confidence: 0.94, pixel_count: 1247, mean_score: 0.847 },
    { id: 2, bbox: { x1: 230, y1: 89, x2: 278, y2: 134 }, centroid: { x: 254, y: 111 }, confidence: 0.81, pixel_count: 689, mean_score: 0.723 },
    { id: 3, bbox: { x1: 401, y1: 302, x2: 444, y2: 341 }, centroid: { x: 422, y: 321 }, confidence: 0.73, pixel_count: 412, mean_score: 0.651 },
    { id: 4, bbox: { x1: 156, y1: 445, x2: 198, y2: 489 }, centroid: { x: 177, y: 467 }, confidence: 0.65, pixel_count: 287, mean_score: 0.598 },
    { id: 5, bbox: { x1: 502, y1: 178, x2: 538, y2: 212 }, centroid: { x: 520, y: 195 }, confidence: 0.58, pixel_count: 198, mean_score: 0.541 },
  ],
  pipeline_metadata: {
    bands_removed: [
      104, 105, 106, 107, 108, 109, 110, 111, 112, 113,
      150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
      160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170,
    ],
    pca_variance_retained: 0.992,
    unet_final_loss: 0.00847,
    total_anomalous_pixels: 2833,
  },
};
