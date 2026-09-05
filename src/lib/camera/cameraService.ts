// ============================================================
// NERIXA — CCTV & Camera Feed Integration Service
// Camera administration, stream lifecycle & Demo Camera Mode
// ============================================================

import type { CCTVCamera } from '@/lib/types/imageIntelligence';
import { SEED_CCTV_CAMERAS } from '@/data/seedImageIntelligence';

export class CameraService {
  private cameras: CCTVCamera[] = [...SEED_CCTV_CAMERAS];

  /**
   * Get all registered CCTV cameras
   */
  public getAllCameras(): CCTVCamera[] {
    return [...this.cameras];
  }

  /**
   * Add a new CCTV camera
   */
  public addCamera(camera: Omit<CCTVCamera, 'id' | 'lastImageReceived' | 'lastUpdateTime'>): CCTVCamera {
    const newCamera: CCTVCamera = {
      ...camera,
      id: `cctv-${Date.now()}`,
      lastImageReceived: 'Just registered',
      lastUpdateTime: new Date().toISOString(),
    };
    this.cameras.unshift(newCamera);
    return newCamera;
  }

  /**
   * Update an existing CCTV camera configuration
   */
  public updateCamera(id: string, updates: Partial<CCTVCamera>): CCTVCamera | null {
    const idx = this.cameras.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.cameras[idx] = {
      ...this.cameras[idx],
      ...updates,
      lastUpdateTime: new Date().toISOString(),
    };
    return this.cameras[idx];
  }

  /**
   * Toggle camera operational status (Online / Offline)
   */
  public toggleCameraStatus(id: string): CCTVCamera | null {
    const camera = this.cameras.find(c => c.id === id);
    if (!camera) return null;
    return this.updateCamera(id, {
      status: camera.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE',
      lastImageReceived: camera.status === 'ONLINE' ? 'Disconnected (Offline)' : 'Live stream reconnected',
    });
  }

  /**
   * Delete a camera
   */
  public deleteCamera(id: string): boolean {
    const initialLen = this.cameras.length;
    this.cameras = this.cameras.filter(c => c.id !== id);
    return this.cameras.length < initialLen;
  }

  /**
   * Filter cameras by status, district, or road
   */
  public filterCameras(filters: { status?: 'ONLINE' | 'OFFLINE'; districtId?: string; roadId?: string }): CCTVCamera[] {
    return this.cameras.filter(cam => {
      if (filters.status && cam.status !== filters.status) return false;
      if (filters.districtId && cam.districtId !== filters.districtId) return false;
      if (filters.roadId && cam.roadId !== filters.roadId) return false;
      return true;
    });
  }
}

export const cameraService = new CameraService();
