/* ===================================================================
   Two skeletons, built to measured proportions. Metres.
   Both animals face −X.  Y up, Z lateral.
===================================================================== */
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---- tube with a varying radius, optionally squashed on an axis --- */
function taper(points, r0, r1, bulge, tub, rad, sq) {
  tub = tub || 44; rad = rad || 12;
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const g = new THREE.TubeGeometry(curve, tub, 1, rad, false);
  const pos = g.attributes.position;
  for (let i = 0; i <= tub; i++) {
    const t = i / tub, P = curve.getPointAt(t);
    let r = r0 + (r1 - r0) * t;
    if (bulge) r += bulge * Math.pow(2 * t - 1, 2);
    for (let j = 0; j <= rad; j++) {
      const k = i * (rad + 1) + j;
      let dx = (pos.getX(k) - P.x) * r, dy = (pos.getY(k) - P.y) * r, dz = (pos.getZ(k) - P.z) * r;
      if (sq) { dx *= sq[0]; dy *= sq[1]; dz *= sq[2]; }
      pos.setXYZ(k, P.x + dx, P.y + dy, P.z + dz);
    }
  }
  g.computeVertexNormals();
  return g;
}

/* ---- a long bone: narrow shaft, flared ends, a bowed axis -------- */
function longBone(a, b, rShaft, rEnd, bow) {
  const m = a.clone().add(b).multiplyScalar(0.5); m.x += (bow || 0);
  const curve = new THREE.CatmullRomCurve3([a, m, b], false, 'catmullrom', 0.5);
  const tub = 40, rad = 14;
  const g = new THREE.TubeGeometry(curve, tub, 1, rad, false);
  const pos = g.attributes.position;
  for (let i = 0; i <= tub; i++) {
    const t = i / tub, P = curve.getPointAt(t);
    const e = Math.pow(Math.abs(2 * t - 1), 2.8);          // flare only near the ends
    const r = rShaft + (rEnd - rShaft) * e;
    for (let j = 0; j <= rad; j++) {
      const k = i * (rad + 1) + j;
      pos.setXYZ(k,
        P.x + (pos.getX(k) - P.x) * r,
        P.y + (pos.getY(k) - P.y) * r,
        P.z + (pos.getZ(k) - P.z) * r);
    }
  }
  g.computeVertexNormals();
  return g;
}

function blade(g, z0, k) {
  g.translate(0, 0, -z0); g.scale(1, 1, k); g.translate(0, 0, z0);
  g.computeVertexNormals(); return g;
}
function ellipsoid(cx, cy, cz, rx, ry, rz, seg) {
  const g = new THREE.SphereGeometry(1, seg || 28, (seg || 28) * 0.72 | 0);
  g.scale(rx, ry, rz); g.translate(cx, cy, cz); return g;
}

/* ---- a vertebra: hourglass centrum, neural arch, transverse ------ */
function vertebra(x, y, rad, len, tproc) {
  const parts = [];
  const c = new THREE.CylinderGeometry(rad, rad, len, 20, 3);
  const p = c.attributes.position;
  for (let i = 0; i < p.count; i++) {                      // waist the centrum
    const yy = p.getY(i), k = 1 - 0.20 * (1 - Math.abs(yy) / (len / 2));
    p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k);
  }
  c.computeVertexNormals(); c.rotateZ(Math.PI / 2); c.translate(x, y, 0);
  parts.push(c);
  const arch = new THREE.TorusGeometry(rad * 0.58, rad * 0.26, 8, 20, Math.PI * 1.25);
  arch.rotateY(Math.PI / 2); arch.rotateZ(-Math.PI * 0.62);
  arch.translate(x, y + rad * 0.80, 0); parts.push(arch);
  if (tproc) [1, -1].forEach(s => {
    const t = new THREE.CylinderGeometry(rad * 0.20, rad * 0.13, tproc, 8);
    t.rotateX(Math.PI / 2); t.translate(x, y + rad * 0.45, s * tproc / 2);
    parts.push(t);
  });
  return parts;
}

/* ---- paper-grain bone surface, so it does not read as plastic ---- */
function grain() {
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const ctx = c.getContext('2d'), img = ctx.createImageData(N, N);
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const G = []; for (let i = 0; i < 64 * 64; i++) G.push(rnd());
  const at = (i, j) => G[(j & 63) * 64 + (i & 63)];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let v = 0, amp = 1, f = 1 / 5;
    for (let o = 0; o < 3; o++) {
      const fx = i * f, fy = j * f, i0 = Math.floor(fx), j0 = Math.floor(fy);
      const tx = fx - i0, ty = fy - j0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = at(i0, j0), b = at(i0 + 1, j0), cc = at(i0, j0 + 1), d = at(i0 + 1, j0 + 1);
      v += amp * ((a + (b - a) * sx) * (1 - sy) + (cc + (d - cc) * sx) * sy);
      amp *= 0.5; f *= 2.1;
    }
    const q = 158 + (v / 1.75) * 92, k = (j * N + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = q; img.data[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4);
  return t;
}

/* muscle reads as muscle only if the fibres run somewhere: long streaks
   along one axis, broken up so they do not look like corduroy        */
function fibre() {
  const W = 128, H = 512, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9a9a9a'; ctx.fillRect(0, 0, W, H);
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let n = 0; n < 150; n++) {
    const x = rnd() * W, w = 0.6 + rnd() * 2.2;
    const y0 = rnd() * H, len = H * (0.25 + rnd() * 0.7);
    const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
    const tone = rnd() < 0.5 ? 255 : 0, a = 0.05 + rnd() * 0.16;
    g.addColorStop(0, 'rgba(' + tone + ',' + tone + ',' + tone + ',0)');
    g.addColorStop(0.5, 'rgba(' + tone + ',' + tone + ',' + tone + ',' + a + ')');
    g.addColorStop(1, 'rgba(' + tone + ',' + tone + ',' + tone + ',0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y0, w, len);
  }
  /* a few wider bands, so the belly looks built of bundles */
  for (let n = 0; n < 9; n++) {
    ctx.fillStyle = 'rgba(0,0,0,' + (0.05 + rnd() * 0.07) + ')';
    ctx.fillRect(rnd() * W, 0, 3 + rnd() * 5, H);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1);
  return t;
}

/* ================================================================= */
const MATS = {};
function makeMaterials() {
  const g = grain();
  const bone = (col, rough) => new THREE.MeshStandardMaterial({
    color: col, roughness: rough, metalness: 0,
    roughnessMap: g, bumpMap: g, bumpScale: 0.0045
  });
  MATS.bone = bone(0xF4EEE1, 0.80);
  MATS.boneDeep = bone(0xE8DFCD, 0.86);
  MATS.cell = new THREE.MeshStandardMaterial({ color: 0xD6CAB2, roughness: 0.92 });
  MATS.shell = new THREE.MeshStandardMaterial({
    color: 0xF4EEE1, roughness: 0.52, transparent: true, opacity: 0.66,
    side: THREE.DoubleSide, depthWrite: false
  });
  MATS.dark = new THREE.MeshStandardMaterial({ color: 0x8C8069, roughness: 0.95 });
  MATS.soft = new THREE.MeshStandardMaterial({
    color: 0xADA089, roughness: 0.97, transparent: true, opacity: 0.80
  });
  MATS.pad = new THREE.MeshStandardMaterial({ color: 0xC6A484, roughness: 0.95, roughnessMap: g });
  MATS.cart = new THREE.MeshStandardMaterial({ color: 0xA88058, roughness: 0.90 });
  const fb = fibre();
  MATS.muscle = new THREE.MeshStandardMaterial({
    color: 0xA8553E, roughness: 0.58, transparent: true, opacity: 0.94,
    roughnessMap: fb, bumpMap: fb, bumpScale: 0.022, flatShading: false
  });
  MATS.muscleDeep = new THREE.MeshStandardMaterial({
    color: 0x8E4234, roughness: 0.62, transparent: true, opacity: 0.94,
    roughnessMap: fb, bumpMap: fb, bumpScale: 0.022, flatShading: false
  });
  MATS.tendon = new THREE.MeshStandardMaterial({
    color: 0xE7DEC9, roughness: 0.30, transparent: true, opacity: 0.96,
    roughnessMap: g, bumpMap: g, bumpScale: 0.003
  });
  MATS.ghost = new THREE.MeshStandardMaterial({
    color: 0xE6DFD2, roughness: 0.95, transparent: true, opacity: 0.12, depthWrite: false
  });
}

function add(group, geo, mat, part) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.userData.part = part || ''; m.userData.m0 = mat;
  group.add(m); return m;
}
const addAll = (G, arr, mat, part) => arr.forEach(g => add(G, g, mat, part));

/* muscle and tendon: hidden until a chapter asks for them */
function soft(group, geo, mat) {
  const m = add(group, geo, mat, 'muscle');
  m.userData.soft = true; m.visible = false; m.castShadow = false;
  return m;
}

/* ============================= ELEPHANT ============================ */
function buildElephant() {
  const G = new THREE.Group(), EZ = 0.62;

  const back = new THREE.CatmullRomCurve3([
    V(-2.00, 2.66, 0), V(-1.40, 2.86, 0), V(-0.60, 2.82, 0),
    V(0.30, 2.73, 0), V(1.10, 2.78, 0), V(1.90, 2.70, 0)
  ], false, 'catmullrom', 0.5);
  const yTop = x => back.getPoint(Math.min(1, Math.max(0, (x + 2.00) / 3.90))).y;

  /* ---- cervical ×7, short and compressed into flat discs ---- */
  for (let i = 0; i < 7; i++) {
    const x = -1.98 + i * 0.049;
    addAll(G, vertebra(x, yTop(x) - 0.11, 0.105, 0.040, 0.14), MATS.boneDeep, 'vert');
  }

  /* ---- thoracic ×20, tall neural spines, 20 flat rib blades ---- */
  const TN = 20, X0 = -1.60, XS = 0.1368;
  for (let i = 0; i < TN; i++) {
    const t = i / (TN - 1), x = X0 + i * XS, yt = yTop(x);
    addAll(G, vertebra(x, yt - 0.12, 0.115, 0.098, 0.17), MATS.boneDeep, 'vert');

    const h = 0.20 + 0.40 * Math.exp(-Math.pow((i - 3) / 6.5, 2));
    add(G, taper([V(x, yt - 0.08, 0), V(x + 0.03, yt + h * 0.5, 0), V(x + 0.06, yt + h, 0)],
      0.056, 0.030, 0, 18, 10, [0.52, 1, 1.5]), MATS.bone, 'spine');

    const zM = 0.54 + 0.40 * Math.sin(Math.PI * (0.14 + 0.74 * t));
    const yv = 1.46 - 0.34 * Math.sin(Math.PI * (0.20 + 0.62 * t));
    const sw = 0.78 - 0.40 * t;
    [1, -1].forEach(s => {
      add(G, taper([
        V(x, yt - 0.17, s * 0.07),
        V(x + sw * 0.20, yt - 0.52, s * zM * 0.74),
        V(x + sw * 0.50, yt - 1.08, s * zM),
        V(x + sw * 0.80, yv + 0.26, s * zM * 0.66),
        V(x + sw, yv, s * zM * 0.24)
      ], 0.050, 0.024, 0, 44, 10, [0.42, 1.25, 1.05]), MATS.bone, 'rib');
    });
  }

  /* ---- lumbar ×3 only ---- */
  for (let i = 0; i < 3; i++) {
    const x = 1.08 + i * 0.17, yt = yTop(x);
    addAll(G, vertebra(x, yt - 0.13, 0.135, 0.145, 0.26), MATS.boneDeep, 'vert');
    add(G, taper([V(x, yt - 0.08, 0), V(x + 0.02, yt + 0.10, 0), V(x + 0.04, yt + 0.21, 0)],
      0.058, 0.032, 0, 14, 10, [0.52, 1, 1.5]), MATS.bone, 'spine');
  }

  /* ---- sacrum, then a thin tail ---- */
  add(G, taper([V(1.56, 2.68, 0), V(1.78, 2.62, 0), V(1.98, 2.50, 0)],
    0.120, 0.072, 0, 18, 14, [1, 1, 1.25]), MATS.boneDeep, 'vert');
  add(G, taper([V(1.98, 2.50, 0), V(2.16, 2.26, 0), V(2.30, 1.92, 0), V(2.36, 1.60, 0)],
    0.042, 0.011, 0, 28, 8), MATS.bone, 'vert');

  /* ---- skull: domed, flat occiput, nasal fossa, tusk sockets ---- */
  add(G, ellipsoid(-2.24, 2.62, 0, 0.42, 0.46, 0.39, 34), MATS.bone, 'skull').userData.shell = true;
  add(G, ellipsoid(-2.42, 2.18, 0, 0.30, 0.28, 0.31, 28), MATS.bone, 'skull').userData.shell = true;
  const occ = new THREE.CylinderGeometry(0.31, 0.26, 0.09, 24);
  occ.rotateZ(Math.PI / 2); occ.translate(-1.92, 2.56, 0);
  add(G, occ, MATS.boneDeep, 'skull');
  add(G, ellipsoid(-2.56, 2.44, 0, 0.11, 0.13, 0.10, 18), MATS.dark, 'skull');   // nasal opening
  [1, -1].forEach(s => add(G, ellipsoid(-2.48, 2.26, s * 0.21, 0.085, 0.085, 0.075, 16),
    MATS.dark, 'skull'));                                                        // orbits
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let a = 0; a < 58; a++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1), rr = 0.66 * Math.cbrt(rnd());
    add(G, ellipsoid(-2.24 + 0.42 * rr * Math.sin(ph) * Math.cos(th),
      2.62 + 0.46 * rr * Math.cos(ph),
      0.39 * rr * Math.sin(ph) * Math.sin(th), 0.034, 0.029, 0.032, 10),
      MATS.cell, 'skull');
    G.children[G.children.length - 1].userData.cell = true;
    G.children[G.children.length - 1].visible = false;
  }

  /* ---- mandible, with the molar conveyor ---- */
  [1, -1].forEach(s => {
    add(G, taper([
      V(-2.04, 2.34, s * 0.19), V(-2.30, 2.00, s * 0.22),
      V(-2.54, 1.93, s * 0.15), V(-2.66, 1.99, s * 0.07)
    ], 0.072, 0.040, 0, 30, 10, [1, 1.15, 0.72]), MATS.bone, 'teeth');
    const m1 = new THREE.BoxGeometry(0.20, 0.080, 0.125, 2, 2, 2);
    m1.translate(-2.41, 2.07, s * 0.19); add(G, m1, MATS.boneDeep, 'teeth');
    const m2 = new THREE.BoxGeometry(0.14, 0.058, 0.115);
    m2.translate(-2.19, 2.15, s * 0.20); add(G, m2, MATS.cell, 'teeth');
  });

  /* ---- tusks: upper incisors, growing for life ---- */
  [1, -1].forEach(s => add(G, taper([
    V(-2.40, 2.26, s * 0.18), V(-2.78, 1.86, s * 0.27),
    V(-3.14, 1.52, s * 0.31), V(-3.48, 1.44, s * 0.29)
  ], 0.088, 0.016, 0, 44, 14), MATS.bone, 'teeth'));

  /* ---- trunk: no bone, no joint ---- */
  add(G, taper([
    V(-2.46, 2.14, 0), V(-2.70, 1.62, 0), V(-2.86, 1.04, 0),
    V(-2.92, 0.54, 0), V(-2.78, 0.24, 0)
  ], 0.255, 0.055, 0, 56, 20), MATS.soft, 'trunk');

  /* ---- forequarters: a big scapula with its spine, and no clavicle ---- */
  [1, -1].forEach(s => {
    add(G, blade(taper([V(-1.24, 2.84, s * EZ), V(-1.35, 2.40, s * EZ), V(-1.46, 1.98, s * EZ)],
      0.30, 0.10, 0, 26, 16), s * EZ, 0.26), MATS.bone, 'scap');
    add(G, taper([V(-1.30, 2.80, s * (EZ + 0.055)), V(-1.42, 2.22, s * (EZ + 0.055))],
      0.052, 0.030, 0, 12, 8, [1, 1, 0.6]), MATS.boneDeep, 'scap');

    add(G, longBone(V(-1.46, 1.99, s * EZ), V(-1.43, 1.30, s * EZ), 0.082, 0.135, -0.035), MATS.bone, 'fore');
    add(G, longBone(V(-1.49, 1.37, s * (EZ - 0.085)), V(-1.46, 0.52, s * (EZ - 0.085)), 0.042, 0.068, -0.012), MATS.bone, 'fore');
    add(G, longBone(V(-1.35, 1.37, s * (EZ + 0.075)), V(-1.38, 0.52, s * (EZ + 0.075)), 0.084, 0.122, 0.012), MATS.bone, 'fore');

    for (let i = 0; i < 4; i++) {
      add(G, ellipsoid(-1.50 + i * 0.055, 0.49, s * (EZ - 0.10 + i * 0.07), 0.055, 0.045, 0.050, 14),
        MATS.boneDeep, 'foot');
      add(G, taper([V(-1.48 + i * 0.055, 0.45, s * (EZ - 0.10 + i * 0.07)),
      V(-1.34 + i * 0.05, 0.27, s * (EZ - 0.09 + i * 0.07))], 0.040, 0.034, 0.010, 12, 9),
        MATS.bone, 'foot');
    }
    add(G, taper([V(-1.52, 0.44, s * EZ), V(-1.63, 0.24, s * EZ)], 0.055, 0.038, 0, 10, 9), MATS.cart, 'foot');
    add(G, ellipsoid(-1.42, 0.115, s * EZ, 0.33, 0.115, 0.31, 30), MATS.pad, 'pad');
  });

  /* ---- hindquarters: broad flaring ilium ---- */
  [1, -1].forEach(s => {
    add(G, blade(taper([V(1.46, 2.74, s * (EZ - 0.06)), V(1.68, 2.46, s * EZ), V(1.90, 2.16, s * (EZ + 0.03))],
      0.26, 0.12, 0, 22, 16), s * EZ, 0.30), MATS.bone, 'hind');

    add(G, ellipsoid(1.78, 2.40, s * EZ, 0.10, 0.10, 0.10, 16), MATS.boneDeep, 'hind'); // femoral head
    add(G, longBone(V(1.77, 2.42, s * EZ), V(1.66, 1.40, s * EZ), 0.090, 0.150, 0.035), MATS.bone, 'hind');
    add(G, ellipsoid(1.58, 1.40, s * EZ, 0.080, 0.065, 0.070, 16), MATS.boneDeep, 'knee');

    add(G, longBone(V(1.65, 1.44, s * (EZ - 0.065)), V(1.63, 0.51, s * (EZ - 0.065)), 0.074, 0.120, 0.012), MATS.bone, 'hind');
    add(G, longBone(V(1.76, 1.43, s * (EZ + 0.085)), V(1.73, 0.52, s * (EZ + 0.085)), 0.030, 0.050, 0.0), MATS.bone, 'hind');

    for (let i = 0; i < 3; i++) {
      add(G, ellipsoid(1.60 - i * 0.05, 0.48, s * (EZ - 0.08 + i * 0.08), 0.052, 0.043, 0.048, 14),
        MATS.boneDeep, 'foot');
      add(G, taper([V(1.58 - i * 0.05, 0.44, s * (EZ - 0.08 + i * 0.08)),
      V(1.46 - i * 0.045, 0.27, s * (EZ - 0.07 + i * 0.08))], 0.038, 0.032, 0.010, 12, 9),
        MATS.bone, 'foot');
    }
    add(G, taper([V(1.62, 0.44, s * EZ), V(1.73, 0.24, s * EZ)], 0.052, 0.036, 0, 10, 9), MATS.cart, 'foot');
    add(G, ellipsoid(1.66, 0.115, s * EZ, 0.31, 0.115, 0.30, 30), MATS.pad, 'pad');
  });

  /* ---- muscle: the mass sits high, the lower limb is tendon ---- */
  /* nuchal ligament: the elastic sheet that carries 300 kg of head,
     anchored on exactly the tall neural spines labelled above      */
  soft(G, taper([
    V(-1.95, 2.72, 0), V(-1.62, 3.14, 0), V(-1.19, 3.34, 0),
    V(-0.52, 3.20, 0), V(0.22, 3.00, 0)
  ], 0.090, 0.046, 0, 64, 26, [1, 0.42, 1.9]), MATS.muscleDeep);

  [1, -1].forEach(s2 => {
    /* forelimb: three spindle bellies, closed volumes, not open tubes */
    soft(G, ellipsoid(-1.31, 2.56, s2 * (EZ + 0.05), 0.215, 0.350, 0.165, 30), MATS.muscle);
    soft(G, ellipsoid(-1.34, 1.96, s2 * (EZ + 0.03), 0.150, 0.360, 0.130, 30), MATS.muscleDeep);
    soft(G, ellipsoid(-1.53, 1.90, s2 * (EZ - 0.05), 0.105, 0.330, 0.098, 28), MATS.muscle);

    /* below the elbow: two long cords and nothing else */
    soft(G, ellipsoid(-1.45, 0.96, s2 * (EZ - 0.05), 0.046, 0.400, 0.042, 24), MATS.tendon);
    soft(G, ellipsoid(-1.37, 0.96, s2 * (EZ + 0.07), 0.038, 0.400, 0.035, 24), MATS.tendon);

    /* hindlimb: gluteal over the ilium, then front and back of the femur */
    soft(G, ellipsoid(1.73, 2.56, s2 * (EZ + 0.04), 0.215, 0.280, 0.168, 30), MATS.muscle);
    soft(G, ellipsoid(1.64, 1.96, s2 * (EZ - 0.05), 0.140, 0.395, 0.122, 30), MATS.muscle);
    soft(G, ellipsoid(1.83, 1.96, s2 * (EZ + 0.05), 0.128, 0.375, 0.112, 30), MATS.muscleDeep);

    soft(G, ellipsoid(1.65, 0.98, s2 * (EZ - 0.05), 0.043, 0.395, 0.039, 24), MATS.tendon);
    soft(G, ellipsoid(1.74, 0.98, s2 * (EZ + 0.07), 0.036, 0.395, 0.033, 24), MATS.tendon);
  });

  return G;
}

/* ============================== HUMAN ============================== */
function buildHuman() {
  const G = new THREE.Group();

  add(G, ellipsoid(0.01, 1.635, 0, 0.088, 0.104, 0.090, 26), MATS.bone, 'skull');
  [1, -1].forEach(s => add(G, ellipsoid(-0.055, 1.645, s * 0.040, 0.022, 0.024, 0.020, 12), MATS.dark, 'skull'));
  add(G, taper([V(-0.050, 1.560, 0.046), V(-0.092, 1.534, 0), V(-0.050, 1.560, -0.046)],
    0.030, 0.030, 0, 18, 9, [1, 0.8, 1]), MATS.bone, 'teeth');

  for (let i = 0; i < 7; i++)                       // cervical ×7, long and mobile
    addAll(G, vertebra(0.005, 1.525 - i * 0.0185, 0.026, 0.028, 0.034), MATS.boneDeep, 'vert');
  for (let i = 0; i < 12; i++)
    addAll(G, vertebra(0.008, 1.392 - i * 0.0285, 0.030 + i * 0.0012, 0.026, 0.042), MATS.boneDeep, 'vert');
  for (let i = 0; i < 5; i++)                       // lumbar ×5
    addAll(G, vertebra(0.008, 1.030 - i * 0.034, 0.040, 0.030, 0.052), MATS.boneDeep, 'vert');

  const stn = new THREE.BoxGeometry(0.030, 0.26, 0.052);
  stn.translate(-0.125, 1.225, 0); add(G, stn, MATS.bone, 'rib');
  for (let i = 0; i < 12; i++) {                    // ribs ×12
    const t = i / 11, y = 1.385 - i * 0.0285;
    const zM = 0.095 + 0.072 * Math.sin(Math.PI * (0.16 + 0.74 * t));
    const yv = y - 0.075 - t * 0.10;
    [1, -1].forEach(s => add(G, taper([
      V(0.008, y, s * 0.022), V(-0.035, y - 0.012, s * zM),
      V(-0.105, yv + 0.03, s * zM * 0.80), V(-0.128, yv, s * (i < 7 ? 0.035 : 0.075))
    ], 0.018, 0.011, 0, 28, 9, [0.55, 1.2, 1]), MATS.bone, 'rib'));
  }

  [1, -1].forEach(s => {                            // the collarbone the elephant has not
    add(G, taper([V(-0.095, 1.400, 0.015), V(-0.105, 1.392, s * 0.10), V(-0.065, 1.372, s * 0.175)],
      0.018, 0.014, 0, 20, 9), MATS.bone, 'clav');
    add(G, blade(taper([V(0.045, 1.395, s * 0.11), V(0.040, 1.300, s * 0.145), V(0.030, 1.215, s * 0.13)],
      0.072, 0.028, 0, 20, 13), s * 0.13, 0.28), MATS.bone, 'scap');
    add(G, blade(taper([V(0.010, 0.905, s * 0.045), V(-0.022, 0.845, s * 0.118), V(0.015, 0.775, s * 0.085)],
      0.078, 0.042, 0, 22, 13), s * 0.09, 0.40), MATS.bone, 'hind');
  });

  [1, -1].forEach(s => {                            // arms, held out by the clavicle
    add(G, longBone(V(-0.050, 1.370, s * 0.185), V(-0.035, 1.085, s * 0.205), 0.019, 0.030, -0.013), MATS.bone, 'fore');
    add(G, longBone(V(-0.045, 1.065, s * 0.188), V(-0.030, 0.800, s * 0.198), 0.012, 0.020, -0.008), MATS.bone, 'fore');
    add(G, longBone(V(-0.018, 1.065, s * 0.216), V(-0.012, 0.800, s * 0.224), 0.011, 0.018, -0.006), MATS.bone, 'fore');
    /* carpals, metacarpals and phalanges — the 27 bones the trunk has none of */
    add(G, ellipsoid(-0.029, 0.782, s * 0.212, 0.021, 0.015, 0.016, 14), MATS.boneDeep, 'fore');
    for (let f = 0; f < 4; f++) {
      const zo = (f - 1.5) * 0.0125;
      add(G, taper([V(-0.030, 0.772, s * (0.212 + zo)), V(-0.030, 0.739, s * (0.214 + zo * 1.16))],
        0.0062, 0.0052, 0, 8, 7), MATS.bone, 'fore');
      add(G, taper([V(-0.030, 0.736, s * (0.214 + zo * 1.16)), V(-0.029, 0.703, s * (0.216 + zo * 1.3))],
        0.0050, 0.0034, 0, 8, 7), MATS.bone, 'fore');
    }
    add(G, taper([V(-0.034, 0.770, s * 0.196), V(-0.041, 0.742, s * 0.183)],
      0.0062, 0.0046, 0, 8, 7), MATS.bone, 'fore');
  });

  [1, -1].forEach(s => {                            // legs, knee extended
    add(G, ellipsoid(0.020, 0.880, s * 0.070, 0.035, 0.035, 0.035, 14), MATS.boneDeep, 'hind');
    add(G, longBone(V(0.015, 0.860, s * 0.075), V(0.000, 0.500, s * 0.100), 0.023, 0.040, -0.013), MATS.bone, 'hind');
    add(G, ellipsoid(-0.032, 0.480, s * 0.100, 0.030, 0.026, 0.022, 14), MATS.boneDeep, 'knee');
    add(G, longBone(V(-0.002, 0.470, s * 0.088), V(-0.002, 0.085, s * 0.092), 0.019, 0.034, 0.009), MATS.bone, 'hind');
    add(G, longBone(V(0.018, 0.465, s * 0.122), V(0.016, 0.095, s * 0.122), 0.010, 0.017, 0.004), MATS.bone, 'hind');
    add(G, ellipsoid(0.040, 0.048, s * 0.100, 0.052, 0.045, 0.045, 16), MATS.boneDeep, 'foot');
    add(G, taper([V(0.020, 0.045, s * 0.100), V(-0.090, 0.030, s * 0.100), V(-0.145, 0.022, s * 0.098)],
      0.050, 0.026, 0, 20, 10, [1, 0.7, 1]), MATS.bone, 'foot');
    add(G, ellipsoid(0.038, 0.013, s * 0.100, 0.060, 0.015, 0.050, 20), MATS.pad, 'pad');
  });

  /* ---- muscle: a human keeps a muscle belly low on the leg ---- */
  [1, -1].forEach(s2 => {
    soft(G, ellipsoid(-0.004, 0.700, s2 * 0.080, 0.056, 0.190, 0.050, 26), MATS.muscle);
    soft(G, ellipsoid( 0.036, 0.700, s2 * 0.084, 0.042, 0.180, 0.038, 24), MATS.muscleDeep);
    soft(G, ellipsoid(-0.014, 0.330, s2 * 0.102, 0.045, 0.140, 0.041, 26), MATS.muscle);
    soft(G, ellipsoid( 0.000, 0.132, s2 * 0.099, 0.014, 0.078, 0.013, 18), MATS.tendon);
  });

  G.position.x = -5.05;
  return G;
}
