// ============================================================
// NER-SHIELD AI — Resilient Google Maps Script Loader
// Dynamically loads Google Maps JavaScript API without external heavy npm packages
// ============================================================

let googleMapsPromise: Promise<boolean> | null = null;

declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
  }
}

export function loadGoogleMapsScript(apiKey?: string): Promise<boolean> {
  // If already available on window
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(true);
  }

  // If no key provided, check localStorage or process.env
  const resolvedKey =
    apiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('nerixa_gmaps_api_key') : null) ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    '';

  if (!resolvedKey || resolvedKey.trim().length < 8) {
    return Promise.resolve(false);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    if (document.getElementById(scriptId)) {
      if (window.google && window.google.maps) {
        resolve(true);
      } else {
        const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(resolvedKey.trim())}&libraries=places,geometry,visualization&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = (e) => {
      console.warn('Google Maps API failed to load (check API key or authorized domains):', e);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!(window.google && window.google.maps);
}
