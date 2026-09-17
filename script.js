(() => {
  'use strict';

  function init() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
    const header = document.querySelector('.site-header');
    const nav = header?.querySelector('.nav');
    const mobile = window.matchMedia('(max-width: 960px)');
    const currentPath = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    const samePage = (url) => url.origin === window.location.origin && url.pathname.replace(/index\.html$/, '').replace(/\/$/, '') === currentPath;

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
      if (!samePage(url) || !url.hash || link.hasAttribute('download')) return;
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
            project.hidden = !matches;
            if (matches) count++;
          });
          filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
          const text = `${count} ${count === 1 ? 'project' : 'projects'} shown${value === 'all' ? '' : ` in ${button.textContent.trim()}`}.`;
          const status = document.querySelector('.filter-status');
          if (status) status.textContent = text;
          announce(text);
        });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
