# Twitch Envelope+Chromaprint Muter

## What it does
Listens to Twitch video audio and automatically mutes the player when the live audio matches any of your preloaded “reference” sounds. Matching happens in two stages to avoid false triggers:
1. **Envelope (shape) check** – continuous low-latency monitoring of recent loudness patterns via an AudioWorklet.
2. **Fingerprint check** – a detailed Chromaprint audio fingerprint must match closely before triggering.

On a confirmed match, the player is muted for the remainder of that reference sound. A countdown badge, in-player notification, and button text reflect the ongoing mute.

## Quickstart / How to use

1. **Install a userscript manager**  
   Install Tampermonkey or a compatible userscript extension in your browser.

2. **Install this script**  
   Create a new userscript in Tampermonkey, paste the full script, and enable it. It runs on all pages under `https://www.twitch.tv/*`.

3. **Open Twitch and reveal the UI**
   - Visit any Twitch stream or video page.
   - Click the raccoon toggle button in the top navigation to open the control panel.
   - If references are present, detection will auto-start; otherwise add one and click **Start Detection**.

4. **Load reference audio**
   - Use the file picker to upload audio files representing sounds you want muted (e.g., recurring trigger noises). Very short sounds are less reliable due to detection windowing.
   - Each file is processed into:
     - A **loudness envelope** (shape) for quick candidate spotting.
     - A **Chromaprint fingerprint** for match confirmation.
   - Loaded references persist across reloads. Those that fail to decode are marked **stale** and can be removed.

5. **Let it run**
   - The script continuously analyzes the Twitch video’s audio.
   - When live audio passes envelope correlation and fingerprint thresholds, the player is muted automatically.
   - UI feedback shows which reference triggered it and how long the mute will last.

6. **Manage references**
   - Enable/disable individual references with the checkbox.
   - Adjust envelope window size (seconds) for shape matching per file.
   - Remove unwanted or stale entries using the × buttons.

## UI summary

- **Raccoon toggle button**: opens/closes the panel and shows remaining mute time during an active mute.
- **Control panel**:
  - Start/Stop detection.
  - Reference list with per-file enable toggles, envelope window size control, and removal.
  - Stale references clearly separated.
  - Status line with live feedback (e.g., “Listening…”, “FP miss…”, “Confirmed → muting”).
- **In-player notification**: shows which reference triggered the mute and countdown.
- **Toggle badge**: shows remaining mute duration on the UI toggle button.

## Performance notes

Detection uses an **AudioWorklet** for the envelope and candidate generation stage, keeping continuous processing off the main thread with low latency. Only promising audio candidates are sent back to the main thread for the heavier Chromaprint fingerprinting, minimizing CPU pressure and improving responsiveness. A fallback to the older `ScriptProcessorNode` exists for environments where AudioWorklet isn’t available.

## Troubleshooting

- **Nothing triggers**: Confirm reference files are loaded, enabled, and detection is active. Check the status line for fingerprint misses or errors.
- **Stale references**: Remove and re-upload the original audio if a reference fails to load properly.
- **Mute doesn’t apply**: Twitch’s internal DOM/React structure used to toggle mute may have changed; refresh the page. If the script can’t actuate the mute control, it may require an update.
- **High CPU usage**: Verify the AudioWorklet path is in use (fallback is heavier); reduce number of references or tweak thresholds to lower candidate volume.
- **Unexpected mute durations**: Very long reference audio or miscalculated durations can cause prolonged mutes—inspect/remove the culprit reference.

## Advanced (editable in the script)

These values live near the top. Changing them requires editing the script source directly.

### Core thresholds / behavior
- `DEFAULT_ENV_WINDOW_S` (default `2`): seconds of reference audio used for envelope matching. Larger values smooth shape comparison but need more context.
- `FP_WINDOW_S` (default `1`): seconds of audio used for fingerprint confirmation.
- `ENV_CORR_THRESHOLD` (default `0.7`): minimum normalized correlation between live and reference envelope to proceed to fingerprinting.
- `FP_THRESHOLD` (default `0.9`): required fraction of identical fingerprint codes to confirm a match.
- `SILENCE_RMS` (default `0.0005`): RMS floor below which detection is skipped to avoid reacting to quiet audio.
- `ENV_RATE_HZ` (default `50`): envelope sampling rate in Hz.

### Behavior toggles
- `AUTO_START_DETECTION` (`true`/`false`): whether detection begins automatically when references are loaded.
- AudioWorklet is the primary detection path; fallback to `ScriptProcessorNode` occurs only if Worklet support is missing.

### Reference persistence
- Reference audio, envelope window sizes, and enabled states are stored (base64-encoded) under the key `ref_audio_files` via `GM_setValue`.
- Changing persistence (e.g., switching to binary IndexedDB) requires editing the loader/save logic in `onRefLoad`, `loadSavedRefAudio`, etc.

## Security / caveats

- The Chromaprint engine (WASM) is fetched from a third-party CDN (`jsdelivr`). A compromised source could affect fingerprinting.
- Fingerprint matching is strict equality; small timing misalignments may lower match scores. Envelope prefiltering reduces false positives but might filter borderline true positives.
- Mute/unmute actions probe internal Twitch React props when available; this method is brittle to site changes.
- Storing reference audio as base64 in userscript storage may hit size limits depending on browser/userscript constraints.

## Possible future improvements (not implemented)
- Use a fuzzy or Hamming-distance–aware fingerprint comparison instead of strict equality.
- Store raw reference audio in binary form (e.g., IndexedDB) for efficiency.
- Export/import reference sets or triggered-match logs.
- Add integrity validation for the downloaded WASM before instantiation.
- Provide a user-facing sensitivity tuning UI beyond per-file windows.

## Disclaimer

This README and explanation were generated by AI. Use the script at your own risk. No warranty is provided.
