/* ============================================================
   Bonorong Wildlife Sanctuary — visitor app prototype
   Group 24 · KIT519 Assignment 2
   Every control on every screen is functional.
   State is held in memory only: refreshing the page resets the
   prototype to a clean slate between test participants.
   ============================================================ */

const state = {
  screen: 'home',
  saved: new Set(),          // ids of saved animals / shows / facilities
  query: '',
  filter: 'all',
  recent: [],
  animalId: 'devil',
  tab: 'about',
  playing: false,
  lang: 'EN',
  textScale: 1,
  accessibleRoute: true,
  audioAuto: false,
  simpleLang: false,
  reminders: true,
  membership: 'family',
  donation: '$20',
  rating: 0,
};

const ICON = {
  devil:'\u{1F9A1}', koala:'\u{1F428}', wombat:'\u{1F43B}',
  kangaroo:'\u{1F998}', quoll:'\u{1F408}', echidna:'\u{1F994}',
  wc:'\u{1F6BB}', food:'\u{1F37D}', water:'\u{1F4A7}', shop:'\u{1F381}', aid:'\u{26D1}',
};

/* ---------------- helpers ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const animal   = (id) => ANIMALS.find(a => a.id === id);
const facility = (id) => FACILITIES.find(f => f.id === id);
const show     = (id) => SHOWS.find(s => s.id === id);

function itemById(id){
  return animal(id) || facility(id) || show(id) || null;
}
function itemLabel(id){
  const it = itemById(id);
  return it ? (it.name || it.title) : id;
}
const isSaved = (id) => state.saved.has(id);

function toggleSave(id){
  const on = !isSaved(id);
  if (on) state.saved.add(id); else state.saved.delete(id);
  toast(on ? `Saved “${itemLabel(id)}” to My Day` : `Removed “${itemLabel(id)}” from My Day`);
  render();
  return on;
}

let toastTimer;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

const nowMins = () => DEMO_TIME.h * 60 + DEMO_TIME.m;
const toMins  = (hhmm) => { const [h,m] = hhmm.split(':').map(Number); return h*60+m; };
const pretty  = (hhmm) => {
  const [h,m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2,'0')} ${ap}`;
};

function statusOf(s){
  if (s.closed)  return { cls:'closed',  text:'Closed today' };
  if (s.allDay)  return { cls:'allday',  text:'Open all day' };
  const n = nowMins(), a = toMins(s.start), b = toMins(s.end);
  if (n >= a && n < b) return { cls:'on',   text:'On now' };
  if (n < a){
    const d = a - n;
    return d <= 60
      ? { cls:'soon', text:`Starts in ${d} min` }
      : { cls:'soon', text:`Starts at ${pretty(s.start)}` };
  }
  return { cls:'done', text:'Finished' };
}
function showTime(s){
  if (s.closed) return s.note;
  if (s.allDay) return s.note;
  return `${pretty(s.start)} – ${pretty(s.end)}`;
}

/* saved items, in a stable order: shows first, then animals, then facilities */
function savedItems(){
  const out = [];
  SHOWS.forEach(s => { if (isSaved(s.id)) out.push({ kind:'show', ...s }); });
  ANIMALS.forEach(a => { if (isSaved(a.id)) out.push({ kind:'animal', ...a }); });
  FACILITIES.forEach(f => { if (isSaved(f.id)) out.push({ kind:'facility', ...f }); });
  return out;
}
function savedStats(){
  const items = savedItems();
  const walk = items.reduce((t,i) => t + (i.distance || 0), 0);
  const mins = items.reduce((t,i) => t + (i.walkMins || 0), 0) + items.length * 8;
  return {
    count: items.length,
    km: (walk / 1000).toFixed(1),
    time: `${Math.floor(mins/60)}h ${mins%60}m`,
  };
}

/* ---------------- navigation ---------------- */
function go(screen, opts = {}){
  if (opts.animalId) state.animalId = opts.animalId;
  if (opts.tab) state.tab = opts.tab;
  state.screen = screen;
  state.playing = false;
  render();
  const sc = $('#screen');
  sc.scrollTop = 0;
  sc.focus({ preventScroll:true });
}

const NAV_FOR = {
  home:'home', search:'search', map:'map', showlist:'map', animal:'map',
  myday:'myday', route:'myday',
  membership:'home', donation:'home', accessibility:'home',
  qa:'home', feedback:'home', settings:'home',
};

/* ---------------- shared partials ---------------- */
function statusbarTime(){ return `${DEMO_TIME.h % 12 || 12}:${String(DEMO_TIME.m).padStart(2,'0')}`; }

function heartBtn(id, label){
  return `<button class="heart" data-save="${id}" aria-pressed="${isSaved(id)}"
    aria-label="${isSaved(id) ? 'Remove' : 'Save'} ${esc(label)} ${isSaved(id) ? 'from' : 'to'} My Day">${isSaved(id) ? '♥' : '♡'}</button>`;
}

function backHeader(title){
  return `<div class="subhdr">
    <button class="iconbtn" data-go="home" aria-label="Back to Home">‹</button>
    <h1 class="h2">${esc(title)}</h1>
  </div>`;
}

function mapMarkers({ onlySaved = false } = {}){
  let html = `
    <div class="path" style="left:8%;top:44%;width:84%;height:14px"></div>
    <div class="path" style="left:46%;top:14%;width:14px;height:62%"></div>`;
  const list = onlySaved ? ANIMALS.filter(a => isSaved(a.id)) : ANIMALS;
  list.forEach(a => {
    html += `<button class="marker" data-animal="${a.id}" data-saved="${isSaved(a.id)}"
        style="left:${a.map.x}%;top:${a.map.y}%" aria-label="${esc(a.name)}, enclosure ${a.enclosure}">
      <span class="bub">${ICON[a.id]}</span><span class="lbl">${esc(a.name.split(' ').pop())}</span></button>`;
  });
  if (!onlySaved){
    FACILITIES.slice(0,3).forEach(f => {
      html += `<button class="marker fac" data-facility="${f.id}"
          style="left:${f.map.x}%;top:${f.map.y}%" aria-label="${esc(f.name)}">
        <span class="bub">${ICON[f.icon]}</span></button>`;
    });
  }
  html += `<div class="marker you" style="left:50%;top:47%">
      <span class="bub"></span><span class="lbl">You are here</span></div>`;
  return html;
}

/* ---------------- screens ---------------- */
const views = {};

/* ---------- HOME ---------- */
views.home = () => {
  const next = SHOWS.filter(s => !s.closed).slice(0,3);
  return `
  <div class="hdr">
    <div class="hdr-row">
      <div>
        <div class="eyebrow">Bonorong Wildlife Sanctuary</div>
        <h1 class="h1" style="margin-top:4px">Good morning</h1>
        <div class="muted" style="margin-top:4px">Open today · 9:00 AM – 5:00 PM</div>
      </div>
      <span class="pill">◎ Brighton, TAS</span>
    </div>
  </div>

  <button class="card" data-go="map" style="border:0;padding:0;width:calc(100% - 40px);cursor:pointer;text-align:left">
    <div class="photo" style="height:150px">HERO PHOTO 16:9</div>
    <div style="background:var(--green);color:#fff;padding:14px 16px">
      <div class="eyebrow" style="color:var(--gold-l)">Our animals</div>
      <div style="font-family:var(--serif);font-size:calc(20px * var(--fs));margin:4px 0 8px">A Day Among Australia’s Wild</div>
      <div style="font-size:calc(11px * var(--fs));font-weight:800;letter-spacing:1.2px;color:var(--gold-l)">EXPLORE SANCTUARY →</div>
    </div>
  </button>

  <div class="sect"><h2 class="h2">Today’s keeper talks</h2>
    <button class="link" data-go="showlist">See all ›</button></div>
  ${next.map(s => {
    const st = statusOf(s);
    return `<button class="row" data-show="${s.id}">
      <span class="avatar">${ICON[s.animal]}</span>
      <span class="body"><span class="t">${esc(s.title)}</span>
        <span class="s">${esc(showTime(s))}</span>
        <span class="status ${st.cls}">${st.text}</span></span>
      <span style="color:var(--ink-3);font-size:18px">›</span>
    </button>`;
  }).join('')}

  <div class="sect"><h2 class="h2">Animal spotlights</h2>
    <button class="link" data-go="search">See all ›</button></div>
  <div style="display:flex;gap:12px;padding:0 20px 14px;overflow-x:auto;scrollbar-width:none">
    ${ANIMALS.slice(0,3).map(a => `
      <button class="card" data-animal="${a.id}" style="margin:0;flex:0 0 170px;padding:0;cursor:pointer;text-align:left">
        <div class="photo" style="height:104px">PHOTO 4:3</div>
        <div style="padding:10px 12px 12px">
          <div class="t" style="font-family:var(--serif);font-size:calc(14px * var(--fs))">${esc(a.name)}</div>
          <div class="s" style="font-size:calc(11px * var(--fs));color:var(--ink-2);margin-top:3px">Enclosure ${a.enclosure} · ${a.distance} m away</div>
          <div style="margin-top:8px;font-size:calc(10px * var(--fs));font-weight:800;letter-spacing:1px;color:var(--gold)">LEARN MORE ›</div>
        </div>
      </button>`).join('')}
  </div>

  <div class="sect"><h2 class="h2">Plan &amp; support</h2></div>
  <div class="chiprow">
    <button class="chip" data-go="membership">Membership</button>
    <button class="chip" data-go="donation">Donate</button>
    <button class="chip" data-go="accessibility">Access</button>
    <button class="chip" data-go="qa">Q &amp; A</button>
  </div>

  <div class="sect"><h2 class="h2">More</h2></div>
  <button class="row" data-go="qa"><span class="avatar">?</span>
    <span class="body"><span class="t">Q &amp; A</span><span class="s">Common visitor questions</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <button class="row" data-go="feedback"><span class="avatar">✎</span>
    <span class="body"><span class="t">Feedback</span><span class="s">Tell us about your visit</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <button class="row" data-go="settings"><span class="avatar">⚙</span>
    <span class="body"><span class="t">Settings</span><span class="s">Language, text size, offline map</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <div class="spacer"></div>`;
};

/* ---------- SEARCH ---------- */
function searchResults(){
  const q = state.query.trim().toLowerCase();
  let rows = [];
  if (state.filter === 'all' || state.filter === 'animals')
    rows = rows.concat(ANIMALS.map(a => ({
      kind:'animal', id:a.id, name:a.name,
      sub:`Enclosure ${a.enclosure} · ${a.species}`,
      distance:a.distance, icon:ICON[a.id], hay:`${a.name} ${a.species} animal`,
    })));
  if (state.filter === 'all' || state.filter === 'facilities')
    rows = rows.concat(FACILITIES.map(f => ({
      kind:'facility', id:f.id, name:f.name, sub:f.sub,
      distance:f.distance, icon:ICON[f.icon], hay:`${f.name} ${f.sub} facility toilet food`,
    })));
  if (state.filter === 'all' || state.filter === 'shows')
    rows = rows.concat(SHOWS.map(s => ({
      kind:'show', id:s.id, name:s.title, sub:showTime(s),
      distance:(animal(s.animal)||{}).distance || 0, icon:ICON[s.animal],
      hay:`${s.title} show talk keeper ${s.animal}`,
    })));
  if (q) rows = rows.filter(r => r.hay.toLowerCase().includes(q));
  rows.sort((a,b) => a.distance - b.distance);
  return rows;
}

views.search = () => {
  const rows = searchResults();
  const q = state.query;
  return `
  <div class="hdr">
    <div class="eyebrow">Find anything</div>
    <h1 class="h1" style="margin-top:4px">Search</h1>
  </div>
  <div class="searchwrap">
    <div class="searchbox">
      <span aria-hidden="true" style="color:var(--ink-3)">⌕</span>
      <input id="q" type="text" value="${esc(q)}" placeholder="Search animals, toilets, food…"
             aria-label="Search the sanctuary" autocomplete="off">
      ${q ? '<button class="clearbtn" id="clearq" aria-label="Clear search">×</button>' : ''}
    </div>
  </div>
  <div class="chiprow">
    ${[['all','All'],['animals','Animals'],['facilities','Facilities'],['shows','Shows']]
      .map(([k,l]) => `<button class="chip" data-filter="${k}" aria-pressed="${state.filter===k}">${l}</button>`).join('')}
  </div>
  <div class="sect" style="padding-bottom:4px">
    <span class="eyebrow" style="color:var(--ink-2)">${rows.length} result${rows.length===1?'':'s'}</span>
    <span class="muted">Nearest first</span>
  </div>

  ${rows.length === 0 ? `<div class="empty">
      Nothing matched “${esc(q)}”.<br>Try an animal name, “toilets”, or “food”.
    </div>` : rows.map(r => `
    <div class="row" data-result="${r.kind}:${r.id}" role="button" tabindex="0">
      <span class="avatar">${r.icon}</span>
      <span class="body"><span class="t">${esc(r.name)}</span>
        <span class="s">${esc(r.sub)}</span></span>
      <span class="muted" style="white-space:nowrap;margin-right:4px">${r.distance} m</span>
      ${heartBtn(r.id, r.name)}
    </div>`).join('')}

  ${state.recent.length ? `
    <div class="sect"><span class="eyebrow" style="color:var(--ink-2)">Recent</span>
      <button class="link" id="clearrecent">Clear</button></div>
    <div class="chiprow">
      ${state.recent.map(t => `<button class="chip" data-recent="${esc(t)}">↺ ${esc(t)}</button>`).join('')}
    </div>` : ''}
  <div class="spacer"></div>`;
};

/* ---------- MAP ---------- */
views.map = () => `
  <div class="hdr"><div class="hdr-row">
    <h1 class="h1">Map</h1>
    <span class="pill">${savedStats().count} saved</span>
  </div></div>
  <div class="searchwrap">
    <button class="searchbox" data-go="search" style="width:100%;cursor:pointer;font-family:inherit">
      <span aria-hidden="true" style="color:var(--ink-3)">⌕</span>
      <span class="muted" style="flex:1;text-align:left">Search the sanctuary…</span>
    </button>
  </div>
  <div class="mapcanvas">
    ${mapMarkers()}
    <button class="fab" data-go="showlist">☰ Today’s shows</button>
  </div>
  <div class="sheet">
    <div class="grab"></div>
    <div class="sect"><h2 class="h2">Tap an animal to learn more</h2></div>
    <div class="muted" style="padding:0 20px 16px">
      ${ANIMALS.length} animals and ${FACILITIES.length} facilities are marked. Saved stops are ringed in gold.
    </div>
  </div>`;

/* ---------- SHOW LIST ---------- */
views.showlist = () => {
  const ordered = [...SHOWS].sort((a,b) => {
    const rank = (s) => statusOf(s).cls === 'on' ? 0 : statusOf(s).cls === 'soon' ? 1 : 2;
    return rank(a) - rank(b);
  });
  return `
  <div class="hdr"><div class="hdr-row">
    <div><div class="eyebrow" style="color:var(--ink-2)">Thursday, 20 August</div>
      <h1 class="h1" style="margin-top:4px">Animal shows</h1></div>
    <button class="iconbtn" data-go="map" aria-label="Back to the map">‹</button>
  </div></div>
  ${ordered.map(s => {
    const st = statusOf(s);
    return `<div class="row" data-show="${s.id}" role="button" tabindex="0"
      ${st.cls === 'done' || st.cls === 'closed' ? 'style="opacity:.62"' : ''}>
      <span class="avatar">${ICON[s.animal]}</span>
      <span class="body"><span class="t">${esc(s.title)}</span>
        <span class="s">${esc(showTime(s))}</span>
        <span class="status ${st.cls}">${st.text}</span></span>
      ${heartBtn(s.id, s.title)}
    </div>`;
  }).join('')}
  <div class="muted" style="padding:6px 20px 0">♥ saves a show straight into My Day.</div>
  <div class="spacer"></div>`;
};

/* ---------- ANIMAL DETAIL ---------- */
views.animal = () => {
  const a = animal(state.animalId);
  const saved = isSaved(a.id);
  const text = { about:a.about, feeding:a.feeding, conservation:a.conservation }[state.tab];
  const bars = Array.from({ length: 34 }, (_, i) =>
    `<i class="${state.playing && i < 14 ? 'on' : ''}" style="height:${6 + ((i*7)%17)}px"></i>`).join('');
  return `
  <div style="position:relative">
    <div class="photo" style="height:200px">${a.name.toUpperCase()} PHOTO 16:9</div>
    <button class="iconbtn" data-go="map" aria-label="Back to the map"
      style="position:absolute;left:16px;top:14px;background:rgba(255,255,255,.92)">‹</button>
    <button class="heart" data-save="${a.id}" aria-pressed="${saved}"
      aria-label="${saved ? 'Remove' : 'Save'} ${esc(a.name)} ${saved ? 'from' : 'to'} My Day"
      style="position:absolute;right:16px;top:14px">${saved ? '♥' : '♡'}</button>
  </div>

  <div class="hdr" style="padding-top:14px">
    <div class="hdr-row">
      <div>
        <div class="eyebrow">Enclosure ${a.enclosure} · ${a.distance} m away</div>
        <h1 class="h1" style="margin-top:4px">${esc(a.name)}</h1>
        <div class="muted" style="font-style:italic">${esc(a.species)}</div>
      </div>
      <button class="pill" id="langbtn">\u{1F310} ${state.lang} ▾</button>
    </div>
  </div>

  <div class="audio">
    <button class="playbtn" id="play" aria-label="${state.playing ? 'Pause' : 'Play'} audio guide">${state.playing ? '‖' : '▶'}</button>
    <span class="wave" aria-hidden="true">${bars}</span>
    <span class="time">1:20</span>
  </div>
  <div class="muted" style="text-align:center;padding:0 20px 12px;font-style:italic">“${esc(a.quote)}”</div>

  <div class="tabs">
    ${[['about','About'],['feeding','Feeding'],['conservation','Conservation']]
      .map(([k,l]) => `<button class="tab" data-tab="${k}" aria-selected="${state.tab===k}">${l}</button>`).join('')}
  </div>
  <div style="padding:0 20px 14px;font-size:calc(13px * var(--fs));line-height:1.55;color:#3c423e">${esc(text)}</div>

  <div class="stats">
    ${a.facts.map(([k,v]) => `<div class="stat"><b style="font-size:calc(13px * var(--fs))">${esc(v)}</b><span>${k}</span></div>`).join('')}
  </div>

  <div style="display:flex;gap:10px;padding:4px 20px 16px">
    <button class="btn btn-dark" data-save="${a.id}" aria-pressed="${saved}" style="flex:1">
      ${saved ? 'Saved to My Day ✓' : '♡ Save to My Day'}
    </button>
    <button class="btn btn-primary" id="takeme" style="flex:1">Take me there</button>
  </div>
  <div class="spacer"></div>`;
};

/* ---------- MY DAY ---------- */
views.myday = () => {
  const items = savedItems();
  const st = savedStats();
  return `
  <div class="hdr"><div class="hdr-row">
    <div><div class="eyebrow" style="color:var(--ink-2)">Thursday, 20 August</div>
      <h1 class="h1" style="margin-top:4px">My Day</h1></div>
    <button class="btn btn-dark" data-go="route" style="padding:9px 14px;font-size:calc(12px * var(--fs))">◎ View on map</button>
  </div></div>

  <div class="stats">
    <div class="stat"><b>${st.count}</b><span>SAVED STOPS</span></div>
    <div class="stat"><b>${st.km} km</b><span>TOTAL WALK</span></div>
    <div class="stat"><b>${st.time}</b><span>EST. TIME</span></div>
  </div>

  ${items.length === 0 ? `
    <div class="empty">
      <div style="font-size:26px;margin-bottom:8px">♡</div>
      Nothing saved yet — tap ♥ anywhere in Search, on the Map or in a show to build your day.
      <div style="margin-top:14px"><button class="btn btn-ghost" data-go="search">Browse animals</button></div>
    </div>`
  : items.map(i => {
    const name = i.name || i.title;
    const sub = i.kind === 'show' ? showTime(i)
              : i.kind === 'animal' ? `Enclosure ${i.enclosure}`
              : i.sub;
    const badge = i.kind === 'show' ? `<span class="status ${statusOf(i).cls}">${statusOf(i).text}</span>` : '';
    const icon = i.kind === 'show' ? ICON[i.animal] : (ICON[i.id] || ICON[i.icon]);
    return `<div class="row" data-open="${i.kind}:${i.id}" role="button" tabindex="0">
      <span class="avatar">${icon}</span>
      <span class="body"><span class="t">${esc(name)}</span>
        <span class="s">${esc(sub)} · ${i.distance} m</span>${badge}</span>
      <button class="heart" data-save="${i.id}" aria-pressed="true"
        aria-label="Remove ${esc(name)} from My Day">♥</button>
    </div>`;
  }).join('')}
  <div class="spacer"></div>`;
};

/* ---------- MY DAY ON MAP ---------- */
views.route = () => {
  const items = savedItems();
  const next = items[0];
  return `
  <div class="hdr"><div class="hdr-row">
    <h1 class="h1">My Day on map</h1>
    <button class="iconbtn" data-go="myday" aria-label="Back to My Day">‹</button>
  </div></div>
  <div class="mapcanvas" style="height:360px">
    ${mapMarkers({ onlySaved:true })}
  </div>
  <div class="sheet">
    <div class="grab"></div>
    ${next ? `
      <div class="sect"><div>
        <div class="eyebrow">Next stop</div>
        <div class="h2" style="margin-top:3px">${esc(next.name || next.title)}</div>
      </div>
      <button class="btn btn-primary" id="walk" style="padding:10px 14px;font-size:calc(12px * var(--fs))">Start walking</button>
      </div>
      <div class="muted" style="padding:0 20px 12px">${next.distance} m · about ${next.walkMins || 3} min on foot</div>`
    : `<div class="empty">No saved stops yet. Save something first and it will appear here.
        <div style="margin-top:14px"><button class="btn btn-ghost" data-go="search">Browse animals</button></div></div>`}
    <div style="display:flex;gap:10px;padding:0 20px 18px">
      <button class="btn btn-ghost" id="accroute" aria-pressed="${state.accessibleRoute}" style="flex:1">
        ${state.accessibleRoute ? 'Accessible route ✓' : 'Accessible route'}
      </button>
      <button class="btn btn-ghost" data-go="myday" style="flex:1">Edit stops</button>
    </div>
  </div>`;
};

/* ---------- SECONDARY: MEMBERSHIP ---------- */
views.membership = () => {
  const chosen = MEMBERSHIPS.find(m => m.id === state.membership);
  return `${backHeader('Membership')}
  <div class="card" style="padding:0">
    <div class="photo" style="height:120px">MEMBER CARD PHOTO</div>
    <div style="padding:14px 16px">
      <div class="eyebrow">Unlimited entry</div>
      <div class="h2" style="margin-top:4px">Become a member</div>
      <div class="muted" style="margin-top:6px">Unlimited visits for a year, and every membership funds the 24-hour wildlife rescue service.</div>
    </div>
  </div>
  ${MEMBERSHIPS.map(m => `
    <button class="row" data-member="${m.id}" aria-pressed="${state.membership===m.id}"
      style="${state.membership===m.id ? 'border-color:var(--gold);background:var(--gold-soft)' : ''}">
      <span class="body"><span class="t">${esc(m.name)}</span><span class="s">${esc(m.sub)}</span></span>
      <span class="muted">${esc(m.price)}</span>
      <span style="font-size:17px;color:${state.membership===m.id ? 'var(--gold)' : 'var(--ink-3)'}">${state.membership===m.id ? '◉' : '○'}</span>
    </button>`).join('')}
  <div style="padding:6px 20px 18px">
    <button class="btn btn-dark" id="join" style="width:100%">Join now — ${esc(chosen.name)}, ${esc(chosen.price)}</button>
  </div>`;
};

/* ---------- SECONDARY: DONATION ---------- */
views.donation = () => `
  ${backHeader('Donate')}
  <div class="card" style="padding:14px 16px">
    <div class="h2">Help us answer the next call</div>
    <div class="muted" style="margin-top:6px">Bonorong runs Tasmania’s 24-hour wildlife rescue service. Every donation keeps a rescuer on the road tonight.</div>
  </div>
  <div class="sect"><span class="eyebrow" style="color:var(--ink-2)">Choose an amount</span></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 20px 12px">
    ${DONATIONS.map(d => `<button class="btn ${state.donation===d ? 'btn-primary' : 'btn-ghost'}" data-amount="${d}">${d}</button>`).join('')}
  </div>
  <div class="muted" style="padding:0 20px 14px">$20 feeds a rescued joey for a week.</div>
  <div style="padding:0 20px 18px">
    <button class="btn btn-dark" id="donate" style="width:100%">Donate ${esc(state.donation)}</button>
  </div>`;

/* ---------- SECONDARY: ACCESSIBILITY ---------- */
views.accessibility = () => {
  const tog = (key, title, sub) => `
    <div class="row" style="cursor:default">
      <span class="body"><span class="t">${title}</span><span class="s">${sub}</span></span>
      <button class="toggle" data-toggle="${key}" aria-pressed="${state[key]}" aria-label="${title}"></button>
    </div>`;
  return `${backHeader('Accessibility')}
  <div class="muted" style="padding:0 20px 12px">These settings change the Map, Search and every screen in the app.</div>
  ${tog('accessibleRoute','Accessible route on map','Avoids steps and steep paths')}
  ${tog('audioAuto','Audio descriptions','Play automatically at each enclosure')}
  ${tog('simpleLang','Simple language mode','Shorter text for younger visitors')}
  ${tog('reminders','Show reminders','Alert me 10 minutes before a talk')}
  <div class="sect"><span class="eyebrow" style="color:var(--ink-2)">Text size</span></div>
  <div style="display:flex;gap:10px;padding:0 20px 14px">
    ${[[1,'A','Default'],[1.15,'A','Large'],[1.3,'A','Largest']].map(([v,g,l],i) => `
      <button class="btn ${state.textScale===v ? 'btn-primary' : 'btn-ghost'}" data-scale="${v}" style="flex:1;flex-direction:column;gap:2px">
        <span style="font-size:${13 + i*5}px">${g}</span>
        <span style="font-size:10px;font-weight:600">${l}</span>
      </button>`).join('')}
  </div>
  <button class="row" data-go="map">
    <span class="avatar">♿</span>
    <span class="body"><span class="t">Accessible facilities</span><span class="s">Toilets, parking, ramps on the map</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span>
  </button>
  <div class="spacer"></div>`;
};

/* ---------- SECONDARY: Q & A ---------- */
views.qa = () => {
  const q = state.query.trim().toLowerCase();
  const list = QA.filter(x => !q || x.q.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
  return `${backHeader('Q & A')}
  <div class="searchwrap">
    <div class="searchbox">
      <span aria-hidden="true" style="color:var(--ink-3)">⌕</span>
      <input id="qaq" type="text" value="${esc(state.query)}" placeholder="Ask a question…" aria-label="Search questions">
    </div>
  </div>
  ${list.length ? list.map(x => `
    <details class="acc"><summary>${esc(x.q)}</summary><div class="ans">${esc(x.a)}</div></details>`).join('')
    : `<div class="empty">No question matched “${esc(state.query)}”. Try “toilets”, “feeding” or “rain”.</div>`}
  <div class="card" style="padding:16px;text-align:center;margin-top:8px">
    <div class="eyebrow" style="color:var(--ink-2)">Still stuck?</div>
    <div class="h2" style="margin:6px 0 12px">Ask a keeper</div>
    <button class="btn btn-dark" data-go="feedback">Send us a question</button>
  </div>
  <div class="spacer"></div>`;
};

/* ---------- SECONDARY: FEEDBACK ---------- */
views.feedback = () => `
  ${backHeader('Feedback')}
  <div class="sect"><h2 class="h2">How was your visit?</h2></div>
  <div class="stars">
    ${[1,2,3,4,5].map(n => `<button class="star" data-star="${n}" aria-pressed="${state.rating>=n}"
      aria-label="${n} out of 5">${state.rating>=n ? '★' : '☆'}</button>`).join('')}
  </div>
  <div class="field">
    <label for="fb">Tell us more</label>
    <textarea id="fb" rows="5" placeholder="The map made it easy to find…"></textarea>
  </div>
  <div style="padding:0 20px 18px">
    <button class="btn btn-dark" id="sendfb" style="width:100%">Send feedback</button>
  </div>`;

/* ---------- SECONDARY: SETTINGS ---------- */
views.settings = () => `
  ${backHeader('Settings')}
  <div class="card" style="padding:14px 16px;display:flex;gap:12px;align-items:center">
    <span class="avatar">\u{1F464}</span>
    <div><div class="t" style="font-weight:700">Guest</div>
      <div class="s muted">Not signed in · prototype</div></div>
  </div>
  <div class="sect"><span class="eyebrow" style="color:var(--ink-2)">App</span></div>
  <button class="row" id="langrow"><span class="body"><span class="t">Language</span>
    <span class="s">${state.lang === 'EN' ? 'English' : 'Simple English'}</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <button class="row" data-go="accessibility"><span class="body"><span class="t">Text size</span>
    <span class="s">${state.textScale === 1 ? 'Default' : state.textScale === 1.15 ? 'Large' : 'Largest'}</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <button class="row" id="offline"><span class="body"><span class="t">Offline map</span>
    <span class="s">42 MB · downloaded</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <button class="row" data-go="accessibility"><span class="body"><span class="t">Show reminders</span>
    <span class="s">${state.reminders ? '10 minutes before' : 'Off'}</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <button class="row" id="clearday"><span class="body">
    <span class="t">Clear My Day</span>
    <span class="s">Remove all ${savedStats().count} saved stop${savedStats().count===1?'':'s'}</span></span>
    <span style="color:var(--ink-3);font-size:18px">›</span></button>
  <div class="muted" style="text-align:center;padding:10px 20px 20px">
    Group 24 · KIT519 prototype · v1.0
  </div>`;

/* ---------------- render ---------------- */
function render(){
  document.documentElement.style.setProperty('--fs', state.textScale);
  $('#clock').textContent = statusbarTime();
  $('#screen').innerHTML = views[state.screen]();
  const active = NAV_FOR[state.screen] || 'home';
  document.querySelectorAll('#nav button').forEach(b => {
    if (b.dataset.nav === active) b.setAttribute('aria-current','page');
    else b.removeAttribute('aria-current');
  });
  wire();
}

/* ---------------- event wiring ---------------- */
function wire(){
  const sc = $('#screen');

  // search input
  const q = $('#q', sc);
  if (q){
    q.addEventListener('input', e => {
      state.query = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const nq = $('#q');
      if (nq){ nq.focus(); nq.setSelectionRange(pos, pos); }
    });
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter' && state.query.trim()) addRecent(state.query.trim());
    });
  }
  const qa = $('#qaq', sc);
  if (qa){
    qa.addEventListener('input', e => {
      state.query = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const n = $('#qaq');
      if (n){ n.focus(); n.setSelectionRange(pos, pos); }
    });
  }

  sc.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]')){
      e.preventDefault(); e.target.click();
    }
  });
}

function addRecent(term){
  state.recent = [term, ...state.recent.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0,4);
}

/* one delegated click handler for the whole prototype */
document.addEventListener('click', (e) => {
  const t = e.target;

  // bottom navigation
  const nav = t.closest('#nav button');
  if (nav) return go(nav.dataset.nav);

  // save / unsave
  const save = t.closest('[data-save]');
  if (save){ e.stopPropagation(); return void toggleSave(save.dataset.save); }

  // plain navigation
  const gotoEl = t.closest('[data-go]');
  if (gotoEl) return go(gotoEl.dataset.go);

  // open an animal
  const an = t.closest('[data-animal]');
  if (an) return go('animal', { animalId: an.dataset.animal, tab:'about' });

  // facility marker
  const fac = t.closest('[data-facility]');
  if (fac){
    const f = facility(fac.dataset.facility);
    return toast(`${f.name} — ${f.distance} m, about ${f.walkMins} min on foot`);
  }

  // a show row opens the animal that features in it
  const sh = t.closest('[data-show]');
  if (sh){
    const s = show(sh.dataset.show);
    return go('animal', { animalId: s.animal, tab:'about' });
  }

  // search result
  const res = t.closest('[data-result]');
  if (res){
    const [kind, id] = res.dataset.result.split(':');
    if (state.query.trim()) addRecent(state.query.trim());
    if (kind === 'animal') return go('animal', { animalId:id, tab:'about' });
    if (kind === 'show')   return go('animal', { animalId: show(id).animal, tab:'about' });
    const f = facility(id);
    toast(`${f.name} — ${f.distance} m away`);
    return go('map');
  }

  // My Day row
  const open = t.closest('[data-open]');
  if (open){
    const [kind, id] = open.dataset.open.split(':');
    if (kind === 'animal') return go('animal', { animalId:id, tab:'about' });
    if (kind === 'show')   return go('animal', { animalId: show(id).animal, tab:'about' });
    return go('route');
  }

  // filters, recents, tabs
  const f = t.closest('[data-filter]');
  if (f){ state.filter = f.dataset.filter; return render(); }

  const rec = t.closest('[data-recent]');
  if (rec){ state.query = rec.dataset.recent; return render(); }

  const tab = t.closest('[data-tab]');
  if (tab){ state.tab = tab.dataset.tab; return render(); }

  if (t.closest('#clearq')){ state.query = ''; return render(); }
  if (t.closest('#clearrecent')){ state.recent = []; toast('Recent searches cleared'); return render(); }

  // animal detail controls
  if (t.closest('#play')){
    state.playing = !state.playing;
    render();
    return toast(state.playing ? 'Audio guide playing' : 'Audio guide paused');
  }
  if (t.closest('#langbtn')){
    state.lang = state.lang === 'EN' ? '简' : state.lang === '简' ? 'DE' : 'EN';
    render();
    return toast(`Audio and text language set to ${state.lang}`);
  }
  if (t.closest('#takeme')){
    const a = animal(state.animalId);
    if (!isSaved(a.id)) state.saved.add(a.id);
    go('route');
    return toast(`Walking to ${a.name} — ${a.distance} m, about ${a.walkMins} min`);
  }
  if (t.closest('#walk')) return toast('Follow the gold path on the map.');
  if (t.closest('#accroute')){
    state.accessibleRoute = !state.accessibleRoute;
    render();
    return toast(state.accessibleRoute ? 'Accessible route on — steps avoided' : 'Accessible route off');
  }

  // toggles and text size
  const tg = t.closest('[data-toggle]');
  if (tg){
    const k = tg.dataset.toggle;
    state[k] = !state[k];
    render();
    return toast(`${tg.getAttribute('aria-label')} ${state[k] ? 'on' : 'off'}`);
  }
  const sca = t.closest('[data-scale]');
  if (sca){
    state.textScale = parseFloat(sca.dataset.scale);
    render();
    return toast('Text size updated across the whole app');
  }

  // membership / donation / feedback / settings
  const mem = t.closest('[data-member]');
  if (mem){ state.membership = mem.dataset.member; return render(); }
  if (t.closest('#join')){
    const m = MEMBERSHIPS.find(x => x.id === state.membership);
    return toast(`${m.name} membership selected — ${m.price}. This is a prototype, no payment is taken.`);
  }
  const amt = t.closest('[data-amount]');
  if (amt){ state.donation = amt.dataset.amount; return render(); }
  if (t.closest('#donate'))
    return toast(`Thank you — ${state.donation} donation recorded. This is a prototype, no payment is taken.`);

  const star = t.closest('[data-star]');
  if (star){ state.rating = Number(star.dataset.star); return render(); }
  if (t.closest('#sendfb')){
    const box = $('#fb');
    const written = box && box.value.trim();
    if (!state.rating && !written) return toast('Add a rating or a comment first.');
    state.rating = 0;
    render();
    return toast('Thank you — your feedback has been sent.');
  }

  if (t.closest('#langrow')){
    state.lang = state.lang === 'EN' ? 'Simple' : 'EN';
    render();
    return toast(`Language set to ${state.lang === 'EN' ? 'English' : 'Simple English'}`);
  }
  if (t.closest('#offline')) return toast('Offline map is already downloaded (42 MB).');
  if (t.closest('#clearday')){
    const n = state.saved.size;
    if (!n) return toast('My Day is already empty.');
    state.saved.clear();
    render();
    return toast(`Cleared ${n} saved stop${n===1?'':'s'} from My Day`);
  }
});

/* clear the shared query when leaving a screen that uses it */
const _go = go;
go = function(screen, opts){
  if (screen !== 'search' && screen !== 'qa') state.query = '';
  _go(screen, opts);
};

render();
