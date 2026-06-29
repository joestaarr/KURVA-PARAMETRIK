/**
 * canvasAnimator.js
 * Engine rendering titik-titik (dots) dengan animasi, grid, dan efek visual
 * OUTPUT: Titik-titik (dots) bukan garis, setiap titik divisualisasikan
 */

const canvas = document.getElementById('curveCanvas');
const ctx = canvas.getContext('2d');
let animationFrameId = null;

// =====================================================================
// TRANSFORM STATE (Zoom & Pan Controller)
// =====================================================================
/**
 * [ZOOM & PAN CONTROLLER]
 * Menyimpan status pergeseran (panning) dan pembesaran (zooming) kanvas.
 * Variabel ini digunakan untuk memanipulasi view pengguna secara interaktif.
 */
let currentScale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let cachedPointsArray = null;

// =====================================================================
// COORDINATE MAPPING (Coordinate Controller)
// =====================================================================
/**
 * [COORDINATE CONTROLLER] mapCoordinate
 * ---------------------------------------------------------------------
 * Memetakan koordinat KARTESIAN MATEMATIKA ke sistem KOORDINAT PIKSEL LAYAR.
 * 
 * Mengapa ini dibutuhkan?
 * 1. Di Matematika: Titik (0,0) ada di tengah. Y positif ke atas.
 * 2. Di Layar HTML Canvas: Titik (0,0) ada di pojok KIRI ATAS. Y positif ke BAWAH.
 * 
 * Cara Kerjanya:
 *   px = (w/2) + (x * currentScale) + offsetX
 *   py = (h/2) - (y * currentScale) + offsetY  <-- Minus karena Y terbalik di kanvas
 * 
 * @param {number} x, y - Koordinat matematika mentah
 * @param {number} w, h - Lebar dan tinggi elemen kanvas
 * @returns {Object|null} - Koordinat pixel siap dirender (px, py)
 *                          Me-return null jika titik berada jauh di luar layar
 *                          (Teknik "Culling" agar tidak membuang performa CPU).
 */
function mapCoordinate(x, y, w, h) {
    const px = w / 2 + (x * currentScale) + offsetX;
    const py = h / 2 - (y * currentScale) + offsetY;
    
    // Validasi: pastikan titik dalam canvas bounds (dengan buffer kecil)
    // Jika titik keluar canvas, kembalikan null untuk diskip
    if (px < -10 || px > w + 10 || py < -10 || py > h + 10) {
        return null;
    }
    
    return {
        px: px,
        py: py
    };
}

// =====================================================================
// GRID RENDERING (Grid Controller)
// =====================================================================
/**
 * [GRID CONTROLLER]
 * Fungsi drawGrid() bertugas merender garis-garis kotak (millimeter block)
 * sebagai latar belakang kanvas. Skala grid ini (logicalMajorStep) akan 
 * membesar/mengecil secara otomatis berdasarkan level Zoom pengguna.
 */
function drawGrid(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);

    // Konfigurasi Sub-Grid (Kotak Kecil / Milimeter)
    const baseMajorSize = 80; // Target ukuran fisik 1 kotak besar (px)
    
    // Adaptive step based on scale
    let logicalMajorStep = baseMajorSize / currentScale;
    
    // Round to nice numbers
    const niceSteps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    let selectedStep = niceSteps[0];
    for (let s of niceSteps) {
        if (s >= logicalMajorStep) {
            selectedStep = s;
            break;
        }
    }
    logicalMajorStep = selectedStep;
    const logicalMinorStep = logicalMajorStep / 10; // 1 kotak besar dipecah 10 kotak kecil
    
    // Center screen in mathematical coordinates
    const centerX = -offsetX / currentScale;
    const centerY = offsetY / currentScale;
    
    // Calculate visible boundaries in mathematical coordinates
    const startX = Math.floor((centerX - w/2 / currentScale) / logicalMinorStep) * logicalMinorStep;
    const endX = Math.ceil((centerX + w/2 / currentScale) / logicalMinorStep) * logicalMinorStep;
    
    const startY = Math.floor((centerY - h/2 / currentScale) / logicalMinorStep) * logicalMinorStep;
    const endY = Math.ceil((centerY + h/2 / currentScale) / logicalMinorStep) * logicalMinorStep;

    ctx.font = '10px Inter, sans-serif';

    // 1. Gambar MINOR GRID (Garis Tipis)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)'; // Sangat transparan
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += logicalMinorStep) {
        // Skip jika ini garis major
        if (Math.abs(x % logicalMajorStep) < logicalMinorStep * 0.1) continue;
        const px = w/2 + (x * currentScale) + offsetX;
        if (px < 0 || px > w) continue;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
    }
    for (let y = startY; y <= endY; y += logicalMinorStep) {
        // Skip jika ini garis major
        if (Math.abs(y % logicalMajorStep) < logicalMinorStep * 0.1) continue;
        const py = h/2 - (y * currentScale) + offsetY;
        if (py < 0 || py > h) continue;
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
    }
    ctx.stroke();

    // 2. Gambar MAJOR GRID (Garis Sedang & Label Angka)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'; // Lebih tegas
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Warna teks
    
    // Label offset calculation to keep them on screen
    const pyZero = h/2 + offsetY;
    const pyLabel = pyZero > 15 && pyZero < h - 15 ? pyZero : (pyZero <= 15 ? 15 : h - 15);
    
    const pxZero = w/2 + offsetX;
    const pxLabel = pxZero > 25 && pxZero < w - 25 ? pxZero : (pxZero <= 25 ? 25 : w - 25);

    // Vertical Major Lines & X-Axis Labels
    for (let x = Math.floor(startX/logicalMajorStep)*logicalMajorStep; x <= endX; x += logicalMajorStep) {
        const px = w/2 + (x * currentScale) + offsetX;
        if (px < 0 || px > w) continue;
        
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
        ctx.stroke();

        if (Math.abs(x) > 0.001) { // Jangan label 0 di sini, nanti di titik O
            let valText = Number(x.toPrecision(10)).toString();
            // Gambar tick mark kecil di sumbu Y (pyLabel)
            ctx.beginPath();
            ctx.moveTo(px, pyLabel - 4);
            ctx.lineTo(px, pyLabel + 4);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            
            // Tulis angka X
            ctx.fillText(valText, px + 4, pyLabel - 6);
        }
    }

    // Horizontal Major Lines & Y-Axis Labels
    for (let y = Math.floor(startY/logicalMajorStep)*logicalMajorStep; y <= endY; y += logicalMajorStep) {
        const py = h/2 - (y * currentScale) + offsetY;
        if (py < 0 || py > h) continue;

        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();

        if (Math.abs(y) > 0.001) {
            let valText = Number(y.toPrecision(10)).toString();
            // Tick mark
            ctx.beginPath();
            ctx.moveTo(pxLabel - 4, py);
            ctx.lineTo(pxLabel + 4, py);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            
            // Tulis angka Y
            ctx.fillText(valText, pxLabel + 6, py - 3);
        }
    }

    // 3. GAMBAR SUMBU PUSAT X & Y (Tebal)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    
    // Sumbu X
    if (pyZero >= 0 && pyZero <= h) {
        ctx.beginPath();
        ctx.moveTo(0, pyZero);
        ctx.lineTo(w, pyZero);
        ctx.stroke();
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText('X', w - 15, pyZero - 10);
    }
    
    // Sumbu Y
    if (pxZero >= 0 && pxZero <= w) {
        ctx.beginPath();
        ctx.moveTo(pxZero, 0);
        ctx.lineTo(pxZero, h);
        ctx.stroke();
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText('Y', pxZero + 10, 15);
    }

    // Titik Pusat Origin (O)
    if (pxZero >= 0 && pxZero <= w && pyZero >= 0 && pyZero <= h) {
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText('0', pxZero - 12, pyZero + 14);
    }
}

// =====================================================================
// DOT STYLING - GRADIENT WARNA BERDASARKAN PARAMETER t
// =====================================================================

/**
 * Menghasilkan warna RGB CLEAN (tanpa glow) berdasarkan posisi titik (progress 0..1)
 * Menggunakan spektrum Hue dari biru cyan → hijau lime → kuning emas
 * Warna SOLID dan CLEAN tanpa opacity yang berubah
 */
function getPointColor(progress) {
    // Gradient spektrum warna hangat: Kuning → Oranye → Merah Bata
    // Progress 0.0 → Kuning (255, 200, 0)
    // Progress 0.5 → Oranye (255, 100, 0)
    // Progress 1.0 → Merah Bata (200, 30, 30)
    
    let r, g, b;
    
    if (progress < 0.5) {
        // Kuning ke Oranye: (255, 200, 0) → (255, 100, 0)
        const p = progress / 0.5;
        r = 255;
        g = Math.round(200 - (100 * p));
        b = 0;
    } else {
        // Oranye ke Merah Bata: (255, 100, 0) → (200, 30, 30)
        const p = (progress - 0.5) / 0.5;
        r = Math.round(255 - (55 * p));
        g = Math.round(100 - (70 * p));
        b = Math.round(30 * p);
    }
    
    // Return RGB format SOLID (tidak transparan)
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Menentukan ukuran titik berdasarkan kecepatan parametrik (speed)
 * Fungsi ini menciptakan efek VISUAL DENSITY yang alami:
 * - Titik dengan kecepatan rendah = ukuran lebih besar (lebih rapat di area lambat)
 * - Titik dengan kecepatan tinggi = ukuran lebih kecil (lebih jarang di area cepat)
 * 
 * RANGE AKURAT: minSize=1.2px, maxSize=2.8px untuk perbandingan visual optimal
 */
function getPointSize(speed, minSize, maxSize) {
    if (!speed || speed === 0) {
        return maxSize; // Titik stasioner atau speed=0 → ukuran maksimal
    }
    
    // Normalisasi inversely proportional terhadap speed
    // Speed rendah (< 10) → normalized = 1.0 (maxSize)
    // Speed tinggi (> 50) → normalized ≈ 0.2 (minSize)
    const normalized = Math.max(0, Math.min(1, 50 / (speed + 10)));
    
    // Interpolasi linear antara minSize dan maxSize
    const size = minSize + normalized * (maxSize - minSize);
    
    return size;
}

// =====================================================================
// CANVAS RESET
// =====================================================================
function resetCanvas() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    drawGrid(ctx, canvas.width, canvas.height);
}

// =====================================================================
// RENDER TITIK PUSAT (CENTER POINT) - Dengan penanda silang yang JELAS
// =====================================================================
/**
 * Menampilkan marker PUSAT kurva dengan:
 * - Cross mark (plus sign) hijau terang
 * - Ring circle di sekitarnya
 * - Label koordinat dengan format yang mudah dibaca
 */
function drawCenterMarker(ctx, cx, cy, w, h) {
    const mapped = mapCoordinate(cx, cy, w, h);
    if (!mapped) return; // Skip jika keluar canvas
    
    const px = mapped.px;
    const py = mapped.py;

    // Cross mark - solid, jelas
    ctx.strokeStyle = 'rgb(50, 100, 200)'; // Biru Gelap
    ctx.lineWidth = 2;
    const size = 8;

    ctx.beginPath();
    ctx.moveTo(px - size, py);
    ctx.lineTo(px + size, py);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px, py - size);
    ctx.lineTo(px, py + size);
    ctx.stroke();

    // Outer ring - tipis
    ctx.beginPath();
    ctx.arc(px, py, size + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgb(40, 80, 180)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label koordinat - MUDAH DIBACA
    ctx.font = 'bold 10px Inter, monospace';
    ctx.fillStyle = 'rgb(50, 100, 200)';
    ctx.fillText(`C(${cx}, ${cy})`, px + size + 5, py - 5);
}

// =====================================================================
// RENDER FOKUS POINT(S) - Diamond marker yang JELAS dan CLEAN
// =====================================================================
/**
 * Menampilkan marker FOKUS (focus point) dengan:
 * - Diamond shape emas terang
 * - Label yang jelas (F₁, F₂, atau F)
 * - Tanpa efek glow, solid dan clean
 */
function drawFocusMarker(ctx, fx, fy, w, h, label) {
    const mapped = mapCoordinate(fx, fy, w, h);
    if (!mapped) return; // Skip jika keluar canvas
    
    const px = mapped.px;
    const py = mapped.py;

    // Diamond shape - solid gold/kuning CLEAN
    ctx.fillStyle = 'rgb(255, 200, 0)'; // Emas terang
    ctx.beginPath();
    ctx.moveTo(px, py - 5);      // Top
    ctx.lineTo(px + 5, py);      // Right
    ctx.lineTo(px, py + 5);      // Bottom
    ctx.lineTo(px - 5, py);      // Left
    ctx.closePath();
    ctx.fill();

    // Border tipis untuk ketajaman
    ctx.strokeStyle = 'rgb(255, 220, 100)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label fokus - MUDAH DIBACA
    ctx.font = 'bold 9px Inter, monospace';
    ctx.fillStyle = 'rgb(255, 200, 0)';
    ctx.fillText(label || 'F', px + 7, py + 3);
}

// =====================================================================
// ANIMASI UTAMA - RENDER TITIK-TITIK (DOTS)
// =====================================================================
/**
 * [ANIMATION & RENDER CONTROLLER] animateCurve
 * ---------------------------------------------------------------------
 * Fungsi animateCurve() adalah otak visual / panggung teaternya!
 * Ia menerima array titik mentah dari geometryCalc, lalu menyutradarai 
 * penggambarannya lapis demi lapis.
 * 
 * ALUR KERJA:
 * 1. AUTO-ZOOM: Membaca boundingBox dari data titik, lalu menghitung `currentScale` 
 *    agar kurva raksasa muat di layar, atau kurva kecil diperbesar (Fit to Screen).
 *    Juga menghitung `offsetX` dan `offsetY` agar posisinya tepat di tengah.
 * 2. GRID DRAWING: Memanggil drawGrid() untuk melukis kertas milimeter blok.
 * 3. ANIMATION LOOP: Menggunakan `requestAnimationFrame` untuk melukis 
 *    satu per satu titik (dots) ke layar seolah-olah sedang digambar manual.
 * 4. COLOR GRADING: Memberikan warna dari Oranye ke Merah Darah berdasarkan
 *    seberapa jauh perjalanan parameter t (progress).
 * 
 * @param {Array<Object>} pointsArray - Array dari [MATH ENGINE CONTROLLER]
 */
function animateCurve(pointsArray) {
    const w = canvas.width;
    const h = canvas.height;

    resetCanvas();

    const statusText = document.getElementById('renderStatusText');

    if (!pointsArray || pointsArray.length === 0) {
        statusText.textContent = "Tidak ada titik untuk dirender.";
        return;
    }

    // Sembunyikan overlay panduan
    document.getElementById('initialOverlay').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('initialOverlay').style.display = 'none';
    }, 500);

    // Filter out break markers untuk total count
    const dataPoints = pointsArray.filter(p => !p.break);
    const totalDataPoints = dataPoints.length;
    const totalPoints = pointsArray.length;
    let currentIdx = 0;
    const startTime = performance.now();
    
    cachedPointsArray = pointsArray;

    // Auto-fit (Auto-scale) logic
    if (pointsArray.meta && pointsArray.meta.boundingBox) {
        const box = pointsArray.meta.boundingBox;
        const width = box.xMax - box.xMin;
        const height = box.yMax - box.yMin;
        
        // Calculate scale to fit with 20% margin
        const scaleX = (w * 0.8) / (width || 1);
        const scaleY = (h * 0.8) / (height || 1);
        currentScale = Math.min(scaleX, scaleY);
        if (currentScale > 50) currentScale = 50;
        if (currentScale < 0.05) currentScale = 0.05;
        
        // Calculate offset to center the bounding box
        const centerX = (box.xMin + box.xMax) / 2;
        const centerY = (box.yMin + box.yMax) / 2;
        offsetX = -(centerX * currentScale);
        offsetY = (centerY * currentScale);
    } else {
        currentScale = 1;
        offsetX = 0;
        offsetY = 0;
    }
    
    // Grid perlu digambar ulang dengan scale baru
    resetCanvas();

    const liveX = document.getElementById('liveX');
    const liveY = document.getElementById('liveY');

    // Gambar center marker jika ada meta
    if (pointsArray.meta) {
        const meta = pointsArray.meta;
        if (meta.titikPusat) {
            drawCenterMarker(ctx, meta.titikPusat.x, meta.titikPusat.y, w, h);
        } else if (meta.vertex) {
            drawCenterMarker(ctx, meta.vertex.x, meta.vertex.y, w, h);
        }

        // Fokus markers DINONAKTIFKAN - hanya tampilkan center marker
        // Jika ingin aktifkan kembali, uncomment code di bawah:
        /*
        if (meta.fokus1) {
            drawFocusMarker(ctx, meta.fokus1.x, meta.fokus1.y, w, h, 'F₁');
        }
        if (meta.fokus2) {
            drawFocusMarker(ctx, meta.fokus2.x, meta.fokus2.y, w, h, 'F₂');
        }
        if (meta.fokus) {
            drawFocusMarker(ctx, meta.fokus.x, meta.fokus.y, w, h, 'F');
        }
        */
    }

    // =====================================================================
    // FRAME-BY-FRAME DOT RENDERING
    // =====================================================================
    let renderedDataIdx = 0; // Counter for data points only (excluding breaks)
    let lastPx = null;
    let lastPy = null;

    function drawNextDots() {
        // Hitung berapa titik per frame (agar animasi ~2-3 detik)
        const dotsPerFrame = Math.max(1, Math.floor(totalDataPoints / 150));
        let drawnCount = 0;

        while (currentIdx < totalPoints && drawnCount < dotsPerFrame) {
            const pt = pointsArray[currentIdx];

            // Skip break markers and reset line connection
            if (pt.break) {
                lastPx = null;
                lastPy = null;
                currentIdx++;
                continue;
            }

            const progress = renderedDataIdx / Math.max(1, totalDataPoints - 1);
            const mapped = mapCoordinate(pt.x, pt.y, w, h);

            // Skip jika koordinat keluar canvas bounds (aman untuk rendering)
            if (!mapped) {
                currentIdx++;
                renderedDataIdx++;
                drawnCount++;
                continue;
            }

            // Garis Penghubung Transparan
            if (lastPx !== null && lastPy !== null) {
                ctx.beginPath();
                ctx.moveTo(lastPx, lastPy);
                ctx.lineTo(mapped.px, mapped.py);
                ctx.strokeStyle = 'rgba(255, 126, 95, 0.4)'; // Warna hangat semi-transparan
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Ukuran titik AKURAT berdasarkan speed (jika tersedia)
            const dotSize = pt.speed !== undefined
                ? getPointSize(pt.speed, 4.0, 6.0)
                : 5.0;

            // Warna titik berdasarkan progress parameter t (CLEAN, SOLID, TANPA GLOW)
            const color = getPointColor(progress);

            // Render dot sebagai filled circle AKURAT
            ctx.beginPath();
            ctx.arc(mapped.px, mapped.py, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Simpan koordinat terakhir untuk garis berikutnya
            lastPx = mapped.px;
            lastPy = mapped.py;

            // Update live koordinat
            liveX.textContent = `X: ${pt.x.toFixed(2)}`;
            liveY.textContent = `Y: ${pt.y.toFixed(2)}`;

            currentIdx++;
            renderedDataIdx++;
            drawnCount++;
        }

        // Update Status dengan pesan yang lebih deskriptif
        const pct = Math.floor((renderedDataIdx / totalDataPoints) * 100);
        statusText.textContent = `📍 Merender titik... ${renderedDataIdx}/${totalDataPoints} (${pct}%)`;
        statusText.style.color = '#ffd700';

        if (currentIdx < totalPoints) {
            animationFrameId = requestAnimationFrame(drawNextDots);
        } else {
            // Animasi SELESAI - Semua titik sudah terender dengan AKURAT
            const timeElapsed = ((performance.now() - startTime) / 1000).toFixed(2);
            statusText.textContent = `✓ SELESAI! ${timeElapsed}s — ${totalDataPoints} titik AKURAT`;
            statusText.style.color = '#00fa9a';

            // Kirim data ke backend untuk penyimpanan
            saveDataToBackend(pointsArray, totalDataPoints);
        }
    }

    drawNextDots();
}

// =====================================================================
// BACKEND API SAVE
// =====================================================================
async function saveDataToBackend(points, totalPoints) {
    try {
        const payload = {
            totalPoints: totalPoints,
            curveType: document.getElementById('curveType').value,
            meta: points.meta || {},
            points: points.filter(p => !p.break).slice(0, 200)
        };

        const response = await fetch('/api/save-curve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("Status Penyimpanan Backend:", result.message);
    } catch (error) {
        console.error("Gagal menyambung ke server:", error);
    }
}

// Event load untuk menggambar grid awal
window.addEventListener('load', () => {
    resetCanvas();
});

// =====================================================================
// EVENTS: PAN & ZOOM
// =====================================================================
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
    redrawCanvas();
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert mouse to mathematical coordinates
    const mathX = (mouseX - canvas.width / 2 - offsetX) / currentScale;
    const mathY = -(mouseY - canvas.height / 2 - offsetY) / currentScale;
    
    currentScale *= zoomFactor;
    
    // Adjust offset so mouse position remains at the same mathematical coordinate
    offsetX = mouseX - canvas.width / 2 - (mathX * currentScale);
    offsetY = mouseY - canvas.height / 2 + (mathY * currentScale);
    
    redrawCanvas();
});

function redrawCanvas() {
    if (!cachedPointsArray) {
        resetCanvas();
        return;
    }
    
    resetCanvas();
    const w = canvas.width;
    const h = canvas.height;
    
    if (cachedPointsArray.meta) {
        const meta = cachedPointsArray.meta;
        if (meta.titikPusat) {
            drawCenterMarker(ctx, meta.titikPusat.x, meta.titikPusat.y, w, h);
        } else if (meta.vertex) {
            drawCenterMarker(ctx, meta.vertex.x, meta.vertex.y, w, h);
        }
    }
    
    // We only redraw data points that were already rendered
    // If the animation is still playing, we redraw everything up to currentIdx
    // For simplicity, we just redraw all of them if the animation finished, or up to the current progress.
    let lastPx = null;
    let lastPy = null;

    for (let i = 0; i < cachedPointsArray.length; i++) {
        const pt = cachedPointsArray[i];
        if (pt.break) {
            lastPx = null;
            lastPy = null;
            continue;
        }
        
        const mapped = mapCoordinate(pt.x, pt.y, w, h);
        if (!mapped) continue;
        
        // Garis penghubung
        if (lastPx !== null && lastPy !== null) {
            ctx.beginPath();
            ctx.moveTo(lastPx, lastPy);
            ctx.lineTo(mapped.px, mapped.py);
            ctx.strokeStyle = 'rgba(255, 126, 95, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        const dotSize = pt.speed !== undefined ? getPointSize(pt.speed, 4.0, 6.0) : 5.0;
        const progress = i / Math.max(1, cachedPointsArray.length - 1);
        const color = getPointColor(progress);
        
        ctx.beginPath();
        ctx.arc(mapped.px, mapped.py, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        lastPx = mapped.px;
        lastPy = mapped.py;
    }
}
