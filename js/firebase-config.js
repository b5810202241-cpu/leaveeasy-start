// ─────────────────────────────────────────────────────────────
// js/firebase-config.js — ตั้งค่า Firebase ของโปรเจกต์ leaveeasy-nammon
// ใช้ compat SDK เพราะทุกหน้ายังเป็น <script> ธรรมดา ไม่ใช่ ES module
// ─────────────────────────────────────────────────────────────

var firebaseConfig = {
  apiKey: "AIzaSyAjNnrzcXPb4PE9gm2-PgUIkVzU4OLrYL8",
  authDomain: "leaveeasy-nammon.firebaseapp.com",
  projectId: "leaveeasy-nammon",
  storageBucket: "leaveeasy-nammon.firebasestorage.app",
  messagingSenderId: "861872630670",
  appId: "1:861872630670:web:31a0fefeffcbc8f19b12df"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
