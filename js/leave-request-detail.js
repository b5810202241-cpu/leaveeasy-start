// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// สัปดาห์ที่ 7: อ่านใบลาจริงจาก Firestore + ปุ่มลบเขียนลบจริง
// สัปดาห์ที่ 8: จำกัดปุ่ม/การเข้าถึงตามบทบาท (employee เปิดใบคนอื่นไม่ได้,
// อนุมัติ/ไม่อนุมัติเฉพาะ manager/hr, ลบได้เฉพาะ employee เจ้าของใบเอง)
// (ความเห็น ยังแก้แค่ในหน่วยความจำเหมือนเดิม — รอทำเป็นของจริงทีหลัง)
// ─────────────────────────────────────────────────────────────

(function () {
  var รหัสใบลา = ค่าจากURL("id");
  var กล่องใบลา = document.getElementById("กล่องใบลา");
  var กล่องความเห็น = document.getElementById("กล่องความเห็น");

  var ใบ, ความเห็น, บทบาทผู้ใช้;

  Promise.all([
    db.collection("leaveRequests").doc(รหัสใบลา).get(),
    รับบทบาทผู้ใช้()
  ]).then(function (ผลลัพธ์) {
    var เอกสาร = ผลลัพธ์[0];
    บทบาทผู้ใช้ = ผลลัพธ์[1];

    if (!เอกสาร.exists) {
      กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
      return;
    }

    ใบ = เอกสาร.data();
    ใบ.id = เอกสาร.id;

    // employee เปิดใบของคนอื่นไม่ได้ (US-08)
    if (บทบาทผู้ใช้ === "employee" && ใบ.requesterId !== firebase.auth().currentUser.uid) {
      กล่องใบลา.innerHTML = "<p>ไม่มีสิทธิ์เข้าดูใบลานี้</p>";
      return;
    }

    ความเห็น = window.LEAVE_DATA.approvals.filter(function (c) { return c.requestId === ใบ.id; });

    วาดใบลา();
    วาดความเห็น();
    กล่องความเห็น.classList.remove("hidden");

    document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);
  }, function (error) {
    กล่องใบลา.innerHTML = "<p>โหลดข้อมูลจาก Firestore ไม่สำเร็จ: " + esc(error.message) + "</p>";
  });

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    var html = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    // อนุมัติ/ไม่อนุมัติ — เฉพาะ manager/hr · ลบ — เฉพาะ employee เจ้าของใบเอง (ตาม ACL.md)
    var ผู้ใช้ปัจจุบัน = firebase.auth().currentUser;
    var อนุมัติได้ = (บทบาทผู้ใช้ === "manager" || บทบาทผู้ใช้ === "hr") && ใบ.status === "รอพิจารณา";
    var ลบได้ = บทบาทผู้ใช้ === "employee" && ใบ.requesterId === ผู้ใช้ปัจจุบัน.uid && ใบ.status === "รอพิจารณา";

    if (อนุมัติได้ || ลบได้) {
      html += '<div class="btn-row">';
      if (อนุมัติได้) {
        html +=
          '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
          '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>';
      }
      if (ลบได้) {
        html += '<button type="button" class="btn-danger" id="ปุ่มลบ">ลบ</button>';
      }
      html += "</div>";
    } else if (ใบ.status !== "รอพิจารณา") {
      html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
    }

    กล่องใบลา.innerHTML = html;

    if (อนุมัติได้) {
      document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
      document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
    }
    if (ลบได้) {
      document.getElementById("ปุ่มลบ").addEventListener("click", ลบใบลา);
    }
  }

  // ── ลบใบลา (ต้องยืนยันก่อนทุกครั้ง กดยกเลิกแล้วต้องไม่ลบ) ──
  function ลบใบลา() {
    if (!confirm("ยืนยันลบใบลานี้? การลบนี้กู้คืนไม่ได้")) return;

    db.collection("leaveRequests").doc(ใบ.id).delete().then(function () {
      location.href = "leave-requests.html";
    }).catch(function (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
    });
  }

  // ── เปลี่ยนสถานะ (สัปดาห์นี้เปลี่ยนแค่ในหน่วยความจำ) ──
  function เปลี่ยนสถานะ(สถานะใหม่) {
    // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
    if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }
    ใบ.status = สถานะใหม่;   // แก้เฉพาะช่อง status เท่านั้น
    วาดใบลา();
  }

  // ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
  function วาดความเห็น() {
    var ที่วาง = document.getElementById("รายการความเห็น");
    if (ความเห็น.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
      return;
    }
    ที่วาง.innerHTML = ความเห็น
      .slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; })
      .map(function (c) {
        return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
               "</div><div>" + esc(c.message) + "</div></div>";
      }).join("");
  }

  // ── ส่งความเห็นใหม่ ──
  function ส่งความเห็น() {
    var ช่อง = document.getElementById("ข้อความความเห็น");
    var เตือน = document.getElementById("เตือนความเห็น");
    var ข้อความ = ช่อง.value.trim();

    if (!ข้อความ) {
      เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      เตือน.classList.remove("hidden");
      return;
    }
    เตือน.classList.add("hidden");

    // สัปดาห์ที่ 6 ยังไม่มีล็อกอิน จึงสมมติว่าผู้เขียนคือ สมหญิง รักงาน
    ความเห็น.push({
      id: "ap-ใหม่-" + Date.now(),
      requestId: ใบ.id,
      authorId: "u002", authorName: "สมหญิง รักงาน",
      message: ข้อความ,
      createdAt: เวลาตอนนี้()
    });
    ช่อง.value = "";
    วาดความเห็น();
  }
})();
