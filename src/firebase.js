// ⚙️ REPLACE THESE WITH YOUR FIREBASE PROJECT CONFIG
// Firebase Console → Project Settings → Your apps → SDK setup

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDVpZQf8R14L1o5cL-2HK1rmUM8NlIowyc",
  authDomain: "ev-charger-hub.firebaseapp.com",
  projectId: "ev-charger-hub",
  storageBucket: "ev-charger-hub.firebasestorage.app",
  messagingSenderId: "317325123119",
  appId: "1:317325123119:web:6095f1fc0eb25e1e9a30da"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Messaging initialised lazily when notifications are set up
export { app }
