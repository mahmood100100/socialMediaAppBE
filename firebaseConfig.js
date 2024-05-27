import dotenv from 'dotenv';
import admin from 'firebase-admin';
dotenv.config();
const FIREBASE_CONFIG = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_CONFIG),
  storageBucket: 'social-media-app-a455b.appspot.com'
});

const bucket = admin.storage().bucket();

export { bucket };
