// ⚙️ REPLACE THESE WITH YOUR FIREBASE PROJECT CONFIG
// Firebase Console → Project Settings → Your apps → SDK setup

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const messaging = getMessaging(app)

// VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
export const VAPID_KEY = 'YOUR_VAPID_KEY'

export { getToken, onMessage }
