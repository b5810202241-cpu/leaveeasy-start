// ─────────────────────────────────────────────────────────────
// js/signup.js — สมัครสมาชิกด้วยอีเมล/รหัสผ่าน (Firebase Authentication)
// สมัครสำเร็จ → สร้างไฟล์ใน users/{uid} ด้วย role เริ่มต้น employee → เข้าหน้ารายการ
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มสมัคร");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();

    var ชื่อ = document.getElementById("name").value.trim();
    var อีเมล = document.getElementById("email").value.trim();
    var รหัสผ่าน = document.getElementById("password").value;

    if (!ชื่อ || !อีเมล || !รหัสผ่าน) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดสมัคร");
      return;
    }
    กล่องเตือน.classList.add("hidden");

    var ปุ่มสมัคร = document.getElementById("ปุ่มสมัคร");
    ปุ่มสมัคร.disabled = true;

    firebase.auth().createUserWithEmailAndPassword(อีเมล, รหัสผ่าน).then(function (ผลลัพธ์) {
      return ผลลัพธ์.user.updateProfile({ displayName: ชื่อ }).then(function () {
        return db.collection("users").doc(ผลลัพธ์.user.uid).set({
          name: ชื่อ,
          email: อีเมล,
          role: "employee"
        });
      });
    }).then(function () {
      location.href = "leave-requests.html";
    }).catch(function (error) {
      เตือน("สมัครไม่สำเร็จ: " + error.message);
      ปุ่มสมัคร.disabled = false;
    });
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
