import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  async capturePhoto(): Promise<string> {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 70
    });
    return photo.dataUrl!;  // base64 con prefijo data:image/jpeg;base64,...
  }
}
