import { v4 as uuidv4 } from 'uuid';
import { getOrCreateUser } from './db';
import { initializeFingerprint, getVisitorId } from './fingerprint';

const USER_ID_KEY = 'vlowgen_user_id';

export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'server-user';
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

export async function initializeUser(): Promise<string> {
  const userId = getUserId();
  
  // Initialize Fingerprint.com for device tracking
  await initializeFingerprint();
  
  const visitorId = getVisitorId();
  console.log('[User] Initialized with user ID:', userId, 'visitor ID:', visitorId);
  
  await getOrCreateUser(userId);
  return userId;
}

export async function updateUserActivity(): Promise<void> {
  const userId = getUserId();
  await getOrCreateUser(userId); // This updates lastActive
}
