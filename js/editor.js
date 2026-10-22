(() => {
  const $ = (id) => document.getElementById(id);
  const campos = { nombre: $("nombre"), color: $("color"), emoji: $("emoji"), mensaje: $("mensaje") };
  const tarjeta = $("tarjeta");
  const escenario = $("escenario");
  const estado = $("estado");
  const btnNfc = $("btn-nfc");
  const btnCancelar = $("btn-cancelar");
  const btnCopiar = $("btn-copiar");
  const btnAbrir = $("btn-abrir");

  const COLORES = ["#7c3aed", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#ec4899", "#111827"];
  const EMOJIS = ["🚀", "💻", "🤖", "🎮", "🎨", "⚽", "🎧", "🔥", "🌟", "🐱", "🧠", "🍕"];

  const hayNFC = "NDEFReader" in window;
  let urlActual = "";
  let urlValida = false;
  let grabando = null; // AbortController mientras se espera el sticker

  // ---------- Estado inicial ----------
  campos.nombre.maxLength = Tarjeta.LIMITES.nombre * 2; // margen para emojis; se recorta al dibujar
  campos.mensaje.maxLength = Tarjeta.LIMITES.mensaje * 2;
  campos.nombre.placeholder = Tarjeta.DEFAULTS.nombre;
  campos.mensaje.placeholder = Tarjeta.DEFAULTS.mensaje;
  campos.emoji.placeholder = Tarjeta.DEFAULTS.emoji;

  // Si llegan parámetros (p. ej. desde "Editar" en la vista), se cargan.
  const previo = Tarjeta.desdeURL();
  const inicial = previo.vacia ? Tarjeta.DEFAULTS : previo.datos;
  campos.nombre.value = inicial.nombre;
  campos.color.value = inicial.color;
  campos.emoji.value = inicial.emoji;
  campos.mensaje.value = inicial.mensaje;

  function chip(texto, alClic, estilo) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = texto;
    if (estilo) Object.assign(b.style, estilo);
    b.addEventListener("click", alClic);
    return b;
  }

  COLORES.forEach((c) =>
    $("chips-color").appendChild(
      chip("", () => { campos.color.value = c; actualizar(true); }, { background: c })
    ).setAttribute("aria-label", "Color " + c)
  );
  EMOJIS.forEach((e) =>
    $("chips-emoji").appendChild(chip(e, () => { campos.emoji.value = e; actualizar(true); }))
  );
  const btnTodos = chip("Ver todos ▾", abrirSelector);
  btnTodos.classList.add("chip-todos");
  btnTodos.setAttribute("aria-haspopup", "dialog");
  $("chips-emoji").appendChild(btnTodos);

  // ---------- Selector con todos los emojis ----------
  const selector = $("selector-emoji");
  const selectorLista = $("selector-lista");
  const selectorTabs = $("selector-tabs");

  // Se construye la primera vez que se abre para no cargar ~1,800 botones al inicio.
  function construirSelector() {
    EMOJIS_TODOS.forEach((g, i) => {
      const seccion = document.createElement("section");
      seccion.id = "cat-" + i;
      const h = document.createElement("h4");
      h.textContent = g.nombre;
      const rejilla = document.createElement("div");
      rejilla.className = "selector-rejilla";
      g.lista.split(" ").forEach((e) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = e;
        rejilla.appendChild(b);
      });
      seccion.append(h, rejilla);
      selectorLista.appendChild(seccion);

      const tab = document.createElement("button");
      tab.type = "button";
      tab.textContent = g.icono;
      tab.title = g.nombre;
      tab.setAttribute("aria-label", g.nombre);
      tab.addEventListener("click", () => seccion.scrollIntoView({ block: "start" }));
      selectorTabs.appendChild(tab);
    });
  }

  function abrirSelector() {
    if (!selectorLista.childElementCount) construirSelector();
    const actual = Tarjeta.limpiar(leer()).emoji;
    selectorLista.querySelectorAll(".selector-rejilla button").forEach((b) =>
      b.classList.toggle("elegido", b.textContent === actual)
    );
    selector.showModal();
    selectorLista.querySelector(".elegido")?.scrollIntoView({ block: "center" });
  }

  selectorLista.addEventListener("click", (ev) => {
    const b = ev.target.closest(".selector-rejilla button");
    if (!b) return;
    campos.emoji.value = b.textContent;
    selector.close();
    actualizar(true);
  });
  $("selector-cerrar").addEventListener("click", () => selector.close());
  // Tocar fuera del panel lo cierra.
  selector.addEventListener("click", (ev) => { if (ev.target === selector) selector.close(); });

  // ---------- Actualización en vivo ----------
  function leer() {
    return {
      nombre: campos.nombre.value,
      color: campos.color.value,
      emoji: campos.emoji.value,
      mensaje: campos.mensaje.value,
    };
  }

  function rebote() {
    tarjeta.classList.remove("rebote");
    void tarjeta.offsetWidth; // reinicia la animación
    tarjeta.classList.add("rebote");
  }

  function actualizar(conRebote = false) {
    const crudo = leer();
    const d = Tarjeta.dibujar(tarjeta, crudo);
    $("color-hex").textContent = d.color;

    // Avisar si el texto se pasa del límite o trae groserías
    const ofensivos = [];
    ["nombre", "mensaje"].forEach((k) => {
      const largo = Tarjeta.graphemes(crudo[k]).length;
      const ofensivo = Filtro.esOfensivo(crudo[k]);
      if (ofensivo) ofensivos.push(k);
      campos[k].classList.toggle("excede", largo > Tarjeta.LIMITES[k] || ofensivo);
      campos[k].title = ofensivo ? "Este texto tiene palabras no permitidas" : `${largo} / ${Tarjeta.LIMITES[k]} caracteres`;
    });
    ajustarAncho();

    urlActual = Tarjeta.aURL(crudo);
    const largo = urlActual.length;
    urlValida = largo <= Tarjeta.MAX_URL && !ofensivos.length;

    $("url").textContent = urlActual;
    const pct = Math.min(100, (largo / Tarjeta.MAX_URL) * 100);
    const medidor = $("medidor");
    medidor.style.width = pct + "%";
    medidor.dataset.nivel = !urlValida ? "mal" : pct > 80 ? "casi" : "bien";
    $("contador").textContent = ofensivos.length
      ? `🚫 Tu ${ofensivos.join(" y ")} tiene palabras no permitidas. Cámbialo para poder generar tu tarjeta.`
      : urlValida
        ? `${largo} / ${Tarjeta.MAX_URL} caracteres ✅`
        : `${largo} / ${Tarjeta.MAX_URL} caracteres ❌ La URL es muy larga: acorta el nombre o el mensaje (los emojis ocupan ~12 caracteres cada uno).`;
    $("contador").classList.toggle("error", !urlValida);

    btnCopiar.disabled = !urlValida;
    btnNfc.disabled = !urlValida || !!grabando;
    btnAbrir.classList.toggle("deshabilitado", !urlValida);
    if (urlValida) btnAbrir.href = urlActual;
    else btnAbrir.removeAttribute("href");

    dibujarQR();
    if (conRebote) rebote();
  }

  // Ajusta el ancho de los inputs al texto (respaldo si no hay `field-sizing`).
  function ajustarAncho() {
    if (CSS.supports && CSS.supports("field-sizing", "content")) return;
    ["nombre", "emoji", "mensaje"].forEach((k) => {
      const v = campos[k].value || campos[k].placeholder;
      campos[k].style.width = Math.max(2, Tarjeta.graphemes(v).length + 1) + "ch";
    });
  }

  function dibujarQR() {
    const caja = $("qr");
    if (!urlValida || typeof qrcode !== "function") {
      caja.innerHTML = '<p class="nota">La URL debe ser válida para generar el QR.</p>';
      return;
    }
    const qr = qrcode(0, "M");
    qr.addData(urlActual);
    qr.make();
    caja.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: "Código QR de tu tarjeta" });
  }

  let temporizador;
  Object.values(campos).forEach((input) =>
    input.addEventListener("input", () => {
      actualizar();
      clearTimeout(temporizador);
      temporizador = setTimeout(rebote, 350);
    })
  );
  tarjeta.addEventListener("click", () => Tarjeta.confeti(escenario, Tarjeta.limpiar(leer()).color, 24));

  // ---------- Copiar ----------
  btnCopiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(urlActual);
      avisar("📋 URL copiada.", "ok");
    } catch {
      const r = document.createRange();
      r.selectNodeContents($("url"));
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      avisar("Selecciona y copia la URL manualmente.", "info");
    }
  });

  // ---------- Web NFC ----------
  function avisar(texto, tipo = "info") {
    estado.textContent = texto;
    estado.dataset.tipo = tipo;
  }

  if (!hayNFC) {
    btnNfc.classList.add("sin-soporte");
    $("qr-caja").open = true;
    avisar(
      window.isSecureContext
        ? "Este navegador no soporta Web NFC. Usa Chrome en Android, o el QR de abajo."
        : "Web NFC necesita HTTPS (GitHub Pages ya lo tiene). Mientras, usa el QR de abajo.",
      "info"
    );
  }

  function terminarGrabacion() {
    grabando = null;
    btnCancelar.classList.add("oculto");
    btnNfc.classList.remove("esperando");
    btnNfc.textContent = "📲 Grabar en sticker NFC";
    btnNfc.disabled = !urlValida;
  }

  btnNfc.addEventListener("click", async () => {
    if (!hayNFC) {
      avisar("Tu navegador no tiene Web NFC 😕. Abre esta página en Chrome para Android, o usa el QR.", "error");
      $("qr-caja").open = true;
      return;
    }
    if (!urlValida) return;

    grabando = new AbortController();
    const url = urlActual;
    btnNfc.disabled = true;
    btnNfc.classList.add("esperando");
    btnNfc.textContent = "📡 Acerca el sticker…";
    btnCancelar.classList.remove("oculto");
    avisar("Pega el sticker a la parte trasera del celular y no lo muevas.", "info");

    const limite = setTimeout(() => grabando?.abort(), 30000);
    try {
      const ndef = new NDEFReader();
      await ndef.write(
        { records: [{ recordType: "url", data: url }] },
        { overwrite: true, signal: grabando.signal }
      );
      avisar("✅ ¡Listo! Acerca el sticker a cualquier celular para ver tu tarjeta.", "ok");
      if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
      Tarjeta.confeti(escenario, Tarjeta.limpiar(leer()).color, 60);
    } catch (err) {
      const mensajes = {
        AbortError: "Se canceló la grabación (o pasaron 30 s sin detectar sticker).",
        NotAllowedError: "Permiso de NFC denegado. Actívalo en los ajustes del sitio y revisa que el NFC del celular esté encendido.",
        NotSupportedError: "Este celular no tiene NFC o está desactivado.",
        NotReadableError: "No se pudo usar el lector NFC. ¿Está encendido el NFC?",
        NetworkError: "Se movió el sticker antes de terminar. Inténtalo de nuevo sin moverlo.",
        InvalidStateError: "El sticker parece estar bloqueado (solo lectura).",
      };
      avisar("⚠️ " + (mensajes[err.name] || "No se pudo grabar: " + err.message), "error");
    } finally {
      clearTimeout(limite);
      terminarGrabacion();
    }
  });

  btnCancelar.addEventListener("click", () => grabando?.abort());

  actualizar();
})();
