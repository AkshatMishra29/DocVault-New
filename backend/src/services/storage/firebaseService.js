import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import { config } from '../../config/index.js';

let bucket = null;

try {
  let serviceAccount = null;

  if (config.firebase.serviceAccountJson) {
    serviceAccount = JSON.parse(config.firebase.serviceAccountJson);
  } else if (fs.existsSync(config.firebase.serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(config.firebase.serviceAccountPath, 'utf8'));
  }

  if (serviceAccount && !getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: config.firebase.storageBucket,
    });
    bucket = getStorage().bucket();
    console.log(`[Firebase] Initialized with bucket: ${config.firebase.storageBucket}`);
  } else if (!serviceAccount) {
    console.warn('[Firebase] Warning: No service account credentials found. Set FIREBASE_SERVICE_ACCOUNT_JSON in cloud environments.');
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error.message);
}

/**
 * Upload a file buffer to Firebase Storage
 */
export async function uploadToFirebase(fileBuffer, destinationPath, mimetype) {
  if (!bucket) {
    throw new Error('Firebase Storage bucket is not initialized.');
  }

  const file = bucket.file(destinationPath);

  await file.save(fileBuffer, {
    metadata: {
      contentType: mimetype,
    },
    resumable: false,
  });

  // Generate a signed download URL valid for 30 days
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  return {
    storagePath: destinationPath,
    downloadUrl: signedUrl,
  };
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFromFirebase(destinationPath) {
  if (!bucket) return;
  try {
    const file = bucket.file(destinationPath);
    await file.delete();
  } catch (err) {
    console.warn(`[Firebase] Could not delete ${destinationPath}:`, err.message);
  }
}

export { bucket };
