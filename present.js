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
  { num: '05', idx: 10,   kicker: 'Structure 05', title: 'Bone holds, muscle moves', views: ['out','in','vs'] },
  { num: '—',  idx: 11,   kicker: 'Close',        title: 'Why size forces it', views: ['out','in'],    fig: 'fig/scale.jpg' }
];

/* words that jump the talk forward. Only ever forward, never back, so a
   word said in passing cannot drag the slide backwards mid-sentence. */
const TRIG = [
  [1,'out',['skull','cranium','the head','start with','starting with','start off',
            'first structure','begin with',
            'school','scull','skulls','the school','cranium of','crane him','granium']],
  [1,'in', ['pneumatised','pneumatized','newmatised','air cell','air cells','bony plate',
            'bony plates','thin plates','attachment','anchor','anchors','tusks','trunk muscles',
            'small brain','enormous','inside',
            'newmatized','numatised','pneumatic','air sells','boney plates','thin plate']],
  [1,'vs', ['five kilo','5 kilo','five kilograms','solid plate','your skull','balanced',
            'on top of a vertical','almost all the volume','our skull','our school']],

  [2,'out',['columnar','column','limbs','four legs','the legs','second structure',
            'straight legs','vertical columns',
            'columna','colonel','column are','limbs are','limps','lambs','the limbs']],
  [2,'in', ['compression','not bending','trabecular','marrow','packed','filled','crush',
            'crushing','inside the bone','cross-section','cross section',
            'trabecula','tribecular','trebecular','the marrow','mero','compressed']],
  [2,'vs', ['spring','bent leg','hollow tube','running and jumping','elastic',
            'store and return','your femur','our femur','femur is','a spring']],

  [3,'out',['the foot','foot','feet','no bone touches','third structure','on tiptoe',
            'tiptoe','walks on','food','the food','digitigrade','digiti grade','digit grade']],
  [3,'in', ['cushion','collagen','chambers','pressure','divided by area','force divided',
            'fat pad','the fat','spreads','increase the area','sole',
            'caution','collagen and','digital cushion','predigit','pre digit','sixth toe','prepollex']],
  [3,'vs', ['heel','calcaneus','thin pad','your foot','our foot','strikes the ground','your heel','land on your']],

  [4,'out',['the knee','knee','fourth structure','last structure','joint','one eighty',
            '180','nearly straight','need','the need','nee','knees','tibia','femur and']],
  [4,'in', ['screw-home','screw home','screwhome','sixteen','locks straight','locking',
            'it locks','no muscle','costs no muscle',
            'screw hole','screwed home','skrew home','rotates','tibia rotates']],
  [4,'vs', ['ten degrees','10 degrees','menisci','meniscus','your knee','our knee',
            'same solution','convergence','twice',
            'meniski','my niski','ten degree','16 degrees','not close relatives']],

  [5,'out',['muscle','muscles','muscular','now the muscle','fifth','bone holds',
            'holds the animal','what about muscle','soft tissue','mussel','mussels','muscle now','the muscle']],
  [5,'in', ['tendon','tendons','high at the shoulder','at the hip','mass held high',
            'nuchal','ligament','carries the head','only move','moves the limb',
            'nucal','new chal','new shell','nuke al','bellies','belly','shoulder and hip']],
  [5,'vs', ['calf','your calf','our calf','low on the leg','bent knee','antagonistic',
            'antagonistic pairs','achilles','calves','half low','antagonist','a kill ease']],

  [6,'out',['square','cube','double every','doubling','eight times','times eight',
            'geometry','to close','finally','last thing','wrap up']],
  [6,'in', ['three moves','remove','add bone','by choice','not a choice','forced',
            'hundred times lighter','a hundred times']]
];

/* ------------------------------------------------------------------ */
const css = `
#pbar{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);
  max-width:min(74%,980px);padding:11px 26px;border-radius:5px;
  background:rgba(26,24,20,.86);pointer-events:none;opacity:0;
  transition:opacity .25s ease;z-index:6}
#pbar.show{opacity:1}
#pbar .cap{font-size:20px;line-height:1.32;color:#F4F0E7;text-align:center;
  max-height:56px;overflow:hidden}
#pbar .cap i{font-style:normal;color:#9A9382;font-size:15px}
`;
const st = document.createElement('style'); st.textContent = css;
document.head.appendChild(st);

/* ---- markup ------------------------------------------------------- */

const bar = document.createElement('div');
bar.id = 'pbar';
bar.innerHTML = '<div class="cap" id="pCap"></div>';
document.getElementById('stage').appendChild(bar);

const $ = id => document.getElementById(id);

/* the caption shows itself only while there is something to read */
function say(html){
  const c = $('pCap'), b = $('pbar');
  c.innerHTML = html || '';
  b.classList.toggle('show', !!html);
}

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

/* ---- the diagrams, standing in the scene as exhibition boards ------
   They are part of the one canvas: visible in the wide view, and reached
   by flying the camera to them, never by covering the screen.          */
const BOARDS = [
  { fig:'fig/limbs.jpg', x:-6.30 },
  { fig:'fig/foot.jpg',  x:-2.80 },
  { fig:'fig/knee.jpg',  x: 0.70 },
  { fig:'fig/scale.jpg', x: 4.20 }
];
const BW = 2.60, BH = 1.37, BY = 3.70, BZ = -7.30;
const boardOf = {};
(function buildBoards(){
  if(typeof THREE==='undefined' || typeof scene==='undefined') return;
  const load = new THREE.TextureLoader();
  BOARDS.forEach(b=>{
    const tex = load.load(b.fig);
    if('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
    else tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
    const g = new THREE.Group();
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(BW+0.11, BH+0.11),
      new THREE.MeshBasicMaterial({ color:0x15120D }));
    back.position.z = -0.012;
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(BW, BH),
      new THREE.MeshBasicMaterial({ map:tex }));
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035,0.035, BY-BH/2, 10),
      new THREE.MeshBasicMaterial({ color:0x2A241B }));
    leg.position.set(0, -(BY)/2 - BH/4 + 0.02, -0.02);
    g.add(back, face, leg);
    g.position.set(b.x, BY, BZ);
    scene.add(g);
    boardOf[b.fig] = g;
  });
})();
/* the school crest on the back wall: the front face carries the artwork,
   and a stack of silhouettes behind it gives the badge real thickness */

function boardCam(fig){
  const b = BOARDS.find(x=>x.fig===fig);
  return [b.x, BY, BZ,  b.x, BY + 0.05, BZ + 3.05];
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

function pips(){ if(!$('ppips')) return;
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

  const onBoard = (v==='in' && s.fig);

  if(s.idx===null){ window.FLATVIEW=false; reset(); }
  else {
    const a = ADAPTS[s.idx], c = a.cam;
    /* the cutaway is the skull's air cells — it means nothing anywhere else */
    const open = (a.id === 'skull');
    window.FLATVIEW = !!onBoard;
    if(v==='out')      pick(s.idx,{cam:cam(c,1.85,-.34,-.07), cut:false, lbl:[0,1], inset:false});
    else if(v==='in')  pick(s.idx,{cam: onBoard ? boardCam(s.fig) : cam(c,0.80,.20,.12),
                                   cut:open, lbl: onBoard ? [] : [1,2], inset:false});
    else               pick(s.idx,{cam:both(a),               cut:open,  lbl:[2,3], inset:false});
    if(!window.ONE) $('num').textContent = s.num;
  }

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
/* a brief glow on the caption, so he can see the voice was understood */
function flash(){
  const c = $('pCap'); if(!c) return;
  c.style.transition = 'none'; c.style.color = '#E0745A';
  setTimeout(()=>{ c.style.transition='color .6s ease'; c.style.color=''; }, 90);
}

function mic(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ say('<i>This browser has no speech recognition. Use the arrow keys.</i>'); return; }
  if(listening){ listening=false; rec && rec.stop(); say(''); return; }
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
    say(show);
    if(int) heard(int);
  };
  rec.onerror = ev => {
    say('<i>Microphone: '+ev.error+' — press L to try again. The arrow keys still work.</i>');
    listening = false; armed = false;
  };
  rec.onend = () => { if(listening){ try{ rec.start(); }catch(e){} } };
  try { rec.start(); listening=true; log=[]; t0=Date.now();
      }
  catch(e){ listening = false; }   /* no microphone here: the keys still work */
}

/* ---- enter / leave ------------------------------------------------ */
function enter(){
  on=true;
    document.querySelector('.hint').textContent='← → camera · 0 all · F full screen · L listen';
  if(typeof resize==='function') resize();
  goTo(0,0);
}


/* a hook for checking the trigger words without a microphone:
   open the console in Present mode and call  sayTest('...the skull...')  */
window.sayTest = t => { heard(String(t).toLowerCase()); return SEQ[step].kicker+' / '+SEQ[step].views[view]; };







const copyTalk = async () => {
  if(!log.length){ say('<i>Nothing recorded yet — press Listen first.</i>'); return; }
  const text = 'Rehearsal — ' + new Date().toLocaleString() + '\n' +
               'Total ' + stamp() + '\n\n' + log.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    say('<i>Copied — ' + log.length + ' lines, ' + stamp() + '. Paste it to Claude.</i>');
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
    say('<i>Clipboard blocked — select the text and copy it by hand.</i>');
  }
};

let armed = false;
function armMic(){ if(armed || listening) return; armed = true; try{ mic(); }catch(e){} }
/* a failed microphone must be retriable: a browser that refused once
   because there was no gesture yet will say yes after a click         */
function retryMic(){ armed = false; listening = false; try{ mic(); }catch(e){} }

addEventListener('keydown', e=>{
  if(!on) return;
  armMic();
  if(e.key==='f'||e.key==='F'){
    e.preventDefault();
    if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
    return;
  }
  if(e.key==='l'||e.key==='L'){ e.preventDefault(); retryMic();
    say('<i>Listening…</i>'); return; }
  if(e.key==='c'||e.key==='C'){ e.preventDefault(); copyTalk(); return; }
  if(e.target.tagName==='BUTTON' && e.code==='Space') return;
  if(e.code==='Space'){ e.preventDefault(); move(1); }
  else if(e.key==='ArrowRight'){ e.stopImmediatePropagation(); move(1); }
  else if(e.key==='ArrowLeft'){ e.stopImmediatePropagation(); move(-1); }
  else if(e.key==='Escape'||e.key==='0'){ goTo(0,0); }
}, true);


/* there is only one mode: the slide, open from the first frame */
enter();
/* try the microphone straight away; browsers that want a gesture first
   get one from the first key press or click */
setTimeout(()=>{ try{ mic(); }catch(e){} }, 600);
addEventListener('pointerdown', armMic, true);

})();
