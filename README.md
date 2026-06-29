<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=appveyor" />
  <img src="https://img.shields.io/badge/Made_with-Love-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" />
  
  <h1>🌌 Dashboard Kurva Parametrik<br><sub>(Dot Rendering Engine)</sub></h1>
  
  <p><strong>Diciptakan secara khusus dan eksklusif oleh Lanciuy (dibantu oleh tim).</strong></p>
</div>

<hr>

## 🚀 Apa Itu Project Ini?

**Dashboard Kurva Parametrik** adalah sebuah *engine visualisasi interaktif* berbasis web yang bertugas untuk merender dan membedah bentuk geometri klasik (Lingkaran, Elips, Parabola, Hiperbola). 

Berbeda dengan sistem *rendering* biasa yang menggambar garis menggunakan fungsi kanvas bawaan, **sistem ini membedah bentuk ke tingkat molekuler (titik / dot)**. Sistem menghitung setiap koordinat murni menggunakan persamaan parametrik matematika, menaruh titik piksel demi piksel, lalu menganalisis pergerakannya secara dinamis (*real-time*).

> *"Kami tidak menggambar garis. Kami menghitung takdir setiap titik di alam semesta (kanvas) ini."* — **Lanciuy**

---

## 💎 Fitur Unggulan

| Fitur | Deskripsi Singkat |
| :--- | :--- |
| 🧮 **Math Engine Asli** | Menghitung sin, cos, sec, tan, dan derivasi turunan tanpa *library* luar (Vanilla Math). |
| 🎯 **Dot-by-Dot Rendering** | Render kurva menggunakan jutaan titik akurat, bukan manipulasi vektor grafis biasa. |
| 🔎 **Live Analysis Panel** | Membedah *step-by-step* bagaimana sebuah titik ditemukan beserta angka aslinya (Bukan *dummy text*!). |
| 📱 **Bento Grid UI** | Tampilan *dashboard* super modern terinspirasi gaya Apple / Bento Grid dengan *Glassmorphism*. |
| 🚀 **Micro-Animations** | Animasi super mulus dari interaksi tombol hingga *signature logo premium* kreasi **Lanciuy**. |

---

## 📐 Penjelasan Konsep Mendetail (Teori Matematika)

Sistem ini didasarkan pada **Persamaan Parametrik**. Alih-alih menggunakan bentuk eksplisit seperti $y = f(x)$, sistem ini mendefinisikan posisi koordinat bergantung pada sebuah parameter independen, biasanya waktu atau sudut (yang kita sebut **$t$**).

### 1. Lingkaran & Elips (Fungsi Tertutup)
Sistem menggunakan sudut (0 hingga 360 derajat) sebagai parameter mutlak.
* **Lingkaran**: Membutuhkan satu *radius* konstan. Kecepatan titik bergerak (*speed*) selalu sama.
* **Elips**: Membutuhkan radius Horizontal ($a$) dan Vertikal ($b$). Karena bentuknya lonjong, **Lanciuy** merancang sistem ini untuk menghitung kecepatan yang *bervariasi* (titik melambat saat di tikungan tajam, dan melesat saat jalurnya landai).

### 2. Parabola & Hiperbola (Fungsi Terbuka)
Sistem menggunakan parameter waktu / rentang lurus ($t = -10$ hingga $10$).
* **Parabola**: Terbuka ke satu arah tak terhingga tanpa pernah menyentuh atau menutup.
* **Hiperbola**: Dua cabang asimtotik yang saling membelakangi. Sistem ini dibekali *handler khusus* untuk **menghindari Error Tak Terhingga (Infinity)** saat $t = 90^\circ$ atau $270^\circ$, yang merupakan tantangan besar dalam grafika komputer standar.

---

## ⚙️ Bagaimana Cara Kerja Sistem Ini? (Arsitektur)

Sistem ini dirancang oleh **Lanciuy** dan tim dengan prinsip *Separation of Concerns* (Pemisahan Tanggung Jawab) yang sangat ketat:

### 1. 🧮 Bagian Otak (Geometry Engine / `geometryCalc.js`)
Ini adalah *core* matematika. Ia hanya menerima angka (jari-jari, interval, sudut), lalu memuntahkan "Data Mentah" (Array berisi kordinat $x$, $y$, sudut radian, hasil $cos/sin$, nilai turunan $dx/dt$, dan *speed*). Engine ini murni "otak" dan tidak tahu menahu soal layar.

### 2. 🎨 Bagian Tangan (Canvas Animator / `canvasAnimator.js`)
Ini adalah sang Pelukis. Ia menerima "Data Mentah", menerjemahkan koordinat pusat Matematika (Tengah Layar) menjadi sistem kordinat piksel HTML (Kiri Atas Layar) menggunakan *Coordinate Controller*. Lalu ia melukis titik-titik tersebut *frame-by-frame* menggunakan fungsi `requestAnimationFrame` untuk menciptakan visual yang sinematik.

### 3. 🧠 Bagian Mulut (UI & Analysis Hub / `ui.js`)
Ini adalah sang Juru Bicara. Ia menangkap klik dari *user*, memerintahkan Otak (Nomor 1) untuk menghitung, memberikan datanya ke Pelukis (Nomor 2) untuk digambar, sekaligus membongkar angka asli hasil hitungan tersebut ke layar (Panel Edukasi) agar dapat dipelajari manusia.

### 4. 🗄️ Backend (Flask Python Server)
Menerima lalu lintas jaringan dan menyimpan *history* titik terakhir yang berhasil dirender melalui protokol JSON/API, untuk berjaga-jaga jika aplikasi di- *refresh*.

---

## 💻 Panduan Instalasi (Cara Menjalankan)

Siap menjalankan mahakarya ini di mesin lokal Anda? Ikuti langkah mudah berikut:

1. **Pastikan Python terinstal** (Minimal versi 3.8+).
2. **Kloning Repositori ini** ke komputer Anda.
   ```bash
   git clone https://github.com/Lanciuy/dashboard-kurva-parametrik.git
   cd dashboard-kurva-parametrik
   ```
3. **Instal Dependensi (Flask)**:
   ```bash
   pip install flask
   ```
4. **Jalankan Server**:
   ```bash
   python app.py
   ```
5. Buka Browser Anda yang paling *modern* dan akses URL sakti berikut:
   👉 **`http://localhost:5000`**

---

<br>

<div align="center">
  <h3>✨ Closing Words ✨</h3>
  
  <p><i>"Setiap titik yang Anda lihat di layar bukanlah sekadar piksel mati, melainkan sebuah identitas matematis yang memiliki posisi, kecepatan, dan takdirnya sendiri. Proyek ini dibangun bukan hanya untuk menggambar grafik, tapi untuk memanifestasikan keindahan kalkulus ke dalam visual interaktif yang bisa disentuh dan dipelajari semua orang."</i></p>
  
  <p><strong>Terus Berkarya. Terus Menginspirasi.</strong></p>
  
  <h4>— Lanciuy & Team —</h4>
</div>
