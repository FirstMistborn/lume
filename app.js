const STROKES = [
  {
    id: "para",
    title: "Paravertebral glide",
    blurb: "Both hands, thumbs or palms just beside the spine. Low back → base of neck. The main ‘don’t stop’ stroke.",
    glows: ["paraL", "paraR"],
    hands: [
      { el: "handL", path: "base-paraL" },
      { el: "handR", path: "base-paraR" }
    ]
  },
  {
    id: "fan",
    title: "Mid-back fan-out",
    blurb: "From either side of the spine, glide out along the ribs toward the sides. Opens the lats. Lighter over bone.",
    glows: ["fanL", "fanR"],
    hands: [
      { el: "handL", path: "base-fanL" },
      { el: "handR", path: "base-fanR" }
    ]
  },
  {
    id: "trap",
    title: "Upper traps & shoulders",
    blurb: "Knead the coat-hanger muscles. Circles on the meat of the shoulder — skip the bony point.",
    glows: ["trapL", "trapR"],
    hands: [
      { el: "handL", path: "base-trapL" },
      { el: "handR", path: "base-trapR" }
    ]
  },
  {
    id: "low",
    title: "Low back out",
    blurb: "From the dimples of the low back, fan out toward the hips. Slow. This area holds a lot.",
    glows: ["lowL", "lowR"],
    hands: [
      { el: "handL", path: "base-lowL" },
      { el: "handR", path: "base-lowR" }
    ]
  },
  {
    id: "across",
    title: "Connecting stroke",
    blurb: "Both hands sweep across the mid-back to link the two sides. Keep contact; don’t hop.",
    glows: ["across"],
    hands: [
      { el: "handL", path: "base-across" }
    ]
  }
];

const SESSION = [
  { title: "Get ready", secs: 20, stroke: null, body: "Warm oil in your palms. Ask what pressure they want. Have them lie face-down, arms relaxed." },
  { title: "Oil the whole back", secs: 40, stroke: "across", body: "Light effleurage from low back up and out. Cover the whole canvas so nothing drags later." },
  { title: "Paravertebral — right & left", secs: 90, stroke: "para", body: "Long glides just beside the spine, low to high. 6–8 passes. This is the stroke from the glowing-arrow videos." },
  { title: "Fan the ribs", secs: 60, stroke: "fan", body: "From mid-back, glide out along the ribs. Match their breathing if you can — out-stroke as they exhale." },
  { title: "Low back", secs: 50, stroke: "low", body: "Slow fan from the lumbar out toward the hips. Stay off the spine and go easy over the kidneys." },
  { title: "Traps & shoulders", secs: 80, stroke: "trap", body: "Knead the upper traps. Thumb circles on the shoulder meat. Ask if they want more pressure here." },
  { title: "Return to the money line", secs: 70, stroke: "para", body: "Back to the long paravertebral glides. Slightly slower than the first set. They usually go quiet here." },
  { title: "Close", secs: 40, stroke: "across", body: "Feather-light connecting strokes. Cover with a towel. Hands off. Give them half a minute before they sit up." }
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function showView(id) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  const el = document.getElementById("view-" + id);
  if (el) el.classList.add("active");
  $$(".nav button").forEach((b) => b.classList.toggle("active", b.dataset.go === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setGlows(ids) {
  $$(".path-glow").forEach((p) => p.classList.remove("on"));
  $$(".hand").forEach((h) => h.classList.remove("on"));
  (ids || []).forEach((id) => {
    ["glow-" + id, "sess-glow-" + id].forEach((gid) => {
      const g = document.getElementById(gid);
      if (g) g.classList.add("on");
    });
  });
}

function placeHandOnPath(handId, pathId, t) {
  const hand = document.getElementById(handId);
  const path = document.getElementById(pathId);
  if (!hand || !path || typeof path.getPointAtLength !== "function") return;
  const len = path.getTotalLength();
  const pt = path.getPointAtLength((t % 1) * len);
  hand.setAttribute("cx", pt.x);
  hand.setAttribute("cy", pt.y);
  hand.classList.add("on");
}

let animRaf = 0;
let animT = 0;
let activeHands = [];

function startHands(hands) {
  cancelAnimationFrame(animRaf);
  activeHands = hands || [];
  animT = 0;
  const tick = () => {
    animT += 0.006;
    activeHands.forEach((h) => placeHandOnPath(h.el, h.path, animT));
    animRaf = requestAnimationFrame(tick);
  };
  if (activeHands.length) tick();
}

function activateStroke(stroke) {
  if (!stroke) {
    setGlows([]);
    cancelAnimationFrame(animRaf);
    $$(".hand").forEach((h) => h.classList.remove("on"));
    return;
  }
  setGlows(stroke.glows);
  startHands(stroke.hands);
  $$("#stroke-list .card").forEach((c) => {
    c.style.borderColor = c.dataset.id === stroke.id ? "var(--gold)" : "";
  });
}

function renderStrokeList() {
  const box = $("#stroke-list");
  if (!box) return;
  box.innerHTML = STROKES.map(
    (s) => `
    <article class="card part-card" data-id="${s.id}">
      <div class="thumb">→</div>
      <div>
        <h3>${s.title}</h3>
        <p>${s.blurb}</p>
      </div>
    </article>`
  ).join("");
  box.addEventListener("click", (e) => {
    const card = e.target.closest("[data-id]");
    if (!card) return;
    const stroke = STROKES.find((s) => s.id === card.dataset.id);
    activateStroke(stroke);
  });
}

let sessIndex = 0;
let sessLeft = SESSION[0].secs;
let sessTimer = null;
let sessRunning = false;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}

function applySessionStep() {
  const step = SESSION[sessIndex];
  $("#sessTitle").textContent = step.title;
  $("#sessBody").textContent = step.body;
  $("#sessLabel").textContent = `Step ${sessIndex + 1} of ${SESSION.length}`;
  sessLeft = step.secs;
  $("#sessTime").textContent = formatTime(sessLeft);
  const pct = ((sessIndex + (1 - sessLeft / step.secs)) / SESSION.length) * 100;
  $("#sessBar").style.width = Math.max(2, pct) + "%";
  const stroke = STROKES.find((s) => s.id === step.stroke);
  activateStroke(stroke || null);
  const hint = $("#sessHint");
  if (hint) hint.textContent = stroke ? `Follow: ${stroke.title}` : "No path yet — just setup.";
}

function tickSession() {
  sessLeft -= 1;
  if (sessLeft <= 0) {
    if (sessIndex < SESSION.length - 1) {
      sessIndex += 1;
      applySessionStep();
    } else {
      stopSession();
      $("#sessTitle").textContent = "Done";
      $("#sessBody").textContent = "Towel on. Lights low. You did the thing.";
      $("#sessTime").textContent = "0:00";
      $("#sessBar").style.width = "100%";
      return;
    }
  } else {
    $("#sessTime").textContent = formatTime(sessLeft);
    const step = SESSION[sessIndex];
    const pct = ((sessIndex + (1 - sessLeft / step.secs)) / SESSION.length) * 100;
    $("#sessBar").style.width = pct + "%";
  }
}

function startSession() {
  if (sessRunning) return;
  sessRunning = true;
  $("#sessToggle").textContent = "Pause";
  sessTimer = setInterval(tickSession, 1000);
}

function stopSession() {
  sessRunning = false;
  $("#sessToggle").textContent = "Start";
  clearInterval(sessTimer);
}

function bindSession() {
  $("#sessToggle").addEventListener("click", () => {
    if (sessRunning) stopSession();
    else startSession();
  });
  $("#sessPrev").addEventListener("click", () => {
    sessIndex = Math.max(0, sessIndex - 1);
    applySessionStep();
  });
  $("#sessNext").addEventListener("click", () => {
    sessIndex = Math.min(SESSION.length - 1, sessIndex + 1);
    applySessionStep();
  });
}

function bindNav() {
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (!go) return;
    const id = go.dataset.go;
    showView(id);
    if (id === "guide") activateStroke(STROKES[0]);
    if (id === "session") applySessionStep();
  });
}

function bindPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  let deferred;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    const btn = $("#installBtn");
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      deferred.prompt();
      await deferred.userChoice;
      btn.hidden = true;
    });
  });
  const hint = $("#installHint");
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (!standalone && hint) hint.classList.add("show");
}

document.addEventListener("DOMContentLoaded", () => {
  const host = $("#sessHint") && $("#sessHint").parentElement;
  const src = $("#back-svg");
  if (host && src) {
    const clone = src.cloneNode(true);
    clone.id = "sess-svg";
    clone.querySelectorAll("[id]").forEach((n) => n.id = "sess-" + n.id);
    host.innerHTML = "";
    host.appendChild(clone);
  }
  renderStrokeList();
  bindNav();
  bindSession();
  bindPwa();
  activateStroke(STROKES[0]);
});
