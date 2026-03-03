/**
 * Fingerprint.com Integration
 * 
 * Provides device fingerprinting for user tracking and analytics
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

let fpPromise: Promise<any> | null = null;
let visitorId: string | null = null;

/**
 * Initialize Fingerprint.com
 */
export async function initializeFingerprint(): Promise<void> {
  try {
    const apiKey = import.meta.env.PUBLIC_FINGERPRINT_API_KEY;

    if (!apiKey) {
      console.warn('[Fingerprint] API key not configured');
      return;
    }

    // Initialize the agent
    fpPromise = FingerprintJS.load({
      apiKey,
      endpoint: [
        // Use custom subdomain for better accuracy
        FingerprintJS.defaultEndpoint,
        FingerprintJS.defaultScriptUrlPattern,
      ],
    });

    const fp = await fpPromise;
    const result = await fp.get();

    visitorId = result.visitorId;

    console.log('[Fingerprint] Initialized with visitor ID:', visitorId);

    // Store visitor ID in localStorage for quick access
    localStorage.setItem('fpVisitorId', visitorId);

    // Send visitor data to backend for analytics
    await sendVisitorData(result);
  } catch (error) {
    console.error('[Fingerprint] Initialization failed:', error);
  }
}

/**
 * Get the current visitor ID
 */
export function getVisitorId(): string | null {
  // Try to get from memory first
  if (visitorId) {
    return visitorId;
  }

  // Fallback to localStorage
  const storedId = localStorage.getItem('fpVisitorId');
  if (storedId) {
    visitorId = storedId;
    return storedId;
  }

  return null;
}

/**
 * Get fresh visitor data
 */
export async function getVisitorData(): Promise<any> {
  try {
    if (!fpPromise) {
      await initializeFingerprint();
    }

    if (!fpPromise) {
      return null;
    }

    const fp = await fpPromise;
    const result = await fp.get();

    return result;
  } catch (error) {
    console.error('[Fingerprint] Failed to get visitor data:', error);
    return null;
  }
}

/**
 * Send visitor data to backend for analytics
 */
async function sendVisitorData(data: any): Promise<void> {
  try {
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

    await fetch(`${apiUrl}/api/analytics/visitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId: data.visitorId,
        requestId: data.requestId,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
        // Include relevant browser/device info
        browserName: data.browserName,
        browserVersion: data.browserVersion,
        os: data.os,
        osVersion: data.osVersion,
        device: data.device,
        ip: data.ip,
        ipLocation: data.ipLocation,
      }),
    });

    console.log('[Fingerprint] Visitor data sent to backend');
  } catch (error) {
    console.error('[Fingerprint] Failed to send visitor data:', error);
  }
}

/**
 * Track a custom event with visitor ID
 */
export async function trackEvent(eventName: string, eventData?: any): Promise<void> {
  try {
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';
    const currentVisitorId = getVisitorId();

    if (!currentVisitorId) {
      console.warn('[Fingerprint] Cannot track event: visitor ID not available');
      return;
    }

    await fetch(`${apiUrl}/api/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId: currentVisitorId,
        eventName,
        eventData,
        timestamp: new Date().toISOString(),
      }),
    });

    console.log('[Fingerprint] Event tracked:', eventName);
  } catch (error) {
    console.error('[Fingerprint] Failed to track event:', error);
  }
}
