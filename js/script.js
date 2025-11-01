/* ==========================================================
   Fire of Civilization — main.js (all-in-one)
   Includes: Theme, Navbar auth swap, Auth (signup/login/profile),
             Contact form, Bonus API (About), Fire Game, Welcome modal
   ========================================================== */

/* ========== Theme (persist) & Navbar Auth Swap ========== */
(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", savedTheme);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  // Navbar: Log In -> Profile if logged in
  const authLink = document.getElementById("authLink");
  const currentUser = localStorage.getItem("currentUser");
  if (authLink) {
    if (currentUser) {
      authLink.textContent = "Profile";
      authLink.href = "profile.html";
    } else {
      authLink.textContent = "Log In";
      authLink.href = "login.html";
    }
  }
})();

/* ========== Auth Simulation ========== */
function getUsers() { return JSON.parse(localStorage.getItem("users") || "[]"); }
function saveUsers(list) { localStorage.setItem("users", JSON.stringify(list)); }
function setCurrentUser(email) { localStorage.setItem("currentUser", email); }

/* SIGNUP (on login.html) */
(() => {
  const form = document.getElementById("signupForm");
  if (!form) return;
  const msg = document.getElementById("signupMsg");
  const err = (id, t) => { const el = form.querySelector(`.err[data-for="${id}"]`); if (el) el.textContent = t || ""; };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name  = form.suName.value.trim();
    const email = form.suEmail.value.trim().toLowerCase();
    const phone = form.suPhone.value.trim();
    const pass  = form.suPass.value;

    let ok = true; err("suName",""); err("suEmail",""); err("suPhone",""); err("suPass","");
    if (!name) { err("suName","Name is required"); ok=false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err("suEmail","Enter a valid email"); ok=false; }
    if (!/^\+?\d[\d\s\-]{7,}$/.test(phone)) { err("suPhone","Enter a valid phone"); ok=false; }
    if (!/^(?=.*\d).{8,}$/.test(pass)) { err("suPass","Min 8 chars & at least 1 digit"); ok=false; }
    if (!ok) return;

    const users = getUsers();
    if (users.find(u => u.email === email)) { err("suEmail","Email already registered"); return; }
    users.push({ name, email, phone, password: pass });
    saveUsers(users);
    setCurrentUser(email);
    msg.textContent = "✅ Account created! Redirecting to Profile…";
    setTimeout(() => location.href = "profile.html", 900);
  });
})();

/* LOGIN (on login.html) */
(() => {
  const form = document.getElementById("loginForm");
  if (!form) return;
  const msg = document.getElementById("loginMsg");
  const err = (id, t) => { const el = form.querySelector(`.err[data-for="${id}"]`); if (el) el.textContent = t || ""; };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.liEmail.value.trim().toLowerCase();
    const pass  = form.liPass.value;

    let ok = true; err("liEmail",""); err("liPass","");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err("liEmail","Enter a valid email"); ok=false; }
    if (!pass) { err("liPass","Password is required"); ok=false; }
    if (!ok) return;

    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === pass);
    if (!found) { msg.textContent = "❌ Invalid email or password"; return; }

    setCurrentUser(email);
    msg.textContent = "✅ Logged in! Redirecting to Profile…";
    setTimeout(() => location.href = "profile.html", 700);
  });
})();

/* PROFILE (on profile.html) */
(() => {
  const box = document.getElementById("profileBox");
  const btn = document.getElementById("logoutBtn");
  if (!box) return;

  const email = localStorage.getItem("currentUser");
  if (!email) {
    box.innerHTML = `<p>You are not logged in. <a href="login.html">Log in</a></p>`;
    if (btn) btn.style.display = "none";
    return;
  }
  const u = getUsers().find(x => x.email === email);
  if (!u) {
    box.innerHTML = `<p>Profile not found. <a href="login.html">Log in</a></p>`;
    if (btn) btn.style.display = "none";
    return;
  }
  box.innerHTML = `
    <div class="row g-2">
      <div class="col-md-6"><strong>Name:</strong> ${u.name}</div>
      <div class="col-md-6"><strong>Email:</strong> ${u.email}</div>
      <div class="col-md-6"><strong>Phone:</strong> ${u.phone}</div>
    </div>
  `;
  btn.addEventListener("click", () => { localStorage.removeItem("currentUser"); location.href = "login.html"; });
})();

/* CONTACT Validation */
(() => {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const msg = document.getElementById("contactMsg");
  const err = (id, t) => { const el = form.querySelector(`.err[data-for="${id}"]`); if (el) el.textContent = t || ""; };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name  = form.cName.value.trim();
    const email = form.cEmail.value.trim().toLowerCase();
    const phone = form.cPhone.value.trim();
    const text  = form.cMsg.value.trim();

    let ok = true; err("cName",""); err("cEmail",""); err("cPhone",""); err("cMsg","");
    if (!name) { err("cName","Required"); ok=false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err("cEmail","Invalid email"); ok=false; }
    if (!/^\+?\d[\d\s\-]{7,}$/.test(phone)) { err("cPhone","Invalid phone"); ok=false; }
    if (!text) { err("cMsg","Required"); ok=false; }
    if (!ok) return;

    msg.textContent = "✅ Message sent. Thank you!";
    form.reset();
  });
})();

/* Bonus API (About) */
(() => {
  const btn = document.getElementById("countryBtn");
  if (!btn) return;
  const input = document.getElementById("countryInput");
  const box   = document.getElementById("countryResult");

  btn.addEventListener("click", async () => {
    const name = (input.value || "").trim();
    if (!name) { box.textContent = "Please enter a country name."; return; }
    box.textContent = "Loading…";
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,flags`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const c = data[0];
      box.innerHTML = `
        <div class="glass p-3 d-inline-block">
          <img src="${c.flags?.svg || c.flags?.png}" alt="Flag of ${c.name.common}" style="max-width:220px;height:auto;border-radius:8px"/>
          <p class="m-0 mt-2"><strong>${c.name.common}</strong></p>
          <p class="m-0">Capital: ${c.capital?.[0] || "—"}</p>
        </div>
      `;
    } catch {
      box.textContent = "Country not found.";
    }
  });
})();

/* ========== Fire Game (Home) — FULL MERGED & OPTIMIZED ========== */
/* ==========================================================
   Fire of Civilization — GAME ONLY (debug-friendly)
   ----------------------------------------------------------
   - No auth/theme/API/modal code. Just the game.
   - Safe DOM lookups, clear structure, no globals leaking.
   - Upgrades: multiple purchases work; costs & caps enforced.
   - Passives use ONE interval per upgrade (scales by count).
   - Next Era button reliably enables/disables with messages.
   - Debug logs (set DEBUG = false to silence).
   ========================================================== */

(() => {
  const DEBUG = true;
  const log = (...a) => { if (DEBUG) console.log("[FoC]", ...a); };

  // --- DOM (fail-fast but silent if missing) ----------------------------
  const $ = (id) => document.getElementById(id);
  const fireButton   = $("fireButton");
  if (!fireButton) { log("No fireButton found: game not on this page."); return; }

  const fireInner    = $("fireInner");
  const flameLevel   = $("flameLevel");
  const flameText    = $("flameText");
  const messageEl    = $("message");
  const flamePointsEl= $("flamePoints");
  const clicksCount  = $("clicksCount");
  const eraProgress  = $("eraProgress");
  const eraGoalText  = $("eraGoalText");
  const eraText      = document.querySelector(".era");
  const shopList     = $("shopList");
  const shopTheme    = $("shopTheme");
  const upgradeSearch= $("upgradeSearch");        
  const nextEraBtn   = $("nextEraBtn");

  const clickSound   = $("clickSound");          
  const upgradeSound = $("upgradeSound");        
  const newEraSound  = $("newEraSound");          

  // --- Static visuals ----------------------------------------------------
  const backgrounds  = ["images/1.png","images/2.png","images/3.png","images/4.png","images/5.png","images/6.png"];
  const fireClasses  = ["fire-era-1","fire-era-2","fire-era-3","fire-era-4","fire-era-5","fire-era-6"];
  const eraNames     = ["Prehistoric","Ancient","Medieval","Industrial","Modern","Future"];
  const eraThemes    = [
    "First steps, struggle for warmth.",
    "Sacred fire and tradition.",
    "Fire of knowledge and progress.",
    "Fire as productive energy.",
    "Technological and electric fire.",
    "Fire as cosmic energy."
  ];

  // --- Game state --------------------------------------------------------
  let flame = 100;                // 0..100
  let clickPower = 1;             // base per click
  let flamePoints = 0;            // currency
  let eraScore = 0;               // counts towards thresholds
  let totalClicks = 0;
  let era = 1;                    // 1..6
  let pointMultiplier = 1;

  let baseDecrease = 4;           // per-second base decay (per era)
  let flatReduction = 0;          // absolute reduction of decay
  let percentReduction = 0;       // percentage reduction (0..0.99)
  let quantumFlameActive = false; // stops decay
  let fireGuardianUsed = false;   // per era

  // Purchases and passives
  const purchasedCounts = Object.create(null);
  let smartControlBuys=0, marbleHearthBuys=0, alchemistBuys=0, ancientSparkBuys=0, quantumClickerBuys=0;
  let costDiscountPercent=0, workShiftBonus=0;
  if (localStorage.getItem("costDiscountPercent")) {
    costDiscountPercent = parseFloat(localStorage.getItem("costDiscountPercent")) || 0;
  }

  // Timers (single decay + single passive per upgrade)
  let decayLoop = null;
  const passiveIntervals = Object.create(null); // key: upgrade title => intervalId

  // --- Helpers -----------------------------------------------------------
  function setMessage(t, ms=1600) {
    if (!messageEl) return;
    messageEl.textContent = t;
    messageEl.style.opacity = 1;
    clearTimeout(setMessage._t);
    setMessage._t = setTimeout(() => { messageEl.style.opacity = 0; }, ms);
  }

  function spawnFloatingText(x, y, text="+1🔥") {
    const el = document.createElement("div");
    el.className = "float-text";
    el.textContent = text;
    el.style.left = (x-8) + "px";
    el.style.top  = (y-20) + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
function addFlame(amount, addPoints = false) {
  flame = Math.min(100, flame + amount);

  if (addPoints) {
    flamePoints += amount;
    eraScore += amount;
  }

  updateFlameUI();
  updatePointsUI();
  updateProgressUI();
}



  function clampFlame() {
    if (!Number.isFinite(flame)) flame = 0;
    flame = Math.max(0, Math.min(100, flame));
  }

  function updateFlameUI() {
    clampFlame();
    if (flameLevel)  flameLevel.style.width = flame + "%";
    if (flameText)   flameText.textContent = `Flame: ${Math.floor(flame)}%`;
    if (fireInner) {
      const scale = 0.4 + 0.6*(flame/100);
      fireInner.style.transform = `translate(-50%,-50%) scale(${scale})`;
      fireInner.style.opacity   = 0.5 + 0.5*(flame/100);
    }
  }

  function updatePointsUI() {
    if (flamePointsEl) flamePointsEl.textContent = flamePoints;
    if (clicksCount)   clicksCount.textContent   = totalClicks;
  }
  function getEraThreshold(eraIndex = era) {
    const data = eraUpgrades[eraIndex];
    if (!data) return 0;

    // Sum of (cost * max purchases) for this era
    const totalCost = data.cost.reduce((sum, cost, i) => sum + cost * data.max[i], 0);
    return totalCost;
  }
function getThreshold(eraIndex = era) {
  const data = eraUpgrades[eraIndex];
  if (!data) return 0;

  // Sum of (cost * max purchases) for this era
  const totalCost = data.cost.reduce((sum, cost, i) => sum + cost * data.max[i], 0);
  return totalCost; // full 100% of all upgrade costs
}

function updateProgressUI() {
  const eraGoal = getEraThreshold(era);
  const spent = Object.entries(purchasedCounts).reduce((sum, [title, count]) => {
    // Only count upgrades from this era
    const data = eraUpgrades[era];
    if (!data) return sum;
    const idx = data.title.indexOf(title);
    if (idx === -1) return sum;
    return sum + (data.cost[idx] * count);
  }, 0);

  const p = Math.min((spent / eraGoal) * 100, 100);
  eraProgress.style.width = p + "%";
  eraGoalText.textContent = `Next Era Progress: ${Math.floor(p)}%`;

  updateEraButtonState();
}


  function currentDecayRate() {
    if (quantumFlameActive) return 0;
    let rate = baseDecrease * (1 - percentReduction);
    if (flame < 50) rate *= (1 - 0.15 * smartControlBuys);
    if (flame < 30) rate *= (1 - 0.05 * marbleHearthBuys);
    rate = Math.max(0, rate - flatReduction);
    return rate;
  }

  function setEraBase() {
    baseDecrease = 1 + 12*(era-1); // era 1 => 1, era 2 => 6, etc.
    log("Era", era, "baseDecrease:", baseDecrease);
  }

  function startDecay() {
    if (decayLoop) clearInterval(decayLoop);
    decayLoop = setInterval(() => {
      flame -= currentDecayRate();
      if (flame <= 0) handleFlameOut();
      updateFlameUI();
    }, 1000);
  }

  function handleFlameOut() {
    const hasGuardian = (purchasedCounts["Fire Guardian"] || 0) > 0;
    if (hasGuardian && !fireGuardianUsed) {
      fireGuardianUsed = true;
      flame = 30;
      fireButton.classList.add("fire-flare");
      setTimeout(() => fireButton.classList.remove("fire-flare"), 600);
      setMessage("🔥 Fire Guardian saved you!", 1400);
      updateFlameUI();
      return;
    }
    gameOver();
  }
function gameOver() {
  if (decayLoop) clearInterval(decayLoop);
  Object.keys(passiveIntervals).forEach(k => clearInterval(passiveIntervals[k]));
  fireButton.disabled = true;
  showFireOutModal();
}


  // --- Upgrades Catalog --------------------------------------------------
  // NOTE: For passive “tickers”, we attach ONE interval per upgrade title,
  // and each tick uses the current purchased count => effect scales automatically.
  const eraUpgrades = {
    1: {
      icon:  ["🪶","🪨","✨","🔥"],
      title: ["Dry Branches","Stone Circle","Ancient Spark","Tribal Hearth"],
      desc:  [
        "Increase click power (+1 per buy).",
        "Reduce extinguishing speed (−1 per buy).",
        "5% per buy chance to gain +1 point per click.",
        "+3🔥 every 5s per buy."
      ],
      cost: [200,130,160,180],
      max:  [5,5,5,5],
      apply: [
        () => { clickPower += 1; },
        () => { flatReduction += 1; },
        (t) => { ancientSparkBuys = purchasedCounts[t] || 0; },
        (t) => ensurePassive(t, 5000, () => {
          const n = purchasedCounts[t] || 0;
          if (n>0) { addFlame(3 * n);updateFlameUI(); }
        })
      ]
    },
    2: {
      icon:  ["🏺","⚱️","🕊️","⚡"],
      title: ["Torch Oil","Marble Hearth","Priest of Vesta","Torch of Olympus"],
      desc:  [
        "Slower decay (−1 per buy).",
        "When flame <30% → reduce speed by 5% per buy.",
        "+3🔥 every 6s per buy.",
        "Clicks stronger (+2 per buy)."
      ],
      cost: [250,300,350,500],
      max:  [5,5,5,5],
      apply: [
        () => { flatReduction += 1; },
        (t) => { marbleHearthBuys = purchasedCounts[t] || 0; },
        (t) => ensurePassive(t, 6000, () => {
          const n = purchasedCounts[t] || 0;
          if (n>0) { addFlame(3 * n); updateFlameUI(); }
        }),
        () => { clickPower += 2; }
      ]
    },
    3: {
      icon:  ["🔩","📜","🕯️","🏰"],
      title: ["Forge","Alchemist","Candle of Enlightenment","Fire Guardian"],
      desc:  [
        "Clicks add +3🔥 per buy.",
        "Every 10 clicks → ×2 flame gain per buy (for that click).",
        "+2🔥 every 2s per buy.",
        "One-time save from extinction each era (once)."
      ],
      cost: [1000,500,500,1500],
      max:  [5,5,5,1],
      apply: [
        () => { clickPower += 3; },
        (t) => { alchemistBuys = purchasedCounts[t] || 0; },
        (t) => ensurePassive(t, 2000, () => {
          const n = purchasedCounts[t] || 0;
          if (n>0) { addFlame(2 * n); updateFlameUI(); }
        }),
        () => {} 
      ]
    },
    4: {
      icon:  ["⚙️","🔧","🏗️","🧍‍♀️"],
      title: ["Steam Blower","Metal Firebox","Factory Boiler","Work Shifts"],
      desc:  [
        "+3🔥 every 2s per buy.",
        "Reduce decay (−5% per buy).",
        "−10% cost of upgrades per buy.",
        "Every 20 clicks → +1 click power."
      ],
      cost: [800,800,1000,100],
      max:  [5,5,5,5],
      apply: [
        (t) => ensurePassive(t, 2000, () => {
          const n = purchasedCounts[t] || 0;
          if (n>0) { addFlame(3 * n); updateFlameUI(); }
        }),
        () => { percentReduction = Math.min(0.95, percentReduction + 0.05); },
        () => { costDiscountPercent = Math.min(0.9, costDiscountPercent + 0.10);localStorage.setItem("costDiscountPercent", costDiscountPercent.toString()); },
        () => {} 
      ]
    },
    5: {
      icon:  ["🔋","🌞","🖥️","🌃"],
      title: ["Electric Heating","Solar Panel","Smart Control System","Neon Pulse"],
      desc:  [
        "Reduce decay (−5% per buy).",
        "+5🔥 every 1s per buy.",
        "When flame <50% → reduce speed by 15% per buy (max 3).",
        "Restore ~3% flame per second (once)."
      ],
      cost: [1100,1200,1300,1500],
      max:  [5,5,3,1],
      apply: [
        () => { percentReduction = Math.min(0.95, percentReduction + 0.05); },
        (t) => ensurePassive(t, 1000, () => {
          const n = purchasedCounts[t] || 0;
          if (n>0) { addFlame(5 * n); updateFlameUI(); }
        }),
        (t) => { smartControlBuys = purchasedCounts[t] || 0; },
        (t) => ensurePassive(t, 1000, () => { flame = Math.min(100, flame + 3); updateFlameUI(); })
      ]
    },
    6: {
      icon:  ["☄️","🌟","💫","⚛️"],
      title: ["Quantum Clicker","Star Reactor","Plasma Core","Quantum Flame"],
      desc:  [
        "+100🔥 per click per buy.",
        "+1000🔥 every 10s per buy.",
        "Reduce decay (−10% per buy).",
        "Eternal glow (no decay, once)."
      ],
      cost: [5000,5000,5000,100000],
      max:  [5,5,5,1],
      apply: [
        (t) => { quantumClickerBuys = purchasedCounts[t] || 0; },
        (t) => ensurePassive(t, 10000, () => {
          const n = purchasedCounts[t] || 0;
          if (n>0) { addFlame(1000 * n); updateFlameUI(); }
        }),
        () => { percentReduction = Math.min(0.99, percentReduction + 0.10); },
        () => { quantumFlameActive = true; }
      ]
    }
  };

  // --- Passive interval helper ------------------------------------------
  function ensurePassive(title, ms, tickFn) {
    if (passiveIntervals[title]) return;   
    passiveIntervals[title] = setInterval(tickFn, ms);
  }

function effectiveCost(base) {
  const discount = costDiscountPercent || 0;
  const clean = 1 - discount;
  const value = base * clean;
  return Math.round(value); 
}


  // --- Shop --------------------------------------------------------------
  function renderShop() {
    if (era === 1) costDiscountPercent = 0;

  if (!shopList) return;
  const data = eraUpgrades[era];
  if (!data) {
    shopList.innerHTML = "";
    return;
  }

  // Update theme text
  if (shopTheme) shopTheme.textContent = eraThemes[era - 1] || "";

  // Clear old shop
  shopList.innerHTML = "";

  data.title.forEach((t, i) => {
    const card = document.createElement("div");
    card.className = "upgrade";
    card.setAttribute("role", "listitem");
    card.style.position = "relative"; // ensure overlay works

    // Icon
    const icon = document.createElement("div");
    icon.className = "upg-icon";
    icon.textContent = data.icon[i];

    // Body
    const body = document.createElement("div");
    body.className = "flex-grow-1";

    const h4 = document.createElement("p");
    h4.className = "upg-title";
    h4.textContent = t;

    const d = document.createElement("p");
    d.className = "upg-desc";
    d.textContent = data.desc[i];

    const bottom = document.createElement("div");
    bottom.className = "upg-bottom";

    const meta = document.createElement("span");
    meta.className = "upg-meta";
    const bought = purchasedCounts[t] || 0;
    meta.textContent = `Cost: ${effectiveCost(data.cost[i])} 🔥 • Bought: ${bought}/${data.max[i]}`;

    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-warning upg-buy";
    btn.textContent = "Buy";

    bottom.append(meta, btn);
    body.append(h4, d, bottom);
    card.append(icon, body);

    // 🟡 Invisible overlay that covers entire card
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.cursor = "pointer";
    overlay.style.background = "transparent";
    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      tryBuyUpgrade(era, i, t);
    });

    card.appendChild(overlay);
    shopList.appendChild(card);
  });

  // Optional hover feedback
  const style = document.createElement("style");
  style.textContent = `
    .upgrade { transition: all 0.2s ease; }
    .upgrade:hover { background: rgba(255,255,255,0.08); transform: translateY(-3px); }
  `;
  document.head.appendChild(style);

  // Filter & refresh
  applyUpgradeSearchFilter();
  refreshShopAffordability();
  updateProgressUI();
  updateEraButtonState();
}


  function tryBuyUpgrade(e, idx, title) {
  const data = eraUpgrades[e];
  if (!data) return;

  const baseCost = data.cost[idx];
  const cur = purchasedCounts[title] || 0;
  const max = data.max[idx];

  const displayCost = effectiveCost(baseCost); 
  const cost = displayCost; 

  if (cur >= max) { setMessage("Maxed out!"); return; }
  if (flamePoints < cost) { setMessage("Not enough points!"); return; }
  flamePoints -= cost;

  purchasedCounts[title] = cur + 1;
    const n = purchasedCounts[title];
    log(`Purchased ${title}: ${n}/${max} (cost ${cost})`);


    const applier = data.apply[idx];
    if (typeof applier === "function") {
      applier.length ? applier(title) : applier();
    }

  if (title.includes("Dry Branches") || title.includes("Torch of Olympus") || title.includes("Forge")) {
    pointMultiplier += 0.2; 
  
  }

    if (upgradeSound) { try { upgradeSound.currentTime = 0; upgradeSound.play(); } catch {} }
    setMessage(`🔥 Purchased ${title} (${n}/${max})`);

    updatePointsUI();
    refreshShopAffordability();
    updateProgressUI();
    updateEraButtonState();
  }

  function refreshShopAffordability() {
    if (!shopList) return;
    const data = eraUpgrades[era];
    if (!data) return;

    const cards = shopList.querySelectorAll(".upgrade");
    cards.forEach((card, idx) => {
      const t = data.title[idx];
      const max = data.max[idx];
      const bought = purchasedCounts[t] || 0;
      const cost = effectiveCost(data.cost[idx]);

      const btn  = card.querySelector(".upg-buy");
      const meta = card.querySelector(".upg-meta");

      if (meta) meta.textContent = `Cost: ${cost} 🔥 • Bought: ${bought}/${max}`;

      if (bought >= max) {
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Maxed";
          btn.classList.add("disabled");
        }
      } else {
        if (btn) {
          btn.disabled = flamePoints < cost;
          btn.textContent = "Buy";
          btn.classList.toggle("disabled", flamePoints < cost);
        }
      }
    });
  }

  // --- Search (optional) -------------------------------------------------
  if (upgradeSearch) {
    upgradeSearch.addEventListener("input", applyUpgradeSearchFilter);
  }
  function applyUpgradeSearchFilter() {
    if (!upgradeSearch || !shopList) return;
    const term = upgradeSearch.value.trim().toLowerCase();
    shopList.querySelectorAll(".upgrade").forEach(item => {
      const title = item.querySelector(".upg-title")?.textContent.toLowerCase() || "";
      const desc  = item.querySelector(".upg-desc")?.textContent.toLowerCase()  || "";
      item.style.display = (title.includes(term) || desc.includes(term)) ? "" : "none";
    });
  }

  // --- Next Era ----------------------------------------------------------
  function allCurrentEraMaxed() {
    const data = eraUpgrades[era];
    if (!data) return true;
    return data.title.every((t, i) => (purchasedCounts[t] || 0) >= data.max[i]);
  }

function updateEraButtonState() {
  const ready = allCurrentEraMaxed();
  nextEraBtn.classList.toggle("active", ready);
  nextEraBtn.disabled = !ready;

  nextEraBtn.textContent = ready ? "✨ Advance to Next Era" : "Advance to Next Era";
}

if (nextEraBtn) {
  nextEraBtn.addEventListener("click", () => {
    const need = getThreshold(era);
    const hasPts = eraScore >= need;
    const hasUpg = allCurrentEraMaxed();

    if (!hasPts && !hasUpg) {
      setMessage("🔒 You need more flame points and all upgrades to advance!");
      return;
    }
    if (!hasPts) {
      setMessage(`🔥 You need ${need - eraScore} more flame points to progress.`);
      return;
    }
    if (!hasUpg) {
      setMessage("⚙️ You must buy all upgrades of this era to proceed.");
      return;
    }

    setMessage("✨ Advancing to the next era...", 1200);
    goNextEra();
  });
}



  function goNextEra() {
    if (era >= 6) {
  showEndGameModal();
  return;
}

    era++;
    eraScore = 0;
    fireGuardianUsed = false;

    // visual
    if (document.body) document.body.style.background = `url(${backgrounds[era-1]}) center/cover fixed no-repeat`;
    fireButton.className = "fire-button " + (fireClasses[era-1] || "");
    if (eraText) eraText.textContent = eraNames[era-1] || "";

    setEraBase();
    startDecay();
    if (newEraSound) { try { newEraSound.currentTime = 0; newEraSound.play(); } catch {} }
    setMessage(`✨ A new era begins: ${eraNames[era-1]}!`, 1600);

    renderShop();
    updateProgressUI();
  }

  // --- Clicking the fire -------------------------------------------------
 fireButton.addEventListener("click", (e) => {
  totalClicks++;

  let flameGain = clickPower;

  if (alchemistBuys > 0 && totalClicks % 10 === 0) {
    const mult = Math.pow(2, alchemistBuys);
    flameGain *= mult;
    setMessage(`🧪 Alchemist boost ×${mult}!`, 900);
  }

  if (quantumClickerBuys > 0) flameGain += 100 * quantumClickerBuys;

  addFlame(flameGain);

  let pointsGain = Math.max(1, Math.round(clickPower * pointMultiplier));

  if (ancientSparkBuys > 0 && Math.random() < 0.05 * ancientSparkBuys) {
    pointsGain += 1;
    setMessage("✨ Ancient Spark triggered!");
  }

  flamePoints += pointsGain;
  eraScore += pointsGain;

  const ws = purchasedCounts["Work Shifts"] || 0;
  if (ws > 0 && totalClicks % 20 === 0) {
    workShiftBonus++;
    clickPower += 1;
    setMessage(`🛠️ Work shift efficiency +1 (total +${workShiftBonus})`, 1000);
  }

  updateFlameUI();
  updatePointsUI();
  updateProgressUI();

  if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }
  spawnFloatingText(e.clientX, e.clientY, `+${pointsGain}🔥`);
});
function showEndGameModal() {
  const modal = document.getElementById("endGameModal");
  const overlay = document.getElementById("endOverlay");
  const closeBtn = document.getElementById("closeEnd");

  if (!modal || !overlay || !closeBtn) return;

  modal.classList.add("active");
  overlay.classList.add("active");

  setMessage("🏆 The Fire has reached the stars…", 2500);

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    overlay.classList.remove("active");
    location.reload();
  });
}
function showFireOutModal() {
  const modal = document.getElementById("fireOutModal");
  const overlay = document.getElementById("fireOutOverlay");
  const restartBtn = document.getElementById("restartFireBtn");
  if (!modal || !overlay || !restartBtn) return;

  modal.classList.add("active");
  overlay.classList.add("active");

  setMessage("💀 The Fire is extinguished...", 2500);

  restartBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    overlay.classList.remove("active");
    location.reload();
  });
}


  // --- Init --------------------------------------------------------------
  function init() {
    costDiscountPercent = 0;
    if (eraText) eraText.textContent = eraNames[0];
    if (document.body) document.body.style.background = `url(${backgrounds[0]}) center/cover fixed no-repeat`;
    fireButton.classList.add(fireClasses[0]);
    setEraBase();
    startDecay();
    renderShop();
    updateFlameUI();
    updatePointsUI();
    updateProgressUI();
    log("Game initialized.");
  }

  init();
})();
document.addEventListener('touchend', function (event) {
  const now = Date.now();
  if (window.lastTouch && (now - window.lastTouch) < 400) {
    event.preventDefault(); 
  }
  window.lastTouch = now;
}, false);
function handleFireClick(e) {
  totalClicks++;
}
