import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "summer-j2oeh",
  "appId": "1:375977592752:web:d47264dc7ec49a49723875",
  "storageBucket": "summer-j2oeh.firebasestorage.app",
  "apiKey": "AIzaSyA7O43K9Es9LDAFaY1y_mMT6O3l0clFXx0",
  "authDomain": "summer-j2oeh.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "375977592752"
};

function getFirebaseApp() {
  if (getApps().length) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
}

export const firebaseApp = getFirebaseApp();
