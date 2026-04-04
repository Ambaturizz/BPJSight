# BPJSight

BPJSight adalah platform inovatif yang dirancang untuk menjembatani transparansi dan efisiensi dalam pengelolaan klaim BPJS Kesehatan. Sistem ini memfasilitasi dua sisi pengguna utama: **Pasien** dan **Rumah Sakit (Fasilitas Kesehatan)**, dengan memanfaatkan teknologi prediksi AI untuk meminimalkan risiko penolakan klaim.

---

## 🌟 Fitur Utama

### 🧑‍⚕️ Alur dari Sisi Pasien
BPJSight memberikan transparansi penuh kepada pasien mengenai status klaim dan hak kesehatan mereka.

1. **Registrasi & Verifikasi Identitas** Pasien dapat mendaftar dengan mudah menggunakan Nomor Induk Kependudukan (NIK) pada KTP dan nomor kartu BPJS Kesehatan. Sistem terintegrasi dengan API resmi BPJS Kesehatan untuk menarik data kepesertaan secara otomatis dan melakukan verifikasi secara instan.

2. **Dashboard Pribadi Pasien** Setelah masuk, pasien akan melihat *Health Risk Card*—sebuah kartu ringkas yang menampilkan status klaim aktif dan satu rekomendasi tindakan kesehatan paling mendesak. Dashboard ini memiliki tab utama yang interaktif:
   - Klaim Saya
   - Risiko Kesehatan
   - Riwayat

3. **Pemantauan Klaim Real-Time** Melalui tab **Klaim Saya**, pasien dapat melacak seluruh proses pengajuan klaim dalam bentuk *timeline* yang jelas:  
   `Diajukan` → `Diverifikasi` → `Diproses` → `Selesai`  
   Setiap perubahan status akan memberikan *push notification* ke perangkat pasien.  
   **Fitur Unggulan:** Jika ada indikasi klaim berpotensi ditolak, sistem akan memperingatkan pasien jauh sebelum keputusan resmi beserta prediksinya (misal: "Diagnosis belum terdokumentasi lengkap"). Sistem juga memberikan panduan langkah konkret untuk memperbaikinya bersama dokter atau pihak rumah sakit.

4. **Transparansi Hak & Manfaat** Pasien dapat mengeksplorasi layanan apa saja yang ditanggung berdasarkan kelas kepesertaan, daftar faskes yang dapat dikunjungi, serta estimasi biaya yang ditanggung oleh BPJS untuk berbagai tindakan medis.

---

### 🏥 Alur dari Sisi Rumah Sakit
BPJSight membantu staf rumah sakit mengelola klaim dengan lebih proaktif dan mengurangi rasio penolakan dokumen.

1. **Registrasi Institusi & Onboarding** Rumah sakit dapat mendaftar melalui portal web BPJSight menggunakan kode faskes resmi dari BPJS Kesehatan dan NPWP institusi.

2. **Command Center Klaim** Saat *login*, pengguna dari pihak rumah sakit disambut oleh sebuah *dashboard* terpusat yang menampilkan ringkasan performa klaim dalam beberapa hari terakhir:
   - Total klaim aktif
   - Tingkat persetujuan
   - Nilai klaim yang sedang diproses
   - Jumlah klaim yang diprediksi berisiko ditolak

3. **Manajemen Klaim Per Pasien** Staf rumah sakit dapat membuka profil pengajuan klaim setiap pasien dan melihat konteks lengkap dalam satu layar, meliputi:
   - Diagnosis dan tindakan medis
   - Kelengkapan dokumen rekam medis
   - Riwayat klaim pasien
   - **Skor Risiko Penolakan (didukung AI)**: Jika skor risiko penolakan tinggi, sistem secara otomatis menampilkan *checklist* dokumen yang harus segera dilengkapi sebelum pengajuan dilanjutkan. Hal ini memungkinkan perbaikan dilakukan secara proaktif.