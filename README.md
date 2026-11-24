# Expo ISW · Tarjeta NFC

Sitio estático (HTML, CSS y JS sin frameworks) para la Expo Cetys de Ingeniería de Software.

- **`index.html`**: editor. El alumno cambia 4 variables (`nombre`, `color`, `emoji`, `mensaje`) en un bloque de código, ve la tarjeta en vivo, obtiene una URL corta y la graba en un sticker NFC (o usa el QR de respaldo).
- **`v.html`**: vista. Lee los parámetros `n`, `c`, `e`, `m` de la URL y muestra la tarjeta animada.
- **`splash.html`**: pantalla para dejar en una TV o monitor. Un editor de código escribe código aleatorio (JavaScript, Python y Java) sin parar, con el zorro y "Ingeniería de Software" al centro. Clic o tecla `F` para pantalla completa; el mouse se oculta solo y la pantalla no se apaga (donde el navegador lo permite).

Ejemplo: `v.html?n=Luis&c=22c55e&e=%F0%9F%A4%96&m=Me+gusta+programar+robots`

## Publicar en GitHub Pages

1. *Settings → Pages → Build and deployment*: **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
2. El sitio queda en `https://<usuario>.github.io/<repo>/`. Las URLs se generan relativas a esa dirección.

## Grabar el sticker (Web NFC)

- Solo funciona en **Chrome para Android** y con **HTTPS** (GitHub Pages ya lo tiene). En iPhone u otros navegadores aparece el QR.
- Sticker recomendado: **NTAG215** (504 bytes). La URL se limita a **450 caracteres** para que quepa con holgura; cada emoji ocupa ~12 caracteres al codificarse.
- Pega el sticker a la parte trasera del celular y no lo muevas hasta ver "✅ ¡Listo!". Si pasan 30 s, la grabación se cancela.

## Probar en local

```sh
python3 -m http.server 8000
# abre http://localhost:8000
```

(Web NFC no funciona en `localhost` desde la PC; para probarlo usa GitHub Pages en el celular.)

## Archivos

| Archivo | Qué hace |
| --- | --- |
| `js/tarjeta.js` | Lógica compartida: limpia datos, arma/lee la URL, dibuja la tarjeta y el confeti |
| `js/editor.js` | Editor en vivo, medidor de 450 caracteres, Web NFC (`NDEFReader`) y QR |
| `js/filtro.js` | Filtro de groserías para nombre y mensaje (agrega palabras en `PALABRAS` o `RAICES`) |
| `js/sonido.js` | Sonido del confeti (pop y chisporroteo) y, al azar (40 %), una cerbatana chistosa; generado con Web Audio |
| `js/splash.js` · `css/splash.css` | Generador de código aleatorio y animación de `splash.html`; solo guarda las líneas que caben en pantalla |
| `js/vendor/qrcode.js` | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT), incluido para no depender de un CDN |
| `css/estilos.css` | Estilos y animaciones |
| `img/zorro.svg` | Logo del zorro (tarjeta y favicon) |
| `.nojekyll` | Evita que GitHub Pages procese el sitio con Jekyll |
