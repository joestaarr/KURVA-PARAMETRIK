/**
 * canvasAnimator.js
 * Engine rendering titik-titik (dots) dengan animasi, grid, dan efek visual
 * OUTPUT: Titik-titik (dots) bukan garis, setiap titik divisualisasikan
 */

const canvas = document.getElementById('curveCanvas');
const ctx = canvas.getContext('2d');
let animationFrameId = null;

// =====================================================================
// TRANSFORM STATE (ZOOM & PAN)
// =====================================================================
let currentScale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let cachedPointsArray = null;

// =====================================================================
// COORDINATE MAPPING (AKURAT & VALIDASI)
// =====================================================================
/**
 * Memetakan koordinat KARTESIAN MATEMATIKA ke sistem KOORDINAT PIKSEL LAYAR
 * 
 * Transformasi Koordinat:
 *   px = w/2 + x    ← Geser origin ke tengah horizontal (left/right)
 *   py = h/2 - y    ← Geser origin ke tengah vertikal & balik sumbu Y
 * 
 * CATATAN PENTING:
 *   - Layar: Y bertambah ke BAWAH (origin top-left)
 *   - Matematika: Y bertambah ke ATAS (origin center)
 *   - Koordinat (0,0) di matematika → center canvas pada layar
 * 
 * VALIDASI: Koordinat titik harus tetap dalam canvas bounds
 * untuk menghindari rendering artefak di luar area display
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
// GRID RENDERING
// =====================================================================
/**
 * Menggambar latar belakang kanvas berupa grid transparan,
 * sumbu X/Y tebal, tick marks, dan label nilai
 */
function drawGrid(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);

    // Grid tipis transparan
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';

    const baseStep = 30;       // Grid setiap 30px secara logis
    const baseTickStep = 60;   // Angka label setiap 60px

    // Adaptive step based on scale
    let logicalStep = baseStep / currentScale;
    let logicalTickStep = baseTickStep / currentScale;
    
    // To make it look nice, round logical step to nice numbers (1, 2, 5, 10, etc)
    const niceSteps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    let selectedStep = niceSteps[0];
    for (let s of niceSteps) {
        if (s >= baseStep / currentScale) {
            selectedStep = s;
            break;
        }
    }
    logicalStep = selectedStep;
    logicalTickStep = logicalStep * 2;

    const physicalStep = logicalStep * currentScale;

    // Center screen in mathematical coordinates
    const centerX = -offsetX / currentScale;
    const centerY = offsetY / currentScale;
    
    const startX = Math.floor((centerX - w/2 / currentScale) / logicalStep) * logicalStep;
    const endX = Math.ceil((centerX + w/2 / currentScale) / logicalStep) * logicalStep;
    
    const startY = Math.floor((centerY - h/2 / currentScale) / logicalStep) * logicalStep;
    const endY = Math.ceil((centerY + h/2 / currentScale) / logicalStep) * logicalStep;

    // Grid vertikal
    for (let x = startX; x <= endX; x += logicalStep) {
        const px = w/2 + (x * currentScale) + offsetX;
        if (px < 0 || px > w) continue;
        
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
        ctx.stroke();

        if (Math.abs(x % logicalTickStep) < logicalStep * 0.1 && Math.abs(x) > 0.01) {
            const pyZero = h/2 + offsetY;
            const pyDraw = pyZero > 10 && pyZero < h - 10 ? pyZero : (pyZero <= 10 ? 10 : h - 10);
            
            // Format angka untuk membuang desimal yang berlebihan akibat precision issue
            let valText = Number(x.toPrecision(10)).toString();
            ctx.fillText(valText, px + 2, pyDraw - 5);
            ctx.beginPath();
            ctx.moveTo(px, pyDraw - 3);
            ctx.lineTo(px, pyDraw + 3);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        }
    }

    // Grid horizontal
    for (let y = startY; y <= endY; y += logicalStep) {
        const py = h/2 - (y * currentScale) + offsetY;
        if (py < 0 || py > h) continue;

        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();

        if (Math.abs(y % logicalTickStep) < logicalStep * 0.1 && Math.abs(y) > 0.01) {
            const pxZero = w/2 + offsetX;
            const pxDraw = pxZero > 10 && pxZero < w - 20 ? pxZero : (pxZero <= 10 ? 10 : w - 20);
            
            let valText = Number(y.toPrecision(10)).toString();
            ctx.fillText(valText, pxDraw + 5, py - 2);
            ctx.beginPath();
            ctx.moveTo(pxDraw - 3, py);
            ctx.lineTo(pxDraw + 3, py);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        }
    }

    // Sumbu X utama
    const pyZero = h / 2 + offsetY;
    if (pyZero >= 0 && pyZero <= h) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, pyZero);
        ctx.lineTo(w, pyZero);
        ctx.stroke();
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('X', w - 15, pyZero - 8);
    }

    // Sumbu Y utama
    const pxZero = w / 2 + offsetX;
    if (pxZero >= 0 && pxZero <= w) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pxZero, 0);
        ctx.lineTo(pxZero, h);
        ctx.stroke();
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('Y', pxZero + 8, 14);
    }

    // Label Origin
    if (pxZero >= 0 && pxZero <= w && pyZero >= 0 && pyZero <= h) {
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('O', pxZero + 4, pyZero + 12);
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
    // Gradient spektrum: Cyan → Hijau Lime → Kuning Emas
    // Progress 0.0 → Cyan (0, 255, 255)
    // Progress 0.33 → Lime (0, 255, 0)
    // Progress 0.66 → Kuning (255, 255, 0)
    // Progress 1.0 → Emas Cerah (255, 200, 0)
    
    let r, g, b;
    
    if (progress < 0.33) {
        // Cyan ke Hijau: (0, 255, 255) → (0, 255, 0)
        const p = progress / 0.33;
        r = 0;
        g = 255;
        b = Math.round(255 * (1 - p));
    } else if (progress < 0.66) {
        // Hijau ke Kuning: (0, 255, 0) → (255, 255, 0)
        const p = (progress - 0.33) / 0.33;
        r = Math.round(255 * p);
        g = 255;
        b = 0;
    } else {
        // Kuning ke Emas: (255, 255, 0) → (255, 200, 0)
        const p = (progress - 0.66) / 0.34;
        r = 255;
        g = Math.round(255 * (1 - p * 0.22));
        b = 0;
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

    // Cross mark - solid, jelas, TIDAK glow
    ctx.strokeStyle = 'rgb(0, 255, 150)'; // Hijau terang CLEAN
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
    ctx.strokeStyle = 'rgb(0, 200, 120)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label koordinat - MUDAH DIBACA
    ctx.font = 'bold 10px Inter, monospace';
    ctx.fillStyle = 'rgb(0, 255, 150)';
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
 * Fungsi utama render animasi kurva sebagai TITIK-TITIK (DOTS)
 * Setiap titik dirender sebagai lingkaran kecil (filled arc)
 * dengan warna gradient berdasarkan progress parameter t
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

    function drawNextDots() {
        // Hitung berapa titik per frame (agar animasi ~2-3 detik)
        const dotsPerFrame = Math.max(1, Math.floor(totalDataPoints / 150));
        let drawnCount = 0;

        while (currentIdx < totalPoints && drawnCount < dotsPerFrame) {
            const pt = pointsArray[currentIdx];

            // Skip break markers
            if (pt.break) {
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

            // Ukuran titik AKURAT berdasarkan speed (jika tersedia)
            // Titik yang lebih lambat = lebih besar (densitas alami)
            // Titik yang lebih cepat = lebih kecil
            const dotSize = pt.speed !== undefined
                ? getPointSize(pt.speed, 1.2, 2.8)
                : 1.8;

            // Warna titik berdasarkan progress parameter t (CLEAN, SOLID, TANPA GLOW)
            const color = getPointColor(progress);

            // Render dot sebagai filled circle AKURAT
            // Anti-aliasing otomatis oleh canvas
            ctx.beginPath();
            ctx.arc(mapped.px, mapped.py, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Border ultra tipis untuk ketajaman (opsional, bisa dihapus)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

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
    for (let i = 0; i < cachedPointsArray.length; i++) {
        const pt = cachedPointsArray[i];
        if (pt.break) continue;
        
        const mapped = mapCoordinate(pt.x, pt.y, w, h);
        if (!mapped) continue;
        
        const dotSize = pt.speed !== undefined ? getPointSize(pt.speed, 1.2, 2.8) : 1.8;
        const progress = i / Math.max(1, cachedPointsArray.length - 1);
        const color = getPointColor(progress);
        
        ctx.beginPath();
        ctx.arc(mapped.px, mapped.py, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}
