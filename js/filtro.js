// Filtro de palabras ofensivas para el nombre y el mensaje.
// Compara palabras completas (no pedazos), así "computadora" o "disputa" no se bloquean.
// Para agregar palabras: escríbelas en minúsculas y sin acentos en PALABRAS o RAICES.
const Filtro = (() => {
  // Palabra exacta; también acepta su plural (+s / +es).
  const PALABRAS = [
    // Español
    "puto", "puta", "pendejo", "pendeja", "verga", "vergas", "vergazo", "vergota",
    "culero", "culera", "culo", "cabron", "cabrona", "pinche", "chinga", "chingar",
    "chingas", "chingon", "chingona", "mamon", "mamona", "mamar", "mames", "mamen",
    "joto", "maricon", "marica", "mierda", "ojete", "huevon", "guevon", "jodido",
    "jodida", "joder", "coger", "cojer", "follar", "polla", "gilipollas", "malparido",
    "estupido", "estupida", "idiota", "imbecil", "retrasado", "retrasada", "porno",
    "nopor", "nazi", "hitler",
    // Abreviaturas comunes
    "hdp", "ptm", "alv", "ctm", "chtm", "vrg", "pndj", "nmms", "xxx",
    // Inglés
    "fuck", "fck", "fuk", "shit", "bitch", "asshole", "dick", "pussy", "cunt",
    "nigga", "nigger", "fag", "faggot", "whore", "slut", "bastard", "porn", "retard",
    "wtf", "stfu", "kys",
  ];
  // La palabra empieza con esto (para conjugaciones y derivados).
  const RAICES = [
    "pendej", "chingad", "chingader", "putaz", "putit", "culer", "cabron", "mamad",
    "verguiz", "verguit", "fuck", "motherfuck", "shit", "bitch",
  ];

  // Números y símbolos que se usan para disfrazar letras.
  const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s" };

  // minúsculas, sin acentos y sin "leet" ("PÜT0" → "puto").
  function normalizar(texto) {
    return String(texto ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[013457@$]/g, (c) => LEET[c]);
  }

  // Cada letra puede repetirse ("puuuto"), pero las dobles siguen siendo dobles,
  // así "polla" no atrapa al nombre "Pola" ni "nigger" al país "Niger".
  function patron(palabra) {
    return palabra.replace(/(.)\1*/g, (run, c) => (run.length > 1 ? `${c}{${run.length},}` : `${c}+`));
  }
  const reExactas = new RegExp(`^(?:${PALABRAS.map(patron).join("|")})(?:e?s+)?$`);
  const reRaices = new RegExp(`^(?:${RAICES.map(patron).join("|")})`);

  const esMala = (p) => reExactas.test(p) || reRaices.test(p);

  function esOfensivo(texto) {
    const palabras = normalizar(texto).split(/[^a-z]+/).filter(Boolean);
    if (palabras.some(esMala)) return true;
    // Letras sueltas separadas para disfrazar: "p u t o", "p.u.t.o"
    let junta = "";
    for (const p of [...palabras, ""]) {
      if (p.length === 1) { junta += p; continue; }
      if (junta.length > 1 && esMala(junta)) return true;
      junta = "";
    }
    return false;
  }

  return { esOfensivo };
})();
