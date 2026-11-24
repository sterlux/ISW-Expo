// Splash / wallpaper: un IDE que escribe código aleatorio sin parar.
// La memoria no crece: el editor solo guarda las líneas que caben en pantalla,
// el minimapa, las pestañas y la terminal tienen tope, y el código se genera
// bloque por bloque conforme se necesita.
(() => {
  const $ = (id) => document.getElementById(id);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const entre = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // ---------- Vocabulario ----------
  const VERBOS = ["calcular", "obtener", "enviar", "leer", "validar", "procesar", "dibujar", "mover", "actualizar",
    "guardar", "cargar", "buscar", "ordenar", "contar", "filtrar", "detectar", "conectar", "girar", "medir", "iniciar"];
  const SUSTANTIVOS = ["Sensor", "Robot", "Usuario", "Tarjeta", "Motor", "Puntaje", "Jugador", "Mensaje", "Datos",
    "Color", "Mapa", "Nivel", "Archivo", "Ruta", "Pixel", "Imagen", "Nodo", "Equipo", "Distancia", "Pantalla"];
  const VARIABLES = ["velocidad", "distancia", "total", "contador", "angulo", "temperatura", "nombre", "puntos",
    "vidas", "resultado", "datos", "lista", "fila", "columna", "energia", "nivel", "posicion", "tiempo", "valor", "suma"];
  const TEXTOS = ["Hola, mundo", "¡Bienvenido a CETYS!", "Conectando...", "Sensor listo", "Nivel completado",
    "Error: sensor no encontrado", "Expo Ingeniería de Software", "Guardando datos", "¡Ganaste!", "Robot en línea"];
  const COMENTARIOS = ["TODO: optimizar esto", "calcula la ruta más corta", "lee el sensor ultrasónico",
    "convierte grados a radianes", "evita dividir entre cero", "actualiza el marcador", "aquí ocurre la magia ✨",
    "valida lo que escribe el usuario", "recorre la matriz fila por fila", "manda los datos al servidor"];
  const COMMITS = ["Agrega detección de colisiones", "Mejora el algoritmo de búsqueda", "Corrige error del sensor",
    "Agrega pruebas unitarias", "Optimiza el renderizado", "Refactoriza el motor del juego"];

  // ---------- Lenguajes y plantillas ----------
  // «v1» = misma variable en toda la plantilla, «v» = una nueva cada vez.
  // f = función, t = clase, n = número, s = texto, c = comentario.
  const LENGUAJES = {
    js: {
      nombre: "JavaScript", icono: "JS", comentario: "//", nombres: "camel",
      claves: "const let var function class new this async true false null undefined of in typeof extends",
      control: "return if else for while import export from default try catch await break switch case",
      plantillas: [
`// «c»
function «f1»(«v1», «v2») {
  const «v3» = «v1» * «n» + «v2»;
  if («v3» > «n») {
    console.log("«s»", «v3»);
    return «v3»;
  }
  return 0;
}`,
`class «t1» {
  constructor(«v1») {
    this.«v1» = «v1»;
    this.«v2» = [];
  }

  «f1»() {
    for (let i = 0; i < «n»; i++) {
      this.«v2».push(i * «n»);
    }
    return this.«v2».length;
  }
}`,
`const «v1» = «v2»
  .filter((d) => d.«v3» > «n»)
  .map((d) => d.«v4»);`,
`async function «f1»() {
  try {
    const res = await fetch("/api/«v1»");
    const «v2» = await res.json();
    return «v2».«v3» ?? «n»;
  } catch (error) {
    console.error("«s»");
  }
}`,
`const «v1» = {
  «v2»: «n»,
  «v3»: "«s»",
  «v4»: true,
};`,
`boton.addEventListener("click", () => {
  «v1» += «n»;
  «f1»(«v1»);
});`,
`export function «f1»(«v1» = «n») {
  return «v1» % 2 === 0 ? "«s»" : null;
}`,
      ],
    },
    py: {
      nombre: "Python", icono: "py", comentario: "#", nombres: "snake",
      claves: "def class self True False None and or not in is lambda as print len range",
      control: "return if elif else for while import from try except with pass break continue",
      plantillas: [
`def «f1»(«v1», «v2»):
    """«c»"""
    «v3» = 0
    for i in range(«n»):
        «v3» += «v1» * i - «v2»
    return «v3»`,
`class «t1»:
    def __init__(self, «v1»):
        self.«v1» = «v1»
        self.«v2» = []

    def «f1»(self):
        while self.«v1» < «n»:
            self.«v1» += 1
        print(f"«s» {self.«v1»}")`,
`# «c»
«v1» = [«v2» * 2 for «v2» in range(«n») if «v2» % 2 == 0]
print(len(«v1»))`,
`if «v1» > «n»:
    print("«s»")
elif «v1» == 0:
    «f1»()
else:
    «v1» -= 1`,
`try:
    with open("«v1».txt") as archivo:
        «v2» = archivo.read()
except FileNotFoundError:
    print("«s»")`,
`def «f1»(«v1»):
    # «c»
    return sorted(«v1», key=lambda x: x[«n»])`,
      ],
    },
    java: {
      nombre: "Java", icono: "J", comentario: "//", nombres: "camel",
      claves: "public private protected class static void int double boolean new this final extends true false null",
      control: "return if else for while import package try catch break switch case",
      plantillas: [
`public class «t1» {
    private int «v1»;
    private String «v2» = "«s»";

    public «t1»(int «v1») {
        this.«v1» = «v1»;
    }

    public int «f1»(int «v3») {
        return «v1» * «v3» + «n»;
    }
}`,
`for (int i = 0; i < «n»; i++) {
    if (i % «n» == 0) {
        System.out.println("«s» " + i);
    }
}`,
`// «c»
public static double «f1»(double «v1», double «v2») {
    return Math.sqrt(«v1» * «v1» + «v2» * «v2»);
}`,
`List<String> «v1» = new ArrayList<>();
«v1».add("«s»");
«v1».forEach(System.out::println);`,
`while («v1» < «n») {
    «v1» += «f1»(«v1»);
}`,
      ],
    },
  };
  for (const L of Object.values(LENGUAJES)) {
    L.claves = new Set(L.claves.split(" "));
    L.control = new Set(L.control.split(" "));
  }

  const ARCHIVOS = [
    "tarjeta.js", "juego.js", "api.js", "app.js",
    "robot.py", "sensores.py", "vision.py", "datos.py",
    "Main.java", "Jugador.java", "Calculadora.java",
  ].map((nombre) => ({ nombre, L: LENGUAJES[nombre.split(".").pop()], ext: nombre.split(".").pop() }));

  function nombreFuncion(L) {
    const v = pick(VERBOS), s = pick(SUSTANTIVOS);
    return L.nombres === "snake" ? `${v}_${s.toLowerCase()}` : v + s;
  }

  // Rellena una plantilla con nombres, números y textos al azar.
  function rellenar(plantilla, L) {
    const fijos = {};
    const usados = new Set();
    const nuevo = (tipo) => {
      for (let intento = 0; intento < 6; intento++) {
        const x = {
          v: () => pick(VARIABLES),
          f: () => nombreFuncion(L),
          t: () => pick(SUSTANTIVOS),
          n: () => String(entre(2, 99)),
          s: () => pick(TEXTOS),
          c: () => pick(COMENTARIOS),
        }[tipo]();
        if (!usados.has(x) || tipo === "n") { usados.add(x); return x; }
      }
      return pick(VARIABLES) + entre(2, 9);
    };
    return plantilla.replace(/«([a-z])(\d?)»/g, (todo, tipo, num) => {
      if (!num) return nuevo(tipo);
      return (fijos[todo] ||= nuevo(tipo));
    });
  }

  // Resaltado de sintaxis sencillo: devuelve [[clase, texto], …]
  function colorear(linea, L) {
    const com = L.comentario === "#" ? "#.*" : "\\/\\/.*";
    const re = new RegExp(`(\\s+)|(${com})|("""[^"]*"""|f?"[^"]*"|'[^']*'|\`[^\`]*\`)|(\\d+(?:\\.\\d+)?)|([A-Za-z_]\\w*)|(.)`, "gy");
    const tokens = [];
    let m;
    while ((m = re.exec(linea))) {
      const [texto, esp, comentario, cadena, numero, palabra] = m;
      let tipo = "p";
      if (esp) tipo = "p";
      else if (comentario) tipo = "m";
      else if (cadena) tipo = "s";
      else if (numero) tipo = "n";
      else if (palabra) {
        const sigue = linea.slice(re.lastIndex).trimStart()[0];
        if (L.control.has(palabra)) tipo = "c";
        else if (L.claves.has(palabra)) tipo = "k";
        else if (sigue === "(") tipo = "f";
        else if (/^[A-Z]/.test(palabra)) tipo = "t";
        else tipo = "v";
      }
      tokens.push([tipo, texto]);
    }
    return tokens;
  }

  // ---------- Elementos ----------
  const lineas = $("lineas");
  const contenido = $("contenido"); // se desplaza hacia arriba como un scroll
  const terminal = $("terminal");
  const pestanas = $("pestanas");
  const lista = $("archivos");
  const canvas = $("minimapa");
  const g = canvas.getContext("2d");

  const MAX_PESTANAS = 5;
  const MAX_TERMINAL = 8;
  const MAX_MAPA = 160;

  const itemsArchivo = new Map();
  for (const a of ARCHIVOS) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="icono ${a.ext}">${a.L.icono}</span>`;
    li.append(a.nombre);
    lista.appendChild(li);
    itemsArchivo.set(a.nombre, li);
  }

  let maxLineas = 20;
  let alto = 20;
  function medir() {
    alto = parseFloat(getComputedStyle(lineas).lineHeight) || 20;
    maxLineas = Math.max(4, Math.floor(lineas.clientHeight / alto) - 1);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    recortar();
    dibujarMapa();
  }
  addEventListener("resize", medir);

  // Cuando el código llega al fondo, las líneas de arriba se borran del DOM
  // y el contenido sube con una animación corta, como si se hiciera scroll.
  function recortar(animar = false) {
    let borradas = 0;
    while (contenido.childElementCount > maxLineas) {
      contenido.firstElementChild.remove();
      borradas++;
    }
    if (!animar || !borradas) return;
    contenido.style.transition = "none";
    contenido.style.transform = `translateY(${borradas * alto}px)`;
    void contenido.offsetHeight; // aplica la posición inicial antes de animar
    contenido.style.transition = "transform 0.18s ease-out";
    contenido.style.transform = "translateY(0)";
  }

  // ---------- Minimapa ----------
  const COLORES = { k: "#569cd6", c: "#c586c0", s: "#ce9178", n: "#b5cea8", m: "#6a9955", f: "#dcdcaa", v: "#9cdcfe", t: "#4ec9b0", p: "#d4d4d4" };
  let mapa = [];
  function dibujarMapa() {
    const dpr = window.devicePixelRatio || 1;
    const alto = 3 * dpr, ancho = 1.4 * dpr;
    g.clearRect(0, 0, canvas.width, canvas.height);
    const caben = Math.floor(canvas.height / alto);
    const desde = Math.max(0, mapa.length - caben);
    // Zona visible del editor
    const visibles = Math.min(maxLineas, mapa.length);
    g.fillStyle = "rgba(121,121,121,0.18)";
    g.fillRect(0, (mapa.length - desde - visibles) * alto, canvas.width, visibles * alto);
    mapa.slice(desde).forEach((tokens, fila) => {
      let x = 4 * dpr;
      for (const [tipo, texto] of tokens) {
        if (tipo !== "p" || texto.trim()) {
          g.globalAlpha = 0.75;
          g.fillStyle = COLORES[tipo];
          g.fillRect(x, fila * alto, texto.length * ancho, alto - dpr);
        }
        x += texto.length * ancho;
      }
    });
    g.globalAlpha = 1;
  }

  // ---------- Terminal ----------
  function escribirTerminal(html, clase = "") {
    const d = document.createElement("div");
    d.className = clase;
    d.innerHTML = html;
    terminal.appendChild(d);
    while (terminal.childElementCount > MAX_TERMINAL) terminal.firstElementChild.remove();
  }
  function comando(cmd) {
    escribirTerminal(`<span class="prompt">expo-cetys ❯</span> <b></b>`);
    terminal.lastElementChild.querySelector("b").textContent = cmd;
  }

  function alGuardar(a) {
    const base = a.nombre.replace(/\.\w+$/, "");
    if (Math.random() < 0.3) {
      comando(`git commit -am "${pick(COMMITS)}"`);
      escribirTerminal(`[main ${Math.random().toString(16).slice(2, 9)}] ${entre(1, 4)} files changed, ${entre(5, 80)} insertions(+)`);
      return;
    }
    if (a.ext === "js") {
      comando(`node ${a.nombre}`);
      escribirTerminal(`✓ ${entre(4, 40)} pruebas pasaron (${entre(30, 900)} ms)`, "ok");
    } else if (a.ext === "py") {
      comando(`python ${a.nombre}`);
      escribirTerminal(`Listo: ${entre(10, 500)} lecturas procesadas`, "ok");
    } else {
      comando(`javac ${a.nombre} && java ${base}`);
      escribirTerminal(`BUILD SUCCESSFUL in ${entre(1, 9)}s`, "ok");
    }
  }

  // ---------- Archivos y pestañas ----------
  let archivo = null;
  let bloquesRestantes = 0;
  let cola = [];
  let numero = 0;

  function abrirArchivo() {
    let a;
    do a = pick(ARCHIVOS); while (archivo && a === archivo && ARCHIVOS.length > 1);
    archivo = a;
    cola = [];
    numero = 0;
    contenido.textContent = "";
    mapa = [];
    // El archivo se abre con código ya escrito para que la pantalla nunca se vea vacía.
    bloquesRestantes = Infinity;
    while (contenido.childElementCount < Math.floor(maxLineas * 0.65)) lineaEscrita(siguienteLinea());
    bloquesRestantes = entre(2, 5);
    dibujarMapa();

    itemsArchivo.forEach((li, nombre) => li.classList.toggle("activo", nombre === a.nombre));
    let tab = [...pestanas.children].find((t) => t.dataset.nombre === a.nombre);
    if (!tab) {
      tab = document.createElement("div");
      tab.className = "pestana";
      tab.dataset.nombre = a.nombre;
      tab.innerHTML = `<span class="icono ${a.ext}">${a.L.icono}</span>`;
      tab.append(a.nombre);
      tab.insertAdjacentHTML("beforeend", '<span class="cerrar"></span>');
      pestanas.appendChild(tab);
      while (pestanas.childElementCount > MAX_PESTANAS) pestanas.firstElementChild.remove();
    }
    for (const t of pestanas.children) t.classList.toggle("activa", t === tab);
    tab.classList.remove("guardada");
    $("titulo-ventana").textContent = `${a.nombre} — expo-cetys`;
    $("migas").textContent = `src › ${a.nombre}`;
    $("estado-lenguaje").textContent = a.L.nombre;
  }

  function siguienteLinea() {
    if (!cola.length) {
      if (bloquesRestantes-- <= 0) return null;
      cola = rellenar(pick(archivo.L.plantillas), archivo.L).split("\n");
      if (numero > 0) cola.unshift("");
    }
    return cola.shift();
  }

  // ---------- Escritura ----------
  let actual = null; // { el, txt, tokens, i, j, span }
  let espera = 600;
  let intervalo = 40;

  // Pone una línea completa de golpe (al abrir un archivo).
  function lineaEscrita(texto) {
    numero++;
    const el = document.createElement("div");
    el.className = "linea";
    el.innerHTML = `<span class="num">${numero}</span><span class="txt"></span>`;
    const tokens = colorear(texto, archivo.L);
    for (const [tipo, t] of tokens) {
      const span = document.createElement("span");
      span.className = tipo;
      span.textContent = t;
      el.lastChild.appendChild(span);
    }
    contenido.appendChild(el);
    mapa.push(tokens);
  }

  function nuevaLinea(texto) {
    numero++;
    const el = document.createElement("div");
    el.className = "linea actual";
    el.innerHTML = `<span class="num">${numero}</span><span class="txt"></span>`;
    contenido.appendChild(el);
    recortar(true);
    const tokens = colorear(texto, archivo.L);
    actual = { el, txt: el.lastChild, tokens, texto, i: 0, j: 0, span: null, col: 0 };
    // La sangría aparece de golpe, como hace el editor.
    if (tokens[0] && tokens[0][0] === "p" && !tokens[0][1].trim()) {
      actual.txt.append(tokens[0][1]);
      actual.col = tokens[0][1].length;
      actual.i = 1;
    }
  }

  function terminarLinea() {
    actual.el.classList.remove("actual");
    mapa.push(actual.tokens);
    if (mapa.length > MAX_MAPA) mapa.shift();
    dibujarMapa();
    const r = Math.random();
    espera = r < 0.08 ? entre(500, 1200) : r < 0.3 ? entre(80, 250) : 0;
    actual = null;
  }

  function paso() {
    if (!actual) {
      const texto = siguienteLinea();
      if (texto === null) {
        // Archivo terminado: "guardar", correr en la terminal y abrir otro.
        pestanas.querySelector(".activa")?.classList.add("guardada");
        alGuardar(archivo);
        abrirArchivo();
        espera = entre(1400, 2400);
        return;
      }
      nuevaLinea(texto);
      if (!actual.tokens.length || actual.i >= actual.tokens.length) terminarLinea();
      return;
    }
    const [tipo, texto] = actual.tokens[actual.i];
    if (!actual.span) {
      actual.span = document.createElement("span");
      actual.span.className = tipo;
      actual.txt.appendChild(actual.span);
    }
    // A veces el "autocompletado" termina la palabra de golpe.
    let n = 1;
    if (actual.j === 2 && /^[fvt]$/.test(tipo) && texto.length > 6 && Math.random() < 0.35) n = texto.length - 2;
    actual.span.textContent += texto.slice(actual.j, actual.j + n);
    actual.j += n;
    actual.col += n;
    if (actual.j >= texto.length) {
      actual.i++;
      actual.j = 0;
      actual.span = null;
    }
    $("estado-pos").textContent = `Ln ${numero}, Col ${actual.col + 1}`;
    intervalo = (tipo === "m" ? 10 : 16) + Math.random() * 36;
    if (actual.i >= actual.tokens.length) terminarLinea();
  }

  let anterior = performance.now();
  let acumulado = 0;
  function cuadro(ahora) {
    // Si la pestaña estuvo oculta no se intenta "ponerse al día" de golpe.
    const dt = Math.min(ahora - anterior, 100);
    anterior = ahora;
    if (espera > 0) espera -= dt;
    else {
      acumulado += dt;
      let tope = 6;
      while (acumulado >= intervalo && espera <= 0 && tope--) {
        acumulado -= intervalo;
        paso();
      }
      if (espera > 0) acumulado = 0;
    }
    requestAnimationFrame(cuadro);
  }

  // ---------- Modo wallpaper ----------
  // Clic o tecla F: pantalla completa. El mouse se oculta si no se mueve.
  const pantallaCompleta = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  addEventListener("click", pantallaCompleta);
  addEventListener("keydown", (e) => { if (e.key === "f" || e.key === "F") pantallaCompleta(); });

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
  comando("code .");
  medir();
  abrirArchivo();
  requestAnimationFrame(cuadro);
})();
