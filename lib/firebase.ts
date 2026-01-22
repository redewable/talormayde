// ============================================================================
// FIREBASE CONFIGURATION
// lib/firebase.ts
// ============================================================================

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  isSupported,
  Messaging,
  MessagePayload
} from "firebase/messaging";

// ============================================================================
// CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ============================================================================
// APP INITIALIZATION
// ============================================================================

let app: FirebaseApp;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// ============================================================================
// CORE SERVICES
// ============================================================================

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// ============================================================================
// MESSAGING (PUSH NOTIFICATIONS)
// ============================================================================

let messagingInstance: Messaging | null = null;

/**
 * Get Firebase Cloud Messaging instance
 * Returns null if running on server or if messaging is not supported
 */
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  // Only run on client side
  if (typeof window === "undefined") {
    return null;
  }

  // Check if messaging is supported in this browser
  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Messaging is not supported in this browser");
    return null;
  }

  // Return cached instance if available
  if (messagingInstance) {
    return messagingInstance;
  }

  try {
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
    return null;
  }
};

/**
 * Request notification permission and get FCM token
 * @param vapidKey - Your VAPID key from Firebase Console
 * @param serviceWorkerRegistration - Optional service worker registration
 * @returns FCM token or null if failed
 */
export const requestNotificationToken = async (
  vapidKey: string,
  serviceWorkerRegistration?: ServiceWorkerRegistration
): Promise<string | null> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    return token;
  } catch (error) {
    console.error("Error getting notification token:", error);
    return null;
  }
};

/**
 * Subscribe to foreground messages
 * @param callback - Function to call when a message is received
 * @returns Unsubscribe function or null if messaging not available
 */
export const onForegroundMessage = async (
  callback: (payload: MessagePayload) => void
): Promise<(() => void) | null> => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  return onMessage(messaging, callback);
};

/**
 * Check if push notifications are supported in this browser
 */
export const isPushNotificationSupported = async (): Promise<boolean> => {
  if (typeof window === "undefined") {
    return false;
  }

  // Check for Notification API
  if (!("Notification" in window)) {
    return false;
  }

  // Check for Service Worker
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  // Check Firebase Messaging support
  return await isSupported();
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | "unsupported" => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
};

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export messaging functions for convenience
export { getToken, onMessage, isSupported };

// Export app instance if needed
export { app };

// Export types for use in components
export type { MessagePayload, Messaging };