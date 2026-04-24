import { create } from 'zustand';
import type { UploadResponse, DetectResponse } from '../types/api.types';

interface DetectionState {
  uploadResult: UploadResponse | null;
  detectionResult: DetectResponse | null;
  setUploadResult: (r: UploadResponse) => void;
  setDetectionResult: (r: DetectResponse) => void;
  reset: () => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  uploadResult: null,
  detectionResult: null,
  setUploadResult: (r) => set({ uploadResult: r }),
  setDetectionResult: (r) => set({ detectionResult: r }),
  reset: () => set({ uploadResult: null, detectionResult: null }),
}));
