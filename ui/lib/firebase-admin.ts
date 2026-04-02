import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Firebase Admin SDK for server-side API routes
// Uses either FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (file path)
function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // Option 1: Service account key as JSON string (for Vercel)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount
    return initializeApp({
      credential: cert(serviceAccount),
    })
  }

  // Option 2: Auto-detect (GOOGLE_APPLICATION_CREDENTIALS env var or GCE metadata)
  return initializeApp()
}

const app = initAdmin()
export const adminDb = getFirestore(app)
