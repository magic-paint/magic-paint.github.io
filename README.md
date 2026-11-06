# Magic Paint

**Big magic for little artists.** A free, ad-free paint studio for kids ages 3–8, for Mac, Windows, Linux and the web.

18 magic brushes · kaleidoscope & mirror modes · 18 coloring pages · Drip, the talking paint-drop buddy · English & Español · works offline.

## Project layout

```
app/        The paint app itself (one HTML file + audio, fonts, icons). Used by both the desktop app and /play on the website.
electron/   Desktop shell: serves app/ from a private app:// origin and provides a native "Save As".
build/      Installer resources: icons (.icns, .ico, .png) and the DMG background.
website/    The marketing site (landing, help, privacy, brand guide).
brand/      Source brand files: logo, wordmark, app icon, mascot (SVG + PNG).
.github/    CI: builds installers and publishes the website, on GitHub's free tier.
```

## Run it locally

```bash
npm install
npm start            # opens the desktop app
```

Want to try the web version? Serve the `app/` folder with any static server, for example `npx serve app`.

## Ship a release (free)

Everything runs on GitHub's free tier: Actions builds the installers, Releases hosts the downloads, and Pages hosts the website.

1. Push this repo to GitHub as a **public** repository.
2. **Settings → Pages → Source: GitHub Actions.** The website deploys on every push to `main`.
3. Tag a version to build the installers:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   About 10 minutes later the release contains `MagicPaint-Mac.dmg` (universal), `MagicPaint-Windows-Setup.exe` and `MagicPaint-Linux.AppImage`.
4. The website's download buttons always point at `releases/latest`, so new versions appear on the site automatically.

The site lives at `https://magic-paint.github.io/` (repo `magic-paint/magic-paint.github.io`) and the browser version at `.../play/`.

## Code signing (optional, later)

The free builds aren't code-signed, so macOS and Windows show a one-time warning. The website explains how to get past it.

- **Mac:** to remove the warning you need the Apple Developer Program ($99/year). Add `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` and `APPLE_TEAM_ID` as repository secrets, set `mac.identity` back to the default and turn `hardenedRuntime` on. electron-builder will then sign and notarize the app.
- **Windows:** open-source projects can apply for free signing through the SignPath Foundation. Microsoft's Trusted Signing service is a low-cost paid option.

## Brand

See `website/brand.html` (published at `/brand.html`) for the logo, colors, type and voice. Fonts are Fredoka and Nunito, both under the SIL Open Font License.
