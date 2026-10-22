// Lógica compartida entre el editor (index.html) y la vista (v.html):
// limpiar datos, construir/leer la URL y dibujar la tarjeta.
const Tarjeta = (() => {
  const MAX_URL = 450;
  const LIMITES = { nombre: 24, mensaje: 100 };
  const DEFAULTS = {
    nombre: "Tu Nombre",
    color: "#7c3aed",
    emoji: "🚀",
    mensaje: "¡Hola! Esta tarjeta la programé yo.",
  };

  // Corta por "caracteres visibles" (graphemes) para no partir un emoji a la mitad.
  function graphemes(texto) {
    if (window.Intl && Intl.Segmenter) {
      const seg = new Intl.Segmenter("es", { granularity: "grapheme" });
      return Array.from(seg.segment(texto), (s) => s.segment);
    }
    return Array.from(texto);
  }

  function recortar(texto, max) {
    return graphemes(String(texto ?? "")).slice(0, max).join("");
  }

  // Emojis que no se permiten (aunque se escriban con el teclado o en la URL).
  const EMOJIS_BLOQUEADOS = ["🖕", "🍆", "💦", "🍑", "🔞"];

  function emojiPermitido(e) {
    // Se ignoran tonos de piel y selector de variación para comparar el emoji base.
    const base = e.replace(/[\u{1F3FB}-\u{1F3FF}️]/gu, "");
    return !EMOJIS_BLOQUEADOS.includes(base);
  }

  function colorValido(c) {
    const hex = String(c ?? "").trim().replace(/^#/, "");
    return /^[0-9a-f]{6}$/i.test(hex) ? "#" + hex.toLowerCase() : null;
  }

  function limpiar(d = {}) {
    // Un texto con groserías se cambia por el de por defecto (también si llega por la URL).
    const permitido = (t) => (typeof Filtro !== "undefined" && Filtro.esOfensivo(t) ? "" : t);
    const nombre = permitido(recortar(d.nombre, LIMITES.nombre).trim());
    const mensaje = permitido(recortar(d.mensaje, LIMITES.mensaje).trim());
    const emoji = graphemes(String(d.emoji ?? "").trim())[0];
    return {
      nombre: nombre || DEFAULTS.nombre,
      color: colorValido(d.color) || DEFAULTS.color,
      emoji: emoji && emojiPermitido(emoji) ? emoji : DEFAULTS.emoji,
      mensaje: mensaje || DEFAULTS.mensaje,
    };
  }

  // Texto blanco u oscuro según qué contraste mejor con el color elegido.
  function colorTexto(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.4 ? "#14141f" : "#ffffff";
  }

  // Parámetros de una letra para que la URL quepa en el sticker NFC.
  function aURL(datos, base = new URL("v.html", location.href)) {
    const d = limpiar(datos);
    const url = new URL(base);
    url.search = new URLSearchParams({
      n: d.nombre,
      c: d.color.slice(1),
      e: d.emoji,
      m: d.mensaje,
    }).toString();
    url.hash = "";
    return url.toString();
  }

  function desdeURL(search = location.search) {
    const p = new URLSearchParams(search);
    const vacia = !["n", "c", "e", "m"].some((k) => p.has(k));
    return {
      vacia,
      datos: limpiar({ nombre: p.get("n"), color: p.get("c"), emoji: p.get("e"), mensaje: p.get("m") }),
    };
  }

  function dibujar(el, datos) {
    const d = limpiar(datos);
    el.style.setProperty("--c", d.color);
    el.style.setProperty("--tinta", colorTexto(d.color));
    el.querySelector("[data-emoji]").textContent = d.emoji;
    el.querySelector("[data-nombre]").textContent = d.nombre;
    el.querySelector("[data-mensaje]").textContent = d.mensaje;
    return d;
  }

  // Lanza confeti del color de la tarjeta dentro de `contenedor`.
  function confeti(contenedor, color, cantidad = 40) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colores = [color, "#ffffff", "#ffd166", "#06d6a0", "#4cc9f0"];
    // Sale del centro de la tarjeta (o del contenedor si no hay tarjeta).
    const caja = contenedor.getBoundingClientRect();
    const origen = (contenedor.querySelector(".tarjeta") || contenedor).getBoundingClientRect();
    const cx = origen.left - caja.left - contenedor.clientLeft + origen.width / 2;
    const cy = origen.top - caja.top - contenedor.clientTop + origen.height / 2;
    for (let i = 0; i < cantidad; i++) {
      const p = document.createElement("span");
      p.className = "confeti";
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      // Explosión en todas direcciones, un poco más hacia arriba.
      const angulo = Math.random() * Math.PI * 2;
      const fuerza = Math.random() * 120 + 90;
      p.style.setProperty("--x", Math.cos(angulo) * fuerza + "px");
      p.style.setProperty("--y", Math.sin(angulo) * fuerza - 60 + "px");
      p.style.setProperty("--r", Math.random() * 720 - 360 + "deg");
      p.style.setProperty("--d", Math.random() * 0.25 + "s");
      p.style.background = colores[i % colores.length];
      contenedor.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  }

  return { MAX_URL, LIMITES, DEFAULTS, limpiar, aURL, desdeURL, dibujar, confeti, colorValido, graphemes };
})();
