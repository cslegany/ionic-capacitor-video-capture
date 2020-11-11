# ionic-capacitor-video-capture: based on https://www.youtube.com/watch?v=cKmCLenu_YI

ionic start capacitor-video-capture blank --type=angular --capacitor
cd capacitor-video-capture
ionic g service services/video

# TS typings
npm i -D @types/dom-mediacapture-record

# Video player plugin
npm install capacitor-video-player

# PWA ready
ng add @angular/pwa

ionic serve --external

# add this to tsconfig.app.json: "types": ["dom-mediacapture-record"]