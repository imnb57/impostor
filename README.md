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
