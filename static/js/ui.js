/**
 * ui.js
 * Menangani logika Event Listener, Form Builder, Panel Analisis Detail,
 * dan Tabel Sampel Titik
 */

const curveSelect = document.getElementById('curveType');
const paramsContainer = document.getElementById('paramsContainer');
const presetGrid = document.getElementById('presetGrid');
const analysisContent = document.getElementById('analysisContent');
const calcTableBody = document.getElementById('calcTableBody');
const btnProcess = document.getElementById('btnProcess');

// =====================================================================
// DEFINISI PARAMETER FORM (Data Controller)
// =====================================================================
/**
 * [DATA CONTROLLER] getParamDefs
 * ---------------------------------------------------------------------
 * Fungsi ini mengelola SKEMA DATA untuk form input. Setiap kurva punya 
 * kebutuhan parameter matematis yang berbeda.
 * 
 * @param {string} curveType - Jenis kurva ('circle', 'ellipse', 'parabola', 'hyperbola')
 * @returns {Array<Object>} Array berisi definisi input (id, label, type, default, step).
 * 
 * Penjelasan Output:
 * - commonParams: Selalu merender titik pusat (xc, yc) dan rentang sudut/waktu (tMin, tMax, delta).
 * - Khusus Parabola/Hiperbola: Terdapat tipe input 'select' untuk orientasi kurva.
 * Data ini tidak langsung tampil di layar, melainkan disuplai ke [UI CONTROLLER].
 */
function getParamDefs(curveType) {
    const commonParams = [
        { id: 'xc', label: 'Pusat X (xc)', type: 'number', default: 0 },
        { id: 'yc', label: 'Pusat Y (yc)', type: 'number', default: 0 },
        { id: 'tMin', label: 'T Min', type: 'number', default: 0 },
        { id: 'tMax', label: 'T Max', type: 'number', default: 360 },
        { id: 'delta', label: 'Interval (Δ)', type: 'number', default: 1, step: 0.1 }
    ];

    switch (curveType) {
        case 'circle':
            return [
                ...commonParams,
                { id: 'r', label: 'Jari-jari (r)', type: 'number', default: 100 }
            ];
        case 'ellipse':
            return [
                ...commonParams,
                { id: 'a', label: 'Jari-jari X (a)', type: 'number', default: 150 },
                { id: 'b', label: 'Jari-jari Y (b)', type: 'number', default: 80 }
            ];
        case 'parabola':
            return [
                { id: 'xc', label: 'Pusat X (xc)', type: 'number', default: 0 },
                { id: 'yc', label: 'Pusat Y (yc)', type: 'number', default: 0 },
                { id: 'tMin', label: 'T Min', type: 'number', default: -10 },
                { id: 'tMax', label: 'T Max', type: 'number', default: 10 },
                { id: 'delta', label: 'Interval (Δ)', type: 'number', default: 0.1, step: 0.01 },
                { id: 'a', label: 'Fokus (a)', type: 'number', default: 10 },
                { id: 'orientation', label: 'Orientasi', type: 'select', options: [
                    { value: 'up', label: 'Buka ke Atas' },
                    { value: 'down', label: 'Buka ke Bawah' },
                    { value: 'right', label: 'Buka ke Kanan' },
                    { value: 'left', label: 'Buka ke Kiri' }
                ], default: 'up'}
            ];
        case 'hyperbola':
            return [
                { id: 'xc', label: 'Pusat X (xc)', type: 'number', default: 0 },
                { id: 'yc', label: 'Pusat Y (yc)', type: 'number', default: 0 },
                { id: 'tMin', label: 'T Min (derajat)', type: 'number', default: -60 },
                { id: 'tMax', label: 'T Max (derajat)', type: 'number', default: 60 },
                { id: 'delta', label: 'Interval (Δ)', type: 'number', default: 1, step: 0.1 },
                { id: 'a', label: 'Sumbu Semi-Mayor (a)', type: 'number', default: 50 },
                { id: 'b', label: 'Sumbu Semi-Minor (b)', type: 'number', default: 40 },
                { id: 'orientation', label: 'Orientasi', type: 'select', options: [
                    { value: 'horizontal', label: 'Horizontal' },
                    { value: 'vertical', label: 'Vertikal' }
                ], default: 'horizontal'}
            ];
    }
}

// =====================================================================
// PRESETS (Library Controller)
// =====================================================================
/**
 * [LIBRARY CONTROLLER] getPresets
 * ---------------------------------------------------------------------
 * Menyimpan 'Blueprints' atau Preset angka cantik yang sudah teruji 
 * menghasilkan visualisasi kurva yang proposional dan simetris di kanvas.
 * 
 * @param {string} curveType - Jenis kurva
 * @returns {Array<Object>} Kumpulan preset siap pakai
 * 
 * Penjelasan Output (Contoh Lingkaran):
 * Mengembalikan array of objects, di mana setiap object punya:
 * - label: Nama tombol preset (misal: "Kecil", "Besar")
 * - params: Object berisi nilai pasti untuk menimpa form (xc, yc, r, tMin, tMax, delta)
 * Catatan Teknis: Semua nilai delta pada Lingkaran & Elips sudah
 * dipastikan merupakan pembagi bulat dari 90 agar render titiknya simetris.
 */
function getPresets(curveType) {
    switch (curveType) {
        case 'circle':
            return [
                { label: 'Kecil', params: { xc: 0, yc: 0, r: 50, tMin: 0, tMax: 360, delta: 45 } },
                { label: 'Sedang', params: { xc: 0, yc: 0, r: 120, tMin: 0, tMax: 360, delta: 18 } },
                { label: 'Besar', params: { xc: 0, yc: 0, r: 200, tMin: 0, tMax: 360, delta: 15 } },
                { label: 'Kanan Atas', params: { xc: 100, yc: 100, r: 80, tMin: 0, tMax: 360, delta: 30 } },
                { label: 'Setengah', params: { xc: 0, yc: 0, r: 150, tMin: 0, tMax: 180, delta: 18 } },
                { label: 'Low-Res (Segi 8)', params: { xc: 0, yc: 0, r: 120, tMin: 0, tMax: 360, delta: 45 } }
            ];
        case 'ellipse':
            return [
                { label: 'Lebar', params: { xc: 0, yc: 0, a: 200, b: 80, tMin: 0, tMax: 360, delta: 18 } },
                { label: 'Tinggi', params: { xc: 0, yc: 0, a: 80, b: 200, tMin: 0, tMax: 360, delta: 18 } },
                { label: 'Mirip Lingkaran', params: { xc: 0, yc: 0, a: 120, b: 100, tMin: 0, tMax: 360, delta: 30 } },
                { label: 'Kiri Bawah', params: { xc: -100, yc: -100, a: 150, b: 50, tMin: 0, tMax: 360, delta: 30 } },
                { label: 'Setengah', params: { xc: 0, yc: 0, a: 180, b: 90, tMin: 0, tMax: 180, delta: 18 } },
                { label: 'Detail Tinggi', params: { xc: 0, yc: 0, a: 150, b: 100, tMin: 0, tMax: 360, delta: 10 } }
            ];
        case 'parabola':
            return [
                { label: 'Lebar Atas', params: { xc: 0, yc: 0, a: 20, orientation: 'up', tMin: -5, tMax: 5, delta: 1 } },
                { label: 'Sempit Atas', params: { xc: 0, yc: -100, a: 5, orientation: 'up', tMin: -10, tMax: 10, delta: 2 } },
                { label: 'Lebar Bawah', params: { xc: 0, yc: 100, a: 15, orientation: 'down', tMin: -6, tMax: 6, delta: 1.5 } },
                { label: 'Kanan', params: { xc: -150, yc: 0, a: 10, orientation: 'right', tMin: -7.5, tMax: 7.5, delta: 1.5 } },
                { label: 'Kiri', params: { xc: 150, yc: 0, a: 10, orientation: 'left', tMin: -7.5, tMax: 7.5, delta: 1.5 } },
                { label: 'Titik Rapat', params: { xc: 0, yc: 0, a: 10, orientation: 'up', tMin: -8, tMax: 8, delta: 0.5 } }
            ];
        case 'hyperbola':
            return [
                { label: 'H. Standar', params: { xc: 0, yc: 0, a: 50, b: 30, orientation: 'horizontal', tMin: -60, tMax: 60, delta: 10 } },
                { label: 'H. Lebar', params: { xc: 0, yc: 0, a: 100, b: 40, orientation: 'horizontal', tMin: -75, tMax: 75, delta: 15 } },
                { label: 'H. Sempit', params: { xc: 0, yc: 0, a: 30, b: 80, orientation: 'horizontal', tMin: -50, tMax: 50, delta: 10 } },
                { label: 'V. Standar', params: { xc: 0, yc: 0, a: 30, b: 50, orientation: 'vertical', tMin: -60, tMax: 60, delta: 10 } },
                { label: 'H. Jauh', params: { xc: 0, yc: 0, a: 150, b: 40, orientation: 'horizontal', tMin: -60, tMax: 60, delta: 12 } },
                { label: 'Ultra Detail', params: { xc: 0, yc: 0, a: 40, b: 40, orientation: 'horizontal', tMin: -80, tMax: 80, delta: 5 } }
            ];
    }
}

// =====================================================================
// FORM BUILDER (UI Controller)
// =====================================================================
/**
 * [UI CONTROLLER] buildForm
 * ---------------------------------------------------------------------
 * Fungsi ini bertindak sebagai DOM Manipulator. Ia mengambil skema data 
 * dari [DATA CONTROLLER] lalu menyuntikkannya menjadi elemen HTML sungguhan.
 * 
 * @param {string} curveType - Jenis kurva aktif
 * 
 * Penjelasan Proses:
 * 1. Mengosongkan div paramsContainer.
 * 2. Me-looping array dari getParamDefs().
 * 3. Jika type === 'select', ia membuat <select> dan mengisinya dengan <option>.
 * 4. Jika type === 'number', ia membuat <input type="number">.
 * 5. Menyematkan semua elemen tersebut ke dalam DOM agar tampil di layar.
 */
function buildForm(curveType) {
    const params = getParamDefs(curveType);
    paramsContainer.innerHTML = '';

    params.forEach(param => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', `param_${param.id}`);
        label.textContent = param.label;

        let input;
        if (param.type === 'select') {
            input = document.createElement('select');
            input.id = `param_${param.id}`;
            param.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (opt.value === param.default) option.selected = true;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = 'number';
            input.id = `param_${param.id}`;
            input.value = param.default;
            if (param.step) input.step = param.step;
        }

        div.appendChild(label);
        div.appendChild(input);
        paramsContainer.appendChild(div);
    });
}

// =====================================================================
// PRESET BUILDER (UI Controller)
// =====================================================================
/**
 * [UI CONTROLLER]
 * Fungsi buildPresets() membuat tombol-tombol HTML untuk setiap preset.
 * Jika diklik, ia akan memuat parameter ke form, dan langsung memicu proses.
 */
function buildPresets(curveType) {
    const presets = getPresets(curveType);
    presetGrid.innerHTML = '';

    presets.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'btn-preset';
        btn.textContent = preset.label;
        btn.addEventListener('click', () => {
            for (const key in preset.params) {
                const input = document.getElementById(`param_${key}`);
                if (input) {
                    input.value = preset.params[key];
                }
            }
        });
        presetGrid.appendChild(btn);
    });
}

// =====================================================================
// FORM VALUE READER
// =====================================================================
function getFormValues(curveType) {
    const params = getParamDefs(curveType);
    const values = {};
    params.forEach(param => {
        const input = document.getElementById(`param_${param.id}`);
        if (param.type === 'number') {
            values[param.id] = parseFloat(input.value);
        } else {
            values[param.id] = input.value;
        }
    });
    return values;
}

// =====================================================================
// HELPER: Format angka dengan akurasi tinggi
// =====================================================================
/**
 * Format angka dengan presisi yang ditentukan
 * Menampilkan "—" untuk nilai undefined/null
 * Menampilkan "∞" untuk nilai tak hingga
 */
function fmt(val, decimals = 4) {
    if (val === undefined || val === null || isNaN(val)) return '—';
    if (!isFinite(val)) return '∞';
    
    // Pembulatan dengan presisi tinggi
    return Number(val).toFixed(decimals);
}

// =====================================================================
// PANEL ANALISIS DETAIL
// =====================================================================
function updateAnalysisPanel(curveType, values, points) {
    const dataPoints = points.filter(p => !p.break);
    const totalPoints = dataPoints.length;
    const meta = points.meta || {};

    let originStory = '';
    let formulaStory = '';
    let calcStory = '';

    switch (curveType) {
        case 'circle': {
            const r = values.r;
            originStory = `Lingkaran terbentuk dengan cara menempatkan sebuah paku di tengah (titik pusat), lalu menarik tali sepanjang <strong>${r} piksel (Jari-jari)</strong>, dan memutarnya satu putaran penuh (360 derajat). Setiap sudut putaran (dari ${values.tMin}° hingga ${values.tMax}°) akan dicatat sebagai satu buah titik di layar. Karena jarak talinya selalu sama, bentuknya bulat sempurna!`;
            
            formulaStory = `
                Secara matematis, komputer menggunakan fungsi Trigonometri untuk menggambar kurva ini:<br>
                <ul>
                    <li><strong>Titik Mendatar (X)</strong> = Pusat X + (Jari-jari × Cosinus sudut)</li>
                    <li><strong>Titik Tegak (Y)</strong> = Pusat Y + (Jari-jari × Sinus sudut)</li>
                    <li><strong>Turunan X (Kecepatan Horizontal)</strong> = -Jari-jari × Sinus sudut</li>
                    <li><strong>Turunan Y (Kecepatan Vertikal)</strong> = Jari-jari × Cosinus sudut</li>
                </ul>
                <div class="eq-formula">$$ x = ${values.xc} + ${r} \\cos(t) \\quad \\text{dan} \\quad y = ${values.yc} + ${r} \\sin(t) $$</div>
                <div class="eq-formula">$$ \\frac{dx}{dt} = -${r} \\sin(t) \\quad \\text{dan} \\quad \\frac{dy}{dt} = ${r} \\cos(t) $$</div>
            `;

            if (totalPoints > 0) {
                const pt = dataPoints[0]; // Ambil titik pertama
                calcStory = `
                    Mari kita bedah perhitungan nyata pada <strong>Titik Pertama (T = ${fmt(pt.t, 1)}°)</strong>:<br>
                    <ol>
                        <li><strong>Konversi Sudut:</strong> Komputer mengubah derajat ke radian: <code>${fmt(pt.t, 1)} × (π / 180) = ${fmt(pt.rad, 4)} radian</code>.</li>
                        <li><strong>Hitung Cos & Sin:</strong> Didapat nilai <code>Cos(${fmt(pt.rad, 4)}) = ${fmt(Math.cos(pt.rad), 4)}</code> dan <code>Sin(${fmt(pt.rad, 4)}) = ${fmt(Math.sin(pt.rad), 4)}</code>.</li>
                        <li><strong>Kalkulasi Titik X:</strong> Pusat X (${values.xc}) + (${r} × ${fmt(Math.cos(pt.rad), 4)}) = <strong>${fmt(pt.x, 3)}</strong>.</li>
                        <li><strong>Kalkulasi Titik Y:</strong> Pusat Y (${values.yc}) + (${r} × ${fmt(Math.sin(pt.rad), 4)}) = <strong>${fmt(pt.y, 3)}</strong>.</li>
                        <li><strong>Kecepatan (Speed):</strong> Karena ini lingkaran, kecepatan akan selalu konstan sebesar jari-jarinya, yaitu <strong>${fmt(pt.speed, 2)}</strong>.</li>
                    </ol>
                    Maka titik pertama sukses diletakkan pada koordinat <strong>(${fmt(pt.x, 3)}, ${fmt(pt.y, 3)})</strong>!
                `;
            } else {
                calcStory = "Tidak ada titik yang dirender.";
            }
            break;
        }
        case 'ellipse': {
            const a = values.a, b = values.b;
            originStory = `Elips sebenarnya adalah lingkaran yang "ditarik" memanjang atau meninggi. Kalau lingkaran punya satu jari-jari tetap, Elips punya dua: <strong>Lebar mendatar (${a} piksel)</strong> dan <strong>Tinggi vertikal (${b} piksel)</strong>. Karena tarikannya tidak seimbang, bentuknya jadi lonjong.`;
            
            formulaStory = `
                Komputer menggunakan rumus yang mirip lingkaran, tapi dikali dengan nilai tarikan (Jari-jari A dan B) yang berbeda:<br>
                <ul>
                    <li><strong>Titik X</strong> = Pusat X + (Lebar Horizontal × Cosinus sudut)</li>
                    <li><strong>Titik Y</strong> = Pusat Y + (Tinggi Vertikal × Sinus sudut)</li>
                    <li><strong>Turunan X</strong> = -Lebar Horizontal × Sinus sudut</li>
                    <li><strong>Turunan Y</strong> = Tinggi Vertikal × Cosinus sudut</li>
                </ul>
                <div class="eq-formula">$$ x = ${values.xc} + ${a} \\cos(t) \\quad \\text{dan} \\quad y = ${values.yc} + ${b} \\sin(t) $$</div>
                <div class="eq-formula">$$ \\frac{dx}{dt} = -${a} \\sin(t) \\quad \\text{dan} \\quad \\frac{dy}{dt} = ${b} \\cos(t) $$</div>
            `;

            if (totalPoints > 0) {
                const pt = dataPoints[0];
                calcStory = `
                    Inilah bedah perhitungan nyata pada <strong>Titik Pertama (T = ${fmt(pt.t, 1)}°)</strong>:<br>
                    <ol>
                        <li><strong>Sudut Radian:</strong> <code>${fmt(pt.t, 1)} × (π / 180) = ${fmt(pt.rad, 4)} radian</code>.</li>
                        <li><strong>Hitung X:</strong> Pusat X (${values.xc}) + (Lebar ${a} × Cos(${fmt(pt.rad, 4)})) = <strong>${fmt(pt.x, 3)}</strong>.</li>
                        <li><strong>Hitung Y:</strong> Pusat Y (${values.yc}) + (Tinggi ${b} × Sin(${fmt(pt.rad, 4)})) = <strong>${fmt(pt.y, 3)}</strong>.</li>
                        <li><strong>Vektor Turunan:</strong> dx/dt = <strong>${fmt(pt.dxdt, 3)}</strong>, dy/dt = <strong>${fmt(pt.dydt, 3)}</strong>.</li>
                        <li><strong>Kecepatan (Speed):</strong> √(dx/dt² + dy/dt²) = <strong>${fmt(pt.speed, 3)}</strong>. <br>
                        <em>Perhatikan di tabel, kecepatan elips ini akan bervariasi! Berbeda dengan lingkaran yang statis.</em></li>
                    </ol>
                    Maka titik ini menempati posisi <strong>(${fmt(pt.x, 3)}, ${fmt(pt.y, 3)})</strong> di kanvas.
                `;
            } else {
                calcStory = "Tidak ada titik yang dirender.";
            }
            break;
        }
        case 'parabola': {
            const a = values.a;
            originStory = `Parabola itu seperti lintasan bola yang dilempar ke udara lalu jatuh kembali. Kurva ini punya satu titik "Puncak/Dasar", lalu membuka ke satu arah (atas/bawah/kiri/kanan) sampai tak terhingga. Tingkat "kelebaran" bukaan ini ditentukan oleh nilai fokus sebesar <strong>${a}</strong>.`;
            
            formulaStory = `
                Berbeda dengan lingkaran yang pakai Cos/Sin, parabola menggunakan perhitungan "Kuadrat" (pangkat dua) pada salah satu sumbunya saja:<br>
                <ul>
                    <li><strong>Sumbu Lintasan Linier:</strong> Bergerak lurus biasa seiring bertambahnya T.</li>
                    <li><strong>Sumbu Lengkungan Kuadratik:</strong> Semakin lama bergeraknya semakin cepat melengkung (dikalikan nilai T²).</li>
                </ul>
                <div class="eq-formula">Orientasi Vertikal (Atas/Bawah):<br> $$ x = x_c + t \\quad \\text{dan} \\quad y = y_c + \\frac{t^2}{4a} $$</div>
                <div class="eq-formula">Orientasi Horizontal (Kanan/Kiri):<br> $$ x = x_c + \\frac{t^2}{4a} \\quad \\text{dan} \\quad y = y_c + t $$</div>
            `;

            if (totalPoints > 0) {
                const pt = dataPoints[0];
                calcStory = `
                    Mari kita bedah nilai pada <strong>Titik Awal T = ${fmt(pt.t, 2)}</strong>:<br>
                    <ol>
                        <li><strong>Catatan:</strong> Pada Parabola, parameter T bukanlah derajat sudut, melainkan unit interval murni (seperti detik pada waktu).</li>
                        <li><strong>Kalkulasi Linier:</strong> Pada sumbu lurus, koordinatnya hanya ditambah T. Jika orientasi vertikal, X = Pusat(${values.xc}) + T(${fmt(pt.t, 2)}).</li>
                        <li><strong>Kalkulasi Kuadratik:</strong> Pada sumbu lengkung, nilainya membesar secara kuadratik, menghasilkan sumbu dominan = <strong>${fmt(values.orientation === 'up' || values.orientation === 'down' ? pt.y : pt.x, 3)}</strong>.</li>
                        <li><strong>Vektor Turunan:</strong> Nilai perubahan dx/dt = <strong>${fmt(pt.dxdt, 3)}</strong>, dan dy/dt = <strong>${fmt(pt.dydt, 3)}</strong>.</li>
                    </ol>
                    Hasilnya, titik terluar ini berada di posisi koordinat <strong>(${fmt(pt.x, 3)}, ${fmt(pt.y, 3)})</strong>.
                `;
            } else {
                calcStory = "Tidak ada titik yang dirender.";
            }
            break;
        }
        case 'hyperbola': {
            const a = values.a, b = values.b;
            originStory = `Hiperbola adalah kurva yang paling unik. Bentuknya seperti dua bukaan yang saling membelakangi dan menjauh sampai ke ujung alam semesta tanpa pernah menyatu. Jarak dari pusat ke bukaan terdekatnya (verteks) adalah <strong>${a} piksel</strong>.`;
            
            formulaStory = `
                Hiperbola menggunakan fungsi trigonometri Sekan (Sec) dan Tangen (Tan). Karena sifat fungsi ini nilainya "meledak" tak terbatas mendekati sudut 90/270 derajat, kurvanya menjauh tanpa batas mengikuti asimtot:<br>
                <ul>
                    <li>Sumbu Transversal (Terbelah): menggunakan fungsi Sekan (Sec).</li>
                    <li>Sumbu Konjugat (Pasangan): menggunakan fungsi Tangen (Tan).</li>
                </ul>
                <div class="eq-formula">Horizontal:<br> $$ x = x_c + a \\sec(t) \\quad \\text{dan} \\quad y = y_c + b \\tan(t) $$</div>
                <div class="eq-formula">Vertikal:<br> $$ x = x_c + b \\tan(t) \\quad \\text{dan} \\quad y = y_c + a \\sec(t) $$</div>
            `;

            if (totalPoints > 0) {
                const pt = dataPoints[0];
                calcStory = `
                    Perhatikan titik perhitungan nyata pada <strong>Sudut T = ${fmt(pt.t, 1)}°</strong>:<br>
                    <ol>
                        <li><strong>Konversi Sudut:</strong> <code>${fmt(pt.t, 1)} × (π / 180) = ${fmt(pt.rad, 4)} radian</code>.</li>
                        <li><strong>Fungsi Trigonometri:</strong> Nilai <code>Sec(T) = ${fmt(pt.secT, 4)}</code> dan <code>Tan(T) = ${fmt(pt.tanT, 4)}</code>. <br>
                        <em>Catatan: Nilai ini dikalkulasi menggunakan 1/Cos(T) untuk secan.</em></li>
                        <li><strong>Kalkulasi Koordinat Akhir:</strong> Berdasarkan rumus, titik ini dirender pada X = <strong>${fmt(pt.x, 3)}</strong> dan Y = <strong>${fmt(pt.y, 3)}</strong>.</li>
                        <li><strong>Kecepatan (Speed):</strong> Seiring sudut T mendekati 90 atau 270 derajat, titik akan bergerak semakin liar dan cepat hingga kecepatannya mencapai <strong>${fmt(pt.speed, 1)} px/step</strong>. Pada batas tersebut, garis kurva sengaja kita putus (break) agar tidak menghubungkan titik dari kutub utara ke selatan kanvas secara acak.</li>
                    </ol>
                `;
            } else {
                calcStory = "Tidak ada titik yang dirender.";
            }
            break;
        }
    }

    // Render panel utama dengan struktur cerita
    const html = `
        <div class="edu-section">
            <h4>🌟 Dari Mana Titik-Titik Ini Berasal?</h4>
            <p>${originStory}</p>
        </div>
        <div class="edu-section">
            <h4>📐 Rumus yang Digunakan</h4>
            <p>${formulaStory}</p>
        </div>
        <div class="edu-section">
            <h4>🧮 Contoh Langkah Perhitungan</h4>
            <p>${calcStory}</p>
        </div>
    `;
    analysisContent.innerHTML = html;
    if (window.MathJax) {
        MathJax.typesetPromise([analysisContent]).catch((err) => console.log(err.message));
    }

    // Isi tabel sampel perhitungan
    updateCalcTable(dataPoints, curveType);
}

// =====================================================================
// TABEL PERHITUNGAN DETAIL (Data Render Controller)
// =====================================================================
/**
 * [DATA RENDER CONTROLLER]
 * Fungsi updateCalcTable() menerima kumpulan data koordinat (dataPoints)
 * dari Main Controller, lalu menyaringnya (maksimal 20 sampel) untuk 
 * dirender menjadi baris tabel HTML agar mudah dipelajari.
 */
function updateCalcTable(dataPoints, curveType) {
    if (!calcTableBody) return;

    // Ambil sampel titik (max 20 titik merata)
    const maxSamples = 20;
    const step = Math.max(1, Math.floor(dataPoints.length / maxSamples));
    const samples = [];
    for (let i = 0; i < dataPoints.length; i += step) {
        samples.push(dataPoints[i]);
        if (samples.length >= maxSamples) break;
    }
    // Selalu sertakan titik terakhir
    if (samples.length > 0 && samples[samples.length - 1] !== dataPoints[dataPoints.length - 1]) {
        samples.push(dataPoints[dataPoints.length - 1]);
    }

    let rows = '';
    samples.forEach((pt, idx) => {
        // Format dengan presisi tinggi untuk akurasi maksimal
        const tDisp = fmt(pt.t, 2);           // Parameter t: 2 desimal
        const radDisp = pt.rad !== undefined ? fmt(pt.rad, 4) : fmt(degToRad(pt.t), 4);  // Radian: 4 desimal
        const xDisp = fmt(pt.x, 3);           // Koordinat X: 3 desimal untuk akurasi
        const yDisp = fmt(pt.y, 3);           // Koordinat Y: 3 desimal untuk akurasi
        const dxDisp = pt.dxdt !== undefined ? fmt(pt.dxdt, 3) : '—';  // dx/dt: 3 desimal
        const dyDisp = pt.dydt !== undefined ? fmt(pt.dydt, 3) : '—';  // dy/dt: 3 desimal
        const speedDisp = pt.speed !== undefined ? fmt(pt.speed, 3) : '—';  // Speed: 3 desimal
        const kDisp = pt.curvature !== undefined && pt.curvature !== null ? fmt(pt.curvature, 6) : '—';  // Curvature: 6 desimal

        rows += `
            <tr>
                <td>${pt.pointIndex !== undefined ? pt.pointIndex : idx}</td>
                <td>${tDisp}</td>
                <td>${radDisp}</td>
                <td class="coord-cell">${xDisp}</td>
                <td class="coord-cell">${yDisp}</td>
                <td>${dxDisp}</td>
                <td>${dyDisp}</td>
                <td>${speedDisp}</td>
                <td>${kDisp}</td>
            </tr>
        `;
    });

    calcTableBody.innerHTML = rows;

    // Tampilkan container tabel
    const tableContainer = document.getElementById('calcTableContainer');
    if (tableContainer) {
        tableContainer.style.display = 'block';
    }
}

// =====================================================================
// EVENT LISTENERS (Main Controller / Hub)
// =====================================================================

// Perbarui form saat memilih jenis kurva lain
curveSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    buildForm(type);
    buildPresets(type);
    analysisContent.innerHTML = '<p>Klik "Proses Gambar" untuk melihat analisis.</p>';
    // Sembunyikan tabel
    const tableContainer = document.getElementById('calcTableContainer');
    if (tableContainer) tableContainer.style.display = 'none';
});

/**
 * [MAIN EVENT CONTROLLER / HUB] btnProcess.addEventListener
 * ---------------------------------------------------------------------
 * Ini adalah JANTUNG UTAMA dari aplikasi (Entry Point Eksekusi).
 * Dipicu setiap kali pengguna menekan tombol "Proses Gambar".
 * 
 * Alur Kerja (Workflow):
 * 1. MENGAMBIL NILAI (Input): Membaca state tipe kurva dan menyedot seluruh 
 *    angka yang diketik user dari form menggunakan getFormValues().
 * 2. PROSES MATEMATIKA (Logic): Mengoper angka-angka tersebut ke [MATH ENGINE CONTROLLER]
 *    (calculateCircle, calculateEllipse, dll) di file geometryCalc.js.
 *    -> Outputnya: Array of Point Objects.
 * 3. KALKULASI BOUNDING BOX (Auto-Zoom): Mencari titik ekstrem (min/max X dan Y) 
 *    dari hasil kalkulasi matematika, lalu menyimpannya di points.meta.boundingBox 
 *    agar Kanvas tahu seberapa besar dia harus melakukan Zoom otomatis.
 * 4. RENDER TEKS (UI): Memanggil updateAnalysisPanel() untuk merender cerita dan rumus,
 *    serta updateCalcTable() untuk menampilkan data tabular.
 * 5. RENDER GRAFIK (Output): Memanggil animateCurve() ke canvasAnimator.js untuk 
 *    melukis titik-titik tersebut secara visual.
 */
// Klik Proses Gambar
btnProcess.addEventListener('click', () => {
    const type = curveSelect.value;
    const vals = getFormValues(type);

    let points = [];

    switch (type) {
        case 'circle':
            points = calculateCircle(vals.xc, vals.yc, vals.r, vals.delta, vals.tMin, vals.tMax);
            break;
        case 'ellipse':
            points = calculateEllipse(vals.xc, vals.yc, vals.a, vals.b, vals.delta, vals.tMin, vals.tMax);
            break;
        case 'parabola':
            points = calculateParabola(vals.xc, vals.yc, vals.a, vals.delta, vals.tMin, vals.tMax, vals.orientation);
            break;
        case 'hyperbola':
            points = calculateHyperbola(vals.xc, vals.yc, vals.a, vals.b, vals.delta, vals.tMin, vals.tMax, vals.orientation);
            break;
    }

    // Hitung bounding box secara dinamis jika belum ada (untuk fitur Auto-Zoom)
    if (points && points.length > 0) {
        if (!points.meta) points.meta = {};
        if (!points.meta.boundingBox) {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            points.forEach(p => {
                if (p.break) return; // lewati titik putus pada hiperbola
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });
            // Berikan margin ekstra jika ukurannya terlalu kecil/datar
            if (minX !== Infinity) {
                if (maxX - minX < 1) { maxX += 5; minX -= 5; }
                if (maxY - minY < 1) { maxY += 5; minY -= 5; }
                points.meta.boundingBox = { xMin: minX, xMax: maxX, yMin: minY, yMax: maxY };
            }
        }
    }

    // Update panel analisis detail
    updateAnalysisPanel(type, vals, points);

    // Kirim titik ke canvasAnimator.js untuk dirender sebagai DOTS
    animateCurve(points);
});

// Load awal
window.addEventListener('DOMContentLoaded', () => {
    buildForm('circle');
    buildPresets('circle');
});
