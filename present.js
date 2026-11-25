/* ===================================================================
   Present mode — four structures, renumbered 01 to 04, driven by voice.

   Each structure has three views, one per strand of Criterion A:
     out  the structure from outside
     in   what is inside it  (skull: the 3D cutaway · others: the diagram)
     vs   the human comparison

   Speech recognition does two jobs at once: it writes the caption and it
   moves the camera, so nothing has to be clicked while talking. Arrow keys
   and the space bar always work as a fallback.
   =================================================================== */
(function () {

const SEQ = [
  { num: '—',  idx: null, kicker: 'The whole slide', title: 'Two skeletons, one rule', views: ['out'] },
  { num: '01', idx: 0,    kicker: 'Structure 01', title: 'The skull',        views: ['out','in','vs'] },
  { num: '02', idx: 5,    kicker: 'Structure 02', title: 'Columnar limbs',   views: ['out','in','vs'], fig: 'fig/limbs.jpg' },
  { num: '03', idx: 7,    kicker: 'Structure 03', title: 'The foot',         views: ['out','in','vs'], fig: 'fig/foot.jpg' },
  { num: '04', idx: 6,    kicker: 'Structure 04', title: 'The knee',         views: ['out','in','vs'], fig: 'fig/knee.jpg' },
  { num: '—',  idx: 10,   kicker: 'Close',        title: 'Why size forces it', views: ['out','in'],    fig: 'fig/scale.jpg' }
];

/* words that jump the talk forward. Only ever forward, never back, so a
   word said in passing cannot drag the slide backwards mid-sentence. */
const TRIG = [
  [1,'out',['skull','cranium','the head','start with','starting with','start off',
            'first structure','begin with']],
  [1,'in', ['pneumatised','pneumatized','newmatised','air cell','air cells','bony plate',
            'bony plates','thin plates','attachment','anchor','anchors','tusks','trunk muscles',
            'small brain','enormous','inside']],
  [1,'vs', ['five kilo','5 kilo','five kilograms','solid plate','your skull','balanced',
            'on top of a vertical','almost all the volume','our skull']],

  [2,'out',['columnar','column','limbs','four legs','the legs','second structure',
            'straight legs','vertical columns']],
  [2,'in', ['compression','not bending','trabecular','marrow','packed','filled','crush',
            'crushing','inside the bone','cross-section','cross section']],
  [2,'vs', ['spring','bent','bend','hollow tube','running and jumping','elastic',
            'store and return','your femur','our femur']],

  [3,'out',['the foot','foot','feet','no bone touches','third structure','on tiptoe',
            'tiptoe','walks on']],
  [3,'in', ['cushion','collagen','chambers','pressure','divided by area','force divided',
            'fat pad','the fat','spreads','increase the area','sole']],
  [3,'vs', ['heel','calcaneus','thin pad','your foot','our foot','strikes the ground']],

  [4,'out',['the knee','knee','fourth structure','last structure','joint','one eighty',
            '180','nearly straight']],
  [4,'in', ['screw-home','screw home','screwhome','sixteen','locks straight','locking',
            'it locks','no muscle','costs no muscle']],
  [4,'vs', ['ten degrees','10 degrees','menisci','meniscus','your knee','our knee',
            'same solution','convergence','twice']],

  [5,'out',['square','cube','double every','doubling','eight times','times eight',
            'geometry','to close','finally','last thing','wrap up']],
  [5,'in', ['three moves','remove','add bone','by choice','not a choice','forced',
            'hundred times lighter','a hundred times']]
];

/* ------------------------------------------------------------------ */
const css = `
.pbtn{font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:2.2px;
  text-transform:uppercase;background:transparent;color:#F2EDE3;
  border:1px solid rgba(242,237,227,.38);padding:8px 13px;cursor:pointer;white-space:nowrap}
.pbtn:hover{border-color:#F2EDE3}
.pbtn.on{background:var(--accent);border-color:var(--accent)}
.band .rgt{display:flex;align-items:center;gap:20px}
#figwrap{position:absolute;inset:14px 0 0 22px;display:none;align-items:center;
  justify-content:center;background:var(--paper);padding:10px 16px 16px}
#figwrap.on{display:flex;animation:figIn .5s ease both}
#figwrap img{max-width:100%;max-height:100%;object-fit:contain;
  box-shadow:0 2px 20px rgba(40,32,20,.13)}
@keyframes figIn{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:none}}
#pbar{display:none;align-items:center;gap:18px;padding-top:9px;color:#F2EDE3}
#pbar.on{display:flex}
#pbar .st{flex:0 0 200px;min-width:0}
#pbar .st .kk{font-size:10px;font-weight:700;letter-spacing:2.4px;
  text-transform:uppercase;color:#8A8270}
#pbar .st .tt{font-family:var(--display);font-weight:700;font-size:20px;
  line-height:1.1;color:#FFF;margin-top:3px}
#pbar .vw{display:flex;gap:6px;flex:0 0 auto}
#pbar .vw b{font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:1.3px;
  text-transform:uppercase;color:#8A8270;border:1px solid #3B352A;padding:8px 12px}
#pbar .vw b.on{background:var(--accent);border-color:var(--accent);color:#FFF}
#pbar .cap{flex:1 1 auto;min-width:0;font-size:17px;line-height:1.35;color:#E6DFCE;
  max-height:46px;overflow:hidden}
#pbar .cap i{font-style:normal;color:#8A8270}
#pbar .nav{display:flex;gap:6px;flex:0 0 auto}
#pbar .nav button{background:transparent;border:1px solid #3B352A;color:#F2EDE3;
  font-family:var(--ui);font-size:10.5px;font-weight:700;letter-spacing:1.5px;
  text-transform:uppercase;padding:9px 13px;cursor:pointer}
#pbar .nav button:hover{border-color:#7E7462}
#pbar .nav button.mic.on{background:#8C2F1B;border-color:#8C2F1B}
#ppips{position:relative;height:26px;margin-top:10px}
#ppips .ax{position:absolute;left:0;right:0;top:13px;height:2px;background:#3B352A}
#ppips .tk{position:absolute;top:8px;width:2px;height:12px;background:#6E6354}
#ppips .lb{position:absolute;top:0;font-size:9.5px;font-weight:700;letter-spacing:1.6px;
  text-transform:uppercase;color:#6E6354;transform:translateX(-50%);white-space:nowrap}
#ppips .you{position:absolute;top:4px;height:20px;border:1.5px solid var(--accent);
  background:rgba(156,59,35,.22);transition:left .5s ease, width .5s ease}

@media (prefers-reduced-motion:reduce){#figwrap.on{animation:none}}
`;
const st = document.createElement('style'); st.textContent = css;
document.head.appendChild(st);

/* ---- markup ------------------------------------------------------- */
const band = document.querySelector('.band');
const r = band.querySelector('.r');
const rgt = document.createElement('div'); rgt.className = 'rgt';
band.replaceChild(rgt, r); rgt.appendChild(r);
const btn = document.createElement('button');
btn.className = 'pbtn'; btn.id = 'pres'; btn.textContent = 'Whole slide';
rgt.appendChild(btn);

const figwrap = document.createElement('div');
figwrap.id = 'figwrap'; figwrap.innerHTML = '<img alt="">';
document.getElementById('stage').appendChild(figwrap);

const foot = document.querySelector('footer');
const wrap = document.createElement('div');
wrap.innerHTML =
  '<div id="pbar">' +
    '<div class="st"><div class="kk" id="pK"></div><div class="tt" id="pT"></div></div>' +
    '<div class="vw"><b data-v="out">Outside</b><b data-v="in">Inside</b><b data-v="vs">Human</b></div>' +
    '<div class="cap" id="pCap"><i>Press Listen, then talk. The slide follows what you say.</i></div>' +
    '<div class="nav">' +
      '<button class="mic" id="pMic">Listen</button>' +
      '<button id="pCopy">Copy talk</button>' +
      '<button id="pWhole">Whole slide</button>' +
      '<button id="pPrev">&#8592;</button><button id="pNext">&#8594;</button>' +
    '</div>' +
  '</div><div id="ppips" style="display:none"></div>';
while (wrap.firstChild) foot.appendChild(wrap.firstChild);

const $ = id => document.getElementById(id);
const rail = $('rail');

/* ---- camera helper: same target, pushed in or swung round ---------- */
function cam(c, scale, dTh, dPh){
  const dx=c[3]-c[0], dy=c[4]-c[1], dz=c[5]-c[2], rr=Math.hypot(dx,dy,dz);
  const th=Math.atan2(dx,dz)+(dTh||0);
  const ph=Math.max(.25, Math.min(1.45, Math.acos(Math.max(-1,Math.min(1,dy/rr)))+(dPh||0)));
  const R=rr*(scale||1);
  return [c[0],c[1],c[2],
          c[0]+R*Math.sin(ph)*Math.sin(th),
          c[1]+R*Math.cos(ph),
          c[2]+R*Math.sin(ph)*Math.cos(th)];
}

/* the comparison shot: aim between the elephant's structure and the same
   part of the human, far enough back that both are in the frame at once */
function both(a){
  const e = a.cam, h = a.humanCam;
  if(!h) return cam(e, 2.10, .05, -.05);
  const tx=(e[0]+h[0])/2, ty=(e[1]+h[1])/2, tz=(e[2]+h[2])/2;
  const gap = Math.hypot(e[0]-h[0], e[1]-h[1], e[2]-h[2]);
  const R = Math.max(5.2, gap*2.25);
  const th = -0.12, ph = 1.30;
  return [tx,ty,tz,
          tx + R*Math.sin(ph)*Math.sin(th),
          ty + R*Math.cos(ph),
          tz + R*Math.sin(ph)*Math.cos(th)];
}

/* ---- state -------------------------------------------------------- */
let on=false, step=0, view=0, rec=null, listening=false, said='';
/* the whole run, kept so it can be copied out afterwards and read back */
let log=[], t0=0;
function stamp(){
  const s=Math.round((Date.now()-t0)/1000);
  return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}

function flat(){ const a=[]; SEQ.forEach((s,i)=>s.views.forEach((v,j)=>a.push([i,j]))); return a; }
const FLAT = flat();
const posOf = (i,j) => FLAT.findIndex(p=>p[0]===i&&p[1]===j);

/* a map of the one canvas: where on the slide the camera is pointing.
   X0..X1 spans the scene, human on the left, elephant across the rest. */
const X0 = -6.4, X1 = 3.0;
const pc = x => ((x - X0) / (X1 - X0)) * 100;
const MARKS = [[-5.05,'Homo sapiens'], [-2.25,'skull'], [-1.42,'foot'],
               [-0.20,'limbs'], [1.66,'knee']];

function pips(){
  const s0 = SEQ[step];
  let lo, hi;
  if(s0.idx===null || s0.idx===10){ lo = 0; hi = 100; }
  else {
    const c = ADAPTS[s0.idx].cam;
    const w = (SEQ[step].views[view]==='vs') ? 2.6 : 1.5;
    lo = Math.max(0, pc(c[0]-w)); hi = Math.min(100, pc(c[0]+w));
  }
  $('ppips').innerHTML =
    '<div class="ax"></div>' +
    MARKS.map(([x,n])=>'<div class="tk" style="left:'+pc(x)+'%"></div>' +
                       '<div class="lb" style="left:'+pc(x)+'%">'+n+'</div>').join('') +
    '<div class="you" style="left:'+lo+'%;width:'+(hi-lo)+'%"></div>';
}

function render(){
  const s = SEQ[step], v = s.views[view];
  $('pK').textContent = s.kicker;
  $('pT').textContent = s.title;
  document.querySelectorAll('#pbar .vw b').forEach(b=>
    b.classList.toggle('on', b.dataset.v===v));

  const showFig = (v==='in' && s.fig);
  figwrap.classList.toggle('on', !!showFig);
  if(showFig) figwrap.querySelector('img').src = s.fig;

  if(s.idx===null){ reset(); }
  else {
    const a = ADAPTS[s.idx], c = a.cam;
    /* the cutaway is the skull's air cells — it means nothing anywhere else */
    const open = (a.id === 'skull');
    if(v==='out')      pick(s.idx,{cam:cam(c,1.85,-.34,-.07), cut:false, lbl:[0,1], inset:false});
    else if(v==='in')  pick(s.idx,{cam:cam(c,0.80,.20,.12),   cut:open,  lbl:[1,2], inset:false});
    else               pick(s.idx,{cam:both(a),               cut:open,  lbl:[2,3], inset:false});
    $('num').textContent = s.num;
  }
  pips();
}

function goTo(i,j){ step=i; view=j; render(); }
function move(d){
  const k = Math.max(0, Math.min(FLAT.length-1, posOf(step,view)+d));
  goTo(FLAT[k][0], FLAT[k][1]);
}

/* ---- speech ------------------------------------------------------- */
function heard(text){
  const t = text.toLowerCase();
  const here = posOf(step,view);
  let best = -1;
  TRIG.forEach(([i,v,words])=>{
    const k = posOf(i, SEQ[i].views.indexOf(v));
    if(k<=here || k<=best) return;
    if(words.some(w=>t.includes(w))) best = k;
  });
  if(best>-1){ goTo(FLAT[best][0], FLAT[best][1]); flash(); }
}

/* a short pulse on the view chip, so he can see the voice was understood */
function flash(){
  const b = document.querySelector('#pbar .vw b.on');
  if(!b) return;
  b.style.transition = 'none'; b.style.boxShadow = '0 0 0 3px rgba(224,116,90,.85)';
  setTimeout(()=>{ b.style.transition='box-shadow .5s ease'; b.style.boxShadow='none'; }, 90);
}

function mic(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ $('pCap').innerHTML = '<i>This browser has no speech recognition. Use the arrow keys.</i>'; return; }
  if(listening){ listening=false; rec && rec.stop(); $('pMic').classList.remove('on');
    $('pMic').textContent='Listen'; return; }
  rec = new SR();
  rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
  rec.onresult = e => {
    let fin='', int='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      const r0=e.results[i];
      if(r0.isFinal) fin += r0[0].transcript; else int += r0[0].transcript;
    }
    if(fin){
      said=(said+' '+fin).slice(-400);
      log.push('['+stamp()+' · '+SEQ[step].kicker+' / '+SEQ[step].views[view]+'] '+fin.trim());
      heard(fin);
    }
    const show=(said+' '+int).trim().slice(-170);
    $('pCap').textContent = show || '…';
    if(int) heard(int);
  };
  rec.onerror = ev => {
    $('pCap').innerHTML = '<i>Microphone: '+ev.error+'. The arrow keys still work.</i>';
    listening=false; $('pMic').classList.remove('on'); $('pMic').textContent='Listen';
  };
  rec.onend = () => { if(listening){ try{ rec.start(); }catch(e){} } };
  try { rec.start(); listening=true; log=[]; t0=Date.now();
        $('pMic').classList.add('on'); $('pMic').textContent='Stop'; }
  catch(e){ $('pCap').innerHTML = '<i>Could not start the microphone.</i>'; }
}

/* ---- enter / leave ------------------------------------------------ */
function enter(){
  on=true; btn.classList.add('on');
  rail.style.display='none';
  $('pbar').classList.add('on'); $('ppips').style.display='flex';
  document.querySelector('.hint').textContent='One slide · ← → moves the camera over it · 0 shows all of it';
  if(typeof resize==='function') resize();
  goTo(0,0);
}


/* a hook for checking the trigger words without a microphone:
   open the console in Present mode and call  sayTest('...the skull...')  */
window.sayTest = t => { heard(String(t).toLowerCase()); return SEQ[step].kicker+' / '+SEQ[step].views[view]; };

btn.onclick   = ()=> goTo(0,0);
$('pNext').onclick = ()=> move(1);
$('pPrev').onclick = ()=> move(-1);
$('pWhole').onclick = ()=> goTo(0,0);
$('pMic').onclick  = mic;

$('pCopy').onclick = async () => {
  if(!log.length){ $('pCap').innerHTML = '<i>Nothing recorded yet — press Listen first.</i>'; return; }
  const text = 'Rehearsal — ' + new Date().toLocaleString() + '\n' +
               'Total ' + stamp() + '\n\n' + log.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    $('pCap').innerHTML = '<i>Copied — ' + log.length + ' lines, ' + stamp() + '. Paste it to Claude.</i>';
  } catch (e) {
    document.getElementById('ptxt')?.remove();
    const box = document.createElement('div');
    box.id = 'ptxt';
    box.style.cssText = 'position:fixed;inset:6% 4%;z-index:99;background:#15120D;' +
      'border:1px solid #3B352A;padding:16px;display:flex;flex-direction:column;gap:10px';
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'flex:1;width:100%;font:13px/1.5 monospace;background:#1E1B16;' +
      'color:#F2EDE3;border:1px solid #3B352A;padding:12px;resize:none';
    const close = document.createElement('button');
    close.textContent = 'Close';
    close.style.cssText = 'align-self:flex-end;background:#9C3B23;color:#fff;border:0;' +
      'font:700 11px/1 sans-serif;letter-spacing:1.5px;text-transform:uppercase;padding:10px 16px;cursor:pointer';
    close.onclick = () => box.remove();
    box.append(ta, close); document.body.appendChild(box); ta.select();
    $('pCap').innerHTML = '<i>Clipboard blocked — select the text and copy it by hand.</i>';
  }
};

addEventListener('keydown', e=>{
  if(!on) return;
  if(e.target.tagName==='BUTTON' && e.code==='Space') return;
  if(e.code==='Space'){ e.preventDefault(); move(1); }
  else if(e.key==='ArrowRight'){ e.stopImmediatePropagation(); move(1); }
  else if(e.key==='ArrowLeft'){ e.stopImmediatePropagation(); move(-1); }
  else if(e.key==='Escape'||e.key==='0'){ goTo(0,0); }
}, true);


/* there is only one mode: the slide, open from the first frame */
enter();

})();
