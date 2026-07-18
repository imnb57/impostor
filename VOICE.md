# Voice chat & random lobbies — design notes

Brainstorm for adding live audio to the discussion phase, plus matchmaking with
strangers. Written before any code so the expensive decisions get made first.

---

## 1. The finding that should drive the design: per-minute cost vs one-time IAP

Managed voice infrastructure (LiveKit, Daily, Agora) bills per participant-minute.
A round of Impostor with 6 players and voice live for ~6 minutes is 36
participant-minutes.

| Provider | $/round | free rounds/mo | 10,000 rounds/mo |
| --- | --- | --- | --- |
| LiveKit — $0.004/pm, 5k free | $0.144 | 138 | $1,440 |
| Daily — $0.004/pm, 10k free | $0.144 | 277 | $1,440 |
| Daily at volume — $0.0015/pm | $0.054 | 277 | $540 |
| Agora — $0.99/1k min, 10k free | $0.036 | 277 | $356 |

Now hold that against the monetisation decision already recorded in `Claude.md`:
**one-time IAP, explicitly no subscription.**

> A $1.99 Pro unlock covers **13–55 rounds** depending on provider. After that,
> every round a paying customer plays costs you money, forever.

That is an inverted business model: your most engaged players become your
largest liability. Per-minute infrastructure wants recurring revenue; you have
deliberately chosen not to have any. Three ways out:

1. **Don't rent a media server** — use peer-to-peer (below). Fits the existing model.
2. **Change monetisation** — a subscription, or voice gated behind consumable
   credits. Contradicts a decision already made for good reasons (churn).
3. **Cap it** — voice free up to N rounds/month per user. Complexity + a bad
   moment right when the party is going well.

**Recommendation: option 1.**

## 2. Mesh vs SFU — for this game, mesh wins

**P2P mesh**: every player connects directly to every other player. No media
server, so no per-minute cost at all.

- Audio is light. Opus at ~32 kbps means a 6-player room uploads 5 × 32 ≈
  160 kbps — fine on wifi or 4G. (Video mesh falls over here; audio does not.)
- Practical ceiling is around **6–8 participants**, which happens to be the
  natural size of this game. 12 would be a stretch.
- Cost is a TURN server for the ~15% of connections that can't traverse NAT.
  Audio TURN traffic is ~1.4 MB per participant-round; a $5/mo coturn box goes
  a very long way. Google's public STUN handles the rest, free.

**SFU** (LiveKit/Daily/Agora/self-hosted mediasoup) only becomes necessary if
rooms grow past ~8, or if random matchmaking scales far enough that you want
central control for moderation. Defer it.

**Signalling is already solved.** WebRTC needs a channel to exchange offers,
answers and ICE candidates — and there is already a live Firebase Realtime
Database subscription per room. Add `rooms/{code}/signal/{fromUid}/{toUid}` and
the existing `useRoomSubscription` carries it. **No new backend.**

## 3. "Lossless high quality audio" — worth redefining

WebRTC does not do lossless. It carries **Opus**, which is lossy by design, and
that is the correct choice:

- Opus at **24–32 kbps mono** is already transparent for speech.
- True lossless (PCM/FLAC) is ~1.4 Mbps — roughly **40× the bandwidth** for zero
  perceptual gain on voice, and brutal on mobile data.
- For a deduction game, **latency beats fidelity**. A 400 ms delay ruins an
  interrogation; a 6 kbps bitrate difference does not.

What actually makes voice feel premium here:

- `echoCancellation: true`, `autoGainControl: true` — table stakes.
- **DTX** (discontinuous transmission) so silence costs nothing.
- Opus 32 kbps mono, ~20 ms frames.
- One deliberate exception: consider **easing off noise suppression**. Hesitation,
  breathing and a wavering voice are the *content* of this game. Aggressive
  denoising sands off exactly the signal players are hunting for — and it is the
  natural foundation for the "polygraph" idea in `ROADMAP.md`.

## 4. The real differentiator is game-integrated audio, not audio

Players who are apart could already be on Discord or WhatsApp. Raw voice adds
little. What no external call can do is *know the game state*:

- **Auto-mute during role reveal.** Nobody's gasp leaks when they flip the
  impostor card. This alone justifies in-app voice.
- **Force-mute during voting** so votes stay secret and nobody gets talked into it.
- **Speaking indicators tied to roles** — a ring pulses around whoever is talking.
- **Talk-time stats in the recap card**: "spoke for 8 seconds all round" is both
  funny and damning. Feeds the share card that already exists.
- **Turn-based clue giving**: the app grants the mic to one player at a time
  during the clue round, which enforces the format the game already implies.

That list is the actual product. Voice is just the transport.

## 5. Random lobbies are a much bigger step than they look

Playing with strangers *plus voice* changes the compliance picture entirely:

- **Play Store UGC policy** requires in-app reporting, blocking, and a
  moderation path before you ship user-to-user content.
- **Age rating jumps.** Unmoderated voice with strangers pushes the rating up and
  invites scrutiny; if under-13s can reach it, COPPA/GDPR-K apply.
- **You cannot moderate what you never recorded.** The usual answer is
  report-and-ban on reputation rather than content review — which means building
  identity, reports, and bans, not just a lobby list.
- Anonymous auth (what the app uses today) makes bans trivially evadable.

Friends-only rooms sidestep all of this: the room code *is* the trust boundary.

**Recommendation: ship voice for code-joined rooms first.** Treat random
matchmaking as a separate project with its own moderation design — not a
follow-on toggle.

## 6. Expo constraints worth knowing before starting

- `react-native-webrtc` is native code. It needs
  [`@config-plugins/react-native-webrtc`](https://www.npmjs.com/package/@config-plugins/react-native-webrtc)
  and **will not run in Expo Go** — dev builds / EAS only.
- The plugin raises Android **minSdk to 24** and disables desugaring, which can
  break other packages. Verify early with a throwaway build.
- **This breaks the OTA channel for that release.** Native changes need a new
  APK; everyone must reinstall once. Worth batching with any other native work.
- Also needed: `RECORD_AUDIO` permission, audio-session/route handling
  (`react-native-incall-manager` for speaker vs earpiece + proximity), and an
  Android foreground service if audio should survive backgrounding.

## 7. Suggested sequencing

1. **Spike (half a day, throwaway):** add the config plugin, build once, confirm
   minSdk 24 doesn't break the existing app. Answer the riskiest question first.
2. **Two-player call** in an existing room, signalling over Firebase. Proves the
   plumbing.
3. **Mesh to 6**, with mute + speaker toggle and per-player speaking indicators.
4. **Game-integrated behaviour** — auto-mute on reveal, force-mute on voting,
   talk-time into the recap card. This is where it stops being a feature and
   starts being *the* feature.
5. **Then** decide on random lobbies, with moderation designed up front.

## 8. Open questions

- Room size ceiling: is 6–8 acceptable? (Mesh gets shaky past that; 12 needs an SFU.)
- Is voice for everyone, or the thing the Pro unlock buys? Even free-to-run, it
  is a strong upsell.
- Should voice be live in the lobby, or only from the discussion phase onward?
- Push-to-talk as an option, or open mic only?
