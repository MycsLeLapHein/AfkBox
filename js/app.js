// ═══════════════════════════════════════════════════════
// app.js — Logique principale de l'application
// ═══════════════════════════════════════════════════════

// ── COLORS ──────────────────────────────────────────────────────
let pickedColor = '#ff6b35';

// ── TIER LIST ───────────────────────────────────────────────────
// TL data loaded from heroes.js

// ── SYNERGIES ───────────────────────────────────────────────────
// SYN data loaded from synergies.js

// getTeams loaded from synergies.js

// ── UTILS ───────────────────────────────────────────────────────
const CC={"SHEMIRA":"#ff0055","REQUIRED":"#ff4444","High Impact":"#ff8c00","Nice to Have":"#ffd700","Niche":"#7ec8e3","Stretch":"#6e7681","Céleste/Hypogéen":"#bf7fff","Collab":"#3fb950","Skip":"#555"};
const cc=c=>CC[c]||'#555';
const sc=v=>v>=3.5?'#3fb950':v>=2?'#ffd700':v>=1?'#ff8c00':'#f85149';
const sb=(v,m=4)=>Math.max(0,Math.min(100,v/m*100)).toFixed(1)+'%';

// ── STATE ────────────────────────────────────────────────────────
function loadState(){
  try{const s=localStorage.getItem('afk_boxes_v2');if(s)return JSON.parse(s);}catch(e){}
  return{boxes:[],activeId:null};
}
function saveState(){localStorage.setItem('afk_boxes_v2',JSON.stringify(state));}
let state=loadState();
let selHero=null,faction='all';
function getActiveBox(){return state.boxes.find(b=>b.id===state.activeId)||null;}
function getBox(){const b=getActiveBox();return b?b.heroes:[];}


// ── PRIORITÉS EX ─────────────────────────────────────────────────
function showExPriority() {
  const box = getActiveBox();
  if (!box) return;

  // Get heroes from box that have EX data
  const heroes = box.heroes.map(h => {
    const t = TL[h.name] || {};
    return {
      name: h.name,
      currentEx: h.ex,
      cap: t.excap,
      p10: t.p10,
      p15: t.p15,
      tier: t.tier,
      cat: t.cat,
    };
  }).filter(h => h.p10 !== undefined);

  // Sort priority for +10: heroes not yet at +10, sorted by p10 score (lower = more urgent)
  const need10 = heroes
    .filter(h => h.currentEx < 10 && h.cap >= 10 && h.p10 > 0)
    .sort((a, b) => a.p10 - b.p10 || a.cap - b.cap);

  // Sort priority for +15: heroes not yet at +15, cap=15, sorted by p15 score (higher = more gain)
  const need15 = heroes
    .filter(h => h.currentEx < 15 && h.cap === 15 && h.p15 >= 5)
    .sort((a, b) => b.p15 - a.p15 || a.p10 - b.p10);

  // Already done
  const done = heroes.filter(h => h.currentEx >= h.cap && h.cap > 0);

  const box_color = box.color || 'var(--accent)';
  const catColors = {"SHEMIRA":"#ff0055","REQUIRED":"#ff4444","High Impact":"#ff8c00",
    "Nice to Have":"#ffd700","Niche":"#7ec8e3","Stretch":"#6e7681","Céleste/Hypogéen":"#bf7fff",
    "Collab":"#3fb950","Skip":"#555"};

  function heroRow(h, showCap) {
    const c = catColors[h.cat] || '#555';
    const progress = h.cap > 0 ? Math.min(100, (h.currentEx / h.cap) * 100) : 0;
    const exLabel = h.currentEx === -1 ? 'Non débloqué' : h.currentEx === 0 ? '+0' : '+' + h.currentEx;
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:var(--bg3);margin-bottom:6px">
      <div style="width:6px;height:6px;border-radius:50%;background:${c};flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="font-size:13px;font-weight:600">${h.name}</span>
          <span style="font-size:10px;padding:1px 5px;border-radius:4px;background:${c}22;color:${c}">${h.cat}</span>
          ${h.tier ? `<span style="font-size:10px;font-weight:700;color:${h.tier==='S'?'var(--gold)':'var(--accent2)'}">${h.tier}</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${progress.toFixed(0)}%;background:${box_color};border-radius:2px;transition:width .3s"></div>
          </div>
          <span style="font-size:11px;color:var(--text2);flex-shrink:0">${exLabel} → <strong style="color:${box_color}">+${h.cap}</strong></span>
        </div>
      </div>
    </div>`;
  }

  const html = `<div class="detail">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
      <div style="font-size:24px">⭐</div>
      <div>
        <h2 style="font-size:18px;font-weight:700">Priorités EX — ${box.name}</h2>
        <p style="font-size:12px;color:var(--text2);margin-top:2px">Basé sur ta tier list de référence (Apr 2026)</p>
      </div>
    </div>

    ${need10.length > 0 ? `
    <div class="sec">
      <h3 style="color:var(--gold)">🎯 À monter à EX+10 en priorité (${Math.min(need10.length, 10)}/${need10.length})</h3>
      <p style="font-size:11px;color:var(--text2);margin-bottom:10px">Score bas = plus urgent · basé sur l'importance du héros dans la méta</p>
      ${need10.slice(0, 10).map(h => heroRow(h, true)).join('')}
      ${need10.length > 10 ? `<p style="font-size:11px;color:var(--text3);text-align:center;margin-top:4px">+ ${need10.length - 10} autres héros...</p>` : ''}
    </div>` : ''}

    ${need15.length > 0 ? `
    <div class="sec">
      <h3 style="color:#3fb950">⭐ À monter à EX+15 en priorité (${Math.min(need15.length, 10)}/${need15.length})</h3>
      <p style="font-size:11px;color:var(--text2);margin-bottom:10px">Score haut = plus de gain entre +10 et +15</p>
      ${need15.slice(0, 10).map(h => heroRow(h, true)).join('')}
      ${need15.length > 10 ? `<p style="font-size:11px;color:var(--text3);text-align:center;margin-top:4px">+ ${need15.length - 10} autres héros...</p>` : ''}
    </div>` : ''}

    ${done.length > 0 ? `
    <div class="sec">
      <h3 style="color:var(--green)">✓ Caps atteints (${done.length})</h3>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
        ${done.map(h => `<span style="padding:3px 10px;border-radius:12px;background:rgba(63,185,80,.12);color:var(--green);font-size:12px;border:1px solid rgba(63,185,80,.3)">✓ ${h.name} +${h.currentEx}</span>`).join('')}
      </div>
    </div>` : ''}

    ${need10.length === 0 && need15.length === 0 ? `
    <div style="text-align:center;padding:40px;color:var(--text2)">
      <div style="font-size:48px;opacity:.3">🎉</div>
      <p style="margin-top:12px">Tous les caps EX sont atteints !</p>
    </div>` : ''}
  </div>`;

  document.getElementById('main').innerHTML = html;
  selHero = null;
  renderL();
}

// ── BOX TABS ────────────────────────────────────────────────────
function renderTabs(){
  const wrap=document.getElementById('box-tabs');
  const tabs=state.boxes.map(b=>{
    const active=b.id===state.activeId;
    const initial=b.name.slice(0,1).toUpperCase();
    return `<button class="box-tab${active?' active':''}" data-boxid="${b.id}" data-action="switch">
      <div class="av" style="background:${b.color}22;color:${b.color}">${initial}</div>
      ${b.name}
      <span class="tab-del" data-boxid="${b.id}" data-action="delete">✕</span>
    </button>`;
  }).join('');
  wrap.innerHTML=tabs+'<button class="add-box-btn" data-action="create">+ Ajouter une box</button>';
  const hasBoxes=state.boxes.length>0;
  document.getElementById('layout').style.display=hasBoxes?'none':'flex';
  document.getElementById('sidebar-wrap').style.display=hasBoxes?'block':'none';
}

// Central click/touch handler for box tabs
document.getElementById('box-tabs').addEventListener('click',function(e){
  const btn=e.target.closest('[data-action]');
  if(!btn)return;
  const action=btn.dataset.action;
  const id=btn.dataset.boxid;
  if(action==='switch')switchBox(id);
  else if(action==='delete')deleteBox(e,id);
  else if(action==='create')openCreateBox();
});

function switchBox(id){
  state.activeId=id;selHero=null;faction='all';
  document.getElementById('srch').value='';
  document.getElementById('main').innerHTML='<div class="empty-state"><div class="ei">⚔</div><p>Sélectionne un héros</p><small>ou clique "+ Ajouter"</small></div>';
  saveState();renderTabs();renderSidebar();
}

function deleteBox(e,id){
  e.stopPropagation();
  const box=state.boxes.find(b=>b.id===id);
  if(!box)return;
  if(!confirm('Supprimer la box "'+box.name+'" et tous ses héros ?'))return;
  state.boxes=state.boxes.filter(b=>b.id!==id);
  if(state.activeId===id)state.activeId=state.boxes.length>0?state.boxes[0].id:null;
  selHero=null;saveState();renderTabs();
  if(getActiveBox())renderSidebar();
}

// ── CREATE BOX ──────────────────────────────────────────────────
function openCreateBox(){
  pickedColor='#ff6b35';
  document.querySelectorAll('.color-opt').forEach(el=>{
    el.style.border=el.dataset.color===pickedColor?'3px solid white':'3px solid transparent';
  });
  document.getElementById('box-name-input').value='';
  document.getElementById('ov-create').style.display='flex';
  setTimeout(()=>document.getElementById('box-name-input').focus(),100);
}
function closeCreateBox(){document.getElementById('ov-create').style.display='none';}
function pickColor(el){
  pickedColor=el.dataset.color;
  document.querySelectorAll('.color-opt').forEach(e=>{
    e.style.border=e.dataset.color===pickedColor?'3px solid white':'3px solid transparent';
  });
}
function confirmCreateBox(){
  const name=document.getElementById('box-name-input').value.trim();
  if(!name){alert('Entre un nom !');return;}
  const id='box_'+Date.now();
  state.boxes.push({id,name,color:pickedColor,heroes:[]});
  state.activeId=id;saveState();closeCreateBox();
  selHero=null;faction='all';
  document.getElementById('srch').value='';
  renderTabs();renderSidebar();
}

// ── SIDEBAR ─────────────────────────────────────────────────────
function renderSidebar(){
  const box=getActiveBox();if(!box)return;
  document.getElementById('sav').textContent=box.name.slice(0,1).toUpperCase();
  document.getElementById('sav').style.background=box.color+'22';
  document.getElementById('sav').style.color=box.color;
  document.getElementById('stit').textContent='Box de '+box.name;
  document.getElementById('hcnt').textContent=box.heroes.length+' héros';
  const facs=['all',...new Set(box.heroes.map(h=>TL[h.name]?.faction).filter(Boolean))].sort((a,b)=>a==='all'?-1:b==='all'?1:a.localeCompare(b));
  document.getElementById('ff').innerHTML=facs.map(f=>`<button class="fb${faction===f?' on':''}" data-fac="${f}">${f==='all'?'Tous':f}</button>`).join('');
  document.getElementById('ff').onclick=function(e){
    const btn=e.target.closest('[data-fac]');
    if(btn)setF(btn.dataset.fac);
  };
  renderL();
}

function renderL(){
  const box=getActiveBox();if(!box)return;
  const q=document.getElementById('srch').value.toLowerCase();
  let items=box.heroes.filter(h=>{
    if(q&&!h.name.toLowerCase().includes(q))return false;
    if(faction!=='all'&&TL[h.name]?.faction!==faction)return false;
    return true;
  }).sort((a,b)=>{
    const ta=TL[a.name],tb=TL[b.name];
    if(!ta&&!tb)return 0;if(!ta)return 1;if(!tb)return-1;
    return ta.rank-tb.rank;
  });
  const el=document.getElementById('hl');
  if(!items.length){
    el.innerHTML=`<div style="padding:20px 14px;text-align:center;color:var(--text3);font-size:13px">${box.heroes.length===0?'Box vide — clique "+ Ajouter"':'Aucun résultat'}</div>`;
    return;
  }
  el.innerHTML=items.map(h=>{
    const t=TL[h.name]||{};const c=cc(t.cat||'');const s=selHero===h.name;
    const safe=h.name.replace(/'/g,"&#39;");
    return`<div class="hi${s?' sel':''}" data-name="${safe}">
      <div class="hdot" style="background:${c}"></div>
      <span class="hn">${h.name}</span>
      ${t.tier?`<span class="tb ${t.tier==='S'?'ts':'ta'}">${t.tier}</span>`:''}
      ${h.ex>0?`<span class="exb">+${h.ex}</span>`:''}
    </div>`;
  }).join('');
  // Use event delegation for hero clicks
  el.onclick=function(e){
    const item=e.target.closest('[data-name]');
    if(item)selH(item.dataset.name);
  };
}

function setF(f){faction=f;renderSidebar();}

// ── HERO DETAIL ──────────────────────────────────────────────────
function selH(name){
  selHero=name;renderL();
  const box=getActiveBox();if(!box)return;
  const hero=box.heroes.find(h=>h.name===name);
  const t=TL[name]||{};if(!hero)return;
  const ac=box.color||'var(--accent)';
  const c=cc(t.cat||'');
  const bnames=box.heroes.map(b=>b.name);
  const teams=getTeams(name,state.activeId);
  const exLevels=[{v:-1,l:'Non débloqué'},{v:0,l:'+0 (débloqué)'},
    {v:1,l:'+1'},{v:2,l:'+2'},{v:3,l:'+3'},{v:4,l:'+4'},{v:5,l:'+5'},
    {v:6,l:'+6'},{v:7,l:'+7'},{v:8,l:'+8'},{v:9,l:'+9'},{v:10,l:'+10'},
    {v:11,l:'+11'},{v:12,l:'+12'},{v:13,l:'+13'},{v:14,l:'+14'},{v:15,l:'+15'}];
  const exOpts=exLevels.map(o=>`<option value="${o.v}"${o.v===hero.ex?' selected':''}>${o.l}</option>`).join('');
  const pnOpts=['Elite','Elite+','Epic','Epic+','Légendaire','Légendaire+','Mythic','Mythic+','Supreme','Supreme+','P1','P2','P3','P4']
    .map(p=>`<option${p===hero.pn?' selected':''}>${p}</option>`).join('');
  const excap=t.excap;
  const exLabel=hero.ex===-1?'Non débloqué':hero.ex===0?'+0 (débloqué)':('+'+hero.ex);
  let exCapLabel,exCapColor,exCapIcon;
  if(excap===undefined||excap===null){exCapLabel='Cap : +10';exCapColor='#ffd700';exCapIcon='🎯';}
  else if(excap===-1){exCapLabel="Pas d'EX recommandé";exCapColor='#6e7681';exCapIcon='⊘';}
  else if(excap===0){exCapLabel='EX non prioritaire';exCapColor='#8b949e';exCapIcon='◦';}
  else if(excap===10){exCapLabel='Cap recommandé : +10';exCapColor='#ffd700';exCapIcon='🎯';}
  else if(excap===15){exCapLabel='Cap recommandé : +15';exCapColor='#3fb950';exCapIcon='⭐';}
  else{exCapLabel='Cap : +'+excap;exCapColor='#ffd700';exCapIcon='🎯';}
  const exProgress=(excap>0&&hero.ex>0)?(hero.ex/excap*100):0;
  const exDone=(excap>0&&hero.ex>=excap);
  if(exDone&&excap>0){exCapLabel='✓ Cap atteint !';exCapColor='#3fb950';exCapIcon='🎉';}
  const roleIcon={'Tank':'🛡','Soutien':'💚','Mage':'🔮','Archer':'🏹','Assassin':'🗡','Guerrier':'⚔'};
  const tHTML=teams.map(tm=>{
    const tags=tm.heroes.map(hn=>{
      const own=bnames.includes(hn);const tt=TL[hn];
      const ri=tt?roleIcon[tt.role]||'':'';
      return`<div class="th ${own?'o':'x'}"><span style="font-size:10px">${own?'✓':'○'}</span> ${ri} ${hn}${own&&tt?`<span style="font-size:9px;color:${cc(tt.cat)};margin-left:2px">${tt.tier}</span>`:''}</div>`;
    }).join('');
    return`<div class="tc"><div class="tt"><span>${tm.name}</span><span class="tm">${tm.mode}</span></div><div class="td">${tm.desc}</div><div class="thl">${tags}</div></div>`;
  }).join('');
  document.getElementById('main').innerHTML=`<div class="detail">
    <div class="dh">
      <div class="dav" style="background:${c}22;border-color:${c}55;color:${c}">${name.slice(0,2).toUpperCase()}</div>
      <div class="di">
        <h2>${name}</h2>
        <div class="meta">
          ${t.tier?`<span class="badge ${t.tier==='S'?'bs':'ba'}">${t.tier}</span>`:''}
          ${t.faction?`<span class="badge bf">${t.faction}</span>`:''}
          ${t.role?`<span class="badge bf">${roleIcon[t.role]||''} ${t.role}</span>`:''}
          ${t.cat?`<span class="badge" style="background:${c}18;color:${c};border-color:${c}44">${t.cat}</span>`:''}
          <span style="font-size:11px;color:var(--text3)">Rang #${t.rank||'?'}</span>
        </div>
        ${t.note?`<div class="note">${t.note}</div>`:''}
      </div>
    </div>
    <div class="sg">
      <div class="sc">
        <div class="scl">EX Level</div>
        <div class="scv" id="ex-label-card" style="color:${ac};font-size:15px">${exLabel}</div>
        <div id="ex-progress-wrap" style="margin-top:5px;height:4px;background:var(--bg4);border-radius:2px;overflow:hidden;display:${excap>0?'block':'none'}">
          <div id="ex-progress-bar" style="height:100%;width:${excap>0?Math.min(100,exProgress).toFixed(0)+'%':'0%'};background:${exDone?'#3fb950':ac};border-radius:2px;transition:width .3s"></div>
        </div>
        <div id="ex-cap-label" style="margin-top:4px;font-size:10px;color:${exCapColor}">${exCapIcon} ${exCapLabel}</div>
      </div>
      <div class="sc"><div class="scl">Parangon</div><div class="scv" style="color:var(--gold)">${hero.pn}</div></div>
      <div class="sc"><div class="scl">Rang Tier</div><div class="scv" style="color:${t.tier==='S'?'var(--gold)':'var(--accent2)'}">${t.tier||'?'}</div></div>
    </div>
    <div class="sec"><h3>Scores tier list</h3>
      ${[['Dream Realm',t.dr||0],['Story Stage',t.stage||0],['PvP',t.pvp||0]].map(([l,v])=>`
      <div class="sr"><span class="sl">${l}</span>
        <div class="st"><div class="sf" style="width:${sb(Math.max(0,v))};background:${sc(v)}"></div></div>
        <span class="sn" style="color:${sc(v)}">${v.toFixed(1)}</span>
      </div>`).join('')}
    </div>
    <div class="sec"><h3>Modifier le héros</h3>
      <div class="eg">
        <div class="ef"><label>Niveau EX</label>
          <select id="ex-select" data-hero="${name}" onchange="ed('ex',this.value,this.dataset.hero);updateExCard(this.value,this.dataset.hero)">${exOpts}</select>
        </div>
        <div class="ef"><label>Parangon</label>
          <select data-hero="${name}" onchange="ed('pn',this.value,this.dataset.hero)">${pnOpts}</select>
        </div>
      </div>
      <div class="ea">
        <button class="btn bsv" data-hero="${name}" onclick="sv(this.dataset.hero)">✓ Sauvegarder</button>
        <button class="btn bdl" data-hero="${name}" onclick="dl(this.dataset.hero)">Supprimer</button>
      </div>
    </div>
    <div class="sec"><h3>Équipes recommandées</h3>${tHTML}</div>
    <div class="aiw"><h3>✦ Question IA</h3>
      <div class="air">
        <input type="text" id="aiq" placeholder="Ex: contre quel boss utiliser ${name} ?" data-hero="${name}" onkeydown="if(event.key==='Enter')ai(this.dataset.hero)">
        <button data-hero="${name}" onclick="ai(this.dataset.hero)">→</button>
      </div>
      <div id="ail" class="ail">✦ Analyse en cours...</div>
      <div id="air2" class="airesp"></div>
    </div>
  </div>`;
}

function ed(f,v,n){
  const box=getActiveBox();if(!box)return;
  const h=box.heroes.find(h=>h.name===n);if(!h)return;
  if(f==='ex')h.ex=parseInt(v);else h[f]=v;
  saveState();
}
function sv(n){
  saveState();renderL();
  const b=document.querySelector('.bsv');
  if(b){b.textContent='✓ Sauvegardé !';setTimeout(()=>b.textContent='✓ Sauvegarder',1500);}
}
function dl(n){
  if(!confirm('Supprimer '+n+' ?'))return;
  const box=getActiveBox();if(!box)return;
  box.heroes=box.heroes.filter(h=>h.name!==n);
  saveState();selHero=null;
  document.getElementById('main').innerHTML='<div class="empty-state"><div class="ei">⚔</div><p>Héros supprimé</p></div>';
  renderSidebar();
}

// ── ADD HERO ─────────────────────────────────────────────────────
let modalAvail=[];
function openM(){
  const box=getActiveBox();if(!box)return;
  const owned=box.heroes.map(h=>h.name);
  modalAvail=Object.keys(TL).filter(n=>!owned.includes(n)).sort((a,b)=>TL[a].rank-TL[b].rank);
  document.getElementById('msearch').value='';
  document.getElementById('mhint').textContent='';
  document.getElementById('mcount').textContent='('+modalAvail.length+' disponibles)';
  document.getElementById('mtit').textContent='Ajouter à la box de '+box.name;
  document.getElementById('mok').style.background=box.color||'var(--accent)';
  buildHeroOptions(modalAvail);
  document.getElementById('ov').style.display='flex';
  setTimeout(()=>document.getElementById('msearch').focus(),100);
}
function buildHeroOptions(list){
  const sel=document.getElementById('mh');
  if(!list.length){sel.innerHTML='<option value="">Aucun résultat</option>';return;}
  sel.innerHTML=list.map(n=>{
    const t=TL[n];
    return`<option value="${n}">${t.tier?'['+t.tier+'] ':''}${n} — ${t.faction||''}</option>`;
  }).join('');
  sel.selectedIndex=0;onHeroChosen();
}
function filterHeroes(){
  const q=document.getElementById('msearch').value.toLowerCase().trim();
  buildHeroOptions(q?modalAvail.filter(n=>n.toLowerCase().includes(q)):modalAvail);
}
function onHeroChosen(){
  const n=document.getElementById('mh').value;const t=TL[n];
  const hint=document.getElementById('mhint');
  if(n&&t){
    const capLabel=t.excap===0?'EX non prioritaire':t.excap===-1?"Pas d'EX":t.excap?'Cap EX : +'+t.excap:'?';
    hint.innerHTML='<span style="color:var(--text2)">'+t.faction+' · '+t.role+'</span> | <span style="color:var(--gold)">DR:'+t.dr+' Stage:'+t.stage+'</span> | <span style="color:var(--purple)">'+capLabel+'</span>';
  }else{hint.textContent='';}
}
function closeM(){document.getElementById('ov').style.display='none';}
function confirmA(){
  const n=document.getElementById('mh').value;
  if(!n){alert('Choisis un héros !');return;}
  const ex=parseInt(document.getElementById('mex').value);
  const pn=document.getElementById('mpn').value;
  const box=getActiveBox();if(!box)return;
  if(box.heroes.find(h=>h.name===n)){alert('Déjà dans la box !');return;}
  box.heroes.push({name:n,ex,pn});
  saveState();closeM();renderSidebar();selH(n);
}
document.getElementById('ov').addEventListener('click',e=>{if(e.target===document.getElementById('ov'))closeM();});
document.getElementById('ov-create').addEventListener('click',e=>{if(e.target===document.getElementById('ov-create'))closeCreateBox();});

// ── EXPORT / IMPORT ──────────────────────────────────────────────
function exportBox(){
  const data={version:3,date:new Date().toISOString(),boxes:state.boxes};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='afk-box-'+new Date().toISOString().slice(0,10)+'.json';a.click();
  URL.revokeObjectURL(url);
}
function importBox(event){
  const file=event.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const data=JSON.parse(e.target.result);
      if(data.boxes){
        state.boxes=data.boxes;
        state.activeId=data.boxes.length>0?data.boxes[0].id:null;
      }else if(data.mycs||data.nams){
        state.boxes=[];
        if(data.mycs&&data.mycs.length){
          const id='box_'+Date.now();
          state.boxes.push({id,name:'Mycs',color:'#ff6b35',heroes:data.mycs});
          state.activeId=id;
        }
        if(data.nams&&data.nams.length){
          const id='box_'+(Date.now()+1);
          state.boxes.push({id,name:'Nams',color:'#4ecdc4',heroes:data.nams});
          if(!state.activeId)state.activeId=id;
        }
      }else{throw new Error('Format invalide');}
      saveState();selHero=null;renderTabs();
      if(getActiveBox())renderSidebar();
      const total=state.boxes.reduce((s,b)=>s+b.heroes.length,0);
      alert('Import réussi ! '+state.boxes.length+' box(es) · '+total+' héros');
    }catch(err){alert('Erreur : '+err.message);}
    event.target.value='';
  };
  reader.readAsText(file);
}

// ── EX LIVE UPDATE ───────────────────────────────────────────────
function updateExCard(rawVal,heroName){
  const val=parseInt(rawVal);
  const t=TL[heroName]||{};
  const excap=t.excap;
  const box=getActiveBox();
  const ac=box?box.color:'var(--accent)';
  const label=val===-1?'Non débloqué':val===0?'+0 (débloqué)':('+'+val);
  const labelEl=document.getElementById('ex-label-card');
  if(labelEl)labelEl.textContent=label;
  const progress=(excap>0&&val>0)?Math.min(100,val/excap*100):0;
  const done=excap>0&&val>=excap;
  const barWrap=document.getElementById('ex-progress-wrap');
  const bar=document.getElementById('ex-progress-bar');
  if(barWrap)barWrap.style.display=excap>0?'block':'none';
  if(bar){bar.style.width=progress.toFixed(0)+'%';bar.style.background=done?'#3fb950':ac;}
  let capLabel,capColor,capIcon;
  if(excap===undefined||excap===null){capLabel='Cap : +10';capColor='#ffd700';capIcon='🎯';}
  else if(excap===-1){capLabel="Pas d'EX recommandé";capColor='#6e7681';capIcon='⊘';}
  else if(excap===0){capLabel='EX non prioritaire';capColor='#8b949e';capIcon='◦';}
  else if(excap===10){capLabel='Cap recommandé : +10';capColor='#ffd700';capIcon='🎯';}
  else if(excap===15){capLabel='Cap recommandé : +15';capColor='#3fb950';capIcon='⭐';}
  else{capLabel='Cap : +'+excap;capColor='#ffd700';capIcon='🎯';}
  if(done&&excap>0){capLabel='✓ Cap atteint !';capColor='#3fb950';capIcon='🎉';}
  const capEl=document.getElementById('ex-cap-label');
  if(capEl){capEl.textContent=capIcon+' '+capLabel;capEl.style.color=capColor;}
}

// ── AI ───────────────────────────────────────────────────────────
async function ai(nm){
  const q=document.getElementById('aiq')?.value?.trim();if(!q)return;
  const L=document.getElementById('ail'),R=document.getElementById('air2');
  L.style.display='';R.style.display='none';
  const box=getActiveBox();
  const sum=box?box.heroes.slice(0,25).map(h=>h.name+'(EX+'+h.ex+','+h.pn+')').join(', '):'';
  const t=TL[nm]||{};
  const prompt='Tu es un expert AFK Journey. Héros : '+nm+' (Tier '+t.tier+', '+t.faction+', DR:'+t.dr+', Stage:'+t.stage+'). Box : '+sum+'. Question : '+q+'. Réponds en français, max 200 mots.';
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
    const d=await res.json();
    R.textContent=d.content?.map(b=>b.text||'').join('')||'Erreur.';R.style.display='';
  }catch(e){R.textContent='Erreur de connexion.';R.style.display='';}
  L.style.display='none';
}

// ── INIT ─────────────────────────────────────────────────────────
renderTabs();
if(getActiveBox())renderSidebar();
