import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { VideoService } from '../services/video.service';

import { Capacitor, Plugins } from '@capacitor/core';
import * as WEbVPPlugin from 'capacitor-video-player';
const { CapacitorVideoPlayer } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  mediaRecorder: MediaRecorder;
  videoPlayer: WEbVPPlugin.CapacitorVideoPlayerPlugin;
  isRecording: boolean = false;
  videos: string[] = [];

  @ViewChild('video') captureElement: ElementRef;

  constructor(private videoService: VideoService, private cdr: ChangeDetectorRef) {
  }

  async ngAfterViewInit() {
    this.videos = await this.videoService.loadVideos();

    //Initialise the video player plugin
    if (Capacitor.isNative) {
      this.videoPlayer = CapacitorVideoPlayer;
    }
    else {
      this.videoPlayer = WEbVPPlugin.CapacitorVideoPlayer;
    }
  }

  async recordVideo() {
    //getting the camera stream
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user'
      },
      audio: true
    });
    this.captureHTMLMediaElement.srcObject = stream;
    this.isRecording = true;

    const options: MediaRecorderOptions = { mimeType: 'video/webm' };
    this.mediaRecorder = new MediaRecorder(stream, options);

    let chunks: Blob[] = [];
    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0)
        chunks.push(event.data);
    }

    //triggered by stopRecord() function
    this.mediaRecorder.onstop = async (event) => {
      const videoBuffer: Blob = new Blob(chunks, { type: 'video/webm' });
      //Store the video
      await this.videoService.storeVideo(videoBuffer);

      //reload the list
      this.videos = this.videoService.videos;
      this.cdr.detectChanges();
    }

    this.mediaRecorder.start();
  }

  stopRecord() {
    this.mediaRecorder.stop();
    this.mediaRecorder = null;
    this.captureHTMLMediaElement.srcObject = null;
    this.isRecording = false;
  }

  async play(videoUrl: string) {
    const base64data: string = await this.videoService.getVideoBase64Data(videoUrl);

    //Show the player fullscreen
    await this.videoPlayer.initPlayer({
      mode: 'fullscreen',
      url: base64data,
      playerId: 'fullscreen',
      componentTag: 'app-home' //component Tag, see at top
    });
  }

  private get captureHTMLMediaElement(): HTMLMediaElement {
    return this.captureElement.nativeElement as HTMLMediaElement;
  }
}
