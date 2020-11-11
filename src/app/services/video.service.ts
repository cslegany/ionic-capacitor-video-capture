import { Injectable } from '@angular/core';
import { Plugins, FilesystemDirectory, Filesystem } from '@capacitor/core';
const { FileSystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  public videos: string[] = [];
  private VIDEOS_KEY: string = 'videos';

  constructor() { }

  async loadVideos(): Promise<string[]> {
    const videoList = await Storage.get({ key: this.VIDEOS_KEY });
    this.videos = JSON.parse(videoList.value) || [];
    return this.videos;
  }

  async storeVideo(blob: Blob) {
    const fileName: string = new Date().getTime() + '.mp4';
    const base64Data = await this.convertBlobToBase64(blob) as string;

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    this.videos.unshift(savedFile.uri); //add to the start;
    console.log('my array now: ', this.videos);

    return Storage.set({
      key: this.VIDEOS_KEY,
      value: JSON.stringify(this.videos)
    });
  }

  //Helper function
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async getVideoBase64Data(fullPath: string): Promise<string> {
    const path: string = fullPath.substr(fullPath.lastIndexOf('/') + 1);
    const file = await Filesystem.readFile({
      path: path, //123123.mp4
      directory: FilesystemDirectory.Data // DATA/
    });
    return `data:video/mp4;base64,${file.data}`;
  }
}
