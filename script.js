/* ============================================================
   SAMED STONES — shared behaviour
   1) Language toggle (AR default, EN alternate) — swaps text via
      data-ar / data-en attributes, flips dir, no persistence
      across pages (kept dependency-free & storage-free).
   2) Mobile nav toggle.
   3) Procedural scroll-scrubbed hero: raw stone with visible
      cracks -> cracks heal & polish -> finished slab installed
      in an office setting. Drawn entirely on <canvas> with noise
      + vein + crack paths so no photography is required yet.
      Swap the drawFrame() body for real photo-frame drawing
      later (see README notes at the bottom of this file).
   ============================================================ */

(function langToggle(){
  const btn = document.querySelector('[data-lang-toggle]');
  const nodes = document.querySelectorAll('[data-ar]');
  function apply(lang){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-ar', lang === 'ar');
    nodes.forEach(el=>{
      const text = lang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
      if(text !== null) el.textContent = text;
    });
    if(btn) btn.textContent = lang === 'ar' ? 'EN' : 'AR';
  }
  let current = 'ar';
  apply(current);
  if(btn){
    btn.addEventListener('click', ()=>{
      current = current === 'ar' ? 'en' : 'ar';
      apply(current);
    });
  }
})();

(function mobileNav(){
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if(!toggle || !links) return;
  toggle.addEventListener('click', ()=>{
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>links.classList.remove('open'));
  });
})();

(function heroTiles(){
  const tiles = document.querySelectorAll('[data-hero-tiles] .hero-tile');
  tiles.forEach(tile=>{
    tile.addEventListener('click', ()=>{
      tiles.forEach(t=>t.classList.remove('active'));
      tile.classList.add('active');
      // TODO once the real fly-through video is in place: seek the
      // <video> element to this room's timestamp, e.g.
      //   video.currentTime = ROOM_TIMESTAMPS[tile.dataset.room];
      console.log('Selected room:', tile.dataset.room);
    });
  });
})();

(function heroAnimation(){
  const wrap = document.querySelector('[data-hero-wrap]');
  const canvas = document.querySelector('[data-hero-canvas]');
  const copy = document.querySelector('[data-hero-copy]');
  if(!wrap || !canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, DPR;

  const TOTAL_FRAMES = 100; // bath 1-40, office 41-70, kitchen 71-100
  const frames = [];
  let loadedCount = 0;
  for(let i=1;i<=TOTAL_FRAMES;i++){
    const img = new Image();
    img.src = `assets/hero-frames/frame_${String(i).padStart(3,'0')}.webp`;
    img.onload = ()=>{ loadedCount++; if(loadedCount===TOTAL_FRAMES) draw(lastProgress); };
    frames.push(img);
  }

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  let lastProgress = 0;
  function draw(progress){
    lastProgress = progress;
    const idx = Math.min(TOTAL_FRAMES-1, Math.max(0, Math.round(progress*(TOTAL_FRAMES-1))));
    const img = frames[idx];
    if(!img || !img.complete || img.naturalWidth === 0) return;
    ctx.clearRect(0,0,W,H);
    // cover-fit draw
    const ir = img.naturalWidth/img.naturalHeight, cr = W/H;
    let dw,dh,dx,dy;
    if(cr > ir){ dw=W; dh=W/ir; dx=0; dy=(H-dh)/2; }
    else { dh=H; dw=H*ir; dy=0; dx=(W-dw)/2; }
    ctx.drawImage(img, dx, dy, dw, dh);
    // subtle dark overlay so the headline stays readable throughout
    ctx.fillStyle = 'rgba(23,21,20,0.28)';
    ctx.fillRect(0,0,W,H);
  }

  resize();
  window.addEventListener('resize', ()=>{ resize(); draw(lastProgress); });

  let ticking = false;
  function update(){
    ticking = false;
    const rect = wrap.getBoundingClientRect();
    const total = wrap.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    let progress = total > 0 ? scrolled/total : 0;
    progress = Math.max(0, Math.min(1, progress));
    draw(progress);
    if(copy) copy.classList.toggle('visible', progress > 0.85);
  }
  function onScroll(){
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion){
    if(copy) copy.classList.add('visible');
  } else {
    window.addEventListener('scroll', onScroll, {passive:true});
    update();
  }
})();

/* --------------------------------------------------------------
   FRAME SOURCE: assets/hero-frames/frame_001.webp ... frame_100.webp
   Frames 1-40   = bathroom clip
   Frames 41-70  = office clip
   Frames 71-100 = kitchen clip
   To swap in a different/longer sequence later, replace the files
   in assets/hero-frames/ and update TOTAL_FRAMES above.
-------------------------------------------------------------- */
