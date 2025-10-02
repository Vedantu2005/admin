import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA921NRCXj7WihnUbjEExCBBGAlrzbV2xU",
  authDomain: "mittal-intern.firebaseapp.com",
  projectId: "mittal-intern",
  storageBucket: "mittal-intern.firebasestorage.app",
  messagingSenderId: "227193150901",
  appId: "1:227193150901:web:2e6e046ce9e07400064dfc",
  measurementId: "G-3PS7PBNLSL"
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

export default app;