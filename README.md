# Twitch Audio Muter

![RaccAway](https://i.imgur.com/TWuN6Bx.png)

## What it does
Automatically mutes a Twitch video when it hears one of your preloaded “reference” sounds (e.g., a recurring trigger noise). It watches the live audio in real time, spots likely matches quickly, and then double-checks with a more precise audio fingerprint before muting, to avoid false alarms.

When a sound is confirmed, the player is muted for the duration of that reference sound. You get visible feedback:  
- A countdown badge on the anti-raccoon toggle  
- An in-player notification showing what triggered the mute  
- Updated button text reflecting the remaining mute time

## Quickstart

1. **Install a userscript manager**  
   Add Tampermonkey (or equivalent) to your browser.

2. **Install this script**  
   Create a new userscript in Tampermonkey, paste the script, and enable it. It runs on any `https://www.twitch.tv/*` page.

3. **Open Twitch and show the control panel**
   - Go to any Twitch stream or video.
   - Click the anti-raccoon icon in the top nav to open the panel.
   - If you already have references loaded, detection will start automatically. Otherwise, upload one and hit **Start Detection**.

4. **Load sounds you want muted**
   - Use the file picker to upload audio files that represent the sounds to suppress. (Very short clips may be less reliable.)
   - Each file is analyzed and kept for future sessions. Failed/unclear ones are marked **stale**.

5. **Let it run**
   - The script monitors the audio continuously.
   - When it detects a match, it mutes and shows how long the mute will last.

6. **Manage your references**
   - Enable/disable specific sounds.
   - Tweak the “shape” matching window per file to adjust sensitivity.
   - Remove unwanted or stale entries.

## UI at a glance

- **Anti-raccoon toggle button**: Opens the main interface and shows remaining mute time during an active mute.  
- **Start/Stop button**: Controls detection.  
- **Reference list**: See, enable/disable, adjust window size, or remove each sound.  
- **Engine indicators**:  
  - *Detection Engine*: Shows whether the fast matching path is using the preferred AudioWorklet or a fallback.  
  - *Fingerprint Engine*: Shows if fingerprinting is happening in the background worker (preferred) or on the main thread.  
- **Status line**: Live feedback (e.g., “Listening…”, “Fingerprint miss…”, “Confirmed → muting”).  
- **In-player notification**: Which reference triggered and countdown.  
- **Toggle badge**: Remaining mute duration on the raccoon icon.

## Common issues & what to do

- **Nothing is muting**  
  Make sure you have reference files loaded and enabled, and that detection is running. Check the status line for clues (e.g., fingerprint misses).

- **Reference shows as stale**  
  Remove it and re-upload the original audio; it failed to process properly previously.

- **Mute doesn’t apply**  
  Twitch’s internal controls can change. Refresh the page; if it still fails, the script may need an update.

- **High CPU usage**  
  Look at the engine indicators—if you’re falling back from the preferred paths, that increases load. Reducing reference count or loosening thresholds (in advanced) helps.

- **Mute lasts too long**  
  That usually means the reference audio is long or its duration was misestimated. Edit or remove the problematic reference.

## Advanced (for power users / tweaking)

### How matching works (behind the scenes)
1. **Quick shape check**: The recent loudness pattern (“envelope”) is monitored continuously off the main thread. When live audio resembles a stored reference’s shape, a candidate is generated.  
2. **Fingerprint confirmation**: Only promising candidates are checked via a detailed Chromaprint fingerprint to avoid false positives. If the fingerprint is close enough, the mute is triggered.

### Editable parameters (in the script source)
- `DEFAULT_ENV_WINDOW_S` (default `2`): How much of each reference’s loudness shape is used for the initial match. Bigger values are smoother/stricter.  
- `FP_WINDOW_S` (default `1`): Duration of audio used to build the fingerprint.  
- `ENV_CORR_THRESHOLD` (default `0.7`): Shape similarity threshold to advance to fingerprinting.  
- `FP_THRESHOLD` (default `0.9`): How closely fingerprints must match to confirm.  
- `SILENCE_RMS` (default `0.0005`): Skips detection on very quiet audio.  
- `ENV_RATE_HZ` (default `50`): Sampling rate for the envelope (shape) data.  
- `AUTO_START_DETECTION`: Whether detection automatically begins when references exist.

### Engine behavior
- **Primary path** uses an **AudioWorklet** for envelope/candidate work and a **Web Worker** for fingerprinting to keep the main thread responsive.  
- Fallbacks exist: if those aren’t available or fail, it gracefully degrades to older mechanisms (ScriptProcessorNode and main-thread fingerprinting).

### Persistence
- Reference audio, window sizes, and enabled/disabled state are stored (base64-encoded) in Tampermonkey storage under `ref_audio_files`. Changing the storage method would require editing the loader/save code.

## Security & caveats

- The fingerprinting engine is loaded as WebAssembly from a third-party CDN. A compromised upstream could affect fingerprint behavior.  
- Fingerprint matching is strict; small timing misalignments may reduce match confidence.  
- Muting toggles internal Twitch properties when available, which may break if Twitch changes their frontend.  
- Stored audio is base64-encoded and may hit size limits in userscript storage for large collections.

## Disclaimer

This README was generated by AI. Use the script at your own risk. No warranty is provided.
