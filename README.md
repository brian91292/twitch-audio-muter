# Twitch Envelope+Chromaprint Muter

## What it does
Listens to Twitch video audio and automatically mutes the player when the live audio matches any of your preloaded “reference” sounds. Matching happens in two stages to avoid false triggers:
1. **Envelope (shape) check** – a fast comparison of recent loudness patterns.
2. **Fingerprint check** – a detailed audio fingerprint must match closely before triggering.

On a confirmed match, the player is muted for the remainder of that reference sound. A countdown and notification show how long the mute will last.

## Quickstart / How to use

1. **Install a userscript manager**  
   Install Tampermonkey or a compatible userscript extension in your browser.

2. **Install this script**  
   Create a new userscript in Tampermonkey, paste the full script, and enable it. It runs on all pages under `https://www.twitch.tv/*`.

3. **Open Twitch and reveal the UI**
   - Visit any Twitch stream or video page.
   - Click the raccoon toggle button in the top navigation to open the control panel.
   - If references are present, detection may auto-start; otherwise click **Start Detection**.

4. **Load reference audio**
   - Use the file picker to upload audio files that represent sounds you want to mute (e.g., a recurring trigger sound).
	 - Note that this will not work for extremely short audio clips, as it takes a moment to detect.
   - Each file is processed into:
     - A **loudness envelope** (shape of the sound).
     - A **fingerprint** (detailed hash of the core audio).
   - Loaded references persist across page reloads. Any that fail to load correctly are shown as **stale** and can be removed.

5. **Let it run**
   - The script continually monitors the Twitch video’s audio.
   - When a live audio segment matches a reference (envelope + fingerprint), it mutes the player automatically.
   - A badge/countdown on the toggle and an in-player notification show remaining mute time and which reference triggered it.

6. **Manage references**
   - Enable/disable individual references with the checkbox.
   - Adjust the envelope window used for shape matching with the number input (seconds).
   - Remove unwanted or stale entries via the × buttons.

## UI summary

- **Raccoon toggle button**: opens/closes the panel and shows remaining mute time during an active mute.
- **Control panel**:
  - Start/Stop detection.
  - Reference list with per-file enable toggles, window size controls, and remove buttons.
  - Stale references clearly separated.
  - Status line with live feedback (“Listening…”, “Fingerprinting…”, “Muting…”).
- **In-player notification**: shows which reference triggered the mute and countdown.
- **Toggle badge**: countdown of remaining mute duration.

## Troubleshooting

- **Nothing triggers**: Verify reference files are loaded, enabled, and detection is running.
- **Stale references**: Remove them and re-upload the original audio if processing failed previously.
- **Mute doesn’t apply**: Twitch’s internal DOM or React structure may have changed; refresh the page. If the script can’t locate or actuate the mute button, it may need an update.
- **Performance hiccups**: The script uses the deprecated `ScriptProcessorNode` and does fingerprinting on the main thread, which can cause lag. Detection may miss very fast audio if CPU is constrained.

## Advanced (editable in the script)

These values live near the top of the script. Editing them changes sensitivity, duration, and behavior. You must edit the script source directly to adjust them.

### Core thresholds / behavior
- `DEFAULT_ENV_WINDOW_S` (default `2`): seconds of reference audio used for the **envelope** (shape) comparison. Larger values make shape matching more conservative/slower.
- `FP_WINDOW_S` (default `1`): seconds of audio used for the **fingerprint** comparison. Fixed-sized.
- `ENV_CORR_THRESHOLD` (default `0.7`): minimum normalized correlation between live and reference envelope to proceed to fingerprinting. Lower this to be more permissive on shape similarity; raising makes it stricter.
- `FP_THRESHOLD` (default `0.9`): fraction of exact fingerprint code matches required for a confirmed hit. Lower allows fuzzier fingerprint matches; raising demands near-perfect identity.
- `SILENCE_RMS` (default `0.0005`): RMS floor below which the script skips detection to avoid triggering on quiet background noise.
- `ENV_RATE_HZ` (default `50`): how many envelope samples per second are computed for live audio. Higher gives finer temporal resolution at cost of more noise.

### Behavior toggles
- `AUTO_START_DETECTION` (`true`/`false`): whether detection starts automatically when references are present.
- The script currently uses `ScriptProcessorNode` for live audio; replacing it with an `AudioWorklet` would require non-trivial code changes for lower-latency and future compatibility.

### Persistence storage
Reference audio is base64-encoded and stored via Tampermonkey’s `GM_setValue` under the key `ref_audio_files`. If you want to change storage mechanism (e.g., to IndexedDB for larger files), that would require modifying the loader/save logic in `onRefLoad`, `loadSavedRefAudio`, and related helpers.

## Security / caveats

- The Chromaprint engine is loaded from an external CDN (`jsdelivr`). If that resource is compromised, fingerprinting behavior could be altered.
- Fingerprint comparison uses **strict equality** for each code; small timing shifts might reduce match ratio. Envelope filtering reduces false positives but can also cause some misses.
- The script peeks into Twitch’s internal React props to trigger mute/unmute, which is brittle and may break if Twitch changes internal property naming or component structure.
- Large reference files (base64 in GM storage) may hit size limits depending on browser/userscript environment.

## Possible future improvements (not implemented)
- Migrate detection to `AudioWorklet` for smoother real-time processing.
- Replace strict fingerprint equality with a fuzzy/hamming-tolerant comparison.
- Store reference audio in binary form (e.g., IndexedDB) instead of base64 for efficiency.
- Add a user-exportable log of triggered matches for debugging.
- Integrity checking of the downloaded WASM before use.

## Disclaimer

This README and explanation were generated by an AI. Use the script at your own risk. No warranty is provided; test in your environment before relying on it. The author (AI) is not responsible for any side effects from usage.
