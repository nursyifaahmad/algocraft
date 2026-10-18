/**
 * AlgoCraft Storage Utility
 * Menangani pembersihan penyimpanan lokal persisten (localStorage & sessionStorage)
 * saat sesi di-reset oleh guru atau siswa memilih keluar/mulai baru.
 */

export function clearAllStudentStorage(studentId?: string) {
  if (typeof window === "undefined") return;

  try {
    // 1. Kunci eksplisit sesi siswa
    localStorage.removeItem("algocraft_student_session");
    localStorage.removeItem("algocraft_student_id");

    if (studentId) {
      localStorage.removeItem(`algocraft_student_cache_${studentId}`);
      localStorage.removeItem(`algocraft_active_tab_${studentId}`);
      localStorage.removeItem(`algocraft_draft_m1_${studentId}`);
      localStorage.removeItem(`algocraft_draft_m2_${studentId}`);
      localStorage.removeItem(`algocraft_draft_m3_${studentId}`);
      localStorage.removeItem(`algocraft_draft_m4_${studentId}`);
      localStorage.removeItem(`algocraft_draft_m5_${studentId}`);
      localStorage.removeItem(`algocraft_draft_m6_${studentId}`);
    }

    // 2. Scan komprehensif seluruh kunci algocraft murid
    // Kecuali algocraft_teacher_* agar sesi login guru di browser yang sama tidak terpengaruh
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("algocraft_") && !key.startsWith("algocraft_teacher_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 3. Bersihkan sessionStorage
    sessionStorage.clear();
  } catch (err) {
    console.error("Gagal membersihkan persistent storage:", err);
  }
}
