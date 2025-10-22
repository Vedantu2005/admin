import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => 
  !firebaseConfig[field as keyof typeof firebaseConfig] || 
  firebaseConfig[field as keyof typeof firebaseConfig] === `your-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}-here` ||
  firebaseConfig[field as keyof typeof firebaseConfig] === `your-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`
);

if (missingFields.length > 0) {
  console.error('Firebase configuration incomplete. Missing or placeholder values for:', missingFields);
}


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Test database connection and log any initialization errors
try {
    console.log('🔥 Firebase initialized with project:', firebaseConfig.projectId);
    console.log('🔧 Database instance created:', !!db);
    console.log('🌐 Database app:', db.app.name);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

export default app;