(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const root = document.documentElement;
  const menu = document.querySelector('.mobile-menu');
  const themeButtons = [...document.querySelectorAll('[data-theme-toggle]')];
  const syncTheme = () => {
    const dark = root.classList.contains('dark');
    themeButtons.forEach(button => button.setAttribute('aria-pressed', String(!dark)));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#151210' : '#ffffff');
  };
  syncTheme();
  themeButtons.forEach(button => button.addEventListener('click', () => {
    root.classList.toggle('dark');
    try { localStorage.setItem('coachin-theme', root.classList.contains('dark') ? 'dark' : 'light'); } catch (_) { /* Reading and switching themes also work without storage. */ }
    syncTheme();
  }));
  window.addEventListener('storage', event => {
    if (event.key === 'coachin-theme') { root.classList.toggle('dark', event.newValue !== 'light'); syncTheme(); }
  });
  document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  document.querySelectorAll('.mobile-panel a').forEach(link => link.addEventListener('click', () => { if (menu) menu.open = false; }));
  document.addEventListener('click', event => { if (menu?.open && !menu.contains(event.target)) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
  });
  window.matchMedia('(min-width: 1200px)').addEventListener('change', event => { if (event.matches && menu) menu.open = false; });

  const languageLinks = [...document.querySelectorAll('[data-language]')];
  const updateLanguageHash = hash => languageLinks.forEach(link => {
    const url = new URL(link.href); url.hash = hash; link.href = url.href;
  });
  updateLanguageHash(location.hash);
  window.addEventListener('hashchange', () => updateLanguageHash(location.hash));
  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('.desktop-nav a')];
    const sections = [...document.querySelectorAll('main > section[id]')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const hash = entry.target.id === 'top' ? '' : '#' + entry.target.id;
        updateLanguageHash(hash);
        navLinks.forEach(link => {
          if (link.hash === hash) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-30% 0px -50% 0px' });
    sections.forEach(section => observer.observe(section));
  }
  document.querySelectorAll('.faq-item').forEach(item => item.addEventListener('toggle', () => {
    if (item.open) document.querySelectorAll('.faq-item').forEach(other => { if (other !== item) other.open = false; });
  }));

  const dialog = document.querySelector('#gallery-dialog');
  const triggers = [...document.querySelectorAll('.gallery-trigger')];
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('#gallery-image');
  const caption = dialog.querySelector('#gallery-caption');
  const counter = dialog.querySelector('.gallery-counter');
  let index = 0, trigger = null, touchStart = null;
  const rtl = root.dir === 'rtl';
  function show(next) {
    index = (next + triggers.length) % triggers.length;
    const active = triggers[index];
    image.src = active.href;
    image.alt = active.querySelector('img').alt;
    caption.textContent = active.querySelector('h3').textContent;
    counter.textContent = `${index + 1} ${counter.dataset.counterWord} ${triggers.length}`;
  }
  triggers.forEach((link, i) => link.addEventListener('click', event => {
    event.preventDefault(); trigger = link; show(i); dialog.showModal();
    document.body.style.overflow = 'hidden'; dialog.querySelector('[data-gallery-close]').focus();
  }));
  dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; trigger?.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.querySelectorAll('[data-gallery-step]').forEach(button => button.addEventListener('click', () => show(index + Number(button.dataset.galleryStep))));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1));
    }
  });
  image.addEventListener('touchstart', event => { touchStart = event.touches[0]?.clientX ?? null; }, { passive: true });
  image.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const dx = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
    touchStart = null;
  }, { passive: true });
})();
