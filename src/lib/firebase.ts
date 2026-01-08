import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVMbZZ6yk2v4_GWRcY5hJ3cUo-gsKytkM",
  authDomain: "test-844af.firebaseapp.com",
  projectId: "test-844af",
  storageBucket: "test-844af.firebasestorage.app",
  messagingSenderId: "1072756775732",
  appId: "1:1072756775732:web:9867da0742be23098ee361",
  measurementId: "G-27ECJPSC15",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
