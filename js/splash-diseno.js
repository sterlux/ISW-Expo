// Splash / wallpaper de Diseño Gráfico Digital: un programa de animación 3D
// con una escena que se dibuja en un canvas con un motor 3D pequeño (sin librerías).
// La memoria no crece: el canvas se redibuja en cada cuadro y el editor de
// scripts y las marcas de la línea de tiempo tienen tope.
(() => {
  const $ = (id) => document.getElementById(id);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const TAU = Math.PI * 2;
  const CUADROS = 120; // la animación dura 120 cuadros y se repite (5 s a 24 fps)

  // ---------- Vectores ----------
  const resta = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const suma = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const por = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unitario = (a) => por(a, 1 / (Math.hypot(...a) || 1));
  const promedio = (pts) => por(pts.reduce(suma, [0, 0, 0]), 1 / pts.length);

  // Normal de un polígono (método de Newell, sirve aunque no sea triángulo).
  function normal(pts) {
    const n = [0, 0, 0];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      n[0] += (a[1] - b[1]) * (a[2] + b[2]);
      n[1] += (a[2] - b[2]) * (a[0] + b[0]);
      n[2] += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return n;
  }

  function rotar([x, y, z], [rx, ry, rz]) {
    let c = Math.cos(rx), s = Math.sin(rx);
    [y, z] = [y * c - z * s, y * s + z * c];
    c = Math.cos(ry); s = Math.sin(ry);
    [x, z] = [x * c + z * s, -x * s + z * c];
    c = Math.cos(rz); s = Math.sin(rz);
    [x, y] = [x * c - y * s, x * s + y * c];
    return [x, y, z];
  }

  // ---------- Mallas ----------
  // Cada cara se voltea si hace falta para que su normal apunte hacia afuera (`ref`).
  function malla(v, caras, ref) {
    caras.forEach((cara, k) => {
      const pts = cara.map((i) => v[i]);
      if (punto(normal(pts), ref(promedio(pts), k)) < 0) cara.reverse();
    });
    return { v, caras };
  }
  const convexa = (v, caras) => {
    const c = promedio(v);
    return malla(v, caras, (centro) => resta(centro, c));
  };

  function cubo(t = 1) {
    const v = [];
    for (const x of [-t / 2, t / 2]) for (const y of [-t / 2, t / 2]) for (const z of [-t / 2, t / 2]) v.push([x, y, z]);
    return convexa(v, [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]]);
  }

  // Sólido de revolución: perfil = [[radio, altura], …] de abajo hacia arriba.
  function revolucion(perfil, n) {
    const v = [], caras = [];
    perfil.forEach(([r, y]) => {
      for (let i = 0; i < n; i++) v.push([r * Math.cos((i / n) * TAU), y, r * Math.sin((i / n) * TAU)]);
    });
    for (let a = 0; a < perfil.length - 1; a++) {
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        caras.push([a * n + i, a * n + j, (a + 1) * n + j, (a + 1) * n + i]);
      }
    }
    const anillo = (a) => Array.from({ length: n }, (_, i) => a * n + i);
    if (perfil[0][0] > 0) caras.push(anillo(0));
    if (perfil.at(-1)[0] > 0) caras.push(anillo(perfil.length - 1));
    return convexa(v, caras);
  }
  const esfera = (r, n, anillos) =>
    revolucion(Array.from({ length: anillos + 1 }, (_, i) => {
      const a = -Math.PI / 2 + (Math.PI * i) / anillos;
      return [Math.cos(a) * r, Math.sin(a) * r];
    }), n);
  const cilindro = (r, h, n) => revolucion([[r, -h / 2], [r, h / 2]], n);
  const cono = (r, h, n) => revolucion([[r, -h / 2], [0, h / 2]], n);

  function toro(R, r, n, m) {
    const v = [], caras = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      for (let j = 0; j < m; j++) {
        const b = (j / m) * TAU;
        v.push([(R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b), (R + r * Math.cos(b)) * Math.sin(a)]);
      }
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        const i2 = (i + 1) % n, j2 = (j + 1) % m;
        caras.push([i * m + j, i2 * m + j, i2 * m + j2, i * m + j2]);
      }
    }
    // Afuera = desde el anillo central hacia la cara.
    return malla(v, caras, (c) => resta(c, por(unitario([c[0], 0, c[2]]), R)));
  }

  // El contorno del zorro (mismo que img/zorro.svg) extruido en 3D.
  function zorro(grosor) {
    const svg = [173, 108, 336, 187, 453, 321, 634, 321, 750, 187, 913, 108, 894, 422, 869, 510, 954, 611, 543, 970, 132, 611, 217, 510, 192, 422];
    const pol = [];
    for (let i = 0; i < svg.length; i += 2) pol.push([(svg[i] - 543) / 430, -(svg[i + 1] - 540) / 430]);
    const n = pol.length, v = [], caras = [], refs = [];
    for (const [x, y] of pol) v.push([x, y, grosor / 2]);
    for (const [x, y] of pol) v.push([x, y, -grosor / 2]);
    let area = 0;
    pol.forEach(([x1, y1], i) => { const [x2, y2] = pol[(i + 1) % n]; area += x1 * y2 - x2 * y1; });
    caras.push(Array.from({ length: n }, (_, i) => i)); refs.push([0, 0, 1]);
    caras.push(Array.from({ length: n }, (_, i) => n + i)); refs.push([0, 0, -1]);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const [dx, dy] = [pol[j][0] - pol[i][0], pol[j][1] - pol[i][1]];
      caras.push([i, j, n + j, n + i]);
      refs.push(area > 0 ? [dy, -dx, 0] : [-dy, dx, 0]);
    }
    return malla(v, caras, (_, k) => refs[k]);
  }

  // ---------- Escena ----------
  const onda = (f, periodo = CUADROS) => Math.sin((f / periodo) * TAU);

  const OBJETOS = [
    {
      nombre: "pelota", icono: "◯", entrada: "polySphere1", color: [232, 86, 70], radio: 0.9,
      malla: esfera(0.9, 18, 12), claves: [0, 15, 30, 45, 60, 75, 90, 105], canales: ["ty", "sx", "sy", "sz"],
      // Rebote con estirar y aplastar (squash & stretch)
      anim(f) {
        const u = (f % 30) / 30;
        const altura = 4 * u * (1 - u);
        const contacto = Math.max(0, 1 - Math.min(u, 1 - u) / 0.07);
        const velocidad = Math.abs(1 - 2 * u);
        const sy = 1 + 0.28 * velocidad * (1 - contacto) - 0.4 * contacto;
        const sxz = 1 / Math.sqrt(sy);
        return { p: [-6.2, 0.9 * sy + 4.2 * altura, 1.6], r: [0, 0, 0], s: [sxz, sy, sxz] };
      },
    },
    {
      nombre: "cubo", icono: "▢", entrada: "polyCube1", color: [70, 140, 230], radio: 1.05,
      malla: cubo(1.7), claves: [0, 30, 60, 90], canales: ["ty", "ry"],
      anim: (f) => ({ p: [6.2, 0.85 + 0.45 * Math.abs(onda(f, 60)), -1.2], r: [0, (f / CUADROS) * TAU, 0], s: [1, 1, 1] }),
    },
    {
      nombre: "dona", icono: "◎", entrada: "polyTorus1", color: [168, 102, 255], radio: 1.6,
      malla: toro(1.15, 0.42, 26, 12), claves: [0, 40, 80], canales: ["ty", "rx", "ry"],
      anim: (f) => ({ p: [0.5, 2.7 + 0.3 * onda(f), -6.8], r: [1.1 + (f / CUADROS) * TAU, (2 * f / CUADROS) * TAU, 0], s: [1, 1, 1] }),
    },
    {
      nombre: "cono", icono: "△", entrada: "polyCone1", color: [255, 150, 60], radio: 0.85,
      malla: cono(0.85, 2, 20), claves: [0, 30, 60, 90], canales: ["tx", "tz", "ry", "rz"],
      anim(f) {
        const a = (f / CUADROS) * TAU;
        return { p: [5 + 1.1 * Math.cos(a), 1, 4.8 + 1.1 * Math.sin(a)], r: [0, -a, 0.25 * Math.sin(2 * a)], s: [1, 1, 1] };
      },
    },
    {
      nombre: "cilindro", icono: "▭", entrada: "polyCylinder1", color: [50, 200, 180], radio: 0.7,
      malla: cilindro(0.7, 2.2, 20), claves: [0, 30, 60, 90], canales: ["sy"],
      anim(f) {
        const sy = 1 + 0.35 * onda(f, 60);
        return { p: [-5.6, 1.1 * sy, -4.8], r: [0, (f / CUADROS) * TAU * 0.5, 0], s: [1, sy, 1] };
      },
    },
    {
      nombre: "zorro", icono: "🦊", entrada: "polyExtrude1", color: [255, 205, 8], radio: 0.85,
      malla: zorro(0.28), claves: [0, 60], canales: ["ty", "ry"],
      anim: (f) => ({ p: [-2.6, 2.1 + 0.25 * onda(f), 6.6], r: [0, 0.9 * onda(f), 0], s: [1.7, 1.7, 1.7] }),
    },
  ];
  const TOTAL_VERTICES = OBJETOS.reduce((n, o) => n + o.malla.v.length, 0);
  const TOTAL_CARAS = OBJETOS.reduce((n, o) => n + o.malla.caras.length, 0);
  const TOTAL_TRIANGULOS = OBJETOS.reduce((n, o) => n + o.malla.caras.reduce((t, c) => t + c.length - 2, 0), 0);

  // ---------- Canvas ----------
  const lienzo = $("lienzo");
  const g = lienzo.getContext("2d");
  let dpr = 1, fondo = null;
  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.max(1, Math.round(lienzo.clientWidth * dpr));
    lienzo.height = Math.max(1, Math.round(lienzo.clientHeight * dpr));
    fondo = g.createLinearGradient(0, 0, 0, lienzo.height);
    fondo.addColorStop(0, "#6f7d8b");
    fondo.addColorStop(1, "#22262a");
  }
  new ResizeObserver(medir).observe(lienzo);

  const LUZ = unitario([0.5, 0.9, 0.35]);
  const CERCA = 0.2;

  function dibujar(t, cuadro, seleccion) {
    const W = lienzo.width, H = lienzo.height;
    g.fillStyle = fondo;
    g.fillRect(0, 0, W, H);

    // Cámara que gira alrededor de la escena
    const giro = t * 0.12, inclinacion = 0.45, distancia = 19;
    const objetivo = [0, 1.4, 0];
    const camara = suma(objetivo, por([Math.cos(inclinacion) * Math.sin(giro), Math.sin(inclinacion), Math.cos(inclinacion) * Math.cos(giro)], distancia));
    const frente = unitario(resta(objetivo, camara));
    const derecha = unitario(cruz(frente, [0, 1, 0]));
    const arriba = cruz(derecha, frente);
    const focal = Math.min(W, H) * 1.25;
    const aCamara = (p) => { const d = resta(p, camara); return [punto(d, derecha), punto(d, arriba), punto(d, frente)]; };
    const aPantalla = ([x, y, z]) => [W / 2 + (x / z) * focal, H / 2 - (y / z) * focal];

    // Línea en 3D recortada contra el plano cercano
    function linea3d(a, b) {
      let pa = aCamara(a), pb = aCamara(b);
      if (pa[2] < CERCA && pb[2] < CERCA) return null;
      if (pa[2] < CERCA) pa = suma(pa, por(resta(pb, pa), (CERCA - pa[2]) / (pb[2] - pa[2])));
      if (pb[2] < CERCA) pb = suma(pb, por(resta(pa, pb), (CERCA - pb[2]) / (pa[2] - pb[2])));
      return [aPantalla(pa), aPantalla(pb)];
    }

    // Cuadrícula del piso
    for (let i = -10; i <= 10; i++) {
      for (const [a, b] of [[[i, 0, -10], [i, 0, 10]], [[-10, 0, i], [10, 0, i]]]) {
        const l = linea3d(a, b);
        if (!l) continue;
        g.strokeStyle = i === 0 ? "#151515" : "rgba(160,160,160,0.33)";
        g.lineWidth = (i === 0 ? 1.8 : 1) * dpr;
        g.beginPath();
        g.moveTo(...l[0]);
        g.lineTo(...l[1]);
        g.stroke();
      }
    }

    // Transformar objetos y juntar todas sus caras
    const caras = [];
    const estados = OBJETOS.map((o) => {
      const e = o.anim(cuadro);
      const mundo = o.malla.v.map((v) => suma(rotar([v[0] * e.s[0], v[1] * e.s[1], v[2] * e.s[2]], e.r), e.p));
      const cam = mundo.map(aCamara);
      for (const cara of o.malla.caras) {
        if (cara.some((i) => cam[i][2] < CERCA)) continue;
        const pts = cara.map((i) => mundo[i]);
        const n = unitario(normal(pts));
        const centro = promedio(pts);
        const haciaCamara = unitario(resta(camara, centro));
        if (punto(n, haciaCamara) <= 0) continue; // cara de espaldas
        const luz = 0.3 + 0.5 * Math.max(0, punto(n, LUZ)) + 0.25 * Math.max(0, punto(n, haciaCamara));
        caras.push({
          pts: cara.map((i) => aPantalla(cam[i])),
          prof: cara.reduce((s, i) => s + cam[i][2], 0) / cara.length,
          color: `rgb(${o.color.map((c) => Math.min(255, Math.round(c * luz))).join(",")})`,
          sel: o === seleccion,
        });
      }
      return e;
    });

    // Sombras suaves en el piso
    OBJETOS.forEach((o, k) => {
      const e = estados[k];
      const alfa = 0.35 * (1 - Math.min(1, (e.p[1] - o.radio) / 4));
      const r = o.radio * Math.max(e.s[0], e.s[2]) * 1.1;
      const pts = [];
      for (let i = 0; i < 20; i++) {
        const c = aCamara([e.p[0] + r * Math.cos((i / 20) * TAU), 0.01, e.p[2] + r * Math.sin((i / 20) * TAU)]);
        if (c[2] < CERCA) return;
        pts.push(aPantalla(c));
      }
      g.fillStyle = `rgba(0,0,0,${alfa.toFixed(3)})`;
      g.beginPath();
      pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
      g.fill();
    });

    // Pintar de atrás hacia adelante
    caras.sort((a, b) => b.prof - a.prof);
    g.lineJoin = "round";
    for (const c of caras) {
      g.beginPath();
      c.pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
      g.closePath();
      g.fillStyle = c.color;
      g.fill();
      g.strokeStyle = c.sel ? "rgba(255,205,8,0.95)" : "rgba(0,0,0,0.2)";
      g.lineWidth = (c.sel ? 1.1 : 0.6) * dpr;
      g.stroke();
    }

    // Manipulador de mover sobre el objeto seleccionado
    const e = estados[OBJETOS.indexOf(seleccion)];
    const largo = seleccion.radio + 1.3;
    for (const [eje, color] of [[[1, 0, 0], "#ff4040"], [[0, 1, 0], "#40ff40"], [[0, 0, 1], "#4a8cff"]]) {
      const l = linea3d(e.p, suma(e.p, por(eje, largo)));
      if (!l) continue;
      const [a, b] = l;
      g.strokeStyle = g.fillStyle = color;
      g.lineWidth = 2.5 * dpr;
      g.beginPath();
      g.moveTo(...a);
      g.lineTo(...b);
      g.stroke();
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), tam = 11 * dpr;
      g.beginPath();
      g.moveTo(b[0] + Math.cos(ang) * tam, b[1] + Math.sin(ang) * tam);
      g.lineTo(b[0] + Math.cos(ang + 2.4) * tam * 0.6, b[1] + Math.sin(ang + 2.4) * tam * 0.6);
      g.lineTo(b[0] + Math.cos(ang - 2.4) * tam * 0.6, b[1] + Math.sin(ang - 2.4) * tam * 0.6);
      g.fill();
    }
    const centro = aCamara(e.p);
    if (centro[2] > CERCA) {
      const [x, y] = aPantalla(centro);
      g.fillStyle = "#ffcd08";
      g.fillRect(x - 5 * dpr, y - 5 * dpr, 10 * dpr, 10 * dpr);
    }

    // Ejes de orientación (esquina inferior izquierda)
    const ox = 46 * dpr, oy = H - 46 * dpr, L = 28 * dpr;
    g.font = `${12 * dpr}px system-ui, sans-serif`;
    for (const [eje, color, nombre] of [[[1, 0, 0], "#ff4040", "X"], [[0, 1, 0], "#40ff40", "Y"], [[0, 0, 1], "#4a8cff", "Z"]]) {
      const x = ox + punto(eje, derecha) * L, y = oy - punto(eje, arriba) * L;
      g.strokeStyle = g.fillStyle = color;
      g.lineWidth = 2 * dpr;
      g.beginPath();
      g.moveTo(ox, oy);
      g.lineTo(x, y);
      g.stroke();
      g.fillText(nombre, x + 3 * dpr, y - 3 * dpr);
    }

    // Datos de la escena (arriba a la izquierda) y nombre de la cámara
    g.fillStyle = "rgba(235,235,235,0.9)";
    g.font = `${12 * dpr}px system-ui, sans-serif`;
    [`Vértices:    ${TOTAL_VERTICES}`, `Caras:       ${TOTAL_CARAS}`, `Triángulos:  ${TOTAL_TRIANGULOS}`, `Objetos:     ${OBJETOS.length}`]
      .forEach((txt, i) => g.fillText(txt, 14 * dpr, (22 + i * 17) * dpr));
    g.textAlign = "center";
    g.fillText("persp", W / 2, H - 14 * dpr);
    g.textAlign = "start";
  }

  // ---------- Esquema (outliner) ----------
  const esquema = $("esquema");
  for (const cam of ["persp", "top", "front", "side"]) {
    esquema.insertAdjacentHTML("beforeend", `<li class="camara"><span class="ico">⎚</span>${cam}</li>`);
  }
  const itemsEsquema = new Map();
  for (const o of OBJETOS) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="ico">${o.icono}</span>`;
    li.append(o.nombre);
    esquema.appendChild(li);
    itemsEsquema.set(o, li);
  }
  esquema.insertAdjacentHTML("beforeend", `<li class="camara"><span class="ico">✷</span>luzDireccional1</li>`);

  // ---------- Caja de canales ----------
  const CANALES = [
    ["tx", "Traslación X"], ["ty", "Traslación Y"], ["tz", "Traslación Z"],
    ["rx", "Rotación X"], ["ry", "Rotación Y"], ["rz", "Rotación Z"],
    ["sx", "Escala X"], ["sy", "Escala Y"], ["sz", "Escala Z"],
  ];
  const filas = {};
  for (const [id, etiqueta] of CANALES) {
    const fila = document.createElement("div");
    fila.className = "fila";
    fila.innerHTML = `<span>${etiqueta}</span><span></span>`;
    $("canales").appendChild(fila);
    filas[id] = fila;
  }
  $("canales").insertAdjacentHTML("beforeend", `<div class="fila"><span>Visibilidad</span><span>on</span></div>`);

  function actualizarCanales(o, cuadro) {
    const e = o.anim(cuadro);
    const grados = (r) => (((r * 180) / Math.PI) % 360).toFixed(3);
    const valores = {
      tx: e.p[0].toFixed(3), ty: e.p[1].toFixed(3), tz: e.p[2].toFixed(3),
      rx: grados(e.r[0]), ry: grados(e.r[1]), rz: grados(e.r[2]),
      sx: e.s[0].toFixed(3), sy: e.s[1].toFixed(3), sz: e.s[2].toFixed(3),
    };
    for (const id in valores) filas[id].lastChild.textContent = valores[id];
  }

  // ---------- Línea de tiempo ----------
  const regla = $("regla");
  for (let f = 0; f <= CUADROS; f += 10) {
    const s = document.createElement("span");
    s.className = "num";
    s.style.left = (f / CUADROS) * 100 + "%";
    s.textContent = Math.max(1, f);
    regla.insertBefore(s, $("marcas"));
  }

  // ---------- Editor de scripts ----------
  const script = $("script");
  const MAX_SCRIPT = 9;
  function escribirScript(texto, clase = "cmd") {
    const d = document.createElement("div");
    d.className = clase;
    d.textContent = texto;
    script.appendChild(d);
    while (script.childElementCount > MAX_SCRIPT) script.firstElementChild.remove();
  }
  const ATRIBUTOS = { tx: "translateX", ty: "translateY", tz: "translateZ", rx: "rotateX", ry: "rotateY", rz: "rotateZ", sx: "scaleX", sy: "scaleY", sz: "scaleZ" };
  function comandoAlAzar(o) {
    const r = Math.random();
    const f = pick(o.claves) + 1;
    if (r < 0.45) {
      const canal = pick(o.canales);
      const e = o.anim(f - 1);
      const valor = { t: e.p, r: e.r, s: e.s }[canal[0]]["xyz".indexOf(canal[1])];
      escribirScript(`cmds.setKeyframe("${o.nombre}", attribute="${ATRIBUTOS[canal]}", t=${f}, v=${valor.toFixed(2)})`);
    } else if (r < 0.65) {
      escribirScript(`cmds.keyTangent("${o.nombre}", itt="spline", ott="spline")`);
    } else if (r < 0.8) {
      escribirScript(`cmds.playbackOptions(min=1, max=${CUADROS})`);
    } else {
      escribirScript(`cmds.render("persp")`);
      escribirScript(`# Resultado: render_${String(f).padStart(4, "0")}.png`, "res");
    }
  }

  // ---------- Selección ----------
  let seleccion = OBJETOS[0];
  function seleccionar(o) {
    seleccion = o;
    itemsEsquema.forEach((li, obj) => li.classList.toggle("activo", obj === o));
    $("canales-nombre").textContent = o.nombre;
    $("canales-forma").textContent = o.nombre + "Shape";
    $("canales-entrada").textContent = o.entrada;
    for (const [id] of CANALES) filas[id].classList.toggle("clave", o.canales.includes(id));
    const marcas = $("marcas");
    marcas.textContent = "";
    for (const k of o.claves) {
      const m = document.createElement("div");
      m.className = "marca";
      m.style.left = (k / CUADROS) * 100 + "%";
      marcas.appendChild(m);
    }
    escribirScript(`cmds.select("${o.nombre}")`);
    escribirScript(`# Resultado: ['${o.nombre}']`, "res");
  }

  // ---------- Bucle ----------
  const inicio = performance.now();
  let siguienteSeleccion = 0, siguienteComando = 0, ultimoCuadro = -1;
  function cuadroAnim(ahora) {
    const t = (ahora - inicio) / 1000;
    const cuadro = (t * 24) % CUADROS;
    if (t >= siguienteSeleccion) {
      let o;
      do o = pick(OBJETOS); while (o === seleccion && t > 0);
      seleccionar(o);
      siguienteSeleccion = t + 4.5;
    }
    if (t >= siguienteComando) {
      comandoAlAzar(seleccion);
      siguienteComando = t + 1.2 + Math.random() * 1.2;
    }
    dibujar(t, cuadro, seleccion);
    const entero = Math.floor(cuadro);
    if (entero !== ultimoCuadro) {
      ultimoCuadro = entero;
      $("cuadro").textContent = entero + 1;
      $("cabezal").style.left = (cuadro / CUADROS) * 100 + "%";
      actualizarCanales(seleccion, cuadro);
    }
    requestAnimationFrame(cuadroAnim);
  }

  // ---------- Modo wallpaper ----------
  // Clic o tecla F: pantalla completa. El mouse se oculta si no se mueve.
  const pantallaCompleta = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  addEventListener("click", pantallaCompleta);
  addEventListener("keydown", (ev) => { if (ev.key === "f" || ev.key === "F") pantallaCompleta(); });

  let temporizadorMouse;
  addEventListener("mousemove", () => {
    document.body.classList.remove("sin-cursor");
    clearTimeout(temporizadorMouse);
    temporizadorMouse = setTimeout(() => document.body.classList.add("sin-cursor"), 2500);
  });

  // Evita que la pantalla se apague (donde el navegador lo permite).
  let bloqueo = null;
  async function mantenerEncendida() {
    try {
      if ("wakeLock" in navigator && document.visibilityState === "visible" && !bloqueo) {
        bloqueo = await navigator.wakeLock.request("screen");
        bloqueo.addEventListener("release", () => (bloqueo = null));
      }
    } catch {}
  }
  document.addEventListener("visibilitychange", mantenerEncendida);
  addEventListener("click", mantenerEncendida);
  mantenerEncendida();

  // ---------- Inicio ----------
  escribirScript("import maya.cmds as cmds");
  medir();
  requestAnimationFrame(cuadroAnim);
})();
