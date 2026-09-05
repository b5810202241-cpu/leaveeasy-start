// ─────────────────────────────────────────────────────────────
// js/login.js — เข้าสู่ระบบด้วยอีเมล/รหัสผ่าน (Firebase Authentication)
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มล็อกอิน");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();

    var อีเมล = document.getElementById("email").value.trim();
    var รหัสผ่าน = document.getElementById("password").value;

    if (!อีเมล || !รหัสผ่าน) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทั้งอีเมลและรหัสผ่าน");
      return;
    }
    กล่องเตือน.classList.add("hidden");

    var ปุ่มล็อกอิน = document.getElementById("ปุ่มล็อกอิน");
    ปุ่มล็อกอิน.disabled = true;

    firebase.auth().signInWithEmailAndPassword(อีเมล, รหัสผ่าน).then(function () {
      location.href = "leave-requests.html";
    }).catch(function (error) {
      เตือน("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
      ปุ่มล็อกอิน.disabled = false;
    });
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
