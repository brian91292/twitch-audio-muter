// ==UserScript==
// @name         Twitch Envelope+Chromaprint Muter
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Mutes audio by checking against reference files, so if there are certain sounds you hear frequently on Twitch that trigger you, you can mute for the dutation of the sound (won't work well with really short sounds)
// @match        https://www.twitch.tv/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      cdn.jsdelivr.net
// ==/UserScript==

(function() {
  'use strict';
  const qs = s => document.querySelector(s);

  // —— CONFIG ——
  const wasmUrl = 'https://cdn.jsdelivr.net/npm/@unimusic/chromaprint@0.1.4/dist/chromaprint.wasm';
  const raccoonIconData =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAADAFBMVEVMaXExNDHcwbcxJiHzOUD+Ljj/TVX/AArzOkD8///pyr3cr6XyOT/+JyfjwbTArKHHnZmoQEbWxLb0OD/1OD7pycL3OT0rKShub270Njv1OD30Kiz1OD71Njr2OD31OD73NTn0Nz32Jyf2Nzv3OT/1NTn3NDj2Nz33OkD0Nz30OD32Nz32OD70Oj33Njn3Njn1OD31ODv7Njbnwrf1OD70NjykpKL5OT71Njv1NDj3NTr0Ojr0Njn1OD1YKy1qbWzIx8T0NTpTTkr1NzsrKCcvKChqa2kpJyYvKChra2ktKShtamlDPzdqZGFqamhna2kpJiRnZWNlZGQsKCcsKScrJiZpZmNsbGptbmzOv7UsKShoZWWDLzPDRkwrKCcrKCYcJyUzLi5YamkzLCvc0cVqamfTjI14eHUcGBhEQ0KuTVJcW1mHLS2jTVCYMDRaX164LjV8ennmbm3qNz1WVlM0ODc2KSj0OkFub24rKSj1OD/zOkH1OUD0O0H0OUDzOkD////zOUD/PUQqKCcrKCfyOUAsKSltbm1ubW3+/vktKipvcG73O0L9/fdub2/2O0H5O0L+/fnzNz9wcHD7PEMoJiX///3+PURzdHP/PEP///v///n8O0IuLCv/OkJvb25ycnEuKCgnJCMfHRwcGhlrbGslIyIeJyZ2d3VkcG/6OUD9Mzz3OEAkIiFmZ2UiIB9paWhjY2LvOEA5NzZob24wLy4+PDv4NT1PTk00MzLoOEAjJyb29vOWl5VKSknc3NmKiojs7OlkZWTh4d7X19OsrKrn5+N+fnxYWFbx8e4mKCffOUD8+facnJpcXFqPj478NT1UU1L0KzNBQD/Q0M3Awb6EhIMWExOHXWBgX175MTpGREO5ubbLQklzZ2hCKSrSNj19YmRpLS+gT1K9SE83KCk7KSqVWlzWP0a2SlCYMTa7NDm0tLFhbGuuT1SoMziPMDX0MjlMJyrzcHPENTv78O7qLTT2ZGixMzn1TFH7zs774d/yW17wsbH/d3rzQEZm24nCAAAA5XRSTlMAARQC/QIDAf4BEgz9AxIMDAMS+u8UEf36ZpMG01+c4x/0CYP1OzHc+7upwuklTULMKw0Vstf8GnpHVBVai/7s/m4SdfIrvEw/qXxrCDOch5FEIMq5HFXQ4BTtXf393/lrqVfVIXT+KVj20PBEpef+/rcL6KH++P/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+1TL/LgAAAAlwSFlzAAALEwAACxMBAJqcGAAAGABJREFUeJztW3d8E1mSfpZb6gZaMB5HwGBsgwM2mJxzmpxz2pwu3/3VajXdarVCW8kBRQfZcpAD4IwNNibnDEMaZpicd9Lm3dvbvbtfvbYNtmXDzjA7t7fz0K8RqNX1va/q1auqV0I/uvu5sWPHjx87/rnx8Lr77vHjx4+/G96MHYvfj4eP8XUsvsALLvHwF76MHRsfP1alGhsfHz9+rEr5FD+y719jVXfDo+DRd+ML/FHG2LtRPBqDvtERj6LIKBgkfilvySjyTo8bTx880P8BBsb8nQN47psGMBb9vatA9S0A9K0KxvzNGiFJqtVqdTRJ/vUBkFrN8P8h/0oASEVSVFrCrIwZeUvzZmTMSkhT44/U2qivGwCphWvCjImTFiyMS42leJ4nYlPjMnNmpq+YNfkGvK8JgJZESJuxfkEu4Zf8HifP8zzH8Xyh0+OXJE9s8tQp04AH9dcEQI0QOXfJnFi/38nTsQTFYfEcxxkMBoqgKd4jeVKzJy7u5+kOA1CTKG1Zdqzk4WmaM3AcLxh4juEZhuEBiQEGTRT6/XFTZ6gRqb7DANQkmjcxudzPExSH58wBCPibwe8MBo7nDQYOMEh89mwtfOPOASDVaPKUhX4PTTMMyOd4ThA4hucMvGBgGEFgBI4TMAnAA+UvyslDUeo7BkCtRjPmlHtoysBxDMNwPC9wPMMIHGOgKEowCILAcAYBI8BXgvY7Z866TRJUtwSgRQmTsjwEJTDAOHDAMwaaoAXe6fR4PEVOniFommL6KBAEA8cRhBS3fjKKuQMASA3KWyhl0QaBYbDGGc5AU06/VMKkxqUsXLgwJS6V8Ej+IoamMQBjnyIKS3LmIs1XBqAm0fosD23gBAHrn2FoqkgqisuZNHHp3OXz0tLS5iXMmjElfUFmrOTnaUoAe8RWSRH+uCm3oQbVqADUaN5MiacYTD0goAv9zoWTli0eZmFp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";
  const AUTO_START_DETECTION = true;
  const DEFAULT_ENV_WINDOW_S = 2;
  const FP_WINDOW_S          = 1;
  const MAX_ENV_WINDOW_S     = 5;
  const ENV_RATE_HZ          = 50;
  const ENV_CORR_THRESHOLD   = 0.7;
  const FP_THRESHOLD         = 0.9;
  const SILENCE_RMS          = 0.0005;

  // —— STATE ——
  let referenceData = [];
  let staleEntries   = [];                 // ← added for flagging stale blobs
  let ChromaprintModule;
  let audioCtx, srcNode, procNode, mediaElement;
  let ringBuf, envRing, writePtr = 0, filled = false;
  let sampleCount = 0, envSum = 0;
  let isDetecting = false, hasMuted = false;
  let unmuteTimeoutId, notificationIntervalId, buttonIntervalId;
  let toggleBtn;

  // —— UI & EVENT LISTENERS ——
  window.addEventListener('load', () => {
     // —— STYLES ——
GM_addStyle(`
  /* Panel wrapper */
  #hybrid-mute {
    display: none;
    position: fixed;
    top: 5rem;
    right: 1rem;
    width: 24rem;
    transform: scale(1.2);
    transform-origin: top right;
    background-color: var(--color-background-alt);
    border: 1px solid var(--color-border-brand);
    border-radius: var(--border-radius-medium);
    box-shadow: var(--shadow-elevation-medium);
    padding: 1rem 1.25rem;
    font: 1rem var(--font-family, system-ui, sans-serif);
    color: var(--color-text-high-emphasis);
    z-index: 10000;
  }

  /* Start/Stop button */
  #start-btn {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    background-color: var(--color-accent-primary);
    color: var(--color-text-inverted);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--border-radius-small);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.1s ease, border-color 0.1s ease;
  }
  #start-btn:hover {
    background-color: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  /* Engine & reference count */
  #hybrid-mute > div:nth-of-type(1),
  #hybrid-mute > div:nth-of-type(2) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.25rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border-muted);
    font-size: 0.875rem;
  }

  /* Browse input */
  #ref-input {
    font-size: 0;
    margin-top: 1rem !important;
    margin-bottom: 0.5rem;
    border: none;
  }
  #ref-input::-webkit-file-upload-button,
  #ref-input::file-selector-button {
    font-size: 1rem;
  }

  /* File list section */
  #file-list-container {
    max-height: 8rem;
    overflow-y: auto;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border-muted);
  }
  .file-entry-row {
    display: grid;
    grid-template-columns: auto 1fr 4rem 1rem;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .file-entry-row span {
    font-size: 0.9rem;
    color: var(--color-text-high-emphasis);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .file-entry-row .enable-toggle {
    width: 1.2rem;
    height: 1.2rem;
  }

  /* Number input with native arrows pinned right */
  .file-entry-row .ref-window-input {
    position: relative;
    width: 4rem;
    padding: 0.4rem;                /* uniform padding */
    font-size: 1rem;
    text-align: right;
    border: 1px solid var(--color-border-muted);
    border-radius: var(--border-radius-small);
  }
  .file-entry-row .ref-window-input::-webkit-outer-spin-button {
    display: none;
  }
  .file-entry-row .ref-window-input::-webkit-inner-spin-button {
    -webkit-appearance: inner-spin-button;
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
  }

  /* Remove buttons */
  .file-entry-row .remove-btn,
  .file-entry-row .remove-stale-btn {
    justify-self: end;
    padding: 0;
    width: 1rem;
    font-size: 1.2rem;
    color: var(--color-text-low-emphasis);
    cursor: pointer;
    transition: color 0.1s ease;
  }
  .file-entry-row .remove-btn:hover,
  .file-entry-row .remove-stale-btn:hover {
    color: var(--color-danger-text);
  }

  /* Status line */
  #status {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  /* Mute notification */
  #mute-notification {
    position: fixed;
    top: 1.2rem;
    left: 1.2rem;
    background-color: var(--color-danger-background);
    color: var(--color-text-inverted);
    padding: 1rem 1.2rem;
    border-radius: var(--border-radius-small);
    box-shadow: var(--shadow-elevation-medium);
    font-size: 1rem;
    z-index: 10001;
  }

  /* Twitch UI toggle button */
  #muter-toggle-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.7rem;
    border-radius: var(--border-radius-small);
    transition: background 0.1s ease;
    width: 6.0rem !important;
    height: 6.0rem !important;
  }
    /* countdown badge in the top‐right */
  #muter-toggle-btn::after {
    content: attr(data-countdown);
    position: absolute;
    top: 1rem;
    right: 0.5rem;
    background: rgba(0,0,0,0.6);
    color: white;
    font-size: 1rem;
    line-height: 1;
    padding: 0.2rem 0.5rem;
    border-radius: 0.3rem;
    pointer-events: none;
    white-space: nowrap;
  }

  #muter-toggle-btn:hover {
    background: var(--color-background-modifier-hover);
  }
  #muter-toggle-btn img {
    width: 100% !important;
    height: 100% !important;
  }
  #mute-notification {
    position: absolute;       /* already inside player */
    top: 0.5rem;
    left: 0.5rem;
    background-color: rgba(0, 0, 0, 0.75);   /* dark semi-transparent */
    color: #ffffff;
    padding: 0.6rem 1rem;      /* a bit more padding */
    border-radius: var(--border-radius-small);
    font-size: 1.1rem;         /* slightly larger text */
    font-weight: 500;
    border: 1px solid var(--color-border-muted);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    opacity: 0.9;              /* subtle fade */
    transition: opacity 0.2s ease;
    z-index: 10002;            /* above video but below UI chrome */
  }
  #mute-notification:hover {
    opacity: 1;                /* fully opaque on hover to read easily */
  }
`);







  const btn = document.getElementById('start-btn');
  if (btn) btn.disabled = false;

    // Create the script's UI panel (it will be hidden by default)
    const c = document.createElement('div');
    c.id = 'hybrid-mute';
    c.innerHTML = `
      <button id="start-btn">Start Detection</button>
      <div>Chromaprint Engine: <span id="wasm-ind" class="indicator" style="color:#ffc107;">Loading...</span></div>
      <div>Reference Audio Files: <span id="ref-ind" class="indicator"></span></div>
      <input type="file" id="ref-input" accept="audio/*" disabled multiple>
      <div id="file-list-container"></div>
      <div id="status">Status: Initializing...</div>
    `;
    document.body.appendChild(c);

    // Inject the button into Twitch's UI that will toggle our panel
    injectUIToggleButton();

    window.addEventListener('pointerdown', e => {
        const panel = document.getElementById('hybrid-mute');
        if (panel.style.display === 'block'
            && !panel.contains(e.target)
            && !toggleBtn.contains(e.target)) {
            panel.style.display = 'none';
        }
    }, true /* useCapture */);

    // Event Listeners for the panel
    qs('#ref-input').addEventListener('change', onRefLoad);
    qs('#start-btn').addEventListener('click', toggleDetect);

    qs('#file-list-container').addEventListener('click', async (e) => {
      if (e.target.classList.contains('remove-btn')) {
        await removeReferenceFile(e.target.dataset.filename);
      }
      if (e.target.classList.contains('remove-stale-btn')) {
        await removeReferenceFile(e.target.dataset.filename);
      }
    });
    qs('#file-list-container').addEventListener('change', (e) => {
      const target = e.target;
      if (target.classList.contains('ref-window-input')) {
        const fileName = target.dataset.filename;
        const newSize = Math.max(0.5, Math.min(MAX_ENV_WINDOW_S, parseFloat(target.value) || DEFAULT_ENV_WINDOW_S));
        target.value = newSize;
        handleWindowSizeChange(fileName, newSize);
      } else if (target.classList.contains('enable-toggle')) {
        const fileName = target.dataset.filename;
        handleEnableToggle(fileName, target.checked);
      }
    });

    initialize();
  });

  function injectUIToggleButton() {
    const injectionInterval = setInterval(() => {
      const notificationsButton = document.querySelector('button[aria-label="Open Notifications"]');

      if (notificationsButton) {
          const notificationSlot = notificationsButton.closest('.top-nav__menu > div');

          if (notificationSlot && notificationSlot.parentElement) {
              clearInterval(injectionInterval);

              if (document.getElementById('muter-toggle-btn-wrapper')) {
                  return;
              }

              toggleBtn = document.createElement('button');
              toggleBtn.id = 'muter-toggle-btn';
              toggleBtn.title = 'Toggle Audio Muter UI';
              toggleBtn.innerHTML = `<img src="${raccoonIconData}" width="24" height="24" alt="Audio Muter">`;


              toggleBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const panel = qs('#hybrid-mute');
                  if (panel) {
                      const isVisible = panel.style.display === 'block';
                      panel.style.display = isVisible ? 'none' : 'block';
                  }
              });

              const wrapperDiv = document.createElement('div');
              wrapperDiv.id = 'muter-toggle-btn-wrapper';
              wrapperDiv.className = notificationSlot.className;
              wrapperDiv.appendChild(toggleBtn);

              notificationSlot.parentElement.insertBefore(wrapperDiv, notificationSlot);
          }
      }
    }, 500);
  }

  // —— INITIALIZATION ——
  async function initialize() {
    const statusEl = qs('#status');
    const wasmInd = qs('#wasm-ind');
    try {
      statusEl.textContent = 'Downloading Chromaprint engine...';
      const response = await fetch(wasmUrl);
      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      const wasmBytes = await response.arrayBuffer();

      statusEl.textContent = 'Loading WASM...';
      ChromaprintModule = await createChromaprintModule({ wasmBinary: wasmBytes });

      statusEl.textContent = 'WASM Ready.';
      wasmInd.textContent = 'Loaded ✔️';
      wasmInd.style.color = '#5cb85c';
      qs('#ref-input').disabled = false;
      qs('#ref-ind').style.color = wasmInd.style.color;
      await loadSavedRefAudio();
    } catch (error) {
      console.error('Failed to initialize Chromaprint module:', error);
      statusEl.textContent = 'Error: Failed to load Chromaprint engine.';
      wasmInd.textContent = 'Failed! ❌';
      wasmInd.style.color = '#e74c3c';
      qs('#ref-ind').style.color = wasmInd.style.color;
    }
  }

  // —— UI MANAGEMENT ——
  function updateFileListUI() {
    const container = qs('#file-list-container');
    container.innerHTML = '';

    if (!referenceData.length && !staleEntries.length) {
      container.innerHTML = '<div style="color:#888; text-align:center; font-style:italic;">No files loaded</div>';
      return;
    }

    if (referenceData.length) {
      referenceData.forEach(ref => {
        const fileDiv = document.createElement('div');
        fileDiv.className = `file-entry-row ${!ref.isEnabled ? 'disabled' : ''}`;
        fileDiv.innerHTML = `
              <input type="checkbox" class="enable-toggle" data-filename="${ref.fileName}" ${ref.isEnabled ? 'checked' : ''} title="Enable/disable this file">
              <span title="${ref.fileName}">${ref.fileName}</span>
              <input type="number" class="ref-window-input" data-filename="${ref.fileName}" value="${ref.envWindowS}" min="0.5" max="${MAX_ENV_WINDOW_S}" step="0.1" title="Envelope match window (seconds)">
              <button class="remove-btn" data-filename="${ref.fileName}" title="Remove file">&times;</button>
          `;
        container.appendChild(fileDiv);
      });
    }

    if (staleEntries.length) {
      const staleHeader = document.createElement('div');
      staleHeader.style.marginTop = '10px';
      staleHeader.style.color = '#e74c3c';
      staleHeader.textContent = `⚠️ Stale references:`;
      container.appendChild(staleHeader);

      staleEntries.forEach(name => {
        const row = document.createElement('div');
        row.className = 'file-entry-row disabled';
        row.innerHTML = `
          <span title="${name}">${name}</span>
          <button class="remove-stale-btn" data-filename="${name}" title="Remove stale entry">&times;</button>
        `;
        container.appendChild(row);
      });
    }
  }

  // —— REFERENCE LOADER & MANAGEMENT ——
  async function onRefLoad(e) {
    const files = e.target.files;
    if (!files.length || !ChromaprintModule) return;
    const existingFilesJSON = await GM_getValue('ref_audio_files', '{}');
    const savedFiles = JSON.parse(existingFilesJSON);
    for (const file of files) {
      if (savedFiles[file.name]) {
        continue;
      }
      const audioDataBuffer = await file.arrayBuffer();
      let binaryString = '';
      const bytes = new Uint8Array(audioDataBuffer);
      const len = bytes.byteLength;
      const CHUNK_SIZE = 8192;
      for (let i = 0; i < len; i += CHUNK_SIZE) {
        const chunk = bytes.subarray(i, i + CHUNK_SIZE);
        binaryString += String.fromCharCode.apply(null, chunk);
      }
      savedFiles[file.name] = {
        data: btoa(binaryString),
        envWindowS: DEFAULT_ENV_WINDOW_S,
        isEnabled: true
      };
      await processAndAddReference(audioDataBuffer, file.name, DEFAULT_ENV_WINDOW_S, true);
    }
    await GM_setValue('ref_audio_files', JSON.stringify(savedFiles));
  }

  async function loadSavedRefAudio() {
    const savedFilesJSON = await GM_getValue('ref_audio_files');
    if (!savedFilesJSON) {
      updateFileListUI();
      return;
    }
    const savedFiles = JSON.parse(savedFilesJSON);
    const fileNames = Object.keys(savedFiles);
    if (!fileNames.length) {
      updateFileListUI();
      return;
    }

    qs('#status').textContent = `Loading ${fileNames.length} saved reference(s)...`;
    referenceData = [];
    staleEntries   = [];
    let needsSave = false;

    for (const name of fileNames) {
      const entry = savedFiles[name];
      const b64 = entry.data;
      const envWindowS = (entry.envWindowS !== undefined) ? entry.envWindowS : DEFAULT_ENV_WINDOW_S;
      const isEnabled = (entry.isEnabled !== undefined) ? entry.isEnabled : true;

      try {
        const bin = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0))).buffer;
        const refObject = await generateReferenceDataObject(bin, envWindowS);
        if (!refObject) throw new Error('Decoding failed');

        refObject.fileName = name;
        refObject.isEnabled = isEnabled;
        referenceData.push(refObject);

        if (entry.envWindowS === undefined || entry.isEnabled === undefined) {
          savedFiles[name] = {
            data: b64,
            envWindowS,
            isEnabled
          };
          needsSave = true;
        }
      } catch (e) {
        console.warn(`Reference "${name}" failed to load and has been flagged as stale`, e);
        staleEntries.push(name);
      }
    }

    if (needsSave) {
      await GM_setValue('ref_audio_files', JSON.stringify(savedFiles));
    }

    updateFileListUI();
    qs('#ref-ind').textContent = `${referenceData.length} file(s) loaded ✔️`;
    if (AUTO_START_DETECTION && referenceData.length > 0) {
      startDetect();
    }
  }

  async function processAndAddReference(audioDataBuffer, fileName, envWindowS, isEnabled) {
    qs('#status').textContent = `Processing ${fileName}...`;
    const refObject = await generateReferenceDataObject(audioDataBuffer, envWindowS);
    if (refObject) {
      refObject.fileName = fileName;
      refObject.isEnabled = isEnabled;
      referenceData.push(refObject);
      updateFileListUI();
      qs('#ref-ind').textContent = `${referenceData.length} file(s) loaded ✔️`;
      qs('#status').textContent = `${referenceData.length} reference(s) ready.`;
      qs('#start-btn').disabled = false;
    }
  }

  async function generateReferenceDataObject(audioDataBuffer, envWindowS) {
    if (!audioDataBuffer || !ChromaprintModule) return null;
    const actx = new(AudioContext || webkitAudioContext)();
    const buf = await actx.decodeAudioData(audioDataBuffer.slice(0));

    const fullPcm = buf.getChannelData(0);
    const silenceThreshold = 0.01;
    let firstSampleIndex = 0;
    for (let i = 0; i < fullPcm.length; i++) {
      if (Math.abs(fullPcm[i]) > silenceThreshold) {
        firstSampleIndex = i;
        break;
      }
    }

    const envEndSampleIndex = Math.min(firstSampleIndex + (actx.sampleRate * envWindowS), fullPcm.length);
    const envPcm = fullPcm.subarray(firstSampleIndex, envEndSampleIndex);
    const envFrameSize = Math.floor(actx.sampleRate / ENV_RATE_HZ);
    const numEnvFrames = Math.floor(envPcm.length / envFrameSize);
    const refEnv = new Float32Array(numEnvFrames);
    for (let i = 0; i < numEnvFrames; i++) {
      let sum = 0,
        off = i * envFrameSize;
      for (let j = 0; j < envFrameSize; j++) sum += Math.abs(envPcm[off + j]);
      refEnv[i] = sum / envFrameSize;
    }

    const fpEndSampleIndex = Math.min(firstSampleIndex + (actx.sampleRate * FP_WINDOW_S), fullPcm.length);
    const fpPcm = fullPcm.subarray(firstSampleIndex, fpEndSampleIndex);
    const refFPArr = await rawFingerprint(fpPcm, actx.sampleRate);

    const startTimeInSeconds = firstSampleIndex / actx.sampleRate;
    const adjustedDuration = buf.duration - startTimeInSeconds;
    await actx.close();

    return {
      duration: adjustedDuration,
      env: refEnv,
      fpArr: refFPArr,
      envWindowS: envWindowS
    };
  }

  async function handleWindowSizeChange(fileName, newSize) {
    qs('#status').textContent = `Re-processing ${fileName}...`;
    const savedFilesJSON = await GM_getValue('ref_audio_files', '{}');
    const savedFiles = JSON.parse(savedFilesJSON);
    if (!savedFiles[fileName]) return;

    savedFiles[fileName].envWindowS = newSize;
    await GM_setValue('ref_audio_files', JSON.stringify(savedFiles));

    const b64 = savedFiles[fileName].data;
    const bin = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0))).buffer;
    const newRefObject = await generateReferenceDataObject(bin, newSize);

    if (newRefObject) {
      const index = referenceData.findIndex(ref => ref.fileName === fileName);
      if (index !== -1) {
        newRefObject.fileName = fileName;
        newRefObject.isEnabled = referenceData[index].isEnabled;
        referenceData[index] = newRefObject;
        qs('#status').textContent = `Updated ${fileName} window to ${newSize}s.`;
      }
    }
  }

  async function handleEnableToggle(fileName, isEnabled) {
    const index = referenceData.findIndex(ref => ref.fileName === fileName);
    if (index !== -1) {
      referenceData[index].isEnabled = isEnabled;
      const savedFilesJSON = await GM_getValue('ref_audio_files', '{}');
      const savedFiles = JSON.parse(savedFilesJSON);
      if (savedFiles[fileName]) {
        savedFiles[fileName].isEnabled = isEnabled;
        await GM_setValue('ref_audio_files', JSON.stringify(savedFiles));
      }
      updateFileListUI();
    }
  }

  async function removeReferenceFile(fileNameToRemove) {
    referenceData = referenceData.filter(ref => ref.fileName !== fileNameToRemove);
    staleEntries   = staleEntries.filter(n => n !== fileNameToRemove); // also clear from stale
    const existingFilesJSON = await GM_getValue('ref_audio_files', '{}');
    const savedFiles = JSON.parse(existingFilesJSON);
    delete savedFiles[fileNameToRemove];
    await GM_setValue('ref_audio_files', JSON.stringify(savedFiles));
    updateFileListUI();
    qs('#ref-ind').textContent = `${referenceData.length} file(s) loaded ✔️`;
    if (!referenceData.length) {
      qs('#status').textContent = 'No references loaded.';
      qs('#start-btn').disabled = true;
    }
  }

  // —— DETECTION CONTROL & PLAYER MUTE ——
  function setPlayerMuted(shouldBeMuted) {
    const buttons = Array.from(document.querySelectorAll('button[aria-label*="Mute"], button[aria-label*="Unmute"]'))
      .filter(btn => btn.offsetParent !== null);
    if (!buttons.length) return;
    const muteButton = buttons.find(btn => btn.closest('[data-a-target="player-controls"]')) || buttons[0];
    const isCurrentlyMuted = muteButton.getAttribute('aria-label').toLowerCase().includes('unmute');
    if (shouldBeMuted === isCurrentlyMuted) return;
    const reactPropsKey = Object.keys(muteButton).find(key => key.startsWith('__reactProps$'));
    if (reactPropsKey && muteButton[reactPropsKey]?.onClick) {
      muteButton[reactPropsKey].onClick();
    } else {
      muteButton.click();
    }
  }

  function toggleDetect() {
    if (hasMuted) {
      clearTimeout(unmuteTimeoutId);
      clearInterval(notificationIntervalId);
      clearInterval(buttonIntervalId);
      qs('#mute-notification')?.remove();
      setPlayerMuted(false);
      hasMuted = false;
      isDetecting = false;
      qs('#start-btn').textContent = 'Start Detection';
      qs('#status').textContent = 'Stopped by user.';
      if (procNode) procNode.disconnect();
      if (srcNode) srcNode.disconnect();
      if (audioCtx) audioCtx.close();
    } else {
      isDetecting ? stopDetect() : startDetect();
    }
  }

  function startDetect() {
    if (!referenceData.length || !ChromaprintModule) return;
    isDetecting = true;
    hasMuted = false;
    qs('#status').textContent = 'Listening…';
    mediaElement = qs('video');
    if (!mediaElement) {
      qs('#status').textContent = 'Error: No video';
      return;
    }
    audioCtx = new(AudioContext || webkitAudioContext)();
    srcNode = audioCtx.createMediaElementSource(mediaElement);
    procNode = audioCtx.createScriptProcessor(4096, 1, 1);
    srcNode.connect(procNode);
    procNode.connect(audioCtx.destination);
    procNode.onaudioprocess = onAudioProcess;

    const fpRingSamples = Math.floor(FP_WINDOW_S * audioCtx.sampleRate);
    ringBuf = new Float32Array(fpRingSamples);

    const maxEnvFrames = Math.ceil(MAX_ENV_WINDOW_S * ENV_RATE_HZ);
    envRing = new Float32Array(maxEnvFrames);

    writePtr = 0;
    filled = false;
    sampleCount = 0;
    envSum = 0;
    qs('#start-btn').textContent = 'Stop Detection';
  }

  function stopDetect() {
    isDetecting = false;
    if (procNode) procNode.disconnect();
    if (srcNode) srcNode.disconnect();
    if (audioCtx) audioCtx.close();
    qs('#start-btn').textContent = 'Start Detection';
    qs('#status').textContent = 'Stopped.';
  }

  async function onAudioProcess(ev) {
    if (!isDetecting || hasMuted) return;
    const input = ev.inputBuffer.getChannelData(0);
    const N = ringBuf.length;

    const envFrameSize = Math.floor(audioCtx.sampleRate / ENV_RATE_HZ);
    for (let i = 0; i < input.length; i++) {
      ringBuf[writePtr] = input[i];
      envSum += Math.abs(input[i]);
      sampleCount++;
      if (sampleCount >= envFrameSize) {
        envRing.copyWithin(0, 1);
        envRing[envRing.length - 1] = envSum / sampleCount;
        sampleCount = envSum = 0;
      }
      writePtr = (writePtr + 1) % N;
    }
    if (!filled && writePtr > N / 2) filled = true;
    if (!filled) return;

    const currentEnvCheck = envRing.subarray(envRing.length - (DEFAULT_ENV_WINDOW_S * ENV_RATE_HZ));
    let ss = 0;
    for (let v of currentEnvCheck) ss += v * v;
    if (Math.sqrt(ss / currentEnvCheck.length) < SILENCE_RMS) return;

    for (const ref of referenceData) {
      if (!ref.isEnabled) continue;

      const refEnv = ref.env;
      if (!refEnv.length) continue;
      const liveEnvSlice = envRing.subarray(envRing.length - refEnv.length);

      let sumR = 0, sumL = 0;
      for (let i = 0; i < refEnv.length; i++) {
        sumR += refEnv[i];
        sumL += liveEnvSlice[i];
      }
      const mR = sumR / refEnv.length, mL = sumL / refEnv.length;
      let num = 0, dR2 = 0, dL2 = 0;
      for (let i = 0; i < refEnv.length; i++) {
        const dR = refEnv[i] - mR, dL = liveEnvSlice[i] - mL;
        num += dR * dL;
        dR2 += dR * dR;
        dL2 += dL * dL;
      }
      const corr = num / Math.sqrt(dR2 * dL2);
      if (corr < ENV_CORR_THRESHOLD) continue;

      qs('#status').textContent = `Env↑ for ${ref.fileName}, fingerprinting…`;
      const win = new Float32Array(N);
      const tail = ringBuf.subarray(writePtr), head = ringBuf.subarray(0, writePtr);
      win.set(tail, 0); win.set(head, tail.length);
      const liveArr = await rawFingerprint(win, audioCtx.sampleRate);
      const M = Math.min(ref.fpArr.length, liveArr.length);
      if (!M) continue;
      let match = 0;
      for (let i = 0; i < M; i++) if (ref.fpArr[i] === liveArr[i]) match++;
      const ratio = match / M;
      if (ratio < FP_THRESHOLD) {
        qs('#status').textContent = `Listening… (FP miss on ${ref.fileName})`;
        continue;
      }

      hasMuted = true;
      procNode.disconnect();
      const muteDurationMs = Math.max((ref.duration - FP_WINDOW_S) * 1000, 0);
      const countdownEndTime = Date.now() + muteDurationMs;
      const startBtn = qs('#start-btn');
      const notif = document.createElement('div');
      notif.id = 'mute-notification';
      const updateNotifText = () => {
        const secondsLeft = Math.ceil((countdownEndTime - Date.now()) / 1000);
        if (secondsLeft >= 0) notif.innerHTML = `🔇 Muting for <b>${secondsLeft}s</b> (match: ${ref.fileName})`;
      };
      updateNotifText();
      //document.body.appendChild(notif);
        const videoEl = document.querySelector('video');
        if (videoEl) {
            // pick the nearest wrapper
            const playerContainer = videoEl.closest('[data-a-player-container]') || videoEl.parentElement;
            // ensure it's positioned
            if (getComputedStyle(playerContainer).position === 'static') {
                playerContainer.style.position = 'relative';
            }
            // append notification into the player
            playerContainer.appendChild(notif);
        } else {
            // fallback to body
            document.body.appendChild(notif);
        }
      notificationIntervalId = setInterval(updateNotifText, 1000);

      const updateButtonText = () => {
        const secondsLeft = Math.ceil((countdownEndTime - Date.now()) / 1000);
        if (secondsLeft > 0) startBtn.textContent = `Stop (Resuming in ${secondsLeft}s...)`;
      };
      updateButtonText();
      buttonIntervalId = setInterval(updateButtonText, 1000);

      qs('#status').textContent = `Confirmed (${ref.fileName}) → muting`;
      setPlayerMuted(true);

        // assume `toggleBtn` is your #muter-toggle-btn element
        let remaining = Math.ceil(muteDurationMs/1000);
        toggleBtn.setAttribute('data-countdown', remaining + 's');

        const cdInterval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(cdInterval);
                toggleBtn.removeAttribute('data-countdown');
            } else {
                toggleBtn.setAttribute('data-countdown', remaining + 's');
            }
        }, 1000);

      unmuteTimeoutId = setTimeout(() => {
        clearInterval(notificationIntervalId);
        clearInterval(buttonIntervalId);
        qs('#mute-notification')?.remove();
        setPlayerMuted(false);
        hasMuted = false;
        qs('#status').textContent = 'Unmuted — resuming…';
        startBtn.textContent = 'Stop Detection';

        ringBuf.fill(0);
        envRing.fill(0);
        writePtr = 0;
        filled = false;

        srcNode.connect(procNode);
        procNode.connect(audioCtx.destination);
      }, muteDurationMs);

      break;
    }
  }

  // —— Chromaprint fingerprint helper ——
  async function rawFingerprint(pcm, sr) {
    const M = ChromaprintModule, ctx = M._chromaprint_new(1);
    M._chromaprint_start(ctx, sr, 1);
    const ptr = M._malloc(pcm.length * 4);
    M.HEAPF32.set(pcm, ptr / 4);
    M._chromaprint_feed(ctx, ptr, pcm.length);
    M._free(ptr);
    M._chromaprint_finish(ctx);
    const lenPtr = M._malloc(4), arrPtr = M._chromaprint_get_raw_fingerprint(ctx, lenPtr);
    const length = M.HEAPU32[lenPtr >> 2];
    const codes = Array.from(M.HEAPU32.subarray(arrPtr >> 2, (arrPtr >> 2) + length));
    M._free(lenPtr);
    M._chromaprint_free(ctx);
    return codes;
  }

  // —— WASM loader ——
  function createChromaprintModule(moduleArg = {}) {
    return new Promise((resolve, reject) => {
      const Module = {...moduleArg};
      let wasmMemory, HEAPU8, HEAPF32, HEAPU32;
      Module.onRuntimeInitialized = () => resolve(Module);

      function updateViews() {
        const buf = wasmMemory.buffer;
        HEAPU8 = new Uint8Array(buf);
        HEAPF32 = new Float32Array(buf);
        HEAPU32 = new Uint32Array(buf);
      }

      const env = {
        memory: new WebAssembly.Memory({initial:256, maximum:256}),
        __memory_base:0, __table_base:0,
        emscripten_resize_heap:()=>false,
        emscripten_get_now:()=>performance.now(),
        emscripten_date_now:()=>Date.now(),
        _emscripten_memcpy_big:(d,s,n)=>{new Uint8Array(wasmMemory.buffer).copyWithin(d,s,s+n); return d;},
        __handle_stack_overflow:() => {throw new Error("overflow");},
        __cxa_throw:()=>{throw new Error("cxa throw");},
        __cxa_begin_catch:()=>{}, __cxa_atexit:()=>{},
        emscripten_err:ptr=>console.error(Module.UTF8ToString(ptr)),
        abort:e=>{throw new Error("abort:"+e);},
        _abort_js:e=>{throw new Error("abort(js):"+e);},
        _setitimer_js:()=>0,
        _emscripten_runtime_keepalive_clear:()=>{}
      };

      const wasi = {
        fd_write:(fd,iovs,iovsLen,wp)=>{let w=0; for(let i=0;i<iovsLen;i++){const off=(iovs>>2)+i*2, p=HEAPU32[off], l=HEAPU32[off+1], txt=Module.UTF8ToString(p); (fd===1?console.log:console.error)(txt); w+=l;} HEAPU32[wp>>2]=w; return 0;},
        fd_close:()=>0, fd_seek:()=>0, proc_exit:c=>{throw new Error("exit:"+c);},
        environ_sizes_get:(cp,sp)=>{HEAPU32[cp>>2]=0; HEAPU32[sp>>2]=0; return 0;},
        environ_get:()=>0,
        random_get:(buf,len)=>{const rnd=new Uint8Array(len); crypto.getRandomValues(rnd); new Uint8Array(env.memory.buffer).set(rnd,buf); return 0;}
      };

      WebAssembly.instantiate(Module.wasmBinary, {env, wasi_snapshot_preview1: wasi})
        .then(res => {
          const exp = res.instance.exports;
          wasmMemory = exp.memory || env.memory;
          updateViews();
          Object.keys(exp).forEach(k => { if (typeof exp[k]==='function') Module['_'+k] = exp[k]; });
          Module.UTF8ToString = ptr => { let s='', i=0; while(HEAPU8[ptr+i]) s+=String.fromCharCode(HEAPU8[ptr+i++]); return s; };
          Module._malloc = exp.malloc || exp._malloc;
          Module._free   = exp.free   || exp._free;
          Module.HEAPF32 = HEAPF32;
          Module.HEAPU32 = HEAPU32;
          Module.memory = wasmMemory;
          if (exp.__wasm_call_ctors) exp.__wasm_call_ctors();
          if (Module.onRuntimeInitialized) Module.onRuntimeInitialized();
        })
        .catch(reject);
    });
  }
})();
