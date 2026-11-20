// Leonida Legend — GTA VI trophy guide & tracker.
// Static, offline: loads app/data/trophies.json, keeps ticks in localStorage,
// exports/imports them as JSON. No network request is ever made at runtime.
import { ROADMAP, renderRoadmap } from "./roadmap.js";

const STORE_KEY = "leonida-legend-progress-v1";
const SPOILER_KEY = "leonida-legend-spoiler-v1";

const rowsEl = document.getElementById("rows");
const detailEl = document.getElementById("detail");
const progressText = document.getElementById("progressText");
const progressPct = document.getElementById("progressPct");
const progressFill = document.getElementById("progressFill");
const gradeCounts = document.getElementById("gradeCounts");
const searchEl = document.getElementById("search");
const gradeEl = document.getElementById("grade");
const statusEl = document.getElementById("status");
const spoilerEl = document.getElementById("spoiler");
const shownCount = document.getElementById("shownCount");
const emptyNote = document.getElementById("emptyNote");
const listHeading = document.getElementById("listHeading");

const doc = await (await fetch("data/trophies.json")).json();
const trophies = doc.trophies;
const sources = doc.sources || {};
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(loadStored(STORE_KEY, []));
let spoiler = loadStored(SPOILER_KEY, false) === true;
let kind = "all";
let selectedId = trophies[0].id;

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort()));
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoiler));
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isHidden(t) {
  // Spoiler-safe mode hides story trophies' names and descriptions until earned.
  return spoiler && t.kind === "story" && !earned.has(t.id);
}

function matches(t) {
  if (kind === "missable" && !t.missable) return false;
  if (kind === "online") return false; // No online trophies: all 55 are single-player.
  if (kind !== "all" && kind !== "missable" && t.kind !== kind) return false;
  if (gradeEl.value !== "all" && t.grade !== gradeEl.value) return false;
  if (statusEl.value === "earned" && !earned.has(t.id)) return false;
  if (statusEl.value === "remaining" && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  progressText.textContent = `${n} of ${total} earned`;
  progressPct.textContent = `${Math.round((n / total) * 100)}%`;
  progressFill.style.width = `${(n / total) * 100}%`;
  const counts = ["platinum", "gold", "silver", "bronze"].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${gradeLabel(g)} ${have}/${all}`;
  });
  gradeCounts.textContent = counts.join(" · ") + ` · Missable earned ${earned.has("positive-mental-attitude") ? "1/1" : "0/1"}`;
}

function renderList() {
  const shown = trophies.filter(matches);
  shownCount.textContent = `— ${shown.length} shown`;
  emptyNote.hidden = kind !== "online";
  rowsEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement("li");
    li.className = "row" + (earned.has(t.id) ? " earned" : "") + (t.id === selectedId ? " selected" : "");

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.id);
    box.setAttribute("aria-label", `Mark ${t.name} as earned`);
    box.addEventListener("change", () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderAll();
    });
    li.append(box);

    const main = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = isHidden(t) ? "Hidden story trophy — earn it to reveal" : t.name;
    name.addEventListener("click", () => select(t.id));
    main.append(name);
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = isHidden(t) ? "Its name and description stay hidden while spoiler-safe mode is on." : t.description;
    main.append(desc);
    const meta = document.createElement("div");
    meta.className = "meta";
    const gradeTag = document.createElement("span");
    gradeTag.className = `tag ${t.grade}`;
    gradeTag.textContent = gradeLabel(t.grade);
    meta.append(gradeTag);
    const kindTag = document.createElement("span");
    kindTag.className = "tag kind";
    kindTag.textContent = t.kind;
    meta.append(kindTag);
    if (t.count) {
      const countTag = document.createElement("span");
      countTag.className = "tag";
      countTag.textContent = `Target: ${t.count.toLocaleString("en-US")}`;
      meta.append(countTag);
    }
    if (t.missable) {
      const missTag = document.createElement("span");
      missTag.className = "tag missable";
      missTag.textContent = "⚠ Missable";
      meta.append(missTag);
    }
    const stageTag = document.createElement("span");
    stageTag.className = "tag";
    stageTag.textContent = `Roadmap stage ${t.stage}`;
    meta.append(stageTag);
    main.append(meta);
    const guideBtn = document.createElement("button");
    guideBtn.type = "button";
    guideBtn.className = "guide-link";
    guideBtn.textContent = "Read the guide + sources →";
    guideBtn.addEventListener("click", () => select(t.id));
    main.append(guideBtn);
    li.append(main);

    const dot = document.createElement("span");
    dot.className = `grade-dot ${t.grade}`;
    dot.title = gradeLabel(t.grade);
    li.append(dot);
    rowsEl.append(li);
  }
  if (shown.length === 0 && kind !== "online") {
    const li = document.createElement("li");
    li.className = "row";
    li.textContent = "Nothing matches these filters — try clearing the search or a filter.";
    rowsEl.append(li);
  }
}

function renderDetail() {
  const t = byId.get(selectedId) || trophies[0];
  detailEl.replaceChildren();
  const h = document.createElement("h3");
  h.textContent = isHidden(t) ? "Hidden story trophy" : t.name;
  detailEl.append(h);
  const official = document.createElement("p");
  official.className = "official";
  official.textContent = isHidden(t)
    ? "Spoiler-safe mode hides this trophy until you earn it."
    : `Official: “${t.description}” — ${gradeLabel(t.grade)}`;
  detailEl.append(official);
  if (t.missable) {
    const warn = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "⚠ Missable. ";
    warn.append(strong, document.createTextNode("Do the balcony meditation in Chapter 1 — see the guide below."));
    detailEl.append(warn);
  }
  const gh = document.createElement("h4");
  gh.textContent = "How to earn it";
  detailEl.append(gh);
  const guide = document.createElement("p");
  guide.textContent = isHidden(t) ? "Earn this trophy to reveal its guide." : t.guide;
  detailEl.append(guide);
  if (!isHidden(t)) {
    const sh = document.createElement("h4");
    sh.textContent = "Sources for this guide";
    detailEl.append(sh);
    const ul = document.createElement("ul");
    for (const key of t.sources || []) {
      const s = sources[key];
      const li = document.createElement("li");
      if (s) {
        const a = document.createElement("a");
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s.name;
        li.append(a);
      } else {
        li.textContent = key;
      }
      ul.append(li);
    }
    detailEl.append(ul);
    const stage = ROADMAP.find((s) => s.stage === t.stage);
    if (stage) {
      const rh = document.createElement("h4");
      rh.textContent = "Roadmap";
      detailEl.append(rh);
      const rp = document.createElement("p");
      rp.textContent = `Stage ${stage.stage}: ${stage.title}. ${stage.tip}`;
      detailEl.append(rp);
    }
  }
}

function renderRoadmapSection() {
  renderRoadmap(document.getElementById("roadmapStages"), trophies, earned, select);
}

function renderAll() {
  renderProgress();
  renderRoadmapSection();
  renderList();
  renderDetail();
}

function select(id) {
  selectedId = id;
  renderList();
  renderDetail();
  detailEl.scrollIntoView({ block: "nearest" });
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: "Grand Theft Auto VI", earned: [...earned].sort() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-legend-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error("bad file");
    const next = new Set();
    for (const item of names) {
      const t = trophies.find((x) => x.id === item || x.name === item);
      if (t) next.add(t.id);
    }
    earned = next;
    save();
    renderAll();
  } catch {
    alert("That file does not look like a Leonida Legend progress export.");
  }
}

// Controls.
document.querySelectorAll(".kind").forEach((btn) => {
  btn.addEventListener("click", () => {
    kind = btn.dataset.kind;
    document.querySelectorAll(".kind").forEach((b) => b.classList.toggle("active", b === btn));
    renderList();
  });
});
searchEl.addEventListener("input", renderList);
gradeEl.addEventListener("change", renderList);
statusEl.addEventListener("change", renderList);
spoilerEl.addEventListener("change", () => {
  spoiler = spoilerEl.checked;
  save();
  renderAll();
});
document.getElementById("export").addEventListener("click", exportProgress);
document.getElementById("import").addEventListener("change", (e) => importProgress(e.target.files[0]));
document.getElementById("reset").addEventListener("click", () => {
  if (confirm("Clear all earned trophies?")) {
    earned = new Set();
    save();
    renderAll();
  }
});

// Deep links for screenshots and sharing: ?kind=missable&spoiler=1&select=<id>&view=roadmap
const params = new URLSearchParams(location.search);
if (params.get("kind") && ["story", "missable", "collectibles", "activities", "online"].includes(params.get("kind"))) {
  kind = params.get("kind");
  document.querySelectorAll(".kind").forEach((b) => b.classList.toggle("active", b.dataset.kind === kind));
}
if (params.get("spoiler") === "1") spoiler = true;
if (params.get("select") && byId.has(params.get("select"))) selectedId = params.get("select");
if (params.get("earned")) {
  for (const id of params.get("earned").split(",")) if (byId.has(id)) earned.add(id);
  save();
}
spoilerEl.checked = spoiler;

// Footer source list.
document.getElementById("sourcesFoot").textContent =
  "Sources: " + Object.values(sources).map((s) => s.name).join(" · ") + ".";

renderAll();
if (params.get("view") === "roadmap") {
  document.getElementById("roadmap").scrollIntoView();
}
