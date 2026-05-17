import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_Gy9ArgMva2Uk0CRTIQ9XC3Ggbz0LJtU",
  authDomain: "joife-9007e.firebaseapp.com",
  projectId: "joife-9007e",
  storageBucket: "joife-9007e.firebasestorage.app",
  messagingSenderId: "670097166482",
  appId: "1:670097166482:web:f2b82613d1c0546e90164b",
  measurementId: "G-3RLHWFSZ0T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Esto mantiene la sesión iniciada aunque cierres el programa
setPersistence(auth, browserLocalPersistence);

// Esto habilita el MODO OFFLINE en PC
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { app, auth, db };
