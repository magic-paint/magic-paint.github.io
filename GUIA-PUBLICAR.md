# Magic Paint: cómo publicarlo gratis (guía paso a paso)

**Costo total: $0.** Todo corre en el plan gratis de GitHub:

| Pieza | Dónde vive | Costo |
|---|---|---|
| Website (landing, ayuda, privacidad, brand) | GitHub Pages | Gratis |
| Versión para jugar en el navegador (`/play/`) | GitHub Pages | Gratis |
| Instaladores de Mac, Windows y Linux | GitHub Releases | Gratis, sin límite de descargas |
| Construir los instaladores | GitHub Actions (runners de Mac y Windows) | Gratis en repos públicos |

Tu URL va a ser `https://TU-USUARIO.github.io/magic-paint/`.

---

## 1. Crear el repo (5 min)

1. Entra a github.com → **New repository**.
2. Nombre: `magic-paint`. Visibilidad: **Public**, porque Pages y Actions son gratis sin límite en repos públicos. No marques README ni .gitignore.
3. En tu PC, descomprime `magic-paint.zip` en **D:\\** (por ejemplo `D:\Proyectos\magic-paint`) y abre una terminal ahí:

```bash
git remote add origin https://github.com/TU-USUARIO/magic-paint.git
git branch -M main
git push -u origin main
```

> El zip ya trae el repositorio de git inicializado con el primer commit.

## 2. Activar el website (1 min)

Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.

El workflow **Deploy website** se ejecuta solo con cada push a `main`. Cuando termine (unos 2 minutos), la página estará en `https://TU-USUARIO.github.io/magic-paint/`.

El workflow pone tu `usuario/repo` en los botones de descarga, así que no tienes que editar nada.

## 3. Publicar la versión 1.0.0 (10 min, automático)

```bash
git tag v1.0.0
git push origin v1.0.0
```

En la pestaña **Actions** verás **Release desktop apps** corriendo en Mac, Windows y Linux. Al terminar crea el Release con:

- `MagicPaint-Mac.dmg` (Universal, funciona en Apple Silicon e Intel)
- `MagicPaint-Windows-Setup.exe`
- `MagicPaint-Linux.AppImage`

Los botones del website apuntan a `releases/latest/download/...`, así que siempre bajan la última versión.

## 4. Sacar versiones nuevas

1. Cambia lo que quieras en `app/index.html`.
2. Haz commit y push, y el website se actualiza solo.
3. Crea un tag nuevo (`git tag v1.1.0 && git push origin v1.1.0`) para generar nuevos instaladores.

---

## Lo que tienes que saber (honesto)

**El aviso de seguridad.** Como la app no está firmada con certificado pagado:

- **Mac** muestra *"Apple could not verify…"* la primera vez. El usuario va a System Settings → Privacy & Security → **Open Anyway**. El website ya lo explica paso a paso.
- **Windows** muestra *"Windows protected your PC"*, y se resuelve con **More info → Run anyway**.

Para quitar esos avisos más adelante:

- **Mac:** Apple Developer Program a **$99/año**. Con eso la app se firma y notariza sola en el mismo workflow (las instrucciones están en el README).
- **Windows:** **SignPath Foundation** firma gratis proyectos open-source, o Microsoft Trusted Signing por unos ~$10/mes.

**Tamaño.** Los instaladores pesan entre 100 y 230 MB porque llevan Chromium adentro (Electron). Lo elegí porque es lo más confiable: probé aquí la build completa con audio, voz, fuentes offline y guardar PNG con el diálogo nativo. Si algún día quieres instaladores de unos 10 MB, se puede migrar a Tauri.

**Dominio propio (opcional, no es gratis).** Un `.com` cuesta unos $10–12/año. Se conecta en Settings → Pages → Custom domain.

**La voz.** Los audios son los mismos de Pinta Mágica (la voz de "Mommy" con *"Hi sweetie!"* / *"¡Hola, mi amor!"*). Si esa voz es de alguien de tu familia, confirma que están cómodos con que sea pública. Si no, se puede regenerar con una voz neutral en ElevenLabs y reemplazar los 14 MP3 en `app/audio/` (los tiempos de cada frase están en `SEGS` dentro de `app/index.html`).

## Mapa del proyecto

```
app/          La app (HTML + audio + fuentes + íconos), la misma para desktop y /play
electron/     Envoltura de escritorio (ventana, guardar PNG nativo, sin navegación externa)
build/        Íconos .icns/.ico/.png y fondo del DMG
website/      Landing, ayuda, privacidad, brand guide
brand/        Logo, wordmark, ícono, mascota Drip (SVG + PNG)
.github/      Workflows: release.yml (instaladores) y pages.yml (website)
```

Para probar en tu PC: `npm install` y luego `npm start`.
