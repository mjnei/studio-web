/**
 * Push Notification Setup Utility
 * 
 * This module handles registering the service worker and setting up
 * Web Push API notifications for the Studio application.
 * 
 * Usage:
 * - Call setupPushNotifications() to initialize push notifications
 * - Call subscribeToPush() to subscribe a user to push notifications
 * - Call unsubscribeFromPush() to unsubscribe a user
 */

import { request } from '@/lib/api-client';

// Configuration
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const SERVICE_WORKER_PATH = '/sw.js';

/**
 * Check if the browser supports Service Workers and Push API
 */
export function isPushNotificationsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Register the service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationsSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      scope: '/',
    });
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Failed to register service worker:', error);
    return null;
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationsSupported()) {
    return 'denied';
  }

  const permission = Notification.permission;

  if (permission !== 'granted' && permission !== 'denied') {
    return Notification.requestPermission();
  }

  return permission;
}

/**
 * Subscribe to push notifications and register with backend
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushNotificationsSupported() || !VAPID_PUBLIC_KEY) {
    console.warn('Push notifications not supported or VAPID_PUBLIC_KEY not configured');
    return false;
  }

  try {
    // Step 1: Register service worker if not already registered
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('Failed to register service worker');
      return false;
    }

    // Step 2: Request notification permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('User denied notification permission');
      return false;
    }

    // Step 3: Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    // Step 4: Subscribe if not already subscribed
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      console.log('Push subscription created:', subscription);
    } else {
      console.log('Already subscribed to push notifications');
    }

    // Step 5: Send subscription to backend
    if (subscription) {
      const subscriptionJson = subscription.toJSON();
      await request('/notifications/subscribe-push', {
        method: 'POST',
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscriptionJson.keys?.p256dh,
              auth: subscriptionJson.keys?.auth,
            },
          },
          user_agent: navigator.userAgent,
        }),
      });
      console.log('Push subscription registered with backend');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(endpoint?: string): Promise<boolean> {
  if (!isPushNotificationsSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Get the current subscription
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from push manager
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');

      // Notify backend
      await request('/notifications/unsubscribe-push', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: endpoint || subscription.endpoint,
        }),
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Initialize push notifications (register SW + request permission + subscribe)
 */
export async function setupPushNotifications(): Promise<boolean> {
  if (!isPushNotificationsSupported()) {
    console.warn('Push notifications not supported in this browser');
    return false;
  }

  try {
    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      return false;
    }

    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.info('User has not granted notification permission');
      return false;
    }

    // Subscribe to push
    return await subscribeToPush();
  } catch (error) {
    console.error('Failed to setup push notifications:', error);
    return false;
  }
}

/**
 * Convert VAPID public key from base64url to Uint8Array
 * Required for the Web Push API subscription
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // The key should already be clean (no PEM headers), but handle whitespace
  const cleanKey = base64String.replace(/\s/g, '');
  
  // Add padding if needed
  const padding = '='.repeat((4 - (cleanKey.length % 4)) % 4);
  const base64 = (cleanKey + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array;
}

/**
 * Get current push subscription status
 */
export async function getPushSubscriptionStatus(): Promise<boolean> {
  if (!isPushNotificationsSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Failed to get push subscription status:', error);
    return false;
  }
}

/**
 * Check notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationsSupported()) {
    return 'denied';
  }
  return Notification.permission;
}
