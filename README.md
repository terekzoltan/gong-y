# Gong-y

A small meditation timer built with Next.js, React and react-timer-hook.

## Run

```sh
npm ci
npm run dev
```

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Timer behavior

- Choose 1-90 minutes, or start a 10/30/60-minute preset.
- A five-second preparation countdown precedes the session.
- Gongs sound at session start, one third of the configured duration elapsed, and with ten seconds remaining. For a 30-minute session, the intermediate gong sounds after 10 minutes.
- Each scheduled cue is consumed once per session. Delayed ticks and forward seeks still trigger due cues. Seeking backwards does not re-arm them. While paused, cues wait until Resume. If a seek skips both cues at once, they share one sound.
- Seeking to the end completes the session. A finished session cannot resume; return to the picker for a new session.
- Completed sessions credit the configured duration to Mindful minutes, including sessions shortened using the slider. Stopped sessions do not add minutes. This preserves the existing statistics convention.
- Audio is prepared in the Start click handler. If playback is blocked, an Enable sound button provides another user gesture. Actual audio permissions depend on the browser.
- Screen wake lock is requested throughout the active timer screen, including preparation, pause and completion, and released on exit. Returning from a hidden tab requests it again. Browser or OS denial does not stop the timer.

## Structure

- `useGongTimer`: preparation, running/paused/finished state, countdown and one-shot cue scheduling.
- `useGongAudio`: random sound selection, gesture-based audio preparation and cleanup.
- `useWakeLock`: visibility and asynchronous wake lock lifecycle.
- `useInactivity`: activity listeners and fading controls.
- `src/lib`: pure cue rules and resilient local statistics storage.
- Components own their CSS modules; the page owns screen selection and the session audio instance.

## Manual regression checks

Check desktop and narrow mobile layouts, keyboard/pointer duration selection, preparation cancellation, pause/resume, seeking across each cue in both directions, natural completion, end-seek completion, one statistics credit, and a fresh second session. On a physical phone, also check sound permission, tab switching and screen wake lock. Background browsers can defer JavaScript and audio; the app cannot guarantee cues while the OS suspends it.
