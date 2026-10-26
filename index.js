const PROJECTS = [
  { short: 'Ikorodu Road congestion', year: '2021', org: 'OOU Transportation Research Group', period: '2020 – 2021', title: 'Assessing traffic congestion on Ikorodu Road, Lagos', desc: 'Led a 10-person field team collecting on-site traffic data along a major Lagos arterial, then applied travel time, Speed Performance Index and level-of-service indices to locate bottlenecks and develop congestion alleviation strategies. Published as first author in TARCE (2024).', tags: ['Traffic data', 'SPI', 'LOS'], metric: '10', metricLabel: 'person field team on a major Lagos arterial' },
  { short: '100 km farm road network', year: '2023', org: 'Arup', period: '2023', title: '100 km+ road network for a 20,000-hectare agricultural development', desc: 'Designed the network and automated drawing production with Civil 3D layout tools to cut sheet-generation time, with under 1% rework.', tags: ['Civil 3D', 'Roadway design', 'Automation'], metric: '<1%', metricLabel: 'rework across automated drawing production' },
  { short: 'Enugu–Onitsha Expressway', year: '2023', org: 'Arup', period: '2023', title: 'Enugu–Onitsha Expressway rehabilitation', desc: 'Tracked cost and schedule performance in Microsoft Project, reconciling interim payment certificates and procurement records for two concurrent contractors.', tags: ['Cost control', 'MS Project'], metric: '2', metricLabel: 'concurrent contractors reconciled' },
  { short: 'Plastic paint & Eko-Watts', year: "'23 '24", org: 'Arup LOS Challenge', period: '2023 & 2024', title: 'Winning proposals: plastic-waste paint and Eko-Watts', desc: 'Plastic waste in paint production to diversify the Lagos transport system (2023), and Eko-Watts: powering Lagos transport through community waste-to-power plants (2024). Both won the Look, Observe and Shape Challenge.', tags: ['Innovation', 'Circular economy'], metric: '2×', metricLabel: 'Look, Observe and Shape Challenge winner' },
  { short: 'National Diagnostic Centres', year: '2024', org: 'Arup for NSIA', period: '2024 – 2026', title: 'Civil infrastructure for National Diagnostic Centres', desc: 'Led civil infrastructure design for three of twelve centres for the Nigerian Sovereign Investment Authority, covering roadway design, earthworks, catchment assessment and stormwater drainage.', tags: ['Roadway', 'Earthworks', 'Drainage'], metric: '3/12', metricLabel: 'centres designed' },
  { short: 'Lagos Green Line', year: '2025', org: 'Arup', period: '2024 – 2026', title: 'Lagos Green Line transit corridor due diligence', desc: 'Led the geospatial accessibility analysis within the due-diligence team, running isochrone analysis to identify stations for prioritisation, merging or deferral, and auditing drawings and the Bill of Engineering Measurement and Evaluation for design and cost irregularities.', tags: ['Transit', 'Isochrones', 'GIS'], metric: '$2B', metricLabel: 'transit corridor under review' },
  { short: 'Wildlife crossings', year: '2026', org: 'University Transportation Centre, SC State University', period: '2026 – Present', title: 'Wildlife crossing effectiveness & network connectivity', desc: 'Investigating wildlife crossing effectiveness and habitat/network connectivity across U.S. transportation corridors using spatial and traffic safety data.', tags: ['Safety', 'Spatial data', 'FARS · HSIS'], metric: 'U.S.', metricLabel: 'corridor-scale safety analysis' },
  { short: 'SCSU Game Day parking', year: '2026', org: 'South Carolina State University', period: '2026', title: 'SCSU Game Day parking design', desc: 'We designed two lots to accommodate game-day traffic demand despite the reduced parking supply caused by new hostel and building developments on campus.', tags: ['Parking design', 'Campus mobility', 'Demand'], metric: '2', metricLabel: 'parking lots designed for game-day demand', link: 'https://drive.google.com/file/d/1oJgt0lncnddICCxIELD7hssVUkPxwirm/view?usp=sharing', linkLabel: 'Design document' },
  { short: 'Traffic safety pitch', year: '2026', org: 'ITE × CBB · NOCoE × AASHTO', period: 'July 2026', title: 'Traffic safety innovation, on stage', desc: '1st Runner Prize at the ITE × CBB 3M Pitch for traffic safety innovation, and team lead of a finalist team in the NOCoE × AASHTO Transportation Technology Tournament 2026.', tags: ['Pitch', 'ConOps', 'TSMO'], metric: '1st', metricLabel: 'Runner Prize, ITE × CBB 3M Pitch' },
];

const ACCENT = '#EEBC5A';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const site = document.getElementById('site');
  const $ = (sel, el = document) => el.querySelector(sel);
  const pad2 = (n) => String(n).padStart(2, '0');

  // ---------- Theme ----------
  // Follows the visitor's local time (light 6am–6pm, dark otherwise). Toggling
  // overrides it for this visit only; nothing is saved between visits.
  let themeOverride = null;
  const timeTheme = () => { const h = new Date().getHours(); return h >= 6 && h < 18 ? 'light' : 'dark'; };
  const applyTheme = () => root.setAttribute('data-theme', themeOverride || timeTheme());
  document.querySelectorAll('[data-theme-toggle]').forEach(el => el.addEventListener('click', () => {
    themeOverride = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme();
  }));
  // Switch over at 6am/6pm if the page is left open.
  setInterval(applyTheme, 60 * 1000);
  // Earlier versions of the site saved the visitor's choice, which pinned the theme; clear it.
  try { localStorage.removeItem('krb-portfolio-theme'); } catch {}

  // ---------- Mobile menu ----------
  const burger = $('.burger');
  const menu = $('.mobile-menu');
  const burgerPath = $('path', burger);
  function setMenu(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burgerPath.setAttribute('d', open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16');
  }
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // ---------- Project line ----------
  const line = $('.line');
  const stations = PROJECTS.map((p, k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'station';
    b.innerHTML = '<span class="station-year"></span><span class="station-dot"></span><span class="station-name"></span>';
    $('.station-year', b).textContent = p.year;
    $('.station-name', b).textContent = p.short;
    b.addEventListener('click', () => showProject(k));
    line.append(b);
    return b;
  });
  let proj = 0;
  function showProject(k) {
    const n = PROJECTS.length;
    proj = (k + n) % n;
    const p = PROJECTS[proj];
    stations.forEach((s, i) => {
      s.classList.toggle('passed', i <= proj);
      s.classList.toggle('current', i === proj);
    });
    $('.line-fill').style.width = `${(proj / (n - 1)) * 88.889}%`;
    $('.proj-period').textContent = p.period;
    $('.proj-org').textContent = p.org;
    $('.proj-title').textContent = p.title;
    $('.proj-desc').textContent = p.desc;
    $('.proj-tags').replaceChildren(...p.tags.map(t => Object.assign(document.createElement('span'), { textContent: t })));
    const link = $('.proj-link');
    link.hidden = !p.link;
    if (p.link) { link.href = p.link; link.textContent = `${p.linkLabel} ↗`; }
    $('.proj-metric').textContent = p.metric;
    $('.proj-metric-label').textContent = p.metricLabel;
    $('.proj-count').textContent = `${pad2(proj + 1)} / ${pad2(n)}`;
  }
  $('.proj-prev').addEventListener('click', () => showProject(proj - 1));
  $('.proj-next').addEventListener('click', () => showProject(proj + 1));
  showProject(0);

  // ---------- Gallery strips + lightbox ----------
  const photos = Array.isArray(window.__GALLERY_IMAGES) ? window.__GALLERY_IMAGES : [];
  const strips = $('.strips');
  const lightbox = $('.lightbox');
  const lbImg = $('img', lightbox);
  let lb = -1;
  let galleryRows = -1;

  function buildGallery() {
    const rows = innerWidth < 700 || photos.length < 9 ? 2 : 3;
    if (rows === galleryRows) return;
    galleryRows = rows;
    const widths = [300, 220, 360, 260, 200, 320, 240, 280];
    strips.replaceChildren();
    for (let r = 0; r < rows; r++) {
      const items = photos.map((src, k) => ({ src, k })).filter(p => p.k % rows === r);
      const mask = document.createElement('div');
      mask.className = 'strip-mask';
      const strip = document.createElement('div');
      strip.className = 'strip';
      strip.style.animation = `${r % 2 ? 'stripR' : 'stripL'} ${Math.max(70, items.length * 16)}s linear infinite`;
      // Each row is doubled so the -50% loop is seamless; the copy is hidden from assistive tech.
      items.concat(items).forEach((p, j) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'photo';
        b.style.width = widths[(p.k + r * 3) % widths.length] + 'px';
        b.setAttribute('aria-label', `Open photo ${p.k + 1}`);
        if (j >= items.length) { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
        const img = document.createElement('img');
        img.src = p.src; img.alt = ''; img.loading = 'lazy'; img.draggable = false;
        b.append(img);
        b.addEventListener('click', () => openLb(p.k));
        strip.append(b);
      });
      mask.append(strip);
      strips.append(mask);
    }
  }
  const stripBtn = $('.strip-toggle');
  stripBtn.addEventListener('click', () => {
    const paused = strips.classList.toggle('paused');
    stripBtn.textContent = paused ? '▶' : '❚❚';
  });

  function openLb(k) {
    const n = photos.length;
    lb = (k + n) % n;
    lbImg.src = photos[lb];
    $('.lb-label', lightbox).textContent = `${pad2(lb + 1)} / ${pad2(n)}`;
    lightbox.hidden = false;
  }
  function closeLb() { lb = -1; lightbox.hidden = true; }
  lightbox.addEventListener('click', closeLb);
  $('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); openLb(lb - 1); });
  $('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); openLb(lb + 1); });
  addEventListener('keydown', (e) => {
    if (lb < 0) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') openLb(lb + 1);
    if (e.key === 'ArrowLeft') openLb(lb - 1);
  });
  buildGallery();

  // ---------- Scroll train ----------
  // A track runs down the right edge from the hero to the contact row; a three-car
  // train follows the scroll position and lights up a station at each section.
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a) => { const el = document.createElementNS(NS, t); for (const k in a) el.setAttribute(k, a[k]); return el; };
  const SK = 'stroke:var(--sk)';
  let trackHost = null;
  let trk = null;
  let raf = 0;

  function buildTrack() {
    // offsetHeight, not scrollHeight: scrollHeight includes the track layer itself,
    // so the page could never shrink back once it had grown (e.g. after closing <details>).
    const W = site.clientWidth, H = site.offsetHeight;
    if (!W || !H) return;
    if (!trackHost) {
      trackHost = document.createElement('div');
      trackHost.style.cssText = 'position:absolute;left:0;top:0;width:100%;pointer-events:none;z-index:5';
      trackHost.setAttribute('aria-hidden', 'true');
      site.append(trackHost);
    }
    trackHost.style.height = H + 'px';
    const secs = [...site.querySelectorAll(':scope > section')];
    if (secs.length < 3) return;

    const xR = W < 760 ? W - 12 : W - Math.max(14, ((W - 1200) / 2) * 0.42);
    const rTop = site.getBoundingClientRect().top, row = site.querySelector('[data-track-row]');
    let yRow = H - 200, xEnd = xR - 200;
    if (row && W < 760) {
      // On phones the buttons wrap, so turn left just below them and stop near the left edge,
      // well clear of the footer.
      const rr = row.getBoundingClientRect();
      yRow = (rr.bottom - rTop) + 32;
      xEnd = rr.left - site.getBoundingClientRect().left + 24;
    } else if (row) {
      const last = row.lastElementChild.getBoundingClientRect(), rr = row.getBoundingClientRect();
      yRow = (rr.bottom - rTop) - last.height / 2;
      xEnd = last.right + 40;
    }
    if (xEnd > xR - 80) xEnd = xR - 80;
    const y0 = secs[0].offsetHeight + 8, rad = 48;
    const d = `M${xR} ${y0} L${xR} ${yRow - rad} Q${xR} ${yRow} ${xR - rad} ${yRow} L${xEnd} ${yRow}`;
    const st = secs.slice(1).map(s => [xR, s.offsetTop]);

    trackHost.innerHTML = '';
    const svg = mk('svg', { width: W, height: H, style: 'position:absolute;left:0;top:0;overflow:visible' });
    svg.append(mk('path', { d, fill: 'none', style: SK, 'stroke-width': 20, 'stroke-dasharray': '2 7', opacity: .16 }));
    [-5, 5].forEach(o => svg.append(mk('path', { d, transform: `translate(${o} 0)`, fill: 'none', style: SK, 'stroke-width': 1.2, opacity: .32 })));
    const prog = mk('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: .9 });
    svg.append(prog);
    const dots = st.map(([sx, sy]) => {
      const c = mk('circle', { cx: sx, cy: sy, r: 5, style: 'fill:var(--bg);stroke:var(--sk);transition:fill .3s', 'stroke-width': 1.5 });
      svg.append(c);
      return c;
    });

    const car = (kind) => {
      const g = mk('g', {}), inner = mk('g', kind === 'tail' ? { transform: 'scale(-1 1)' } : {});
      g.append(inner);
      const add = (t, a) => inner.append(mk(t, a));
      const body = kind === 'mid' ? 'M-24 -7 H24 V7 H-24 Z' : 'M-24 -7 H8 Q23 -7 25 0 Q23 7 8 7 H-24 Z';
      add('path', { d: body, style: 'fill:var(--bg);' + SK, 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
      add('path', { d: kind === 'mid' ? 'M-22 -4.5 H22 M-22 4.5 H22' : 'M-22 -4.5 H8 M-22 4.5 H8', fill: 'none', style: SK, 'stroke-width': .7, opacity: .7 });
      if (kind === 'mid') {
        add('path', { d: 'M-6 0 L0 -4 L6 0 L0 4 Z M-6 0 H6', fill: 'none', style: SK, 'stroke-width': .9 });
        add('rect', { x: -19, y: -2, width: 7, height: 4, rx: 1, fill: 'none', style: SK, 'stroke-width': .8 });
        add('rect', { x: 12, y: -2, width: 7, height: 4, rx: 1, fill: 'none', style: SK, 'stroke-width': .8 });
      } else {
        add('path', { d: 'M12 -5.6 Q20 -4.5 21.6 0 Q20 4.5 12 5.6 Z', fill: ACCENT, opacity: .85, style: SK, 'stroke-width': .8 });
        add('rect', { x: -18, y: -2, width: 8, height: 4, rx: 1, fill: 'none', style: SK, 'stroke-width': .8 });
        add('rect', { x: -6, y: -2, width: 8, height: 4, rx: 1, fill: 'none', style: SK, 'stroke-width': .8 });
        add('circle', { cx: 23.5, cy: -3, r: 1, fill: '#fff6d8' });
        add('circle', { cx: 23.5, cy: 3, r: 1, fill: '#fff6d8' });
      }
      add('rect', { x: -27, y: -4, width: 3, height: 8, style: 'fill:var(--bg);' + SK, 'stroke-width': 1 });
      svg.append(g);
      return g;
    };
    const cars = [car('head'), car('mid'), car('tail')];
    trackHost.append(svg);

    // Sample the path so scroll position can be mapped to a distance along it.
    const len = prog.getTotalLength(), ys = [], step = 6;
    let lc = -1;
    for (let l = 0; l <= len; l += step) {
      const p = prog.getPointAtLength(l);
      if (lc < 0 && p.y >= yRow - 0.5) lc = l;
      ys.push(lc < 0 ? p.y : yRow + (l - lc));
    }
    svg.append(mk('path', { d: `M${xEnd} ${yRow - 11} V${yRow + 11} M${xEnd - 5} ${yRow - 11} V${yRow + 11}`, fill: 'none', style: SK, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    prog.setAttribute('stroke-dasharray', `${len} ${len}`);
    const stL = st.map(([, sy]) => { let i = 0; while (i < ys.length - 1 && ys[i] < sy) i++; return i * step; });
    trk = { prog, cars, dots, len, ys, step, stL, cur: trk ? trk.cur : 0, goal: 0, top: rTop + scrollY };
    trackTick(true);
  }

  function trackTick(force) {
    const t = trk;
    if (!t) return;
    const maxS = Math.max(1, root.scrollHeight - innerHeight), vEnd = t.ys[t.ys.length - 1];
    let target = scrollY + innerHeight * .62 - t.top;
    // Near the bottom, stretch the remaining scroll so the train still reaches the buffer stop.
    const tail = Math.max(0, scrollY - (maxS - innerHeight)) / innerHeight;
    const need = vEnd - (maxS + innerHeight * .62 - t.top);
    if (need > 0) target += Math.min(1, tail) * need;
    let lo = 0, hi = t.ys.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (t.ys[m] < target) lo = m + 1; else hi = m; }
    t.goal = Math.min(t.len - 26, Math.max(104, lo * t.step));
    if (force) t.cur = t.goal;
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function loop() {
    raf = 0;
    const t = trk;
    if (!t) return;
    t.cur += (t.goal - t.cur) * .14;
    if (Math.abs(t.goal - t.cur) < .3) t.cur = t.goal;
    t.prog.setAttribute('stroke-dashoffset', t.len - t.cur);
    t.cars.forEach((g, i) => {
      const L = Math.max(0, t.cur - i * 51);
      const p = t.prog.getPointAtLength(L), q = t.prog.getPointAtLength(Math.min(t.len, L + 2)), o = t.prog.getPointAtLength(Math.max(0, L - 2));
      g.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${Math.atan2(q.y - o.y, q.x - o.x) * 180 / Math.PI})`);
    });
    t.dots.forEach((c, i) => { c.style.fill = t.cur >= t.stL[i] - 2 ? ACCENT : 'var(--bg)'; });
    if (t.cur !== t.goal) raf = requestAnimationFrame(loop);
  }

  // ---------- Parallax + layout tracking ----------
  addEventListener('scroll', () => { root.style.setProperty('--sy', Math.min(scrollY, 900)); trackTick(); }, { passive: true });
  addEventListener('pointermove', (e) => root.style.setProperty('--mx', ((e.clientX / innerWidth) - .5).toFixed(3)));

  // Rebuild the track whenever the page size changes (resize, fonts, lazy images, <details>).
  let lastSig = '', rt = 0;
  const remeasure = () => {
    const sig = site.clientWidth + 'x' + site.offsetHeight;
    if (sig === lastSig) return;
    lastSig = sig;
    buildGallery();
    buildTrack();
  };
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(remeasure, 120); }).observe(site);
  remeasure();
});
