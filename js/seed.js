// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างจาก js/data.js ลง Firestore ครั้งเดียว
// ใช้ .set() (ไม่ใช่ .add()) เพื่อให้กดซ้ำได้โดยไม่เกิด doc ซ้ำ
// ─────────────────────────────────────────────────────────────

(function () {
  var ปุ่ม = document.getElementById("ปุ่มSeed");
  var สถานะ = document.getElementById("สถานะSeed");

  ปุ่ม.addEventListener("click", function () {
    ปุ่ม.disabled = true;
    สถานะ.textContent = "กำลัง seed ข้อมูล…";

    var batch = db.batch();

    window.LEAVE_DATA.users.forEach(function (u) {
      batch.set(db.collection("users").doc(u.id), u);
    });

    window.LEAVE_DATA.leaveTypes.forEach(function (t) {
      batch.set(db.collection("leaveTypes").doc(t.id), t);
    });

    window.LEAVE_DATA.leaveRequests.forEach(function (r) {
      batch.set(db.collection("leaveRequests").doc(r.id), r);
    });

    window.LEAVE_DATA.approvals.forEach(function (a) {
      var ref = db
        .collection("leaveRequests").doc(a.requestId)
        .collection("approvals").doc(a.id);
      batch.set(ref, {
        authorId: a.authorId,
        authorName: a.authorName,
        message: a.message,
        createdAt: a.createdAt
      });
    });

    batch.commit().then(function () {
      สถานะ.textContent = "✅ Seed สำเร็จ — users 3, leaveTypes 3, leaveRequests 5, approvals 4";
      ปุ่ม.disabled = false;
    }).catch(function (error) {
      สถานะ.textContent = "❌ Seed ไม่สำเร็จ: " + error.message;
      ปุ่ม.disabled = false;
    });
  });
})();
