// plan.js — the 6-stage platinum roadmap.
// Each stage groups trophies by the order the official descriptions imply:
// story chapters first, then strangers and activities, with the long grinds
// and clean-up last. The missable trophy (Positive Mental Attitude) starts
// in stage 1 on purpose — meditate at every spot as you find it.

export const STAGES = [
  {
    n: 1,
    title: "First steps — Chapters 1–2",
    blurb:
      "Play the story and learn the state. Meditate at every spot you find (the one possibly missable trophy), grab the Ocean Beach cocktail, and sample the open world as it opens.",
    ids: [2, 3, 4, 8, 28, 44],
  },
  {
    n: 2,
    title: "The story deepens — Chapters 3–4",
    blurb:
      "Finish the remaining chapter and named-mission trophies. In Chapter 4, do the optional mission that opens the bank vaults — it feeds Maximum Withdrawal, so do not rush past it.",
    ids: [5, 6, 9, 10, 11, 12, 13, 40],
  },
  {
    n: 3,
    title: "Finale and the 100% gold",
    blurb:
      "Finish the final mission for the gold, then start the 100% checklist in earnest: stranger strands and the first 50 challenges. The platinum cannot pop before the 100% gold does.",
    ids: [7, 14, 25, 32],
  },
  {
    n: 4,
    title: "Strangers of Leonida",
    blurb:
      "Work the stranger strands to their finales — Andy, Kenton, Billy, Randy and Tyrone each have a final mission — and take Bret's hunt when it opens.",
    ids: [22, 23, 24, 26, 27, 29],
  },
  {
    n: 5,
    title: "Activities and skills",
    blurb:
      "The activity trophies: try all nine activity types, then grind the two big ones — 250 stunts and gold in all 42 Shooting Range challenges — plus drone races, races, fishing, the arcade and bowling.",
    ids: [15, 16, 17, 18, 19, 20, 21, 46, 51],
  },
  {
    n: 6,
    title: "Crime, collectibles and clean-up",
    blurb:
      "Everything left: card sets, WAiNK spots, vehicles, garages, the partner crime trophies, gang operations, the vaults you still need, and the vague ones (choices, second tries, strange events). The platinum pops here.",
    ids: [1, 30, 31, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 45, 47, 48, 49, 50, 52, 53, 54, 55],
  },
];

export function stageOf(trophyId) {
  for (const stage of STAGES) {
    if (stage.ids.includes(trophyId)) return stage;
  }
  return null;
}

export function stageLabel(trophyId) {
  const stage = stageOf(trophyId);
  return stage ? `Stage ${stage.n}: ${stage.title}` : "";
}

// Render the roadmap section. Each stage lists its trophies by name, with
// earned ones ticked, so the reader sees the order and the remaining work
// at a glance. Missable trophies carry a warning chip.
export function renderRoadmap(listEl, trophies, state) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  listEl.innerHTML = "";
  for (const stage of STAGES) {
    const item = document.createElement("li");
    item.className = "roadmap-stage";
    const earnedHere = stage.ids.filter((id) => state.earned[String(id)]).length;
    const heading = document.createElement("h3");
    heading.textContent = `Stage ${stage.n} — ${stage.title}`;
    const count = document.createElement("span");
    count.className = "stage-count";
    count.textContent = `${earnedHere} / ${stage.ids.length} earned`;
    heading.appendChild(count);
    const blurb = document.createElement("p");
    blurb.textContent = stage.blurb;
    const names = document.createElement("ul");
    for (const id of stage.ids) {
      const trophy = byId.get(id);
      if (!trophy) continue;
      const row = document.createElement("li");
      if (state.earned[String(id)]) row.className = "done";
      const mark = state.earned[String(id)] ? "✓ " : "○ ";
      row.textContent = mark + trophy.name + (trophy.missable ? " — missable, do it when you see it" : "");
      names.appendChild(row);
    }
    item.append(heading, blurb, names);
    listEl.appendChild(item);
  }
}
