// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAW1JjbFuhuyVCoFQ1ZHPFyuv8xGQ08XQ0',
  authDomain: 'inventory-management-app-f0374.firebaseapp.com',
  projectId: 'inventory-management-app-f0374',
  storageBucket: 'inventory-management-app-f0374.appspot.com',
  messagingSenderId: '418215402860',
  appId: '1:418215402860:web:1bbd969efbf38225516749',
  measurementId: 'G-4L4SSSW6DP',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth };
