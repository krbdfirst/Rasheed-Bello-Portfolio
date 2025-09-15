document.addEventListener('DOMContentLoaded', () => {
  // container that holds the scrollable sections
  const container = document.querySelector('.container') || document.documentElement;

  // all sections in document order (only those with an id)
  const sectionEls = Array.from(container.querySelectorAll('.section')).filter(s => s.id);
  const sections = sectionEls.map(s => s.id);

  // Desktop nav links (the ones that should show the "active" state)
  const desktopNavLinks = Array.from(document.querySelectorAll('.nav-links a'));

  // Mobile menu links (optional: we also toggle active class here for parity)
  const mobileMenuLinks = Array.from(document.querySelectorAll('.mobile-menu a'));

  // all internal anchors (href starting with '#')
  const internalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

  // Next button in your HTML (bottom-bar)
  const nextAnchor = document.querySelector('.bottom-bar .next-section a');
  const nextLabel = document.getElementById('next-label');

  // Sections that should map to the "About" menu link
  const aboutAliases = new Set(['education-training', 'experience']);

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
    if (nextLabel) nextLabel.textContent = prettyLabel(nextId);
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
});