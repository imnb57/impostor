# 🕵️ Impostor

A party word game for React Native (Expo). Everyone gets the same secret word —
except the impostor. Describe the word without saying it, then vote out the liar.

Two ways to play:

- **Pass & Play** — one phone, no setup, works offline.
- **Online** — create a room, friends join with a 4-letter code (needs Firebase).

## Run it

```bash
npm install
npm run start        # scan the QR code with Expo Go (iOS/Android)
```

Pass & Play works immediately. Online mode needs Firebase (below).

## Firebase setup (online mode)

This app runs in **Expo Go**, so it uses the Firebase **JS web SDK** — do not
install `@react-native-firebase/*` (native modules won't load in Expo Go).

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add a **Web app** (`</>` icon) and copy the SDK config values.
3. **Build → Authentication → Sign-in method** → enable **Anonymous**.
4. **Build → Realtime Database** → create a database, then paste the contents of
   `database.rules.json` into the Rules tab.
5. `cp .env.example .env`, fill in the values, restart the dev server
   (`npm run start -- --clear`).

The anonymous auth UID is persisted in AsyncStorage, so players who close the
app can rejoin the same room code and pick up where they left off
("Rejoin last room" on the online screen).

## Google sign-in (optional profile)

Players can attach a Google account (name + avatar) on the home screen. It links
onto the anonymous session, so the game UID — and any in-progress room — is kept.

1. Firebase console → **Authentication → Sign-in method** → enable **Google**.
   Copy the **Web client ID** shown in the provider panel into
   `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
2. [Google Cloud console](https://console.cloud.google.com/apis/credentials)
   (same project) → **Create OAuth client ID → Android**:
   - Package name: `com.imnb57.impostor`
   - SHA-1: from `npx eas-cli credentials` (Android → your keystore)
   Put the resulting ID in `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.

Note: Google sign-in only works in a **built app** (APK/AAB or dev build) — the
button is disabled inside Expo Go, where the app's OAuth redirect scheme doesn't
exist. Everything else works in Expo Go.

## Build an APK to share (EAS)

```bash
npm install -g eas-cli        # or use npx eas-cli
eas login                     # your Expo account
eas init                      # links the project (creates the EAS project id)
eas env:create --scope project   # add every EXPO_PUBLIC_* var for the
                                  # "preview" and "production" environments —
                                  # .env is gitignored and never uploaded
eas build -p android --profile preview
```

The `preview` profile produces an installable **.apk** you can send to anyone
(they must enable "install unknown apps"). Build status and the download link
appear at expo.dev.

## Play Store checklist

1. `eas build -p android --profile production` → produces an **.aab**.
2. Play Console: create the app, upload the .aab to **Internal testing** first.
3. `eas submit -p android` can automate uploads once you add a service account key.
4. Required before review:
   - **App icons/splash**: replace the placeholder images in `assets/`.
   - **Privacy policy URL** — required because the app uses Firebase Auth
     (Google sign-in collects name/email/photo; anonymous auth stores a device
     identifier).
   - **Data safety form**: declare Firebase Auth (identifiers, name, email) and
     Realtime Database (player names, votes) collection.
   - **Content rating questionnaire** (this app: no user-generated chat, no ads yet).
5. Package name `com.imnb57.impostor` is set in `app.json` — change it *before*
   the first Play upload if you want a different one; it's permanent afterwards.
6. Deploy `database.rules.json` to Realtime Database rules (console → Rules tab)
   — test mode expires and leaves the DB open.

## Pushing updates without a reinstall (EAS Update)

Installed apps pull JavaScript and asset changes over the air, so most
changes reach players without them downloading a new APK.

```bash
# ship whatever is in the working tree to everyone on the preview APK
eas update --branch preview --message "fix voting copy"
```

Players get it on next launch (the app checks automatically), or immediately
via **Settings → Check for updates**.

**What can and cannot travel this way** — this is the part that bites:

| Change | Ships over the air? |
| --- | --- |
| Screens, copy, styling, game logic, word bank | ✅ yes |
| New JS dependency (no native code) | ✅ yes |
| New native module (`expo install` something with native code) | ❌ new APK |
| Anything in `app.json` native config — icons, splash, permissions, package | ❌ new APK |
| Bumping `version` in `app.json` | ❌ breaks the update link — see below |

`runtimeVersion` uses the `appVersion` policy, meaning an update only reaches
builds with a **matching `version`**. Leave `version` alone while shipping OTA
fixes. When you do need a native change, bump `version`, build a new APK, and
publish updates against that version from then on.

First release on a new version:

```bash
eas build -p android --profile preview   # players install this once
eas update --branch preview -m "..."     # then every fix flows automatically
```

## Game modes

| Mode | What changes |
| --- | --- |
| **Classic** | Everyone knows the word; the impostor gets one oblique clue. |
| **Saboteur** | One player knows the word but wins only if an *innocent* is voted out. |
| **Informant** | One player learns an impostor's name but never the word. If the impostor is caught, they get one shot at naming the informant to steal the round. |
| **Fragments** | Nobody gets the word — each player holds a different facet of it, and the impostor's facet belongs to a different word entirely. |

Roles, payloads and win conditions live in `src/services/roles.ts` and
`src/services/resolveRound.ts`. `resolveRound` is pure and fully tested
(`npm test`) because a subtle bug there silently ruins games.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run start` | Start the Expo dev server |
| `npm run android` / `npm run ios` | Start and open on a device/simulator |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

## Project layout

See `Claude.md` for the full spec. Short version: screens are thin, game logic
lives in `src/services`, Firebase access only goes through `src/services/rooms.ts`,
and every online screen renders from a single Realtime Database subscription
mirrored in `src/store/roomStore.ts`.
