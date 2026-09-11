# Selise Super League — mobile wrapper

Capacitor shell that ships the portal as iOS and Android apps.

## How it works

The WebView loads the **hosted site** (`https://selise-super-league.vercel.app`)
rather than a bundled copy. That is not a shortcut — the portal is
server-rendered: every content route is dynamic and Payload serves `/api/*`
against MongoDB, so there is no static export to bundle.

Two consequences worth knowing before you plan a release:

- **Content and UI changes ship with a web deploy.** No app-store round trip.
  Anything under `src/` in the parent repo reaches users as soon as Vercel
  deploys it.
- **A rebuild is only needed for native changes** — app icon, splash, name,
  bundle ID, permissions, plugins, or anything in `capacitor.config.ts`.

`www/` holds only `error.html`, the offline screen shown when the site is
unreachable (`server.errorPath`). It auto-retries when connectivity returns.

The native-facing behaviour — hiding the splash, the Android back button,
opening third-party links in the system browser — lives in the **web app**, at
`src/components/native/CapacitorBridge.tsx`, because the hosted page is what
actually runs. It talks to the injected `window.Capacitor` bridge, so it adds
no dependency to the web bundle and no-ops in a normal browser.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node | **>= 22** | The Capacitor CLI refuses to run below 22. The web app is on 20/22, so you may need `mise use node@22` (or newer) in this folder. |
| Yarn | 4.10.3 | Via Corepack, same as the parent repo. |
| Xcode | 16+ | iOS only. Needs the **full** Xcode, not just Command Line Tools. |
| Android Studio | latest | Android only. Ships the SDK (compile/target 36, min 24). |
| JDK | 21 | Android only. Android Studio bundles one. |

CocoaPods is **not** required — Capacitor 8 uses Swift Package Manager.

### Android toolchain from scratch (macOS, verified)

Android Studio's first-run wizard can install the SDK for you, but the whole
thing also works headlessly:

```bash
brew install --cask android-studio          # GUI, emulator manager, Play uploads
brew install openjdk@21                     # NOT the temurin cask — that needs sudo
brew install --cask android-commandlinetools # provides the first sdkmanager

export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"

yes | sdkmanager --sdk_root="$ANDROID_HOME" --licenses
sdkmanager --sdk_root="$ANDROID_HOME" \
  "platform-tools" "platforms;android-36" "build-tools;36.0.0" \
  "emulator" "system-images;android-36;google_apis_playstore;arm64-v8a" \
  "cmdline-tools;latest"
```

Two traps worth knowing:

- **Install `cmdline-tools;latest` into `$ANDROID_HOME`.** Homebrew's
  `avdmanager` derives the SDK root from its own location, so it reports
  `Package path is not valid … null` for images that are plainly installed.
  Use `$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager` instead.
- **`chmod +x android/gradlew`** after `cap add android` if the build fails
  with "gradlew file does not have executable permissions".

Create the emulator and add the env vars to your shell:

```bash
"$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" create avd \
  -n ssl_pixel -k "system-images;android-36;google_apis_playstore;arm64-v8a" -d pixel_7

cat >> ~/.zshrc <<'EOF'
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
EOF
```

Then `"$ANDROID_HOME/emulator/emulator" -avd ssl_pixel &` and `yarn run:android`.
Budget ~4 GB of disk for the SDK and roughly 200s for the first Gradle build.

This project is deliberately **not** a workspace of the parent repo: it has its
own `yarn.lock` and `node_modules`, so Vercel web builds never install the
Capacitor toolchain. Run yarn from inside this directory.

## Setup

```bash
cd apps/mobile
yarn install
yarn sync          # copies www/ + config into ios/ and android/
```

`ios/` and `android/` are committed — they hold icons, manifest, signing config
and any native tweaks. Only their build output is gitignored.

## Everyday commands

```bash
yarn sync          # after changing capacitor.config.ts, www/, or plugins
yarn open:ios      # open in Xcode
yarn open:android  # open in Android Studio
yarn run:ios       # build + launch on a simulator/device
yarn run:android
yarn doctor        # diagnose a broken toolchain
```

## Pointing the shell at a dev server

```bash
CAP_SERVER_URL=http://192.168.1.10:3000 yarn sync
```

Use your machine's **LAN IP**, not `localhost` — on a device or simulator
`localhost` is the device itself. `cleartext` flips on automatically for
`http://` origins. Re-run a plain `yarn sync` to go back to production.

## Before you ship

1. **App icons and splash** — replace the generated placeholders:
   - iOS: `ios/App/App/Assets.xcassets/`
   - Android: `android/app/src/main/res/mipmap-*/`
   `@capacitor/assets` can generate the whole set from one 1024×1024 source.
2. **Bundle ID** is `com.selisegroup.superleague` (`appId` in
   `capacitor.config.ts`). Changing it later means a new app listing, so
   confirm it before the first submission.
3. **Signing** — an Apple Developer account ($99/yr) and a Google Play account
   ($25 one-off). Keep the Android keystore safe; losing it means you cannot
   update the listing.
4. **Version numbers** live natively, not in `package.json`:
   - iOS: `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in Xcode
   - Android: `versionName` / `versionCode` in `android/app/build.gradle`
5. **`allowNavigation`** in `capacitor.config.ts` lists the only origin the
   shell will navigate to. If the portal ever moves domain, update it or the
   app will refuse to load.

## App Store review risk

Apple's **Guideline 4.2 (Minimum Functionality)** rejects apps that are a
repackaged website. This wrapper does more than a bare WebView — offline
handling, native splash, status-bar integration, hardware back button — but
that is not a guarantee. The usual way to settle it is genuine native value,
most commonly **push notifications** for match updates, which would need a
Firebase/APNs setup plus sending logic in Payload.

Google Play is considerably more permissive and this should pass as-is.
