import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDukE4vDsjbRvZPtowKV-gT30Be9VXn1hQ",
  authDomain: "skill-test-samatchaya.firebaseapp.com",
  projectId: "skill-test-samatchaya",
  storageBucket: "skill-test-samatchaya.appspot.com",
  messagingSenderId: "1094024653204",
  appId: "1:1094024653204:web:f44c7158082cd670df0781",
  measurementId: "G-KEHLZFET7E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { db, storage };