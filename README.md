# Twitch Audio Muter

## What it does
Listens to Twitch video audio and automatically mutes the player when the live audio matches any of your preloaded “reference” sounds. Matching happens in two stages to avoid false triggers:
1. **Envelope (shape) check** – continuous low-latency monitoring of recent loudness patterns via an AudioWorklet.
2. **Fingerprint check** – a detailed Chromaprint audio fingerprint must match closely before confirming a trigger.

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
   - Use the file picker to upload audio files representing sounds you want muted (e.g., recurring trigger noises). Very short sounds are less reliable due to windowing requirements.
   - Each file is processed into:
     - A **loudness envelope** for fast candidate identification.
     - A **Chromaprint fingerprint** for match confirmation.
   - References persist across reloads. Files that fail to decode are marked **stale** and can be removed.

5. **Let it run**
   - The script continuously analyzes the Twitch video’s audio.
   - When live audio passes envelope correlation and fingerprint thresholds, the player is muted automatically.
   - UI feedback shows which reference triggered it and remaining mute time.

6. **Manage references**
   - Enable/disable individual references with the checkbox.
   - Adjust the envelope window size (seconds) per file to tune shape matching.
   - Remove unwanted or stale entries via the × buttons.

## UI summary

- **Raccoon toggle button**: opens/closes the panel and displays remaining mute time during an active mute.
- **Control panel**:
  - Start/Stop detection.
  - Reference list with per-file enable toggles, envelope window controls, and removal.
  - Stale references clearly separated.
  - Status line with live feedback (e.g., “Listening…”, “FP miss…”, “Confirmed → muting”).
  - Engine indicators:
    - **Detection Engine** shows whether the envelope/candidate stage is using AudioWorklet or fallback.
    - **Fingerprint Engine** shows whether fingerprinting is occurring in the Web Worker (preferred) or on the main thread (fallback).
- **In-player notification**: displays the reference that triggered and a countdown.
- **Toggle badge**: shows remaining mute duration on the raccoon icon.

## Performance notes

Envelope detection and candidate extraction run inside an **AudioWorklet** for low-latency, off-main-thread processing. Fingerprinting is performed in a separate **Web Worker** when available; if the worker fails or isn’t ready, fingerprinting falls back to the main thread. This split minimizes main-thread CPU load while retaining accurate confirmation via Chromaprint.

## Troubleshooting

- **Nothing triggers**: Ensure reference files are loaded, enabled, and detection is active. Check the status line for correlation/fingerprint misses.
- **Stale references**: Remove them and re-upload the original audio if they failed to load correctly.
- **Mute doesn’t apply**: Twitch’s internal DOM/React props used to toggle mute may have changed; refresh the page. If the script cannot find or actuate the mute control, it may need an update.
- **High CPU usage**: Verify the AudioWorklet and fingerprint worker indicators show the preferred paths. Reducing the number of references or loosening thresholds will reduce candidate volume.
- **Unexpected mute durations**: Extremely long reference audio or misconfigured durations can produce prolonged mutes—inspect and adjust or remove the offending reference.

## Advanced (editable in the script)

These values are near the top of the script. Editing them requires modifying the source directly.

### Core thresholds / behavior
- `DEFAULT_ENV_WINDOW_S` (default `2`): seconds of reference audio used for envelope matching. Larger values smooth shape comparison but need more context (higher window = higher accuracy).
- `FP_WINDOW_S` (default `1`): seconds of audio used for fingerprint confirmation.
- `ENV_CORR_THRESHOLD` (default `0.7`): minimum normalized correlation between live and reference envelope to proceed to fingerprinting.
- `FP_THRESHOLD` (default `0.9`): required fraction of identical fingerprint codes to confirm a match.
- `SILENCE_RMS` (default `0.0005`): RMS floor below which detection is skipped to avoid reacting to near-silence.
- `ENV_RATE_HZ` (default `50`): how many envelope samples per second are computed.

### Behavior toggles
- `AUTO_START_DETECTION` (`true`/`false`): whether detection begins automatically when references are present.
- AudioWorklet is the primary detection path; fallback to `ScriptProcessorNode` is only used if worklet support is unavailable.

### Reference persistence
- Reference audio, per-file envelope window sizes, and enabled states are stored (base64-encoded) under the key `ref_audio_files` via Tampermonkey’s storage APIs. Changing persistence (e.g., switching to binary storage) would require editing the loader/save logic in `onRefLoad`, `loadSavedRefAudio`, etc.

## Security / caveats

- The Chromaprint engine (WASM) is fetched from a third-party CDN (`jsdelivr`). If that resource is compromised, fingerprinting behavior could be affected.
- Fingerprint matching uses strict equality across code arrays; small misalignments can reduce match ratios. Envelope prefiltering reduces noise but may also exclude borderline true positives.
- Mute/unmute logic inspects internal Twitch React props when available, which is brittle and subject to site changes.
- Reference audio is stored as base64 in userscript storage; large sets may hit size limits depending on the environment.

## Disclaimer

This README was generated by AI. Use the script at your own risk. No warranty is provided.
