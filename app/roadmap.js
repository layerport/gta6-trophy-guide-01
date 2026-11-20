// Roadmap to the platinum: six stages in play order, built from the official
// trophy descriptions — story chapters and missions, then character quests,
// activities, collectibles, crime and cash, and 100% completion last.
// Times and counts come from the cited guides (see trophies.json sources).
export const ROADMAP = [
  {
    stage: 1,
    title: "Play the story — and save the balcony",
    blurb: "Chapters 1–4, the named missions and the final mission. Do the balcony meditation with Lucia in Chapter 1 (after Down to Earth) before the chapter ends: it is the game's one missable trophy.",
    tip: "Keep a manual save at the start of each chapter — there is no mission replay.",
  },
  {
    stage: 2,
    title: "Character quests & strangers",
    blurb: "Finish the final missions for Andy, Kenton, Billy, Randy and Tyrone, hunt Bret's unique animal, and complete 8 stranger mission strands across Leonida.",
    tip: "Stranger missions appear while you travel — check in with each contact between chapters.",
  },
  {
    stage: 3,
    title: "Activities & skills",
    blurb: "Gold all 42 Shooting Range challenges, win drone races at all 14 Top Fun spots and 20 different races, pull off 250 stunts, fish with Cal, finish an arcade game and 50 challenges.",
    tip: "Track everything under Touch Pad > Progress > Activities; stunts and challenges also feed the 100% checklist.",
  },
  {
    stage: 4,
    title: "Collectibles & exploration",
    blurb: "3 card sets, 100 WAiNK scans, all 18 meditations, 100 vehicles discovered and every corner of Leonida explored.",
    tip: "Scan unfamiliar vehicles and landmarks with WAiNK from the very start — it saves hours later.",
  },
  {
    stage: 5,
    title: "Crime, cash & property",
    blurb: "Bank vaults, armored trucks, jewelry stores, one illegal operation per gang, $250,000 of marked bills laundered, $100,000 spent and all 8 garages bought.",
    tip: "Vaults open with the optional Chapter 4 mission “That's Where The Money Is…” — 8 of them count toward 100%.",
  },
  {
    stage: 6,
    title: "100% completion & platinum",
    blurb: "Finish the in-game 100% checklist (Progress > 100% Completion after the story): 39 gang operations, 22 bank jobs, 15 of 18 card sets, 70 of 80 challenges, 300 of 397 stunts. The platinum pops with the last trophy.",
    tip: "You do not need literally everything — the checklist only asks for set portions of most activities.",
  },
];

// Render the six roadmap stages into `host`. `trophies` is the data array,
// `earned` a Set of earned trophy ids, `onSelect` opens a trophy's detail.
export function renderRoadmap(host, trophies, earned, onSelect) {
  host.replaceChildren();
  for (const step of ROADMAP) {
    const mine = trophies.filter((t) => t.stage === step.stage);
    const done = mine.filter((t) => earned.has(t.id)).length;
    const li = document.createElement("li");
    li.className = "stage";

    const h = document.createElement("h3");
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = step.stage;
    h.append(num, document.createTextNode(step.title));
    li.append(h);

    const p = document.createElement("p");
    p.textContent = step.blurb;
    li.append(p);

    const prog = document.createElement("div");
    prog.className = "stage-progress";
    prog.textContent = `${done} of ${mine.length} trophies in this stage`;
    li.append(prog);

    const tip = document.createElement("p");
    tip.textContent = "Tip: " + step.tip;
    li.append(tip);

    const chips = document.createElement("div");
    chips.className = "chips";
    for (const t of mine) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (earned.has(t.id) ? " done" : "") + (t.missable ? " missable" : "");
      chip.textContent = (t.missable ? "⚠ " : "") + t.name;
      chip.addEventListener("click", () => onSelect(t.id));
      chips.append(chip);
    }
    li.append(chips);
    host.append(li);
  }
}
