document.addEventListener('DOMContentLoaded', () => {
  // container that holds the scrollable sections
  const container = document.querySelector('.container') || document.documentElement;
  const body = document.body;
  const siteLogo = document.getElementById('site-logo');
  const themeToggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  const themeStorageKey = 'krb-portfolio-theme';
  const themeMeta = {
    dark: {
      toggleIcon: 'images/icons/light.svg',
      ariaLabel: 'Switch to light theme'
    },
    light: {
      toggleIcon: 'images/icons/dark.svg',
      ariaLabel: 'Switch to dark theme'
    }
  };

  // all sections in document order (only those with an id)
  const sectionEls = Array.from(container.querySelectorAll('.section')).filter(s => s.id);
  const sections = sectionEls.map(s => s.id);
  const sectionLabels = new Map(
    sectionEls.map(section => [section.id, section.dataset.label || prettyLabel(section.id)])
  );

  // Desktop nav links (the ones that should show the "active" state)
  const desktopNavLinks = Array.from(document.querySelectorAll('.nav-links a'));

  // Mobile menu links (optional: we also toggle active class here for parity)
  const mobileMenuLinks = Array.from(document.querySelectorAll('.mobile-menu a'));

  // all internal anchors (href starting with '#')
  const internalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

  // Next button in your HTML (bottom-bar)
  const nextAnchor = document.querySelector('.bottom-bar .next-section a');
  const nextLabel = document.getElementById('next-label');
  const galleryMarquee = document.querySelector('.gallery-marquee');
  const galleryTrack = document.getElementById('gallery-track');
  const galleryPattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let galleryAnimationFrame = 0;
  let galleryLastTimestamp = 0;
  let galleryOffset = 0;
  let galleryPaused = false;

  // Sections that should map to the "About" menu link
  const aboutAliases = new Set(['education-training', 'experience']);

  function readSavedTheme() {
    try {
      const savedTheme = window.localStorage.getItem(themeStorageKey);
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
    } catch {
      return null;
    }
  }

  function persistTheme(theme) {
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Ignore storage failures in restricted browser contexts.
    }
  }

  function applyTheme(theme) {
    const activeTheme = theme === 'light' ? 'light' : 'dark';
    const toggleState = themeMeta[activeTheme];

    body.dataset.theme = activeTheme;
    persistTheme(activeTheme);

    if (siteLogo) {
      const nextLogo = activeTheme === 'light' ? siteLogo.dataset.lightLogo : siteLogo.dataset.darkLogo;
      if (nextLogo) siteLogo.src = nextLogo;
    }

    themeToggles.forEach(button => {
      const icon = button.querySelector('[data-theme-icon]');

      button.setAttribute('aria-label', toggleState.ariaLabel);
      if (icon) icon.src = toggleState.toggleIcon;
    });
  }

  function toggleTheme() {
    const nextTheme = body.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  }

  function clearActiveNav() {
    desktopNavLinks.forEach(a => a.classList.remove('active'));
    mobileMenuLinks.forEach(a => a.classList.remove('active'));
  }

  function setActiveNavFor(sectionId) {
    clearActiveNav();
    // per your request: when on gallery, none of the main links are active
    if (sectionId === 'gallery') return;

    const menuTarget = aboutAliases.has(sectionId) ? 'about' : sectionId;
    const desktopSelector = `.nav-links a[href="#${menuTarget}"]`;
    const mobileSelector  = `.mobile-menu a[href="#${menuTarget}"]`;

    const desktopLink = document.querySelector(desktopSelector);
    if (desktopLink) desktopLink.classList.add('active');

    const mobileLink = document.querySelector(mobileSelector);
    if (mobileLink) mobileLink.classList.add('active');
  }

  function prettyLabel(id) {
    return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function updateNextButton(currentId) {
    if (!nextAnchor) return;
    const idx = sections.indexOf(currentId);
    if (idx === -1 || idx === sections.length - 1) {
      // last section (gallery) -> hide next
      nextAnchor.style.display = 'none';
      return;
    }
    const nextId = sections[idx + 1];
    nextAnchor.style.display = 'inline-flex';
    nextAnchor.setAttribute('href', `#${nextId}`);
    if (nextLabel) nextLabel.textContent = sectionLabels.get(nextId) || prettyLabel(nextId);
  }

  function uniqueUrls(urls) {
    return [...new Set(urls)].sort((left, right) => left.localeCompare(right));
  }

  function loadInlineGalleryImages() {
    if (!Array.isArray(window.__GALLERY_IMAGES)) return [];

    return window.__GALLERY_IMAGES
      .filter(item => typeof item === 'string' && galleryPattern.test(item))
      .map(item => new URL(item, window.location.href).href);
  }

  async function loadManifestGalleryImages() {
    try {
      const response = await fetch('images/Gallery/gallery-manifest.json', { cache: 'no-store' });
      if (!response.ok) return [];
      const items = await response.json();
      return Array.isArray(items)
        ? items
            .filter(item => typeof item === 'string' && galleryPattern.test(item))
            .map(item => new URL(item, window.location.href).href)
        : [];
    } catch {
      return [];
    }
  }

  async function loadDirectoryGalleryImages() {
    try {
      const directoryUrl = new URL('images/Gallery/', window.location.href);
      const response = await fetch(directoryUrl, { cache: 'no-store' });
      if (!response.ok) return [];
      const markup = await response.text();
      if (!markup.includes('<a')) return [];

      const doc = new DOMParser().parseFromString(markup, 'text/html');
      const imageUrls = Array.from(doc.querySelectorAll('a[href]'))
        .map(link => link.getAttribute('href'))
        .filter(Boolean)
        .map(href => new URL(href, directoryUrl).href)
        .filter(url => url.startsWith(directoryUrl.href) && galleryPattern.test(url));

      return imageUrls;
    } catch {
      return [];
    }
  }

  function buildGallerySet(imageUrls) {
    const set = document.createElement('div');
    set.className = 'gallery-set';
    const marqueeWidth = galleryMarquee?.clientWidth || window.innerWidth || 0;
    const columnCount = Math.min(
      imageUrls.length,
      Math.max(3, Math.ceil(marqueeWidth / 220) + 1)
    );

    const columns = Array.from({ length: columnCount }, () => {
      const column = document.createElement('div');
      column.className = 'gallery-column';
      set.appendChild(column);
      return column;
    });

    imageUrls.forEach((src, index) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-card';

      const image = document.createElement('img');
      image.src = src;
      image.alt = `Gallery highlight ${String(index + 1).padStart(2, '0')}`;
      image.loading = 'eager';
      image.decoding = 'async';

      figure.appendChild(image);
      columns[index % columns.length].appendChild(figure);
    });

    return set;
  }

  function getGalleryColumns() {
    const gallerySet = galleryTrack?.querySelector('.gallery-set');
    if (!gallerySet) return [];

    return Array.from(gallerySet.children).filter(node => node instanceof HTMLElement);
  }

  function applyGalleryOffset() {
    if (!galleryTrack) return;
    galleryTrack.style.transform = `translate3d(${-galleryOffset}px, 0, 0)`;
  }

  function getGallerySpeed() {
    if (!galleryTrack) return 0;
    const cycleWidth = galleryTrack.scrollWidth;
    return cycleWidth > 0 ? cycleWidth / 48 : 18;
  }

  function recycleGalleryColumns() {
    const gallerySet = galleryTrack?.querySelector('.gallery-set');
    if (!gallerySet) return;

    const gap = parseFloat(window.getComputedStyle(gallerySet).gap) || 0;
    const columns = getGalleryColumns();
    let firstColumn = columns[0];

    while (firstColumn) {
      const moveDistance = firstColumn.getBoundingClientRect().width + gap;
      if (galleryOffset < moveDistance) break;

      gallerySet.appendChild(firstColumn);
      galleryOffset -= moveDistance;
      firstColumn = getGalleryColumns()[0];
    }

    applyGalleryOffset();
  }

  function stopGalleryLoop() {
    if (!galleryAnimationFrame) return;
    window.cancelAnimationFrame(galleryAnimationFrame);
    galleryAnimationFrame = 0;
  }

  function runGalleryLoop(timestamp) {
    if (!galleryTrack) return;

    if (!galleryLastTimestamp) {
      galleryLastTimestamp = timestamp;
    }

    const deltaSeconds = (timestamp - galleryLastTimestamp) / 1000;
    galleryLastTimestamp = timestamp;

    if (!galleryPaused && !reducedMotionQuery.matches) {
      galleryOffset += getGallerySpeed() * deltaSeconds;
      recycleGalleryColumns();
    }

    galleryAnimationFrame = window.requestAnimationFrame(runGalleryLoop);
  }

  function startGalleryLoop() {
    if (!galleryTrack || reducedMotionQuery.matches) return;
    stopGalleryLoop();
    galleryLastTimestamp = 0;
    galleryAnimationFrame = window.requestAnimationFrame(runGalleryLoop);
  }

  function syncGalleryOnResize() {
    recycleGalleryColumns();
  }

  function syncGalleryMotionPreference() {
    if (reducedMotionQuery.matches) {
      stopGalleryLoop();
      galleryOffset = 0;
      applyGalleryOffset();
      return;
    }

    startGalleryLoop();
  }

  async function initGallery() {
    if (!galleryTrack) return;

    const imageUrls = uniqueUrls([
      ...loadInlineGalleryImages(),
      ...(await loadDirectoryGalleryImages()),
      ...(await loadManifestGalleryImages())
    ]);

    if (!imageUrls.length) {
      galleryTrack.parentElement?.setAttribute('hidden', 'hidden');
      return;
    }

    galleryTrack.parentElement?.removeAttribute('hidden');
    galleryTrack.replaceChildren(buildGallerySet(imageUrls));

    const images = Array.from(galleryTrack.querySelectorAll('img'));
    let pending = images.length;

    if (!pending) {
      galleryOffset = 0;
      applyGalleryOffset();
      startGalleryLoop();
      return;
    }

    const onAssetReady = () => {
      pending -= 1;
      if (pending <= 0) {
        galleryOffset = 0;
        applyGalleryOffset();
        startGalleryLoop();
      }
    };

    images.forEach(image => {
      if (image.complete) {
        onAssetReady();
        return;
      }

      image.addEventListener('load', onAssetReady, { once: true });
      image.addEventListener('error', onAssetReady, { once: true });
    });

    galleryMarquee?.addEventListener('pointerenter', () => {
      galleryPaused = true;
    });

    galleryMarquee?.addEventListener('pointerleave', () => {
      galleryPaused = false;
    });

    window.addEventListener('resize', syncGalleryOnResize);
    reducedMotionQuery.addEventListener('change', syncGalleryMotionPreference);
  }

  // IntersectionObserver to detect which section is visible inside the scroll container
  const obsOptions = {
    root: (container === document.documentElement ? null : container),
    threshold: [0.25, 0.5, 0.75]
  };

  let lastSeen = null;
  const observer = new IntersectionObserver((entries) => {
    // pick the entry with largest intersectionRatio among visible entries
    const visible = entries.filter(e => e.isIntersecting);
    if (visible.length === 0) return;
    visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    const chosen = visible[0];
    const id = chosen.target.id;
    if (id && id !== lastSeen) {
      lastSeen = id;
      setActiveNavFor(id);
      updateNextButton(id);
    }
  }, obsOptions);

  sectionEls.forEach(el => observer.observe(el));

  // Smooth scroll for all internal anchors (desktop nav, mobile nav, next button)
  internalLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    a.addEventListener('click', (e) => {
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        // scrollIntoView handles scrolling the container (if container is the scroller)
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.style.display === 'flex') mobileMenu.style.display = 'none';
      }
    });
  });

  // Mobile menu toggle (hamburger + close button)
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.mobile-menu .close-btn');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.style.display = 'flex';
    });
  }
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
    });
  }

  themeToggles.forEach(button => {
    button.addEventListener('click', toggleTheme);
  });

  applyTheme(readSavedTheme() || body.dataset.theme || 'dark');

  // initial state: pick the section roughly in view or default to first
  if (sections.length) {
    let initial = sections[0];
    sectionEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= (window.innerHeight / 2) && rect.bottom >= (window.innerHeight / 2)) {
        initial = el.id;
      }
    });
    setActiveNavFor(initial);
    updateNextButton(initial);
  }

  initGallery();
});
