// main.js — boot and rendering for the Leonida Legend tracker.
// Loads app/data/trophies.json, renders the checklist, the detail panel and
// the roadmap, and wires search, filters, spoiler mode and export/import.
// No network at run time beyond this one same-origin fetch of our own data.

import { loadState, saveState, setEarned, clearEarned, isEarned, earnedCount, downloadExport, parseImport } from "./store.js";
import { renderRoadmap, stageLabel } from "./plan.js";

const KIND_FILTERS = [
  ["all", "All"],
  ["story", "Story"],
  ["missable", "Missable"],
  ["collectible", "Collectibles"],
  ["activity", "Activities"],
  ["side", "Side jobs"],
  ["crime", "Crime"],
  ["online", "Online"],
];

const KIND_LABELS = { meta: "Platinum path", story: "Story", activity: "Activity", collectible: "Collectible", side: "Side job", crime: "Crime", misc: "Open world" };

let trophies = [];
let sources = {};
let state = loadState();
let selectedId = null;

const $ = (id) => document.getElementById(id);

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isStory(trophy) {
  return trophy.kind === "story";
}

// Spoiler mode hides a story trophy's name and description until earned.
function isHidden(trophy) {
  return state.spoiler && isStory(trophy) && !isEarned(state, trophy.id);
}

function matchesKind(trophy) {
  if (state.kind === "all") return true;
  if (state.kind === "missable") return trophy.missable === true;
  if (state.kind === "online") return trophy.kind === "online";
  return trophy.kind === state.kind;
}

function matchesQuery(trophy) {
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const hay = [trophy.name, trophy.description, trophy.guide, KIND_LABELS[trophy.kind] || ""].join(" ").toLowerCase();
  return hay.includes(q);
}

function visibleTrophies() {
  return trophies.filter(
    (t) =>
      matchesKind(t) &&
      matchesQuery(t) &&
      (!state.earnedOnly || isEarned(state, t.id)) &&
      (!state.remainingOnly || !isEarned(state, t.id)),
  );
}

function renderFilters() {
  const group = $("kindFilters");
  group.innerHTML = "";
  for (const [value, label] of KIND_FILTERS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.textContent = label;
    btn.setAttribute("aria-pressed", String(state.kind === value));
    btn.addEventListener("click", () => {
      state = { ...state, kind: value };
      saveState(state);
      renderAll();
    });
    group.appendChild(btn);
  }
  const note = $("filterNote");
  if (state.kind === "online") {
    note.textContent = "No online trophies: all 55 are earned offline, in single-player — so this filter is empty on purpose.";
  } else if (state.kind === "missable") {
    note.textContent = "Only 1 missable trophy — Positive Mental Attitude. Guide sites flag it as the only one that may be missable; meditate at every spot as you find it.";
  } else {
    note.textContent = "";
  }
}

function renderProgress() {
  const earned = earnedCount(state);
  $("progressCount").textContent = `${earned} / 55 earned`;
  $("progressPct").textContent = `${Math.round((earned / 55) * 100)}%`;
  $("progressFill").style.width = `${(earned / 55) * 100}%`;
  const byGrade = {};
  for (const t of trophies) if (isEarned(state, t.id)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  $("gradeCount").textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => `${byGrade[g] || 0} ${g}`)
    .join(" · ");
}

function renderList() {
  const list = $("trophyList");
  list.innerHTML = "";
  const shown = visibleTrophies();
  $("listCount").textContent = `${shown.length} of 55`;
  $("emptyState").hidden = shown.length !== 0;
  for (const trophy of shown) {
    const row = document.createElement("li");
    row.className = `trophy-row grade-${trophy.grade}` + (isEarned(state, trophy.id) ? " earned" : "") + (selectedId === trophy.id ? " selected" : "");
    row.id = `row-${trophy.id}`;
    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "trophy-check";
    check.checked = isEarned(state, trophy.id);
    check.setAttribute("aria-label", `Earned: ${isHidden(trophy) ? "hidden story trophy" : trophy.name}`);
    check.addEventListener("click", (event) => {
      event.stopPropagation();
      state = setEarned(state, trophy.id, check.checked);
      renderAll();
    });
    const body = document.createElement("div");
    const name = document.createElement("div");
    name.className = "trophy-name";
    const dot = document.createElement("span");
    dot.className = "grade-dot";
    dot.setAttribute("aria-hidden", "true");
    name.appendChild(dot);
    name.appendChild(document.createTextNode(isHidden(trophy) ? "Hidden story trophy — earn it to reveal" : trophy.name));
    const desc = document.createElement("div");
    desc.className = "trophy-desc" + (isHidden(trophy) ? " spoiler-hidden" : "");
    desc.textContent = isHidden(trophy) ? "Spoiler mode is on. Tick this trophy once you have earned it to reveal its name and description." : trophy.description;
    const meta = document.createElement("div");
    meta.className = "trophy-meta";
    const gradeChip = document.createElement("span");
    gradeChip.className = `chip grade-${trophy.grade}`;
    gradeChip.textContent = gradeWord(trophy.grade);
    meta.appendChild(gradeChip);
    const kindChip = document.createElement("span");
    kindChip.className = "chip";
    kindChip.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
    meta.appendChild(kindChip);
    if (trophy.missable) {
      const miss = document.createElement("span");
      miss.className = "chip missable";
      miss.textContent = "⚠ Missable";
      meta.appendChild(miss);
    }
    const stageChip = document.createElement("span");
    stageChip.className = "chip stage";
    stageChip.textContent = `Roadmap stage ${trophy.stage}`;
    meta.appendChild(stageChip);
    if (trophy.count) {
      const countChip = document.createElement("span");
      countChip.className = "chip";
      countChip.textContent = `× ${trophy.count.toLocaleString("en-US")}`;
      meta.appendChild(countChip);
    }
    body.append(name, desc, meta);
    const link = document.createElement("a");
    link.href = `#trophy-${trophy.id}`;
    link.textContent = "Guide →";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      selectTrophy(trophy.id);
    });
    row.append(check, body, link);
    row.addEventListener("click", () => selectTrophy(trophy.id));
    list.appendChild(row);
  }
}

function renderDetail() {
  const panel = $("detailPanel");
  const trophy = trophies.find((t) => t.id === selectedId);
  panel.innerHTML = "";
  if (!trophy) {
    const empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = "Pick a trophy from the checklist to see its guide, its sources and its place on the roadmap.";
    panel.appendChild(empty);
    return;
  }
  const hidden = isHidden(trophy);
  const title = document.createElement("h3");
  title.textContent = hidden ? "Hidden story trophy" : trophy.name;
  const grade = document.createElement("p");
  grade.className = `detail-grade grade-${trophy.grade}`;
  grade.textContent = `${gradeWord(trophy.grade)} trophy · #${trophy.id} of 55`;
  const desc = document.createElement("p");
  desc.className = "detail-desc";
  desc.textContent = hidden ? "Spoiler mode is hiding this story trophy until you earn it." : `“${trophy.description}” — official description`;
  const guide = document.createElement("p");
  guide.className = "detail-guide";
  guide.textContent = hidden ? "Earn it in-game, tick it off, and the guide appears here." : trophy.guide;
  // Compact source line straight under the guide, so the citation is visible
  // at a glance; the full linked list follows below.
  const sourceLine = document.createElement("p");
  sourceLine.className = "detail-sources-line";
  const cited = (trophy.sources || []).map((key) => (sources[key] ? sources[key].label.split(" — ")[0] : key));
  sourceLine.textContent = hidden ? "" : `Sources: ${cited.join(" · ")}`;
  const facts = document.createElement("div");
  facts.className = "detail-facts";
  for (const text of [KIND_LABELS[trophy.kind] || trophy.kind, `Roadmap stage ${trophy.stage}`, trophy.missable ? "⚠ Missable — do it when you see it" : "Not missable"]) {
    const chip = document.createElement("span");
    chip.className = "chip" + (text.startsWith("⚠") ? " missable" : "");
    chip.textContent = text;
    facts.appendChild(chip);
  }
  panel.append(title, grade, desc, guide, sourceLine, facts);
  if (!hidden) {
    const srcBlock = document.createElement("div");
    srcBlock.className = "detail-sources";
    const srcHead = document.createElement("h4");
    srcHead.textContent = "Sources for this guide";
    const srcList = document.createElement("ul");
    for (const key of trophy.sources || []) {
      const src = sources[key];
      if (!src) continue;
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = src.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = src.label;
      item.appendChild(link);
      srcList.appendChild(item);
    }
    srcBlock.append(srcHead, srcList);
    const roadBlock = document.createElement("div");
    roadBlock.className = "detail-roadmap";
    const roadHead = document.createElement("h4");
    roadHead.textContent = "Where it sits on the roadmap";
    const roadText = document.createElement("p");
    roadText.textContent = stageLabel(trophy.id);
    roadBlock.append(roadHead, roadText);
    const actions = document.createElement("div");
    actions.className = "detail-actions";
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.textContent = isEarned(state, trophy.id) ? "Mark as not earned" : "Mark as earned";
    toggleBtn.addEventListener("click", () => {
      state = setEarned(state, trophy.id, !isEarned(state, trophy.id));
      renderAll();
    });
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.textContent = "Copy deep link";
    copyBtn.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#trophy-${trophy.id}`;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = "Copied!";
      } catch {
        copyBtn.textContent = url;
      }
      setTimeout(() => { copyBtn.textContent = "Copy deep link"; }, 1500);
    });
    actions.append(toggleBtn, copyBtn);
    panel.append(srcBlock, roadBlock, actions);
  }
}

function selectTrophy(id) {
  selectedId = id;
  history.replaceState(null, "", `#trophy-${id}`);
  renderAll();
  const row = $(`row-${id}`);
  if (row) row.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function renderAll() {
  renderFilters();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap($("roadmapList"), trophies, state);
  $("spoilerToggle").checked = state.spoiler;
  $("earnedOnlyToggle").checked = state.earnedOnly;
  $("remainingToggle").checked = state.remainingOnly;
  $("searchInput").value = state.query;
}

function applyViewPreset() {
  // Screenshot and sharing presets: ?view=roadmap scrolls to the roadmap,
  // ?view=missable filters to the missable trophy, ?view=spoiler turns
  // spoiler mode on. A #trophy-N hash always picks the detail trophy.
  const view = new URLSearchParams(location.search).get("view");
  if (view === "missable") state = { ...state, kind: "missable" };
  if (view === "spoiler") state = { ...state, spoiler: true };
  // ?view=roadmap is scrolled to in boot(), after the first render fills it.
}

async function boot() {
  const response = await fetch("data/trophies.json");
  const data = await response.json();
  trophies = data.trophies || [];
  sources = data.sources || {};

  const hash = location.hash.match(/^#trophy-(\d+)$/);
  if (hash) selectedId = Number(hash[1]);
  if (!selectedId) selectedId = 40; // Maximum Withdrawal: guide + sources + grade note on first paint.
  applyViewPreset();

  $("searchInput").addEventListener("input", (event) => {
    state = { ...state, query: event.target.value };
    saveState(state);
    renderList();
  });
  $("spoilerToggle").addEventListener("change", (event) => {
    state = { ...state, spoiler: event.target.checked };
    saveState(state);
    renderAll();
  });
  $("earnedOnlyToggle").addEventListener("change", (event) => {
    state = { ...state, earnedOnly: event.target.checked, remainingOnly: false };
    saveState(state);
    renderAll();
  });
  $("remainingToggle").addEventListener("change", (event) => {
    state = { ...state, remainingOnly: event.target.checked, earnedOnly: false };
    saveState(state);
    renderAll();
  });
  $("exportBtn").addEventListener("click", () => downloadExport(state));
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const text = await file.text();
    const result = parseImport(text);
    if (result.error) {
      alert(result.error);
    } else {
      state = result.state;
      saveState(state);
      renderAll();
    }
    event.target.value = "";
  });
  $("resetBtn").addEventListener("click", () => {
    if (confirm("Clear all earned trophies? Your saved progress will be wiped.")) {
      state = clearEarned(state);
      renderAll();
    }
  });
  window.addEventListener("hashchange", () => {
    const match = location.hash.match(/^#trophy-(\d+)$/);
    if (match) {
      selectedId = Number(match[1]);
      renderAll();
    }
  });

  renderAll();
  // The roadmap only exists after the first render, so scroll to it now —
  // scrolling in applyViewPreset ran while the list was still empty.
  if (new URLSearchParams(location.search).get("view") === "roadmap") {
    $("roadmapSection").scrollIntoView();
    window.scrollBy(0, -140);
  }
}

boot().catch((error) => {
  const panel = $("detailPanel");
  if (panel) panel.textContent = `Could not load the trophy data: ${error.message}`;
});
