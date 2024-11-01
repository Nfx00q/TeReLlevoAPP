export {};

declare module 'google.maps' {
    export const maps: any;
}

declare global {
    interface Window {
      googleMapsCallback: () => void;
    }
}

declare global {
  interface Window {
    cordova: any; // Puedes usar 'any' o ser más específico si conoces el tipo
  }
}