// store.js — saved progress for the Leonida Legend tracker.
// One small JSON blob in localStorage: which trophies are earned, plus the
// reader's filter, search and spoiler choices. Export writes the same blob
// to a file; import reads it back. Nothing leaves the browser.

export const STORAGE_KEY = "leonida-legend-progress-v1";

export const DEFAULT_STATE = Object.freeze({
  earned: {},
  spoiler: false,
  earnedOnly: false,
  remainingOnly: false,
  kind: "all",
  query: "",
});

function blankState() {
  return { earned: {}, spoiler: false, earnedOnly: false, remainingOnly: false, kind: "all", query: "" };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    const state = blankState();
    if (parsed && typeof parsed === "object") {
      if (parsed.earned && typeof parsed.earned === "object") {
        for (const key of Object.keys(parsed.earned)) {
          if (parsed.earned[key]) state.earned[String(key)] = true;
        }
      }
      if (typeof parsed.spoiler === "boolean") state.spoiler = parsed.spoiler;
      if (typeof parsed.earnedOnly === "boolean") state.earnedOnly = parsed.earnedOnly;
      if (typeof parsed.remainingOnly === "boolean") state.remainingOnly = parsed.remainingOnly;
      if (typeof parsed.kind === "string") state.kind = parsed.kind;
      if (typeof parsed.query === "string") state.query = parsed.query;
    }
    return state;
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): the tracker still works in memory.
  }
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function isEarned(state, trophyId) {
  return Boolean(state.earned[String(trophyId)]);
}

export function setEarned(state, trophyId, value) {
  const next = { ...state, earned: { ...state.earned } };
  if (value) next.earned[String(trophyId)] = true;
  else delete next.earned[String(trophyId)];
  saveState(next);
  return next;
}

export function clearEarned(state) {
  const next = { ...state, earned: {} };
  saveState(next);
  return next;
}

// Serialise the progress blob for export. The file also carries the app
// name and version so an import can refuse a file from another tracker.
export function exportText(state) {
  return JSON.stringify(
    { app: "leonida-legend", version: 1, exportedAt: new Date().toISOString(), state },
    null,
    2,
  );
}

export function downloadExport(state) {
  const blob = new Blob([exportText(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "leonida-legend-progress.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Parse an imported file. Returns { state } on success or { error } with a
// short human-readable reason. Unknown keys are dropped; only real trophy
// ids (1..55) survive, so a hand-edited file cannot smuggle junk in.
export function parseImport(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "That file is not valid JSON." };
  }
  const incoming = parsed && parsed.state ? parsed.state : parsed;
  if (!incoming || typeof incoming !== "object" || !incoming.earned || typeof incoming.earned !== "object") {
    return { error: "That file has no Leonida Legend progress in it." };
  }
  const state = blankState();
  for (const key of Object.keys(incoming.earned)) {
    const id = Number(key);
    if (Number.isInteger(id) && id >= 1 && id <= 55 && incoming.earned[key]) {
      state.earned[String(id)] = true;
    }
  }
  if (typeof incoming.spoiler === "boolean") state.spoiler = incoming.spoiler;
  return { state };
}
