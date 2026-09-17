(() => {
  'use strict';

  function init() {
    // Keep saved links working after the contact and media pages are separated.
    // Only these explicit, same-site destinations are eligible for redirection.
    const legacyMediaDestinations = {
      '#profile-details': 'media/profile.html#profile-details',
      '#certificates': 'media/certificates.html#certificates',
      '#courses': 'media/courses.html#courses',
      '#experience-media': 'media/experience.html#experience-media',
      '#profile-gallery': 'media/gallery.html#profile-gallery',
      '#document-gallery': 'media/documents.html#document-gallery',
      '#posts': 'media/posts.html#posts',
      '#public-links': 'media/links.html#public-links'
    };
    const pagePath = window.location.pathname;
    if (/\/media\.html$/.test(pagePath) && Object.hasOwn(legacyMediaDestinations, window.location.hash)) {
      window.location.replace(new URL(legacyMediaDestinations[window.location.hash], window.location.href).href);
      return;
    }
    if ((/\/index\.html$/.test(pagePath) || pagePath.endsWith('/')) && window.location.hash === '#contact') {
      window.location.replace(new URL('contact.html#contact', window.location.href).href);
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
    const header = document.querySelector('.site-header');
    const nav = header?.querySelector('.nav');
    const mobile = window.matchMedia('(max-width: 960px)');
    const currentPath = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    const samePage = (url) => url.origin === window.location.origin && url.pathname.replace(/index\.html$/, '').replace(/\/$/, '') === currentPath;
    const runningAnimations = new Set();
    const visitedEntrances = new WeakSet();
    let entranceObserver;

    // Static SVG geometry is rasterised once; only three containing layers move.
    // No canvas loop, network request, flashing, or pointer tracking is needed.
    const ambientThemes = {
      home: '<path d="M-40 410C130 130 260 600 500 235S900 175 1120-30M-45 455C170 170 280 650 550 285S950 200 1130 15M-50 500C210 210 310 700 600 335S1000 225 1140 60M-55 545C250 250 340 750 650 385S1050 250 1150 105"/><ellipse cx="790" cy="250" rx="265" ry="150" transform="rotate(-30 790 250)"/>',
      research: '<path d="M-50 620C110 590 210 150 440 250S700 530 1070 85M-40 665C180 620 240 205 440 300S770 570 1085 150M-30 710C230 640 275 260 440 350S840 610 1100 215M80 90L80 720M-10 640L1120 640"/><circle cx="440" cy="250" r="10"/><circle cx="680" cy="358" r="7"/><circle cx="845" cy="300" r="7"/><circle cx="265" cy="318" r="6"/>',
      projects: '<path d="M180 210L450 65 750 230 470 395ZM180 210V490L470 670 750 510V230M470 395V670M450 65V330M110 400H30V555H180M750 395H875V205H1010"/><path d="M340 305L570 180M340 585L625 435M875 500H1010V365"/><circle cx="30" cy="555" r="10"/><circle cx="1010" cy="205" r="10"/><circle cx="1010" cy="365" r="10"/>',
      media: '<path d="M140 250L340 125 620 230 850 95M140 250L290 490 620 230 800 500 1000 340M290 490L500 645 800 500M340 125L420 380 1000 340"/><circle cx="140" cy="250" r="13"/><circle cx="340" cy="125" r="10"/><circle cx="620" cy="230" r="18"/><circle cx="850" cy="95" r="8"/><circle cx="290" cy="490" r="13"/><circle cx="800" cy="500" r="13"/><circle cx="1000" cy="340" r="9"/><circle cx="500" cy="645" r="8"/>',
      contact: '<circle cx="620" cy="380" r="95"/><circle cx="620" cy="380" r="175"/><circle cx="620" cy="380" r="255"/><circle cx="620" cy="380" r="335"/><path d="M35 485Q400 135 750 485T1200 485M35 550Q400 200 750 550T1200 550"/>',
      profile: '<path d="M275 570C30 390 210 135 480 110S980 215 850 470 520 750 275 570ZM335 520C145 380 285 190 490 175S865 250 770 435 520 670 335 520ZM395 470C260 370 360 245 500 240S750 285 690 400 520 590 395 470ZM455 420C375 360 435 300 510 305S635 320 610 365 520 510 455 420Z"/>',
      certificates: '<path d="M290 670Q140 380 425 65M750 670Q930 340 635 65"/><path d="M283 580Q105 540 165 420Q285 455 283 580ZM257 445Q110 365 195 280Q300 350 257 445ZM293 305Q180 200 285 145Q360 225 293 305ZM356 180Q260 60 365 25Q420 110 356 180ZM771 580Q955 530 895 410Q775 450 771 580ZM808 435Q950 345 860 270Q755 335 808 435ZM770 295Q880 185 770 130Q705 220 770 295ZM706 165Q805 45 695 10Q645 105 706 165Z"/>',
      courses: '<path d="M60 625H250V475H440V325H630V175H820V25M120 695H310V545H500V395H690V245H880V95M-10 555H180V405H370V255H560V105H750"/><circle cx="250" cy="475" r="11"/><circle cx="440" cy="325" r="11"/><circle cx="630" cy="175" r="11"/>',
      experience: '<path d="M-20 170H265L385 290H710L885 115H1110M-20 265H190L380 455H655L835 275H1110M-20 580H220L365 435M655 455L830 630H1110M385 290V50M380 455V740"/><circle cx="385" cy="290" r="16"/><circle cx="380" cy="455" r="16"/><circle cx="710" cy="290" r="12"/><circle cx="835" cy="275" r="12"/><circle cx="830" cy="630" r="12"/>',
      gallery: '<rect x="170" y="150" width="370" height="460" rx="8" transform="rotate(-18 355 380)"/><rect x="450" y="75" width="360" height="470" rx="8" transform="rotate(14 630 310)"/><rect x="370" y="320" width="470" height="300" rx="8" transform="rotate(-5 605 470)"/><path d="M255 490L345 355 430 440 495 375M510 360L600 220 720 340"/><circle cx="335" cy="270" r="27"/><circle cx="675" cy="185" r="22"/>',
      documents: '<path d="M230 100H650L790 240V650H230ZM650 100V240H790M145 185V725H705M315 350H690M315 425H690M315 500H610M315 275H560"/><path d="M855 115H955V530H855M85 80H150M117 47V113"/>',
      posts: '<path d="M-20 165Q115 15 250 165T520 165T790 165T1060 165M-20 245Q115 95 250 245T520 245T790 245T1060 245M-20 325Q115 175 250 325T520 325T790 325T1060 325M-20 405Q115 255 250 405T520 405T790 405T1060 405M-20 485Q115 335 250 485T520 485T790 485T1060 485M-20 565Q115 415 250 565T520 565T790 565T1060 565"/>',
      links: '<ellipse cx="555" cy="385" rx="390" ry="150" transform="rotate(-35 555 385)"/><ellipse cx="555" cy="385" rx="390" ry="150" transform="rotate(35 555 385)"/><ellipse cx="555" cy="385" rx="150" ry="325"/><circle cx="555" cy="385" r="34"/><circle cx="300" cy="180" r="16"/><circle cx="825" cy="580" r="16"/><circle cx="555" cy="65" r="12"/><circle cx="865" cy="170" r="12"/>'
    };
    const fileName = pagePath.split('/').pop() || 'index.html';
    const mediaMatch = pagePath.match(/\/media\/([a-z-]+)\.html$/);
    const isCaseStudy = /\/projects\/[^/]+\.html$/.test(pagePath);
    const pageSeed = [...pagePath].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
    const caseThemes = ['projects', 'research', 'experience', 'courses'];
    const ambientTheme = mediaMatch && Object.hasOwn(ambientThemes, mediaMatch[1]) ? mediaMatch[1]
      : isCaseStudy ? caseThemes[pageSeed % caseThemes.length]
      : ({ 'index.html': 'home', 'research.html': 'research', 'projects.html': 'projects', 'media.html': 'media', 'contact.html': 'contact' })[fileName] || 'home';
    document.body.dataset.ambientTheme = isCaseStudy ? `case-${fileName.replace('.html', '')}` : ambientTheme;
    const scene = document.createElement('div');
    scene.className = 'ambient-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.setAttribute('inert', '');
    scene.dataset.theme = ambientTheme;
    const svgOpen = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 760" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">';
    const artLayers = [ambientThemes[ambientTheme], ambientThemes[ambientTheme], '<ellipse cx="550" cy="380" rx="350" ry="235"/><ellipse cx="550" cy="380" rx="285" ry="170"/><path d="M100 380H210M890 380H1000M550 45V125M550 635V715"/>'];
    artLayers.forEach((geometry, index) => {
      const layer = document.createElement('div');
      layer.className = `ambient-layer ambient-layer-${index + 1}`;
      layer.style.setProperty('--art-angle', `${(pageSeed % 19) - 9 + (index === 1 ? 95 : 0)}deg`);
      layer.style.setProperty('--art-duration', `${68 + (pageSeed % 25) + index * 17}s`);
      layer.style.setProperty('--art-delay', `${-((pageSeed % 41) + index * 13)}s`);
      layer.innerHTML = svgOpen + geometry + '</svg>';
      scene.append(layer);
    });
    document.body.prepend(scene);
    let backgroundPaused = false;
    try { backgroundPaused = localStorage.getItem('madvid-background-paused') === 'true'; } catch { /* Storage is optional. */ }
    const ambientToggle = document.createElement('button');
    ambientToggle.type = 'button';
    ambientToggle.className = 'ambient-toggle';
    (document.querySelector('.site-footer .container') || document.querySelector('.site-footer'))?.append(ambientToggle);
    function updateBackgroundMotion() {
      scene.dataset.paused = String(document.hidden || reducedMotion.matches || backgroundPaused);
      ambientToggle.hidden = reducedMotion.matches;
      ambientToggle.textContent = backgroundPaused ? 'Resume background motion' : 'Pause background motion';
      ambientToggle.setAttribute('aria-pressed', String(backgroundPaused));
    }
    ambientToggle.addEventListener('click', () => {
      backgroundPaused = !backgroundPaused;
      try { localStorage.setItem('madvid-background-paused', String(backgroundPaused)); } catch { /* Storage is optional. */ }
      updateBackgroundMotion();
    });
    document.addEventListener('visibilitychange', updateBackgroundMotion);
    reducedMotion.addEventListener('change', updateBackgroundMotion);
    window.addEventListener('pageshow', updateBackgroundMotion);
    updateBackgroundMotion();

    // WAAPI effects never leave content hidden or change its layout. Unsupported
    // browsers, reduced-motion users and script failures keep the static page.
    function animateMotion(element, frames, options = {}) {
      if (reducedMotion.matches || !element?.animate || document.hidden) return;
      const animation = element.animate(frames, {
        duration: 420,
        easing: 'cubic-bezier(.2, .7, .2, 1)',
        ...options
      });
      runningAnimations.add(animation);
      const release = () => runningAnimations.delete(animation);
      animation.addEventListener('finish', release, { once: true });
      animation.addEventListener('cancel', release, { once: true });
      return animation;
    }

    function enter(element, delay = 0) {
      animateMotion(element, [
        { opacity: .55, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { delay });
    }

    function highlightDestination(target) {
      const heading = target.matches('h1, h2, h3, h4') ? target : target.querySelector('h1, h2, h3, h4');
      if (!heading) return;
      animateMotion(heading, [
        { backgroundColor: 'rgba(191, 227, 255, 0)' },
        { backgroundColor: 'rgba(191, 227, 255, .65)', offset: .25 },
        { backgroundColor: 'rgba(191, 227, 255, 0)' }
      ], { duration: 1100, delay: 120 });
    }

    function observeEntrances() {
      entranceObserver?.disconnect();
      if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
      const candidates = [...document.querySelectorAll([
        '.hero-text', '.hero-aside', '.research-hero', '.media-page > header', '.project-hero', '.page-heading',
        '.section > h2', '.section > h3', '.section-heading', '.research-section > h2', '.media-section > h2',
        '.card', '.edu', '.research-spotlight', '.metric-card', '.research-method', '.research-figure',
        '.media-figure', '.experience-media-card', '.public-link-card', '.contact-with-copy', '.contact-card', '.timeline .item', '.result-chart'
      ].join(', '))];
      const candidateSet = new Set(candidates);
      entranceObserver = new IntersectionObserver((entries) => {
        let stagger = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entranceObserver.unobserve(entry.target);
          if (visitedEntrances.has(entry.target)) return;
          visitedEntrances.add(entry.target);
          enter(entry.target, Math.min(stagger++ * 40, 160));
        });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      candidates.forEach((element) => {
        let parent = element.parentElement;
        while (parent && !candidateSet.has(parent)) parent = parent.parentElement;
        if (!parent && !visitedEntrances.has(element)) entranceObserver.observe(element);
      });
    }

    function stopMotion() {
      runningAnimations.forEach((animation) => animation.cancel());
      runningAnimations.clear();
    }
    reducedMotion.addEventListener('change', () => {
      stopMotion();
      observeEntrances();
    });
    window.addEventListener('beforeprint', stopMotion);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); });

    if (header && nav) {
      nav.id ||= 'primary-navigation';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'nav-toggle';
      toggle.setAttribute('aria-controls', nav.id);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      toggle.innerHTML = '<span>Menu</span><svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5h14M3 10h14M3 15h14"/></svg>';
      nav.before(toggle);

      function setMenu(open, restoreFocus = false) {
        header.classList.toggle('is-menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        if (open && mobile.matches) enter(nav);
        if (restoreFocus) toggle.focus();
      }
      toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
      nav.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && header.classList.contains('is-menu-open')) setMenu(false, true);
      });
      document.addEventListener('click', (event) => {
        if (mobile.matches && !header.contains(event.target)) setMenu(false);
      });
      mobile.addEventListener('change', () => setMenu(false));
      header.classList.add('nav-enhanced');

      nav.querySelectorAll('a[href]').forEach((link) => {
        const url = new URL(link.href, window.location.href);
        if (samePage(url) && !url.hash) link.setAttribute('aria-current', 'page');
      });
    }

    // Keep keyboard focus and the URL aligned with in-page navigation.
    document.querySelectorAll('a[href]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      if (!samePage(url) || url.search !== window.location.search || !url.hash || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      link.addEventListener('click', (event) => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        let id;
        try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
        highlightDestination(target);
        if (window.location.hash !== url.hash) history.pushState(null, '', url.hash);
      });
    });

    // Active section indicators never change what content is visible.
    const sectionLinks = [...document.querySelectorAll('.nav a[href], .research-toc a[href]')].map((link) => {
      const url = new URL(link.href, window.location.href);
      if (!samePage(url) || !url.hash) return null;
      const section = document.getElementById(url.hash.slice(1));
      return section ? { link, section } : null;
    }).filter(Boolean);
    let framePending = false;
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);
    let backToTop = document.getElementById('backToTop');
    if (!backToTop) {
      backToTop = document.createElement('button');
      backToTop.id = 'backToTop';
      backToTop.type = 'button';
      backToTop.textContent = '↑';
      document.body.append(backToTop);
    }
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.title = 'Back to top';
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      const topTarget = document.querySelector('main');
      if (topTarget) {
        if (!topTarget.hasAttribute('tabindex')) {
          topTarget.setAttribute('tabindex', '-1');
          topTarget.addEventListener('blur', () => topTarget.removeAttribute('tabindex'), { once: true });
        }
        topTarget.focus({ preventScroll: true });
      }
    });

    function updateScrollState() {
      framePending = false;
      backToTop.classList.toggle('show', window.scrollY > 550);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const completion = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progress.style.setProperty('--reading-progress', completion.toFixed(4));
      const threshold = (header?.getBoundingClientRect().height || 90) + 100;
      const groups = new Map();
      sectionLinks.forEach((entry) => {
        const group = entry.link.closest('nav');
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push(entry);
      });
      groups.forEach((entries) => {
        let active = null;
        entries.forEach((entry) => { if (entry.section.getBoundingClientRect().top <= threshold) active = entry; });
        entries.forEach((entry) => {
          const isActive = entry === active;
          entry.link.classList.toggle('is-active', isActive);
          if (isActive) entry.link.setAttribute('aria-current', 'location');
          else if (entry.link.getAttribute('aria-current') === 'location') entry.link.removeAttribute('aria-current');
        });
      });
    }
    window.addEventListener('scroll', () => {
      if (!framePending) { framePending = true; requestAnimationFrame(updateScrollState); }
    }, { passive: true });
    window.addEventListener('resize', updateScrollState);
    updateScrollState();

    function announce(message) {
      let status = document.getElementById('interaction-status');
      if (!status) {
        status = document.createElement('div');
        status.id = 'interaction-status';
        status.className = 'sr-only';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        document.body.append(status);
      }
      status.textContent = message;
    }

    if (navigator.clipboard?.writeText && window.isSecureContext) {
      document.querySelectorAll('#contact a.contact-card[href^="mailto:"]').forEach((link) => {
        const email = link.getAttribute('href').slice(7).split('?')[0];
        const wrapper = document.createElement('div');
        wrapper.className = 'contact-with-copy';
        link.before(wrapper);
        wrapper.append(link);
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'copy-email';
        copy.textContent = 'Copy email address';
        copy.setAttribute('aria-label', `Copy ${email}`);
        wrapper.append(copy);
        copy.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(email);
            copy.textContent = 'Email copied';
            announce(`Copied ${email} to the clipboard.`);
            window.setTimeout(() => { copy.textContent = 'Copy email address'; }, 2500);
          } catch {
            copy.textContent = 'Please select and copy the address';
            announce('Clipboard is unavailable. You can select and copy the displayed email address.');
          }
        });
      });
    }

    const filters = [...document.querySelectorAll('[data-project-filter]')];
    const projects = [...document.querySelectorAll('[data-project-category]')];
    if (filters.length && projects.length) {
      filters.forEach((button) => {
        const isAll = button.dataset.projectFilter === 'all';
        button.setAttribute('aria-pressed', String(isAll));
        button.addEventListener('click', () => {
          const value = button.dataset.projectFilter;
          let count = 0;
          projects.forEach((project) => {
            const categories = project.dataset.projectCategory.split(/[\s,]+/);
            const matches = value === 'all' || categories.includes(value);
            const wasHidden = project.hidden;
            project.hidden = !matches;
            if (matches) {
              if (wasHidden) enter(project, Math.min(count * 40, 120));
              count++;
            }
          });
          filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
          const text = `${count} ${count === 1 ? 'project' : 'projects'} shown${value === 'all' ? '' : ` in ${button.textContent.trim()}`}.`;
          const status = document.querySelector('.filter-status');
          if (status) status.textContent = text;
          announce(text);
        });
      });
    }

    // Enhance native disclosures and the existing research tabs without owning
    // their behavior or delaying interactions.
    document.addEventListener('toggle', (event) => {
      const disclosure = event.target;
      if (!disclosure.matches?.('details[open]')) return;
      [...disclosure.children].filter((child) => child.tagName !== 'SUMMARY').forEach((child, index) => enter(child, Math.min(index * 30, 90)));
    }, true);

    const researchPanels = document.querySelectorAll('.research-panel');
    if (researchPanels.length && 'MutationObserver' in window) {
      const panelObserver = new MutationObserver((changes) => {
        const revealed = new Set(changes.map((change) => change.target).filter((panel) => !panel.hidden));
        revealed.forEach((panel) => enter(panel));
        updateScrollState();
      });
      researchPanels.forEach((panel) => panelObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] }));
    }
    const resultChart = document.querySelector('.result-chart');
    if (resultChart && 'MutationObserver' in window) {
      const chartObserver = new MutationObserver(() => {
        resultChart.querySelectorAll('.result-chart-bar').forEach((bar, index) => {
          animateMotion(bar, [
            { transform: 'scaleX(.05)', transformOrigin: 'left', opacity: .65 },
            { transform: 'scaleX(1)', transformOrigin: 'left', opacity: 1 }
          ], { duration: 360, delay: Math.min(index * 25, 125) });
        });
      });
      chartObserver.observe(resultChart, { childList: true });
    }
    observeEntrances();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
