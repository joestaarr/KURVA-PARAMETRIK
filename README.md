<div align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  
  <h1>🌟 Dashboard Kurva Parametrik 🌟</h1>
  <p>Aplikasi web modern untuk merender dan menganalisis kurva matematis berbasis persamaan parametrik secara real-time.</p>
</div>

---

## 👨‍💻 Pengembang Utama
**Dikembangkan oleh:** [**Lanciuy**](https://github.com/joestaarr)  
*Senior Fullstack Developer & Mahasiswa Grafika Komputer*

---

## 📖 Deskripsi Proyek
**Dashboard Kurva Parametrik** adalah aplikasi web interaktif yang merender visualisasi matematika menggunakan **HTML5 Canvas API** pada *frontend* dan **Python FastAPI** pada *backend*. Proyek ini dirancang khusus untuk menganalisis sifat-sifat geometri kurva 2D seperti Lingkaran, Elips, Parabola, dan Hiperbola.

Aplikasi ini menyajikan antarmuka (*UI*) bergaya *modern dark-mode* dengan *micro-animations* yang memanjakan mata, serta fitur *live coordinate tracking* yang sangat berguna untuk kebutuhan akademik maupun presentasi sidang.

---

## 🚀 Fitur Unggulan
- **Real-time Rendering:** Gambar kurva langsung terbentuk titik demi titik di kanvas dengan animasi 60FPS.
- **Parametric Equations Engine:** Menghitung koordinat berdasarkan rumus parametrik absolut murni tanpa pendekatan (*approximation*).
- **Modern Architecture:** Memisahkan *Routing*, *Services*, dan *Views* pada arsitektur FastAPI (Menerapkan *Clean Architecture*).
- **Data Persistence:** Otomatis menyimpan setiap kurva yang dirender ke dalam `curves.json` di sisi *backend* melalui API Endpoint.
- **Preset Dinamis:** Menyediakan puluhan rekomendasi parameter instan (seperti *H. Standar*, *V. Standar*, *Lingkaran Presisi*) untuk demonstrasi kilat.

---

## 🧮 Teori Matematika dan Persamaan Parametrik

Aplikasi ini mendasarkan *rendering* visualnya pada persamaan parametrik matematika standar. Parameter `t` (sudut/langkah parametrik) disimulasikan sebagai variabel independen dari rentang minimum ke maksimum.

### 1. Lingkaran (Circle)
Lingkaran terbentuk dari himpunan titik yang berjarak sama (jari-jari `r`) dari satu titik pusat komputasi (`xc, yc`).
* **Fungsi Parametrik:**
  * $x(t) = x_c + r \cdot \cos(t)$
  * $y(t) = y_c + r \cdot \sin(t)$

### 2. Elips (Ellipse)
Bentuk modifikasi (pelebaran) dari lingkaran dengan panjang rentang sumbu yang berbeda: sumbu semi-mayor (`a`) dan semi-minor (`b`).
* **Fungsi Parametrik:**
  * $x(t) = x_c + a \cdot \cos(t)$
  * $y(t) = y_c + b \cdot \sin(t)$

### 3. Parabola
Kurva garis lengkung terbuka yang terbentuk dari pergerakan kuadratik parameter `t`.
* **Fungsi Parametrik (Orientasi Terbuka ke Kanan):**
  * $x(t) = x_c + a \cdot t^2$
  * $y(t) = y_c + 2a \cdot t$

### 4. Hiperbola (Hyperbola)
Kurva simetris ekstrem yang dibentuk oleh dua cabang terpisah secara asimtotik.
* **Fungsi Parametrik (Orientasi Horizontal):**
  * $x(t) = x_c + a \cdot \sec(t)$
  * $y(t) = y_c + b \cdot \tan(t)$
* *Catatan teknis engine:* Pada `geometryCalc.js`, nilai `sec(t)` dan `tan(t)` akan menghasilkan nilai tak hingga pada sudut $90^\circ$ dan $-90^\circ$. Mesin kanvas kami dirancang untuk mendeteksi _breaking point_ ini agar proses rendering melompat tanpa membuat garis cacat pada layar.

---

## 🛠️ Persyaratan Sistem (*Prerequisites*)
Pastikan sistem Anda sudah menginstal alat-alat berikut sebelum memulai server:
- [Python 3.8+](https://www.python.org/downloads/)
- `pip` (Python package manager)
- Browser modern yang mendukung Canvas API (Chrome, Firefox, Edge terbaru)

---

## 📦 Panduan Instalasi dan Penggunaan

**1. Kloning Repositori**
Buka terminal Anda dan jalankan perintah:
```bash
git clone https://github.com/joestaarr/KURVA-PARAMETRIK.git
cd KURVA-PARAMETRIK
```

**2. Instalasi Dependensi Backend**
Sangat disarankan untuk menggunakan _virtual environment_, namun Anda dapat langsung menginstalnya secara global:
```bash
# Menginstal FastAPI, Uvicorn, dan library penunjang
pip install -r requirements.txt
```

**3. Menjalankan Server Lokal**
Aktifkan mesin backend melalui perintah berikut:
```bash
python main.py
```
*Server Uvicorn sekarang akan menyala.*

**4. Mengakses Dashboard**
Buka web browser dan kunjungi tautan berikut:
👉 **[http://localhost:8000](http://localhost:8000)**

---

## 📂 Struktur Arsitektur Direktori

```text
KURVA-PARAMETRIK/
├── main.py                 # File Utama (Entry Point) & Setup FastAPI
├── requirements.txt        # Daftar library Python
├── .gitignore              # Aturan filter pengecualian file Git
├── data/
│   └── curves.json         # [Auto-generated] Database ringan penyimpan log koordinat
├── routers/                # Modul Routing Terpisah
│   ├── api.py              # Logika Endpoint API (Terima JSON dari Frontend)
│   └── pages.py            # Logika Endpoint Views (Merender HTML)
├── utils/                  
│   └── storage.py          # Handler Storage (Logika baca/tulis JSON ke filesystem)
└── static/                 # Aset Frontend Web (Client-side)
    ├── index.html          # Kerangka Antarmuka HTML5
    ├── css/
    │   └── style.css       # Desain Modern, Animasi Glow, dan Grid System
    └── js/
        ├── ui.js             # Dom Manipulator, Event Listeners, & UI Controller
        ├── geometryCalc.js   # Otak Matematika pengolah persamaan parametrik murni
        └── canvasAnimator.js # Engine Animasi HTML5 Canvas & Logic Renderer
```

---

## 🤝 Kontribusi
Aplikasi ini masih terus berkembang. Jika Anda memiliki saran untuk optimasi formula matematika, _bug fixes_, atau fitur tambahan (seperti ekspor gambar), silakan kirimkan *Pull Request*. Setiap kontribusi dari *developer* lain selalu kami apresiasi!

## 📄 Lisensi
Dikembangkan secara eksklusif oleh **Lanciuy** untuk tujuan edukasi dan praktikum Algoritma Grafika Komputer.

---
<div align="center">
  <i>"Menghidupkan matematika ke dalam kanvas digital."</i>
</div>
