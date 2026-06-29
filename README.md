<div align="center">
  <!-- ANIMASI TYPING (SVG ANIMATED) -->
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=800&size=30&pause=1000&color=D95A43&center=true&vCenter=true&width=800&height=60&lines=Dashboard+Kurva+Parametrik;Created+with+Passion+by+Lanciuy;Dot-by-Dot+Rendering+Engine" alt="Typing SVG" />
  <br>
  
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=appveyor" />
  <img src="https://img.shields.io/badge/Made_with-Love-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" />
  
  <p><strong>Diciptakan secara khusus dan eksklusif oleh Lanciuy (dibantu oleh tim).</strong></p>
</div>

<hr>

## 🚀 Apa Itu Project Ini?

**Dashboard Kurva Parametrik** adalah sebuah *engine visualisasi interaktif* berbasis web yang bertugas untuk merender dan membedah bentuk geometri klasik (Lingkaran, Elips, Parabola, Hiperbola). 

Berbeda dengan sistem *rendering* biasa yang menggambar garis menggunakan fungsi kanvas bawaan, **sistem ini membedah bentuk ke tingkat molekuler (titik / dot)**. Sistem menghitung setiap koordinat murni menggunakan persamaan parametrik matematika, menaruh titik piksel demi piksel, lalu menganalisis pergerakannya secara dinamis (*real-time*).

> *"Kami tidak menggambar garis. Kami menghitung takdir setiap titik di alam semesta (kanvas) ini."* — **Lanciuy**

---

## 💻 Tech Stack (Bahasa & Teknologi)

Sistem ini dikembangkan menggunakan teknologi murni tanpa *library front-end* raksasa agar performanya maksimal dan murni (*vanilla*). Berikut adalah pilar teknologi yang dipilih secara teliti oleh **Lanciuy**:

<div align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/JavaScript_Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</div>

* **Python & Flask (Backend / Server):** Bertugas sebagai pelayan jaringan yang ringan dan super cepat. Mengatur lalu lintas data (API REST) dan penyimpanan status *history* kalkulasi ke dalam *server-side*.
* **JavaScript murni & HTML5 Canvas API (Frontend / Otak Render):** Inilah nyawa utamanya. JavaScript bertugas memproses puluhan ribu operasi trigonometri per detik (*Math Engine*), dan merendernya *frame-by-frame* langsung ke dalam piksel kanvas browser.
* **CSS3 (Styling & Animasi):** Merakit tata letak antarmuka bergaya modern (*Bento Grid & Glassmorphism*) lengkap dengan mikrokosmos animasi rumit (*CSS Keyframes* orbit planetary), khusus untuk mempercantik logo premium **Lanciuy**.

---

## 💎 Fitur Unggulan

| Fitur | Deskripsi Singkat |
| :--- | :--- |
| 🧮 **Math Engine Asli** | Menghitung sin, cos, sec, tan, dan derivasi turunan murni via JS Math. |
| 🎯 **Dot-by-Dot Rendering** | Render kurva menggunakan jutaan titik akurat, bukan manipulasi vektor (garis). |
| 🔎 **Live Analysis Panel** | Membedah *step-by-step* bagaimana sebuah titik ditemukan beserta angka aslinya. |
| 📱 **Bento Grid UI** | Tampilan *dashboard* super modern terinspirasi gaya Apple dengan panel tembus pandang. |
| 🚀 **Micro-Animations** | Animasi super mulus berkat rendering `requestAnimationFrame`. |

---

## 📐 Penjelasan Konsep Mendetail (Teori Matematika)

Sistem ini didasarkan pada **Persamaan Parametrik**. Alih-alih menggunakan bentuk eksplisit seperti $y = f(x)$, sistem ini mendefinisikan posisi koordinat bergantung pada sebuah parameter independen, biasanya waktu atau sudut (yang kita sebut **$t$**).

### 1. Lingkaran & Elips (Fungsi Tertutup)
Sistem menggunakan sudut (0 hingga 360 derajat) sebagai parameter mutlak.
* **Lingkaran**: Membutuhkan satu *radius* konstan. Kecepatan titik bergerak (*speed*) selalu sama.
* **Elips**: Membutuhkan radius Horizontal ($a$) dan Vertikal ($b$). Karena bentuknya lonjong, **Lanciuy** merancang sistem ini untuk menghitung kecepatan yang *bervariasi* (titik melambat saat di tikungan tajam, dan melesat saat jalurnya landai).

### 2. Parabola & Hiperbola (Fungsi Terbuka)
Sistem menggunakan parameter sembarang rentang interval (misal $t = -10$ hingga $10$).
* **Parabola**: Terbuka ke satu arah tak terhingga tanpa pernah menyentuh atau menutup.
* **Hiperbola**: Dua cabang asimtotik yang saling membelakangi. Sistem ini dibekali *handler khusus* untuk **menghindari Error Tak Terhingga (Infinity)** saat $t = 90^\circ$ atau $270^\circ$, yang merupakan tantangan terbesar dalam grafika matematika standar.

---

## ⚙️ Bagaimana Cara Kerja Sistem Ini? (Arsitektur)

Sistem ini dirancang oleh **Lanciuy** dan tim dengan prinsip *Separation of Concerns* (Pemisahan Tanggung Jawab) yang sangat ketat:

### 1. 🧮 Bagian Otak (Geometry Engine / `geometryCalc.js`)
Ini adalah *core* matematika. Ia hanya menerima angka (jari-jari, interval, sudut), lalu memuntahkan "Data Mentah" (Array berisi koordinat $x$, $y$, radian, $cos/sin$, kecepatan $dx/dt$, dan $speed$). Engine ini buta layar; ia murni kalkulator.

### 2. 🎨 Bagian Tangan (Canvas Animator / `canvasAnimator.js`)
Ini adalah sang Pelukis. Ia menerima "Data Mentah", menerjemahkan koordinat pusat Matematika (Tengah Layar) menjadi sistem koordinat layar HTML (Kiri Atas Layar). Lalu ia melukis titik tersebut satu-per-satu (*frame-by-frame*) menciptakan ilusi optik menggambar dinamis yang memanjakan mata.

### 3. 🧠 Bagian Mulut (UI & Analysis Hub / `ui.js`)
Ini adalah sang Juru Bicara. Menangkap klik dari *user*, menyuruh Otak (1) menghitung, memberi perintah Pelukis (2) menggambar, sekaligus **membongkar angka rahasia hasil hitungan** ke layar (Panel Edukasi) agar dapat dipelajari secara transparan oleh akademisi.

---

## 💻 Panduan Instalasi (Cara Menjalankan)

Siap menjalankan mahakarya ini di mesin lokal Anda? Ikuti langkah mudah berikut:

1. **Pastikan Python terinstal** (Minimal versi 3.8+).
2. **Kloning Repositori ini** ke komputer Anda.
   ```bash
   git clone https://github.com/Lanciuy/dashboard-kurva-parametrik.git
   cd dashboard-kurva-parametrik
   ```
3. **Instal Dependensi**:
   ```bash
   pip install flask
   ```
4. **Jalankan Server**:
   ```bash
   python app.py
   ```
5. Perhatikan tulisan yang muncul di terminal Anda. Buka Browser Anda yang paling *modern* dan akses URL yang tertera di sana (secara *default* biasanya adalah: 👉 **`http://127.0.0.1:5000`** atau **`http://localhost:5000`**)

---

<br>

<div align="center">
  <h3>✨ Closing Words ✨</h3>
  
  <p><i>"Setiap titik yang Anda lihat di layar bukanlah sekadar piksel mati, melainkan sebuah identitas matematis yang memiliki posisi, kecepatan, dan takdirnya sendiri. Proyek ini dibangun bukan hanya untuk menggambar grafik, tapi untuk memanifestasikan keindahan kalkulus ke dalam visual interaktif yang bisa disentuh, dipelajari, dan dikagumi oleh semua orang."</i></p>
  
  <p><strong>Terus Berkarya. Terus Berinovasi. Jangan Pernah Berhenti Belajar.</strong></p>
  
  <br>
  
  <h2>— Lanciuy & Team —</h2>
</div>
