// Sonido del confeti generado con Web Audio (sin archivos):
// soplido de cerbatana → "¡pop!" → chisporroteo del confeti al caer.
const Sonido = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let ruido = null;

  // Un segundo de ruido blanco que se reutiliza en cada parte del sonido.
  function bufferRuido(c) {
    const b = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const datos = b.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
    return b;
  }

  function ruidoFiltrado(c, buf, salida, { inicio, duracion, tipo, frecuencia, q = 1, volumen }) {
    const fuente = c.createBufferSource();
    fuente.buffer = buf;
    const filtro = c.createBiquadFilter();
    filtro.type = tipo;
    filtro.frequency.setValueAtTime(frecuencia[0], inicio);
    if (frecuencia[1]) filtro.frequency.exponentialRampToValueAtTime(frecuencia[1], inicio + duracion);
    filtro.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(volumen, inicio + Math.min(0.01, duracion / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
    fuente.connect(filtro).connect(g).connect(salida);
    fuente.start(inicio, Math.random() * 0.5, duracion + 0.05);
  }

  // Dibuja todo el sonido a partir del instante t en `salida`.
  function sonar(c, buf, salida, t) {
    // 1. Soplido de cerbatana: ruido que sube de tono
    ruidoFiltrado(c, buf, salida, { inicio: t, duracion: 0.16, tipo: "bandpass", frecuencia: [500, 2600], q: 1.5, volumen: 0.35 });

    // 2. ¡Pop!: golpe grave + chasquido
    const tp = t + 0.14;
    const osc = c.createOscillator();
    const go = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, tp);
    osc.frequency.exponentialRampToValueAtTime(55, tp + 0.12);
    go.gain.setValueAtTime(0.0001, tp);
    go.gain.exponentialRampToValueAtTime(0.8, tp + 0.005);
    go.gain.exponentialRampToValueAtTime(0.0001, tp + 0.15);
    osc.connect(go).connect(salida);
    osc.start(tp);
    osc.stop(tp + 0.2);
    ruidoFiltrado(c, buf, salida, { inicio: tp, duracion: 0.09, tipo: "bandpass", frecuencia: [1800], q: 0.7, volumen: 0.9 });

    // 3. Chisporroteo: muchos clics agudos que se van apagando
    for (let i = 0; i < 26; i++) {
      const ti = tp + 0.05 + Math.random() ** 1.6 * 0.9;
      ruidoFiltrado(c, buf, salida, {
        inicio: ti,
        duracion: 0.012 + Math.random() * 0.02,
        tipo: "highpass",
        frecuencia: [3500 + Math.random() * 4000],
        volumen: 0.05 + Math.random() * 0.12 * (1 - (ti - tp)),
      });
    }
  }

  function confeti() {
    if (!AC) return;
    try {
      ctx ||= new AC();
      ruido ||= bufferRuido(ctx);
      const pedido = performance.now();
      // Sin un toque previo el navegador mantiene el audio en pausa; en ese caso no suena
      // (y no se acumula para sonar tarde cuando por fin se active).
      ctx.resume().then(() => {
        if (performance.now() - pedido < 250) sonar(ctx, ruido, ctx.destination, ctx.currentTime + 0.01);
      });
    } catch {
      /* sin audio, no pasa nada */
    }
  }

  // El primer toque en la página "desbloquea" el audio (necesario en iPhone).
  function desbloquear() {
    if (!AC) return;
    try {
      ctx ||= new AC();
      ctx.resume();
    } catch {}
  }
  addEventListener("pointerdown", desbloquear, { once: true, capture: true });

  return { confeti, sonar, bufferRuido };
})();
