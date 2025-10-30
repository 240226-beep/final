/* ========== Theme (persist) & Navbar Auth Swap ========== */
(function(){
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", savedTheme);

  const btn = document.getElementById("themeToggle");
  if(btn){
    btn.addEventListener("click", ()=>{
      const next = root.getAttribute("data-theme")==="light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  // Navbar: Log In -> Profile if logged in
  const authLink = document.getElementById("authLink");
  const currentUser = localStorage.getItem("currentUser");
  if(authLink){
    if(currentUser){
      authLink.textContent = "Profile";
      authLink.href = "profile.html";
    }else{
      authLink.textContent = "Log In";
      authLink.href = "login.html";
    }
  }
})();

/* ========== Auth Simulation ========== */
function getUsers(){ return JSON.parse(localStorage.getItem("users")||"[]"); }
function saveUsers(list){ localStorage.setItem("users", JSON.stringify(list)); }
function setCurrentUser(email){ localStorage.setItem("currentUser", email); }

/* SIGNUP (on login.html) */
(function(){
  const form = document.getElementById("signupForm");
  if(!form) return;
  const msg = document.getElementById("signupMsg");
  const err = (id,t)=>{ const el=form.querySelector(`.err[data-for="${id}"]`); if(el) el.textContent=t||""; };

  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const name  = form.suName.value.trim();
    const email = form.suEmail.value.trim().toLowerCase();
    const phone = form.suPhone.value.trim();
    const pass  = form.suPass.value;

    let ok = true; err("suName",""); err("suEmail",""); err("suPhone",""); err("suPass","");
    if(!name){ err("suName","Name is required"); ok=false; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err("suEmail","Enter a valid email"); ok=false; }
    if(!/^\+?\d[\d\s\-]{7,}$/.test(phone)){ err("suPhone","Enter a valid phone"); ok=false; }
    if(!/^(?=.*\d).{8,}$/.test(pass)){ err("suPass","Min 8 chars & at least 1 digit"); ok=false; }
    if(!ok) return;

    const users = getUsers();
    if(users.find(u=>u.email===email)){ err("suEmail","Email already registered"); return; }
    users.push({name,email,phone,password:pass});
    saveUsers(users);
    setCurrentUser(email);
    msg.textContent = "✅ Account created! Redirecting to Profile…";
    setTimeout(()=> location.href="profile.html", 900);
  });
})();

/* LOGIN (on login.html) */
(function(){
  const form = document.getElementById("loginForm");
  if(!form) return;
  const msg = document.getElementById("loginMsg");
  const err = (id,t)=>{ const el=form.querySelector(`.err[data-for="${id}"]`); if(el) el.textContent=t||""; };

  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const email = form.liEmail.value.trim().toLowerCase();
    const pass  = form.liPass.value;

    let ok = true; err("liEmail",""); err("liPass","");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err("liEmail","Enter a valid email"); ok=false; }
    if(!pass){ err("liPass","Password is required"); ok=false; }
    if(!ok) return;

    const users = getUsers();
    const found = users.find(u=>u.email===email && u.password===pass);
    if(!found){ msg.textContent="❌ Invalid email or password"; return; }

    setCurrentUser(email);
    msg.textContent="✅ Logged in! Redirecting to Profile…";
    setTimeout(()=> location.href="profile.html", 700);
  });
})();

/* PROFILE (on profile.html) */
(function(){
  const box = document.getElementById("profileBox");
  const btn = document.getElementById("logoutBtn");
  if(!box) return;

  const email = localStorage.getItem("currentUser");
  if(!email){
    box.innerHTML = `<p>You are not logged in. <a href="login.html">Log in</a></p>`;
    if(btn) btn.style.display="none";
    return;
  }
  const u = getUsers().find(x=>x.email===email);
  if(!u){
    box.innerHTML = `<p>Profile not found. <a href="login.html">Log in</a></p>`;
    if(btn) btn.style.display="none";
    return;
  }
  box.innerHTML = `
    <div class="row g-2">
      <div class="col-md-6"><strong>Name:</strong> ${u.name}</div>
      <div class="col-md-6"><strong>Email:</strong> ${u.email}</div>
      <div class="col-md-6"><strong>Phone:</strong> ${u.phone}</div>
    </div>
  `;
  btn.addEventListener("click", ()=>{ localStorage.removeItem("currentUser"); location.href="login.html"; });
})();

/* CONTACT Validation */
(function(){
  const form = document.getElementById("contactForm");
  if(!form) return;
  const msg = document.getElementById("contactMsg");
  const err = (id,t)=>{ const el=form.querySelector(`.err[data-for="${id}"]`); if(el) el.textContent=t||""; };

  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const name  = form.cName.value.trim();
    const email = form.cEmail.value.trim().toLowerCase();
    const phone = form.cPhone.value.trim();
    const text  = form.cMsg.value.trim();

    let ok = true; err("cName",""); err("cEmail",""); err("cPhone",""); err("cMsg","");
    if(!name){ err("cName","Required"); ok=false; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err("cEmail","Invalid email"); ok=false; }
    if(!/^\+?\d[\d\s\-]{7,}$/.test(phone)){ err("cPhone","Invalid phone"); ok=false; }
    if(!text){ err("cMsg","Required"); ok=false; }
    if(!ok) return;

    msg.textContent="✅ Message sent. Thank you!";
    form.reset();
  });
})();

/* Bonus API (About) */
(function(){
  const btn = document.getElementById("countryBtn");
  if(!btn) return;
  const input = document.getElementById("countryInput");
  const box   = document.getElementById("countryResult");

  btn.addEventListener("click", async ()=>{
    const name = (input.value||"").trim();
    if(!name){ box.textContent="Please enter a country name."; return; }
    box.textContent="Loading…";
    try{
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,flags`);
      if(!res.ok) throw new Error("Not found");
      const data = await res.json();
      const c = data[0];
      box.innerHTML = `
        <div class="glass p-3 d-inline-block">
          <img src="${c.flags?.svg || c.flags?.png}" alt="Flag of ${c.name.common}" style="max-width:220px;height:auto;border-radius:8px"/>
          <p class="m-0 mt-2"><strong>${c.name.common}</strong></p>
          <p class="m-0">Capital: ${c.capital?.[0] || "—"}</p>
        </div>
      `;
    }catch(e){
      box.textContent = "Country not found.";
    }
  });
})();

/* ========== Game (Home) ========== */
(function(){
  const fireButton   = document.getElementById("fireButton");
  if(!fireButton) return; // only on index

  const fireInner    = document.getElementById("fireInner");
  const flameLevel   = document.getElementById("flameLevel");
  const flameText    = document.getElementById("flameText");
  const message      = document.getElementById("message");
  const flamePointsDisplay = document.getElementById("flamePoints");
  const clicksCount  = document.getElementById("clicksCount");
  const eraProgress  = document.getElementById("eraProgress");
  const eraGoalText  = document.getElementById("eraGoalText");
  const eraText      = document.querySelector(".era");
  const shopList     = document.getElementById("shopList");
  const shopTheme    = document.getElementById("shopTheme");
  const upgradeSearch= document.getElementById("upgradeSearch");
  const nextEraBtn   = document.getElementById("nextEraBtn");

  const clickSound   = document.getElementById("clickSound");
  const upgradeSound = document.getElementById("upgradeSound");
  const newEraSound  = document.getElementById("newEraSound");

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
  const thresholds   = [500,1000,2000,3000,5000];

  // State
  let flame = 100, clickPower = 3, flamePoints = 0, eraScore = 0, totalClicks = 0, era = 1;
  let baseDecrease = 1, flatReduction = 0, percentReduction = 0;
  let quantumFlameActive = false, fireGuardianUsed = false;

  const purchasedCounts = {};
  let smartControlBuys=0, marbleHearthBuys=0, alchemistBuys=0, ancientSparkBuys=0, quantumClickerBuys=0;
  let costDiscountPercent=0, workShiftBonus=0;

  let activeIntervals = [], decayLoop=null;

  function setMessage(t, ms=3000){
    message.textContent=t; message.style.opacity=1;
    clearTimeout(setMessage._t); setMessage._t = setTimeout(()=>message.style.opacity=0, ms);
  }
  function spawnFloatingText(x,y,text="+1🔥"){
    const el=document.createElement("div"); el.className="float-text"; el.textContent=text;
    el.style.left=(x-8)+"px"; el.style.top=(y-20)+"px"; document.body.appendChild(el);
    setTimeout(()=>el.remove(),1000);
  }
  function clampFlame(){ if(flame>100) flame=100; if(flame<0) flame=0; }
  function updateFlameUI(){
    clampFlame();
    flameLevel.style.width = flame + "%";
    flameText.textContent  = `Flame: ${Math.floor(flame)}%`;
    const scale = 0.4 + 0.6*(flame/100);
    fireInner.style.transform = `translate(-50%,-50%) scale(${scale})`;
    fireInner.style.opacity   = 0.5 + 0.5*(flame/100);
  }
  function updatePointsUI(){ flamePointsDisplay.textContent=flamePoints; clicksCount.textContent=totalClicks; }
  function updateProgressUI(){ const p=Math.min(eraScore/thresholds[era-1]*100,100); eraProgress.style.width=p+"%"; eraGoalText.textContent=`Next Era Progress: ${Math.floor(p)}%`; updateEraButtonState(); }

  function currentDecayRate(){
    if(quantumFlameActive) return 0;
    const base = baseDecrease;
    let rate = base * (1 - percentReduction);
    if(flame < 50) rate *= (1 - 0.15 * smartControlBuys);
    if(flame < 30) rate *= (1 - 0.05 * marbleHearthBuys);
    rate = Math.max(0, rate - flatReduction);
    return rate;
  }
  function setEraBase(){ baseDecrease = 1 + 5.0*(era-1); }
  function startDecay(){
    if(decayLoop) clearInterval(decayLoop);
    decayLoop = setInterval(()=>{
      const dr = currentDecayRate();
      flame -= dr;
      if(flame <= 0){ handleFlameOut(); }
      updateFlameUI();
    }, 1000);
  }
  function handleFlameOut(){
    const hasGuardian = (purchasedCounts["Fire Guardian"]||0) > 0;
    if(hasGuardian && !fireGuardianUsed){
      fireGuardianUsed=true; flame=30;
      fireButton.classList.add("fire-flare");
      setTimeout(()=>fireButton.classList.remove("fire-flare"),1000);
      setMessage("🔥 Fire Guardian saved you!", 2000);
      alert("🔥 Fire Guardian saved you!");
      updateFlameUI(); return;
    }
    gameOver();
  }
  function gameOver(){
    if(decayLoop) clearInterval(decayLoop);
    activeIntervals.forEach(id=>clearInterval(id)); activeIntervals=[];
    fireButton.remove();
    setMessage("💀 The fire is out. Civilization has fallen.", 4000);
  }

  // Upgrades (4 per era), passives stack permanently
  const eraUpgrades = {
    1:{icon:["🪶","🪨","✨","🔥"],title:["Dry Branches","Stone Circle","Ancient Spark","Tribal Hearth"],
      desc:["Increase click power (+1 per buy).","Reduce extinguishing speed (−1 per buy).","5% per buy chance to gain +1 point per click.","+3🔥 every 5s per buy."],
      cost:[100,130,160,180],max:[5,5,5,5],
      apply:[
        ()=>{ clickPower+=1; },
        ()=>{ flatReduction+=1; },
        t=>{ ancientSparkBuys = purchasedCounts[t]||0; },
        t=>{ const id=setInterval(()=>{ const n=purchasedCounts[t]||0; if(n>0){ flame=Math.min(100,flame+3*n); updateFlameUI(); } },5000); activeIntervals.push(id); }
      ]},
    2:{icon:["🏺","⚱️","🕊️","⚡"],title:["Torch Oil","Marble Hearth","Priest of Vesta","Torch of Olympus"],
      desc:["Slower decay (−1 per buy).","When flame <30% → reduce speed by 5% per buy.","+3🔥 every 6s per buy.","Clicks stronger (+2 per buy)."],
      cost:[250,300,320,350],max:[5,5,5,5],
      apply:[
        ()=>{ flatReduction+=1; },
        t=>{ marbleHearthBuys = purchasedCounts[t]||0; },
        t=>{ const id=setInterval(()=>{ const n=purchasedCounts[t]||0; if(n>0){ flame=Math.min(100,flame+3*n); updateFlameUI(); } },6000); activeIntervals.push(id); },
        ()=>{ clickPower+=2; }
      ]},
    3:{icon:["🔩","📜","🕯️","🏰"],title:["Forge","Alchemist","Candle of Enlightenment","Fire Guardian"],
      desc:["Clicks add +3🔥 per buy.","Every 10 clicks → ×2 flame gain per buy (for that click).","+2🔥 every 2s per buy.","One-time save from extinction each era (once)."],
      cost:[400,480,520,550],max:[5,5,5,1],
      apply:[
        ()=>{ clickPower+=3; },
        t=>{ alchemistBuys = purchasedCounts[t]||0; },
        t=>{ const id=setInterval(()=>{ const n=purchasedCounts[t]||0; if(n>0){ flame=Math.min(100,flame+2*n); updateFlameUI(); } },2000); activeIntervals.push(id); },
        ()=>{}
      ]},
    4:{icon:["⚙️","🔧","🏗️","🧍‍♀️"],title:["Steam Blower","Metal Firebox","Factory Boiler","Work Shifts"],
      desc:["+3🔥 every 2s per buy.","Reduce decay (−5% per buy).","−10% cost of upgrades per buy.","Every 20 clicks → +1 click power."],
      cost:[600,700,750,850],max:[5,5,5,5],
      apply:[
        t=>{ const id=setInterval(()=>{ const n=purchasedCounts[t]||0; if(n>0){ flame=Math.min(100,flame+3*n); updateFlameUI(); } },2000); activeIntervals.push(id); },
        ()=>{ percentReduction = Math.min(0.95, percentReduction+0.05); },
        ()=>{ costDiscountPercent = Math.min(0.9, costDiscountPercent+0.10); },
        ()=>{}
      ]},
    5:{icon:["🔋","🌞","🖥️","🌃"],title:["Electric Heating","Solar Panel","Smart Control System","Neon Pulse"],
      desc:["Reduce decay (−5% per buy).","+5🔥 every 1s per buy.","When flame <50% → reduce speed by 15% per buy (max 3).","Restore ~3% flame per second (once)."],
      cost:[900,1000,1100,1300],max:[5,5,3,1],
      apply:[
        ()=>{ percentReduction = Math.min(0.95, percentReduction+0.05); },
        t=>{ const id=setInterval(()=>{ const n=purchasedCounts[t]||0; if(n>0){ flame=Math.min(100,flame+5*n); updateFlameUI(); } },1000); activeIntervals.push(id); },
        t=>{ smartControlBuys = purchasedCounts[t]||0; },
        ()=>{ const id=setInterval(()=>{ flame=Math.min(100,flame+3); updateFlameUI(); },1000); activeIntervals.push(id); }
      ]},
    6:{icon:["☄️","🌟","💫","⚛️"],title:["Quantum Clicker","Star Reactor","Plasma Core","Quantum Flame"],
      desc:["+100🔥 per click per buy.","+1000🔥 every 10s per buy.","Reduce decay (−10% per buy).","Eternal glow (no decay, once)."],
      cost:[2000,2500,3000,4000],max:[5,5,5,1],
      apply:[
        t=>{ quantumClickerBuys = purchasedCounts[t]||0; },
        t=>{ const id=setInterval(()=>{ const n=purchasedCounts[t]||0; if(n>0){ flame=Math.min(100,flame+1000*n); updateFlameUI(); } },10000); activeIntervals.push(id); },
        ()=>{ percentReduction = Math.min(0.99, percentReduction+0.10); },
        ()=>{ quantumFlameActive = true; }
      ]}
  };

  function effectiveCost(base){ return Math.max(1, Math.ceil(base*(1 - costDiscountPercent))); }

  function renderShop(){
    shopList.innerHTML = "";
    shopTheme.textContent = eraThemes[era-1];
    const data = eraUpgrades[era];

    data.title.forEach((t,i)=>{
      const card = document.createElement("div"); card.className="upgrade"; card.setAttribute("role","listitem");
      const icon = document.createElement("div"); icon.className="upg-icon"; icon.textContent=data.icon[i];
      const body = document.createElement("div"); body.className="flex-grow-1";
      const h4   = document.createElement("p"); h4.className="upg-title"; h4.textContent=t;
      const d    = document.createElement("p"); d.className="upg-desc"; d.textContent=data.desc[i];

      const bottom=document.createElement("div"); bottom.className="upg-bottom";
      const meta = document.createElement("span"); meta.className="upg-meta";
      const bought = purchasedCounts[t]||0;
      meta.textContent = `Cost: ${effectiveCost(data.cost[i])} 🔥 • Bought: ${bought}/${data.max[i]}`;

      const btn  = document.createElement("button"); btn.className="btn btn-sm btn-outline-warning upg-buy"; btn.textContent="Buy";
      btn.addEventListener("click",()=>tryBuyUpgrade(era,i,t,meta,btn));

      bottom.append(meta,btn); body.append(h4,d,bottom);
      card.append(icon,body); shopList.appendChild(card);
    });

    applyUpgradeSearchFilter();
    refreshShopAffordability();
    updateEraButtonState();
  }

  function tryBuyUpgrade(e,i,title,metaEl,btn){
    const data = eraUpgrades[e];
    const max  = data.max[i];
    const cost = effectiveCost(data.cost[i]);
    const cur  = purchasedCounts[title]||0;

    if(cur>=max){ setMessage("Maxed out!"); return; }
    if(flamePoints < cost){ setMessage("Not enough points!"); return; }

    flamePoints -= cost;
    purchasedCounts[title] = cur + 1;
    const n = purchasedCounts[title];

    const applier = data.apply[i];
    applier.length ? applier(title) : applier();

    if(title==="Smart Control System") smartControlBuys = n;
    if(title==="Marble Hearth")        marbleHearthBuys = n;
    if(title==="Alchemist")            alchemistBuys = n;
    if(title==="Ancient Spark")        ancientSparkBuys = n;
    if(title==="Quantum Clicker")      quantumClickerBuys = n;

    if(upgradeSound){ upgradeSound.currentTime=0; upgradeSound.play(); }
    setMessage(`🔥 Purchased ${title} (${n}/${max})`);
    updatePointsUI();

    metaEl.textContent = `Cost: ${cost} 🔥 • Bought: ${n}/${max}`;
    refreshShopAffordability();
    updateEraButtonState();
  }

  function refreshShopAffordability(){
    const data = eraUpgrades[era];
    const cards = shopList.querySelectorAll(".upgrade");
    cards.forEach((card, idx)=>{
      const t = data.title[idx];
      const max = data.max[idx];
      const count = purchasedCounts[t]||0;
      const cost  = effectiveCost(data.cost[idx]);
      const btn   = card.querySelector(".upg-buy");
      btn.disabled = count>=max || flamePoints < cost;
    });
  }

  // Search/filter with persistence
  (function(){
    if(!upgradeSearch) return;
    const saved = localStorage.getItem("upgradeSearch") || "";
    upgradeSearch.value = saved;
    upgradeSearch.addEventListener("input", ()=>{
      localStorage.setItem("upgradeSearch", upgradeSearch.value);
      applyUpgradeSearchFilter();
    });
  })();
  function applyUpgradeSearchFilter(){
    if(!upgradeSearch) return;
    const term = upgradeSearch.value.trim().toLowerCase();
    shopList.querySelectorAll(".upgrade").forEach(item=>{
      const title = item.querySelector(".upg-title")?.textContent.toLowerCase() || "";
      const desc  = item.querySelector(".upg-desc")?.textContent.toLowerCase() || "";
      item.style.display = (title.includes(term) || desc.includes(term)) ? "" : "none";
    });
  }

  // Next Era button (always clickable; show messages when locked)
  function updateEraButtonState(){
    const ready = eraScore >= thresholds[era-1] && allCurrentEraMaxed();
    nextEraBtn.classList.toggle("active", ready);
  }
  nextEraBtn.addEventListener("click", ()=>{
    const hasPts = eraScore >= thresholds[era-1];
    const hasUpg = allCurrentEraMaxed();
    if(!hasPts && !hasUpg){ setMessage("🔒 You need more flame points and all upgrades to advance!"); return; }
    if(!hasPts){ setMessage("🔥 You need to reach the required flame points first."); return; }
    if(!hasUpg){ setMessage("⚙️ You must buy all upgrades of this era to proceed."); return; }
    setMessage("✨ Advancing to the next era...");
    goNextEra();
  });

  function allCurrentEraMaxed(){
    const data = eraUpgrades[era];
    return data.title.every((t,i)=> (purchasedCounts[t]||0) >= data.max[i]);
  }
  function goNextEra(){
    if(era>=6){ setMessage("🏆 Final Era reached!"); return; }
    era++; eraScore=0; fireGuardianUsed=false;
    document.body.style.background = `url(${backgrounds[era-1]}) center/cover fixed no-repeat`;
    fireButton.className = "fire-button " + fireClasses[era-1];
    document.querySelector(".era").textContent = eraNames[era-1];
    setEraBase(); startDecay();
    if(newEraSound){ newEraSound.currentTime=0; newEraSound.play(); }
    setMessage(`✨ A new era begins: ${eraNames[era-1]}!`, 1800);
    renderShop(); updateProgressUI();
  }

  // Clicking the fire
  fireButton.addEventListener("click",(e)=>{
    totalClicks++;
    let flameGain = clickPower;
    if(alchemistBuys>0 && totalClicks % 10 === 0){
      flameGain *= Math.pow(2, alchemistBuys);
      setMessage(`🧪 Alchemist boost ×${Math.pow(2, alchemistBuys)}!`, 900);
    }
    if(quantumClickerBuys>0) flameGain += 100 * quantumClickerBuys;
    flame = Math.min(100, flame + flameGain);

    let pointsGain = 1;
    if(ancientSparkBuys>0 && Math.random() < 0.05*ancientSparkBuys) pointsGain += 1;
    flamePoints += pointsGain; eraScore += pointsGain;

    const ws = purchasedCounts["Work Shifts"]||0;
    if(ws>0 && totalClicks % 20 === 0){
      workShiftBonus++; clickPower += 1;
      setMessage(`🛠️ Work shift efficiency +1 (total +${workShiftBonus})`, 1000);
    }

    updateFlameUI(); updatePointsUI(); updateProgressUI();
    if(clickSound){ clickSound.currentTime=0; clickSound.play(); }
    spawnFloatingText(e.clientX,e.clientY,`+${pointsGain}🔥`);
  });

  // init
  function init(){
    document.querySelector(".era").textContent = eraNames[0];
    document.body.style.background = `url(${backgrounds[0]}) center/cover fixed no-repeat`;
    fireButton.classList.add(fireClasses[0]);
    setEraBase(); startDecay(); renderShop();
    updateFlameUI(); updatePointsUI(); updateProgressUI();
  }
  init();
})();
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("welcomeModal");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("closeWelcome");

  // Show only for first-time visitors
  if (!localStorage.getItem("hasVisited")) {
    modal.classList.add("active");
    overlay.classList.add("active");
    localStorage.setItem("hasVisited", "true");
  }

  // Close button
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    overlay.classList.remove("active");
  });
});
