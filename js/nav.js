// ─────────────────────────────────────────────────────────────
// js/nav.js — แถบเมนูด้านบนที่ใช้ร่วมกันทุกหน้า
// แก้เมนูที่ไฟล์นี้ที่เดียว ทุกหน้าเปลี่ยนตามพร้อมกัน
//
// วิธีใช้: ทุกหน้ามี <div id="nav"></div> ไว้บนสุดของ body
// ─────────────────────────────────────────────────────────────

(function () {
  var เมนู = [
    { href: "index.html",             ชื่อ: "หน้าแรก" },
    { href: "leave-requests.html",    ชื่อ: "รายการใบลา" },
    { href: "new-leave-request.html", ชื่อ: "ยื่นใบลาใหม่" },
    { href: "leave-types.html",       ชื่อ: "ประเภทการลา" }
  ];

  // ชื่อไฟล์ของหน้าที่กำลังเปิดอยู่ เอาไว้ขีดเส้นใต้เมนูที่ตรงกัน
  var หน้าปัจจุบัน = location.pathname.split("/").pop() || "index.html";

  var html = '<div class="navbar"><span class="brand">🔧 LeaveEasy</span>';
  เมนู.forEach(function (m) {
    var active = m.href === หน้าปัจจุบัน ? ' class="active"' : "";
    html += '<a href="' + m.href + '"' + active + ">" + m.ชื่อ + "</a>";
  });
  html += '<span class="nav-user" id="navUser"></span></div>';

  var ที่วาง = document.getElementById("nav");
  if (ที่วาง) ที่วาง.innerHTML = html;

  // ── หน้าที่ต้องล็อกอินก่อนถึงจะเปิดได้ (เทียบแบบไม่สนนามสกุล กันกรณี server/บราวเซอร์ตัด .html ออก) ──
  var หน้าปัจจุบันไม่มีนามสกุล = หน้าปัจจุบัน.replace(/\.html$/, "");
  var หน้าที่ต้องล็อกอิน = ["leave-requests", "new-leave-request", "leave-request-detail", "leave-types"];

  firebase.auth().onAuthStateChanged(function (ผู้ใช้) {
    var ที่วางUser = document.getElementById("navUser");
    if (!ที่วางUser) return;

    if (ผู้ใช้) {
      ที่วางUser.innerHTML =
        esc(ผู้ใช้.displayName || ผู้ใช้.email) +
        ' <button type="button" class="btn-ghost" id="ปุ่มออกจากระบบ">ออกจากระบบ</button>';
      document.getElementById("ปุ่มออกจากระบบ").addEventListener("click", function () {
        firebase.auth().signOut().then(function () { location.href = "login.html"; });
      });

      // "ประเภทการลา" เป็นเมนูของฝ่ายบุคคล (hr) เท่านั้น
      รับบทบาทผู้ใช้().then(function (บทบาท) {
        if (บทบาท === "hr") return;

        var ลิงก์ประเภทการลา = document.querySelector('a[href="leave-types.html"]');
        if (ลิงก์ประเภทการลา) ลิงก์ประเภทการลา.remove();

        if (หน้าปัจจุบันไม่มีนามสกุล === "leave-types") {
          location.href = "leave-requests.html";
        }
      });
    } else {
      ที่วางUser.innerHTML = '<a href="login.html">เข้าสู่ระบบ</a>';
      if (หน้าที่ต้องล็อกอิน.indexOf(หน้าปัจจุบันไม่มีนามสกุล) !== -1) {
        location.href = "login.html";
      }
    }
  });
})();

// แถบเตือนสีเหลือง ใช้ตอนที่ยังไม่ได้ตั้งค่า Firebase
function showConfigWarning(ข้อความ) {
  var กล่อง = document.createElement("div");
  กล่อง.className = "alert alert-warn";
  กล่อง.innerHTML =
    "⚠️ <strong>ยังไม่ได้ตั้งค่า Firebase</strong> — " +
    (ข้อความ || "หน้านี้จึงยังไม่ได้อ่านข้อมูลจากฐานข้อมูลจริง") +
    "<br>วิธีตั้งค่าอยู่ในไฟล์ SETUP.md ขั้นที่ 4";
  var ที่วาง = document.querySelector(".container") || document.body;
  ที่วาง.insertBefore(กล่อง, ที่วาง.firstChild);
}
