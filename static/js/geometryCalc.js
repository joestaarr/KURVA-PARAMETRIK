/**
 * geometryCalc.js
 * Logika perhitungan matematika untuk kurva parametrik
 * Setiap titik menyimpan data lengkap: koordinat, radian, turunan, kecepatan, kelengkungan
 */

// =====================================================================
// UTILITAS MATEMATIKA (Math Helper Controller)
// =====================================================================

/**
 * [MATH HELPER CONTROLLER]
 * Konversi derajat ke radian
 * Rumus: rad = deg × (π / 180)
 */
function degToRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Hitung panjang busur kumulatif dari array titik-titik
 * Rumus segmen: ds = √((x₂ - x₁)² + (y₂ - y₁)²)
 * Total: S = Σ ds
 */
function computeCumulativeArcLength(points) {
    let cumLen = 0;
    for (let i = 0; i < points.length; i++) {
        if (i === 0 || points[i].break || points[i - 1].break) {
            points[i].arcLength = 0;
            continue;
        }
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        cumLen += Math.sqrt(dx * dx + dy * dy);
        points[i].arcLength = cumLen;
    }
    return cumLen;
}

/**
 * Hitung kelengkungan (curvature) κ di setiap titik
 * Rumus: κ = |x'y'' - y'x''| / (x'² + y'²)^(3/2)
 * Menggunakan finite differences dari titik-titik terdekat
 */
function computeCurvature(points, delta) {
    for (let i = 0; i < points.length; i++) {
        if (points[i].break) {
            points[i].curvature = null;
            continue;
        }

        // Gunakan central difference jika memungkinkan
        const prev = (i > 0 && !points[i - 1].break) ? points[i - 1] : null;
        const next = (i < points.length - 1 && !points[i + 1].break) ? points[i + 1] : null;

        if (prev && next) {
            const dxdt = (next.x - prev.x) / (2 * delta);
            const dydt = (next.y - prev.y) / (2 * delta);
            const d2xdt2 = (next.x - 2 * points[i].x + prev.x) / (delta * delta);
            const d2ydt2 = (next.y - 2 * points[i].y + prev.y) / (delta * delta);

            const numerator = Math.abs(dxdt * d2ydt2 - dydt * d2xdt2);
            const denominator = Math.pow(dxdt * dxdt + dydt * dydt, 1.5);

            points[i].curvature = denominator > 1e-10 ? numerator / denominator : 0;
            points[i].dxdt = dxdt;
            points[i].dydt = dydt;
            points[i].speed = Math.sqrt(dxdt * dxdt + dydt * dydt);
        } else {
            points[i].curvature = 0;
            points[i].dxdt = 0;
            points[i].dydt = 0;
            points[i].speed = 0;
        }
    }
}

// =====================================================================
// LINGKARAN (Math Engine Controller)
// =====================================================================
/**
 * [MATH ENGINE CONTROLLER: CIRCLE] calculateCircle
 * ---------------------------------------------------------------------
 * Fungsi ini bertugas menghitung seluruh titik-titik koordinat untuk Lingkaran.
 * Ia tidak menggambar apapun, hanya memuntahkan data mentah (RAW DATA).
 * 
 * @param {number} xc - Koordinat pusat sumbu X
 * @param {number} yc - Koordinat pusat sumbu Y
 * @param {number} r - Jari-jari lingkaran (radius)
 * @param {number} delta - Interval jarak antar titik (dalam derajat)
 * @param {number} tMin - Titik awal (derajat)
 * @param {number} tMax - Titik akhir (derajat)
 * @returns {Array<Object>} Kumpulan objek titik (x, y, dxdt, dydt, speed, dll)
 * 
 * Rumus Parametrik Lingkaran:
 *   x(t) = xc + r · cos(t)
 *   y(t) = yc + r · sin(t)
 *
 * Turunan Pertama (Kecepatan / dx/dt):
 *   dx/dt = -r · sin(t)
 *   dy/dt = r · cos(t)
 * 
 * Output Speed (Kecepatan): Konstan di semua titik karena jarik-jarik tidak berubah.
 * Kecepatan parametrik:
 *   |v(t)| = √(dx/dt² + dy/dt²) = r  (konstan untuk lingkaran)
 *
 * Kelengkungan:
 *   κ = 1/r  (konstan untuk lingkaran)
 */
function calculateCircle(xc, yc, r, delta, tMin, tMax) {
    const points = [];
    
    // Iterasi dari tMin ke tMax dengan interval delta (dalam derajat)
    for (let t = tMin; t <= tMax; t += delta) {
        // Konversi derajat ke radian untuk fungsi trigonometri
        const rad = degToRad(t);
        const cosT = Math.cos(rad);
        const sinT = Math.sin(rad);

        // Hitung koordinat titik pada lingkaran
        const x = xc + r * cosT;
        const y = yc + r * sinT;

        // Hitung turunan pertama (AKURAT menggunakan rumus analitik)
        const dxdt = -r * sinT;
        const dydt = r * cosT;
        const speed = Math.sqrt(dxdt * dxdt + dydt * dydt); // = r (konstan)

        // Simpan data titik dengan semua informasi matematis
        points.push({
            x, y, t,
            rad: rad,
            cosT: cosT,
            sinT: sinT,
            dxdt: dxdt,
            dydt: dydt,
            speed: speed,
            curvature: 1 / r,  // Kelengkungan konstan
            pointIndex: points.length
        });
    }

    // Hitung panjang busur kumulatif
    const totalArcLength = computeCumulativeArcLength(points);

    // Metadata ringkasan
    points.meta = {
        type: 'circle',
        keliling: 2 * Math.PI * r,
        luas: Math.PI * r * r,
        eksentrisitas: 0,
        totalArcLength: totalArcLength,
        curvatureConst: 1 / r,
        radiusKelengkungan: r,
        titikPusat: { x: xc, y: yc },
        jariJari: r,
        boundingBox: {
            xMin: xc - r, xMax: xc + r,
            yMin: yc - r, yMax: yc + r
        }
    };

    return points;
}

// =====================================================================
// ELIPS (Math Engine Controller)
// =====================================================================
/**
 * [MATH ENGINE CONTROLLER: ELLIPSE] calculateEllipse
 * ---------------------------------------------------------------------
 * Menghitung seluruh titik-titik koordinat untuk Elips.
 *
 * @param {number} xc, yc - Titik pusat
 * @param {number} a - Sumbu Semi-Mayor (Jari-jari arah horizontal)
 * @param {number} b - Sumbu Semi-Minor (Jari-jari arah vertikal)
 * @param {number} delta, tMin, tMax - Parameter iterasi sudut (derajat)
 * @returns {Array<Object>} Kumpulan objek titik
 * 
 * Rumus Parametrik Elips:
 *   x(t) = xc + a · cos(t)
 *   y(t) = yc + b · sin(t)
 *
 * Turunan Pertama (Kecepatan / dx/dt):
 *   dx/dt = -a · sin(t)
 *   dy/dt = b · cos(t)
 * 
 * Karakteristik Speed (Kecepatan): 
 * Berbeda dengan Lingkaran, kecepatan render elips BERVARIASI. Ia melambat 
 * saat berada di tikungan tajam, dan melesat cepat di jalur yang landai.
 * Kecepatan parametrik:
 *   |v(t)| = √(a²sin²t + b²cos²t)
 *
 * Kelengkungan:
 *   κ(t) = ab / (a²sin²t + b²cos²t)^(3/2)
 */
function calculateEllipse(xc, yc, a, b, delta, tMin, tMax) {
    const points = [];
    
    // Iterasi dari tMin ke tMax dengan interval delta (dalam derajat)
    for (let t = tMin; t <= tMax; t += delta) {
        // Konversi derajat ke radian
        const rad = degToRad(t);
        const cosT = Math.cos(rad);
        const sinT = Math.sin(rad);

        // Hitung koordinat titik pada elips
        const x = xc + a * cosT;
        const y = yc + b * sinT;

        // Hitung turunan pertama (AKURAT menggunakan rumus analitik)
        const dxdt = -a * sinT;
        const dydt = b * cosT;
        const speed = Math.sqrt(dxdt * dxdt + dydt * dydt);

        // Kelengkungan analitik AKURAT untuk elips
        const denom = Math.pow(a * a * sinT * sinT + b * b * cosT * cosT, 1.5);
        const curvature = denom > 1e-10 ? (a * b) / denom : 0;

        // Simpan data titik dengan semua informasi matematis
        points.push({
            x, y, t,
            rad: rad,
            cosT: cosT,
            sinT: sinT,
            dxdt: dxdt,
            dydt: dydt,
            speed: speed,
            curvature: curvature,
            pointIndex: points.length
        });
    }

    const totalArcLength = computeCumulativeArcLength(points);

    // Ramanujan Approximation II untuk keliling elips
    const semiMajor = Math.max(a, b);
    const semiMinor = Math.min(a, b);
    const h = Math.pow((semiMajor - semiMinor) / (semiMajor + semiMinor), 2);
    const kelilingApprox = Math.PI * (semiMajor + semiMinor) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

    // Eksentrisitas
    const eksentrisitas = Math.sqrt(1 - (semiMinor * semiMinor) / (semiMajor * semiMajor));

    // Jarak fokus dari pusat
    const c = Math.sqrt(semiMajor * semiMajor - semiMinor * semiMinor);

    points.meta = {
        type: 'ellipse',
        keliling: kelilingApprox,
        luas: Math.PI * a * b,
        eksentrisitas: eksentrisitas,
        totalArcLength: totalArcLength,
        titikPusat: { x: xc, y: yc },
        semiMajor: semiMajor,
        semiMinor: semiMinor,
        jarakFokus: c,
        fokus1: a >= b ? { x: xc - c, y: yc } : { x: xc, y: yc - c },
        fokus2: a >= b ? { x: xc + c, y: yc } : { x: xc, y: yc + c },
        boundingBox: {
            xMin: xc - a, xMax: xc + a,
            yMin: yc - b, yMax: yc + b
        }
    };

    return points;
}

// =====================================================================
// PARABOLA (Math Engine Controller)
// =====================================================================
/**
 * [MATH ENGINE CONTROLLER: PARABOLA] calculateParabola
 * ---------------------------------------------------------------------
 * Menghitung titik-titik koordinat untuk bentuk Parabola.
 * Berbeda dari Lingkaran/Elips yang menggunakan rentang DERAJAT (0-360), 
 * Parabola dirender menggunakan T (waktu/titik sembarang) seperti -10 hingga 10.
 * 
 * @param {number} xc, yc - Titik pusat vertex (puncak parabola)
 * @param {number} a - Jarak fokus (mempengaruhi seberapa "lebar" bukaan kurva)
 * @param {number} delta, tMin, tMax - Rentang parameter nilai T (bukan derajat)
 * @param {string} orientation - Arah bukaan ('up', 'down', 'left', 'right')
 * @returns {Array<Object>} Kumpulan objek titik
 * 
 * Rumus Parametrik Parabola (Contoh Orientasi Ke Atas):
 *   x(t) = xc + t
 *   y(t) = yc + t² / (4a)
 * 
 * Turunan Pertama (dx/dt):
 *   dx/dt = 1
 *   dy/dt = t / (2a)
 * 
 * Sifat Unik Parabola: Ia tidak pernah melengkung kembali/menutup. 
 * Ia membentang terus ke titik tak terhingga. Oleh karena itu, kita membatasi 
 * perulangan dengan tMin dan tMax secara absolut.
 */
function calculateParabola(xc, yc, a, delta, tMin, tMax, orientation) {
    const points = [];
    for (let t = tMin; t <= tMax; t += delta) {
        let x, y, dxdt, dydt;

        switch (orientation) {
            case 'right':
                x = xc + a * t * t;
                y = yc + 2 * a * t;
                dxdt = 2 * a * t;
                dydt = 2 * a;
                break;
            case 'left':
                x = xc - a * t * t;
                y = yc + 2 * a * t;
                dxdt = -2 * a * t;
                dydt = 2 * a;
                break;
            case 'up':
                x = xc + 2 * a * t;
                y = yc + a * t * t;
                dxdt = 2 * a;
                dydt = 2 * a * t;
                break;
            case 'down':
                x = xc + 2 * a * t;
                y = yc - a * t * t;
                dxdt = 2 * a;
                dydt = -2 * a * t;
                break;
            default:
                x = xc + a * t * t;
                y = yc + 2 * a * t;
                dxdt = 2 * a * t;
                dydt = 2 * a;
        }

        const speed = Math.sqrt(dxdt * dxdt + dydt * dydt);
        // Kelengkungan analitik parabola
        const curvature = 1 / (2 * a * Math.pow(1 + t * t, 1.5));

        points.push({
            x, y, t,
            dxdt: dxdt,
            dydt: dydt,
            speed: speed,
            curvature: curvature,
            pointIndex: points.length
        });
    }

    const totalArcLength = computeCumulativeArcLength(points);

    // Vertex di t=0
    let vertexX = xc, vertexY = yc;
    // Lokasi fokus
    let fokusX = xc, fokusY = yc;
    // Direktriks perpendicular
    let latusRectum = 4 * a;

    switch (orientation) {
        case 'right':
            fokusX = xc + a; break;
        case 'left':
            fokusX = xc - a; break;
        case 'up':
            fokusY = yc + a; break;
        case 'down':
            fokusY = yc - a; break;
    }

    points.meta = {
        type: 'parabola',
        totalArcLength: totalArcLength,
        vertex: { x: vertexX, y: vertexY },
        fokus: { x: fokusX, y: fokusY },
        orientation: orientation,
        parameterA: a,
        latusRectum: latusRectum,
        kelengkunganVertex: 1 / (2 * a), // κ di vertex (t=0)
        radiusKelengkunganVertex: 2 * a
    };

    return points;
}

// =====================================================================
// HIPERBOLA (HYPERBOLA)
// =====================================================================
/**
 * [MATH ENGINE CONTROLLER: HYPERBOLA] calculateHyperbola
 * ---------------------------------------------------------------------
 * Menghitung titik-titik koordinat untuk bentuk Hiperbola.
 * Kurva unik yang SELALU memiliki dua cabang yang saling membelakangi.
 *
 * @param {number} xc, yc - Titik pusat di antara dua puncak
 * @param {number} a - Jarak dari titik pusat ke puncak (vertex)
 * @param {number} b - Jarak konjugasi (menentukan asimtot kemiringan)
 * @param {number} delta, tMin, tMax - Parameter sudut (derajat)
 * @param {string} orientation - 'horizontal' (kiri-kanan) atau 'vertical' (atas-bawah)
 * @returns {Array<Object>} Kumpulan objek titik
 * 
 * Rumus Parametrik Hiperbola Horizontal:
 *   x(t) = xc + a · sec(t)   => (sec(t) = 1/cos(t))
 *   y(t) = yc + b · tan(t)   => (tan(t) = sin(t)/cos(t))
 * 
 * Hal Penting: Saat t mencapai tepat 90 atau 270 derajat, nilai sec(t) 
 * dan tan(t) menjadi TAK TERHINGGA (Infinity). Itulah sebabnya kita menggunakan 
 * "if (Math.abs(t % 180) === 90) continue;" untuk melompatinya agar kode tidak crash.
 * 
 * Karena hiperbola terputus di tengah, kita menyisipkan "{ break: true }" 
 * di array agar CanvasAnimator berhenti menarik garis penghubung dari cabang 
 * pertama ke cabang kedua.
 *
 * Rumus Turunan (Horizontal):
 *   dx/dt = a · sec(t)·tan(t)    dy/dt = b · sec²(t)
 *
 * Vertikal:
 *   x(t) = xc + b · tan(t)       y(t) = yc + a · sec(t)
 *   dx/dt = b · sec²(t)          dy/dt = a · sec(t)·tan(t)
 *
 * Properti:
 *   c = √(a² + b²)
 *   Eksentrisitas = c / a
 *   Asimtot: y = ±(b/a)·x  (horizontal)
 *            x = ±(b/a)·y  (vertikal)
 */
function calculateHyperbola(xc, yc, a, b, delta, tMin, tMax, orientation) {
    const points = [];

    function makeBranch(signX, signY, isVertical) {
        for (let t = tMin; t <= tMax; t += delta) {
            if (Math.abs(t % 180) === 90) continue;

            const rad = degToRad(t);
            const cosT = Math.cos(rad);
            const sinT = Math.sin(rad);
            const secT = 1 / cosT;
            const tanT = sinT / cosT;

            let x, y, dxdt, dydt;

            if (isVertical) {
                x = xc + b * tanT * signX;
                y = yc + a * secT * signY;
                dxdt = b * secT * secT * signX;
                dydt = a * secT * tanT * signY;
            } else {
                x = xc + a * secT * signX;
                y = yc + b * tanT * signY;
                dxdt = a * secT * tanT * signX;
                dydt = b * secT * secT * signY;
            }

            if (Math.abs(x) > 5000 || Math.abs(y) > 5000) continue;

            const speed = Math.sqrt(dxdt * dxdt + dydt * dydt);

            points.push({
                x, y, t,
                rad: rad,
                secT: secT,
                tanT: tanT,
                dxdt: dxdt,
                dydt: dydt,
                speed: speed,
                pointIndex: points.length
            });
        }
    }

    if (orientation === 'horizontal') {
        makeBranch(1, 1, false);
        points.push({ break: true });
        makeBranch(-1, 1, false);
    } else if (orientation === 'vertical') {
        makeBranch(1, 1, true);
        points.push({ break: true });
        makeBranch(1, -1, true);
    } else if (orientation === 'left-branch') {
        makeBranch(-1, 1, false);
    } else {
        makeBranch(1, 1, false);
    }

    const totalArcLength = computeCumulativeArcLength(points);
    computeCurvature(points, delta);

    const c = Math.sqrt(a * a + b * b);

    points.meta = {
        type: 'hyperbola',
        totalArcLength: totalArcLength,
        titikPusat: { x: xc, y: yc },
        semiTransverse: a,
        semiConjugate: b,
        jarakFokus: c,
        eksentrisitas: c / a,
        orientation: orientation,
        asimtotSlope: b / a,
        fokus1: orientation !== 'vertical'
            ? { x: xc - c, y: yc }
            : { x: xc, y: yc - c },
        fokus2: orientation !== 'vertical'
            ? { x: xc + c, y: yc }
            : { x: xc, y: yc + c },
        boundingBox: {
            xMin: xc - Math.max(a, b) * 3,
            xMax: xc + Math.max(a, b) * 3,
            yMin: yc - Math.max(a, b) * 3,
            yMax: yc + Math.max(a, b) * 3
        }
    };

    return points;
}
