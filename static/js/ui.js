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
// DEFINISI PARAMETER FORM
// =====================================================================
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
                    { value: 'horizontal', label: 'Horizontal (Kanan)' },
                    { value: 'left-branch', label: 'Horizontal (Kiri)' },
                    { value: 'vertical', label: 'Vertikal' }
                ], default: 'horizontal'}
            ];
    }
}

// =====================================================================
// PRESETS
// =====================================================================
function getPresets(curveType) {
    switch (curveType) {
        case 'circle':
            return [
                { label: 'Kecil', params: { xc: 0, yc: 0, r: 50, tMin: 0, tMax: 360, delta: 2 } },
                { label: 'Sedang', params: { xc: 0, yc: 0, r: 120, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Besar', params: { xc: 0, yc: 0, r: 200, tMin: 0, tMax: 360, delta: 0.5 } },
                { label: 'Kanan Atas', params: { xc: 100, yc: 100, r: 80, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Setengah', params: { xc: 0, yc: 0, r: 150, tMin: 0, tMax: 180, delta: 1 } },
                { label: 'Low-Res (Segi)', params: { xc: 0, yc: 0, r: 120, tMin: 0, tMax: 360, delta: 60 } }
            ];
        case 'ellipse':
            return [
                { label: 'Lebar', params: { xc: 0, yc: 0, a: 200, b: 80, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Tinggi', params: { xc: 0, yc: 0, a: 80, b: 200, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Mirip Lingkaran', params: { xc: 0, yc: 0, a: 120, b: 100, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Kiri Bawah', params: { xc: -100, yc: -100, a: 150, b: 50, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Setengah', params: { xc: 0, yc: 0, a: 180, b: 90, tMin: 0, tMax: 180, delta: 1 } },
                { label: 'Detail Tinggi', params: { xc: 0, yc: 0, a: 150, b: 100, tMin: 0, tMax: 360, delta: 0.2 } }
            ];
        case 'parabola':
            return [
                { label: 'Lebar Atas', params: { xc: 0, yc: 0, a: 20, orientation: 'up', tMin: -5, tMax: 5, delta: 0.05 } },
                { label: 'Sempit Atas', params: { xc: 0, yc: -100, a: 5, orientation: 'up', tMin: -10, tMax: 10, delta: 0.1 } },
                { label: 'Lebar Bawah', params: { xc: 0, yc: 100, a: 15, orientation: 'down', tMin: -6, tMax: 6, delta: 0.1 } },
                { label: 'Kanan', params: { xc: -150, yc: 0, a: 10, orientation: 'right', tMin: -8, tMax: 8, delta: 0.1 } },
                { label: 'Kiri', params: { xc: 150, yc: 0, a: 10, orientation: 'left', tMin: -8, tMax: 8, delta: 0.1 } },
                { label: 'Titik Rapat', params: { xc: 0, yc: 0, a: 10, orientation: 'up', tMin: -8, tMax: 8, delta: 0.01 } }
            ];
        case 'hyperbola':
            return [
                { label: 'H. Standar', params: { xc: 0, yc: 0, a: 50, b: 30, orientation: 'horizontal', tMin: -60, tMax: 60, delta: 0.5 } },
                { label: 'H. Lebar', params: { xc: 0, yc: 0, a: 100, b: 40, orientation: 'horizontal', tMin: -70, tMax: 70, delta: 1 } },
                { label: 'H. Sempit', params: { xc: 0, yc: 0, a: 30, b: 80, orientation: 'horizontal', tMin: -50, tMax: 50, delta: 0.5 } },
                { label: 'V. Standar', params: { xc: 0, yc: 0, a: 30, b: 50, orientation: 'vertical', tMin: -60, tMax: 60, delta: 0.5 } },
                { label: 'Cabang Kiri', params: { xc: 0, yc: 0, a: 50, b: 40, orientation: 'left-branch', tMin: -65, tMax: 65, delta: 0.5 } },
                { label: 'Ultra Detail', params: { xc: 0, yc: 0, a: 40, b: 40, orientation: 'horizontal', tMin: -80, tMax: 80, delta: 0.05 } }
            ];
    }
}

// =====================================================================
// FORM BUILDER
// =====================================================================
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
// PRESET BUILDER
// =====================================================================
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

    let equationHTML = '';
    let propsHTML = '';
    let derivHTML = '';
    let geometryHTML = '';

    switch (curveType) {
        case 'circle': {
            const r = values.r;
            equationHTML = `
                <div class="eq-block">
                    <span class="eq-label">Persamaan Parametrik:</span>
                    <div class="eq-formula">x(t) = ${values.xc} + ${r} · cos(t)</div>
                    <div class="eq-formula">y(t) = ${values.yc} + ${r} · sin(t)</div>
                </div>
                <div class="eq-block">
                    <span class="eq-label">Persamaan Kartesian:</span>
                    <div class="eq-formula">(x − ${values.xc})² + (y − ${values.yc})² = ${r}² = ${r*r}</div>
                </div>
            `;
            derivHTML = `
                <div class="eq-block">
                    <span class="eq-label">Turunan Pertama:</span>
                    <div class="eq-formula">dx/dt = −${r} · sin(t)</div>
                    <div class="eq-formula">dy/dt = ${r} · cos(t)</div>
                </div>
                <div class="eq-block">
                    <span class="eq-label">Kecepatan Parametrik:</span>
                    <div class="eq-formula">|v(t)| = √(dx/dt² + dy/dt²) = ${r} (konstan)</div>
                </div>
            `;
            geometryHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Keliling</span><span class="prop-val">${fmt(meta.keliling, 2)} px</span></div>
                    <div class="prop-item"><span class="prop-key">Luas</span><span class="prop-val">${fmt(meta.luas, 2)} px²</span></div>
                    <div class="prop-item"><span class="prop-key">Kelengkungan κ</span><span class="prop-val">${fmt(meta.curvatureConst, 6)} (konstan)</span></div>
                    <div class="prop-item"><span class="prop-key">Radius Kelengkungan</span><span class="prop-val">${fmt(meta.radiusKelengkungan, 2)} px</span></div>
                    <div class="prop-item"><span class="prop-key">Eksentrisitas</span><span class="prop-val">0 (lingkaran sempurna)</span></div>
                    <div class="prop-item"><span class="prop-key">Busur Terukur</span><span class="prop-val">${fmt(meta.totalArcLength, 2)} px</span></div>
                </div>
            `;
            propsHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Pusat</span><span class="prop-val">(${values.xc}, ${values.yc})</span></div>
                    <div class="prop-item"><span class="prop-key">Jari-jari</span><span class="prop-val">${r} px</span></div>
                    <div class="prop-item"><span class="prop-key">Diameter</span><span class="prop-val">${r * 2} px</span></div>
                    <div class="prop-item"><span class="prop-key">Bounding Box</span><span class="prop-val">[${values.xc - r}, ${values.xc + r}] × [${values.yc - r}, ${values.yc + r}]</span></div>
                </div>
            `;
            break;
        }
        case 'ellipse': {
            const a = values.a, b = values.b;
            equationHTML = `
                <div class="eq-block">
                    <span class="eq-label">Persamaan Parametrik:</span>
                    <div class="eq-formula">x(t) = ${values.xc} + ${a} · cos(t)</div>
                    <div class="eq-formula">y(t) = ${values.yc} + ${b} · sin(t)</div>
                </div>
                <div class="eq-block">
                    <span class="eq-label">Persamaan Kartesian:</span>
                    <div class="eq-formula">(x − ${values.xc})²/${a}² + (y − ${values.yc})²/${b}² = 1</div>
                </div>
            `;
            derivHTML = `
                <div class="eq-block">
                    <span class="eq-label">Turunan Pertama:</span>
                    <div class="eq-formula">dx/dt = −${a} · sin(t)</div>
                    <div class="eq-formula">dy/dt = ${b} · cos(t)</div>
                </div>
                <div class="eq-block">
                    <span class="eq-label">Kecepatan Parametrik:</span>
                    <div class="eq-formula">|v(t)| = √(${a}²sin²t + ${b}²cos²t) — bervariasi</div>
                </div>
                <div class="eq-block">
                    <span class="eq-label">Kelengkungan:</span>
                    <div class="eq-formula">κ(t) = ${a}·${b} / (${a}²sin²t + ${b}²cos²t)^(3/2)</div>
                </div>
            `;
            geometryHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Keliling (Ramanujan)</span><span class="prop-val">≈ ${fmt(meta.keliling, 2)} px</span></div>
                    <div class="prop-item"><span class="prop-key">Luas</span><span class="prop-val">${fmt(meta.luas, 2)} px²</span></div>
                    <div class="prop-item"><span class="prop-key">Eksentrisitas</span><span class="prop-val">${fmt(meta.eksentrisitas, 6)}</span></div>
                    <div class="prop-item"><span class="prop-key">Jarak Fokus (c)</span><span class="prop-val">${fmt(meta.jarakFokus, 2)} px</span></div>
                    <div class="prop-item"><span class="prop-key">Fokus 1</span><span class="prop-val">(${fmt(meta.fokus1?.x, 1)}, ${fmt(meta.fokus1?.y, 1)})</span></div>
                    <div class="prop-item"><span class="prop-key">Fokus 2</span><span class="prop-val">(${fmt(meta.fokus2?.x, 1)}, ${fmt(meta.fokus2?.y, 1)})</span></div>
                    <div class="prop-item"><span class="prop-key">Busur Terukur</span><span class="prop-val">${fmt(meta.totalArcLength, 2)} px</span></div>
                </div>
            `;
            propsHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Pusat</span><span class="prop-val">(${values.xc}, ${values.yc})</span></div>
                    <div class="prop-item"><span class="prop-key">Semi-Mayor</span><span class="prop-val">${meta.semiMajor} px</span></div>
                    <div class="prop-item"><span class="prop-key">Semi-Minor</span><span class="prop-val">${meta.semiMinor} px</span></div>
                    <div class="prop-item"><span class="prop-key">Rasio a:b</span><span class="prop-val">${fmt(a/b, 3)}</span></div>
                </div>
            `;
            break;
        }
        case 'parabola': {
            const a = values.a;
            const ori = values.orientation;
            let eqX = '', eqY = '', dX = '', dY = '';

            switch (ori) {
                case 'right':
                    eqX = `x(t) = ${values.xc} + ${a}·t²`; eqY = `y(t) = ${values.yc} + ${2*a}·t`;
                    dX = `dx/dt = ${2*a}·t`; dY = `dy/dt = ${2*a}`;
                    break;
                case 'left':
                    eqX = `x(t) = ${values.xc} − ${a}·t²`; eqY = `y(t) = ${values.yc} + ${2*a}·t`;
                    dX = `dx/dt = −${2*a}·t`; dY = `dy/dt = ${2*a}`;
                    break;
                case 'up':
                    eqX = `x(t) = ${values.xc} + ${2*a}·t`; eqY = `y(t) = ${values.yc} + ${a}·t²`;
                    dX = `dx/dt = ${2*a}`; dY = `dy/dt = ${2*a}·t`;
                    break;
                case 'down':
                    eqX = `x(t) = ${values.xc} + ${2*a}·t`; eqY = `y(t) = ${values.yc} − ${a}·t²`;
                    dX = `dx/dt = ${2*a}`; dY = `dy/dt = −${2*a}·t`;
                    break;
            }

            equationHTML = `
                <div class="eq-block">
                    <span class="eq-label">Persamaan Parametrik (${ori.toUpperCase()}):</span>
                    <div class="eq-formula">${eqX}</div>
                    <div class="eq-formula">${eqY}</div>
                </div>
            `;
            derivHTML = `
                <div class="eq-block">
                    <span class="eq-label">Turunan Pertama:</span>
                    <div class="eq-formula">${dX}</div>
                    <div class="eq-formula">${dY}</div>
                </div>
                <div class="eq-block">
                    <span class="eq-label">Kelengkungan:</span>
                    <div class="eq-formula">κ(t) = 1 / (${2*a} · (1 + t²)^(3/2))</div>
                    <div class="eq-formula">κ(0) = ${fmt(meta.kelengkunganVertex, 6)} (di vertex)</div>
                </div>
            `;
            geometryHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Vertex</span><span class="prop-val">(${meta.vertex?.x}, ${meta.vertex?.y})</span></div>
                    <div class="prop-item"><span class="prop-key">Fokus</span><span class="prop-val">(${meta.fokus?.x}, ${meta.fokus?.y})</span></div>
                    <div class="prop-item"><span class="prop-key">Latus Rectum</span><span class="prop-val">${fmt(meta.latusRectum, 2)} px</span></div>
                    <div class="prop-item"><span class="prop-key">Radius Kelengkungan (vertex)</span><span class="prop-val">${fmt(meta.radiusKelengkunganVertex, 2)} px</span></div>
                    <div class="prop-item"><span class="prop-key">Busur Terukur</span><span class="prop-val">${fmt(meta.totalArcLength, 2)} px</span></div>
                </div>
            `;
            propsHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Parameter (a)</span><span class="prop-val">${a}</span></div>
                    <div class="prop-item"><span class="prop-key">Orientasi</span><span class="prop-val">${ori.toUpperCase()}</span></div>
                </div>
            `;
            break;
        }
        case 'hyperbola': {
            const a = values.a, b = values.b;
            const ori = values.orientation;
            let mainEq = '';

            if (ori === 'vertical') {
                mainEq = `
                    <div class="eq-formula">x(t) = ${values.xc} + ${b} · tan(t)</div>
                    <div class="eq-formula">y(t) = ${values.yc} ± ${a} · sec(t)</div>
                `;
            } else {
                mainEq = `
                    <div class="eq-formula">x(t) = ${values.xc} ± ${a} · sec(t)</div>
                    <div class="eq-formula">y(t) = ${values.yc} + ${b} · tan(t)</div>
                `;
            }

            equationHTML = `
                <div class="eq-block">
                    <span class="eq-label">Persamaan Parametrik (${ori.toUpperCase()}):</span>
                    ${mainEq}
                </div>
                <div class="eq-block">
                    <span class="eq-label">Persamaan Kartesian:</span>
                    <div class="eq-formula">${ori !== 'vertical' 
                        ? `(x − ${values.xc})²/${a}² − (y − ${values.yc})²/${b}² = 1` 
                        : `(y − ${values.yc})²/${a}² − (x − ${values.xc})²/${b}² = 1`}</div>
                </div>
            `;
            derivHTML = `
                <div class="eq-block">
                    <span class="eq-label">Turunan Pertama:</span>
                    <div class="eq-formula">${ori !== 'vertical' 
                        ? `dx/dt = ${a} · sec(t)·tan(t)` 
                        : `dx/dt = ${b} · sec²(t)`}</div>
                    <div class="eq-formula">${ori !== 'vertical' 
                        ? `dy/dt = ${b} · sec²(t)` 
                        : `dy/dt = ${a} · sec(t)·tan(t)`}</div>
                </div>
            `;
            geometryHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Eksentrisitas (e)</span><span class="prop-val">${fmt(meta.eksentrisitas, 6)}</span></div>
                    <div class="prop-item"><span class="prop-key">Jarak Fokus (c)</span><span class="prop-val">${fmt(meta.jarakFokus, 2)} px</span></div>
                    <div class="prop-item"><span class="prop-key">Fokus 1</span><span class="prop-val">(${fmt(meta.fokus1?.x, 1)}, ${fmt(meta.fokus1?.y, 1)})</span></div>
                    <div class="prop-item"><span class="prop-key">Fokus 2</span><span class="prop-val">(${fmt(meta.fokus2?.x, 1)}, ${fmt(meta.fokus2?.y, 1)})</span></div>
                    <div class="prop-item"><span class="prop-key">Slope Asimtot</span><span class="prop-val">±${fmt(meta.asimtotSlope, 4)}</span></div>
                    <div class="prop-item"><span class="prop-key">Busur Terukur</span><span class="prop-val">${fmt(meta.totalArcLength, 2)} px</span></div>
                </div>
            `;
            propsHTML = `
                <div class="prop-grid">
                    <div class="prop-item"><span class="prop-key">Pusat</span><span class="prop-val">(${values.xc}, ${values.yc})</span></div>
                    <div class="prop-item"><span class="prop-key">Semi-Transversal (a)</span><span class="prop-val">${a} px</span></div>
                    <div class="prop-item"><span class="prop-key">Semi-Konjugat (b)</span><span class="prop-val">${b} px</span></div>
                </div>
            `;
            break;
        }
    }

    // Render panel utama
    const html = `
        <div class="analysis-section">
            <h4><span class="section-icon">📐</span> Persamaan</h4>
            ${equationHTML}
        </div>
        <div class="analysis-section">
            <h4><span class="section-icon">📊</span> Turunan & Kelengkungan</h4>
            ${derivHTML}
        </div>
        <div class="analysis-section">
            <h4><span class="section-icon">📏</span> Properti Kurva</h4>
            ${propsHTML}
        </div>
        <div class="analysis-section">
            <h4><span class="section-icon">🔬</span> Geometri Lanjutan</h4>
            ${geometryHTML}
        </div>
        <div class="analysis-section">
            <h4><span class="section-icon">⚙️</span> Parameter Rendering</h4>
            <div class="prop-grid">
                <div class="prop-item"><span class="prop-key">Rentang t</span><span class="prop-val">${values.tMin} → ${values.tMax}</span></div>
                <div class="prop-item"><span class="prop-key">Interval Δ</span><span class="prop-val">${values.delta}</span></div>
                <div class="prop-item"><span class="prop-key">Total Titik</span><span class="prop-val">${totalPoints}</span></div>
                <div class="prop-item"><span class="prop-key">Mode Render</span><span class="prop-val">Titik (Dots)</span></div>
            </div>
        </div>
    `;
    analysisContent.innerHTML = html;

    // Isi tabel sampel perhitungan
    updateCalcTable(dataPoints, curveType);
}

// =====================================================================
// TABEL PERHITUNGAN DETAIL (SAMPEL)
// =====================================================================
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
// EVENT LISTENERS
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
