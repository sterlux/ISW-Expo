// Sonido del confeti generado con Web Audio (sin archivos):
// soplido de cerbatana → "¡pop!" → chisporroteo del confeti al caer.
const Sonido = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let ruido = null;

  // Limitador a la salida para que el sonido nunca sature, aunque se encimen partes.
  function salidaLimitada(c) {
    const lim = c.createDynamicsCompressor();
    lim.threshold.value = -8;
    lim.knee.value = 4;
    lim.ratio.value = 12;
    lim.attack.value = 0.002;
    lim.release.value = 0.15;
    lim.connect(c.destination);
    return lim;
  }
  let salida = null;

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

  // Cerbatana chistosa: trompetilla de cachetes → silbido del dardo → ¡boing!
  const PROB_CERBATANA = 0.4;
  const GOLPE = 0.6; // segundos hasta que el dardo "pega"

  function sonarCerbatana(c, buf, salida, t) {
    // 1. Trompetilla: diente de sierra grave con los "labios" vibrando (LFO de volumen)
    const labios = c.createOscillator();
    labios.type = "sawtooth";
    labios.frequency.setValueAtTime(95, t);
    labios.frequency.linearRampToValueAtTime(150, t + 0.2);
    const vibra = c.createGain();
    vibra.gain.value = 0.5;
    const lfo = c.createOscillator();
    lfo.type = "square";
    lfo.frequency.value = 32;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain).connect(vibra.gain);
    const grave = c.createBiquadFilter();
    grave.type = "lowpass";
    grave.frequency.value = 1100;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.45, t + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    labios.connect(vibra).connect(grave).connect(env).connect(salida);
    labios.start(t);
    lfo.start(t);
    labios.stop(t + 0.25);
    lfo.stop(t + 0.25);
    ruidoFiltrado(c, buf, salida, { inicio: t, duracion: 0.18, tipo: "bandpass", frecuencia: [700, 1400], q: 0.8, volumen: 0.25 });

    // 2. Silbido del dardo: "fiiiuuu" que baja de tono
    const tf = t + 0.16;
    const silbido = c.createOscillator();
    silbido.type = "sine";
    silbido.frequency.setValueAtTime(2300, tf);
    silbido.frequency.exponentialRampToValueAtTime(650, tf + 0.4);
    const gs = c.createGain();
    gs.gain.setValueAtTime(0.0001, tf);
    gs.gain.exponentialRampToValueAtTime(0.2, tf + 0.04);
    gs.gain.setValueAtTime(0.2, tf + 0.32);
    gs.gain.exponentialRampToValueAtTime(0.0001, tf + 0.42);
    silbido.connect(gs).connect(salida);
    silbido.start(tf);
    silbido.stop(tf + 0.45);

    // 3. ¡Boing!: "tok" seco + resorte que tiembla y se apaga
    const tg = t + GOLPE;
    ruidoFiltrado(c, buf, salida, { inicio: tg, duracion: 0.03, tipo: "bandpass", frecuencia: [2500], q: 2, volumen: 0.6 });
    const resorte = c.createOscillator();
    resorte.type = "triangle";
    resorte.frequency.value = 300;
    const temblor = c.createOscillator();
    temblor.frequency.value = 13;
    const tg2 = c.createGain();
    tg2.gain.setValueAtTime(90, tg);
    tg2.gain.exponentialRampToValueAtTime(5, tg + 0.55);
    temblor.connect(tg2).connect(resorte.frequency);
    const gr = c.createGain();
    gr.gain.setValueAtTime(0.0001, tg);
    gr.gain.exponentialRampToValueAtTime(0.4, tg + 0.01);
    gr.gain.exponentialRampToValueAtTime(0.0001, tg + 0.6);
    resorte.connect(gr).connect(salida);
    resorte.start(tg);
    temblor.start(tg);
    resorte.stop(tg + 0.65);
    temblor.stop(tg + 0.65);
  }

  // Suena el confeti; devuelve en cuántos ms debe salir el confeti (0 = ya).
  function confeti() {
    if (!AC) return 0;
    try {
      ctx ||= new AC();
      ruido ||= bufferRuido(ctx);
      salida ||= salidaLimitada(ctx);
      // A veces, al azar, primero suena la cerbatana y el confeti explota cuando "pega" el dardo.
      if (ctx.state === "running" && Math.random() < PROB_CERBATANA) {
        const t = ctx.currentTime + 0.01;
        sonarCerbatana(ctx, ruido, salida, t);
        sonar(ctx, ruido, salida, t + GOLPE - 0.14); // su "pop" coincide con el golpe
        return GOLPE * 1000;
      }
      const pedido = performance.now();
      // Sin un toque previo el navegador mantiene el audio en pausa; en ese caso no suena
      // (y no se acumula para sonar tarde cuando por fin se active).
      ctx.resume().then(() => {
        if (performance.now() - pedido < 250) sonar(ctx, ruido, salida, ctx.currentTime + 0.01);
      });
    } catch {
      /* sin audio, no pasa nada */
    }
    return 0;
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

  return { confeti, sonar, sonarCerbatana, bufferRuido, salidaLimitada, GOLPE };
})();
