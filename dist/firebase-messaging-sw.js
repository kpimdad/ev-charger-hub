importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// REPLACE with your actual Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDVpZQf8R14L1o5cL-2HK1rmUM8NlIowyc",
  authDomain: "ev-charger-hub.firebaseapp.com",
  projectId: "ev-charger-hub",
  storageBucket: "ev-charger-hub.firebasestorage.app",
  messagingSenderId: "317325123119",
  appId: "1:317325123119:web:6095f1fc0eb25e1e9a30da"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/ev-charger-hub/icon-192.png',
    badge: '/ev-charger-hub/icon-192.png',
    tag: 'ev-charger',
    renotify: true,
    data: { url: '/ev-charger-hub/' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/ev-charger-hub/')
  );
});
