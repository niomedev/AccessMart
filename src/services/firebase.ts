// firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIRE_BASE_APIKEY,
  authDomain: process.env.FIRE_BASE_AUTHDOMAIN,
  projectId: process.env.FIRE_BASE_PROJECTID,
  storageBucket: process.env.FIRE_BASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIRE_BASE_MESSAGINGSENDERID,
  appId: process.env.FIRE_BASE_APPID,
  measurementId: process.env.FIRE_BASE_MEASUREMENTID
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const analytics: Analytics = getAnalytics(app);
const db: Firestore = getFirestore(app);

export { db, analytics };
