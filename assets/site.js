(() => {
  'use strict';

  /* ------------------------------------------------------------------------
   * 1. Subtle ambient constellation network backdrop
   * ------------------------------------------------------------------------ */
  const canvas = document.querySelector('.cs-bg');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let nodes = [];
    let rafId = 0;

    const createNodes = () => {
      const area = width * height;
      const count = Math.max(24, Math.min(58, Math.round(area / 28000)));
      const list = [];
      for (let i = 0; i < count; i++) {
        // Slightly favor margins for the editorial framing feel
        let x = Math.random() * width;
        if (width > 1060 && Math.random() < 0.45) {
          const margin = (width - 840) / 2;
          x = Math.random() < 0.5 ? Math.random() * margin : width - Math.random() * margin;
        }
        list.push({
          x,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: 1.2 + Math.random() * 1.1,
        });
      }
      return list;
    };

    const resize = (regenerate = true) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (regenerate || nodes.length === 0) {
        nodes = createNodes();
      }
      draw(false);
    };

    const edgeAlphaForX = (x1, x2) => {
      if (width <= 960) return 0.55;
      const center = width / 2;
      const mid = (x1 + x2) / 2;
      const dist = Math.abs(mid - center);
      return dist < 410 ? 0.35 : 1.0;
    };

    const tick = () => draw(true);

    const startLoop = () => {
      if (!reduced && !document.hidden && !rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const draw = (step = true) => {
      rafId = 0;
      ctx.clearRect(0, 0, width, height);
      const maxDist = 175;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (step) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < -20) a.x = width + 20;
          if (a.x > width + 20) a.x = -20;
          if (a.y < -20) a.y = height + 20;
          if (a.y > height + 20) a.y = -20;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) {
            const fade = (1 - d / maxDist) * 0.08 * edgeAlphaForX(a.x, b.x);
            ctx.strokeStyle = `rgba(123, 33, 48, ${fade.toFixed(4)})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const alpha = 0.135 * edgeAlphaForX(n.x, n.x);
        ctx.fillStyle = `rgba(123, 33, 48, ${alpha.toFixed(4)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced && step && !document.hidden) {
        rafId = requestAnimationFrame(tick);
      }
    };

    resize(true);
    startLoop();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const widthChanged = window.innerWidth !== width;
        const majorHeightChange = Math.abs(window.innerHeight - height) > 120;
        if (!widthChanged && !majorHeightChange) return;
        stopLoop();
        resize(widthChanged || majorHeightChange);
        startLoop();
      }, 160);
    });
  }

  /* ------------------------------------------------------------------------
   * 2. Toast helper & Clipboard copy
   * ------------------------------------------------------------------------ */
  const toastEl = document.getElementById('site-toast');
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(label);
    }
  };

  /* ------------------------------------------------------------------------
   * 3. Mobile navigation drawer
   * ------------------------------------------------------------------------ */
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.getElementById('site-nav-links');
  const backdrop = document.querySelector('.nav-backdrop');

  const setMenuOpen = (open) => {
    if (!burger || !navLinks || !backdrop) return;
    burger.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger?.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  backdrop?.addEventListener('click', () => setMenuOpen(false));
  navLinks?.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) setMenuOpen(false);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      burger.focus();
    }
  });

  const mobileMq = window.matchMedia('(max-width: 720px)');
  mobileMq.addEventListener('change', (e) => {
    if (!e.matches) setMenuOpen(false);
  });

  /* ------------------------------------------------------------------------
   * 4. Copy email & BibTeX triggers
   * ------------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const copyEmailBtn = e.target.closest('[data-copy-email]');
    if (copyEmailBtn) {
      copyText(copyEmailBtn.dataset.copyEmail, 'Email copied to clipboard');
      return;
    }

    const bibBtn = e.target.closest('[data-copy-bib]');
    if (bibBtn) {
      const targetId = bibBtn.dataset.copyBib;
      const tpl = document.getElementById(targetId);
      if (tpl) {
        copyText(tpl.textContent.trim(), 'BibTeX copied to clipboard');
        if (!bibBtn.dataset.origLabel) {
          bibBtn.dataset.origLabel = bibBtn.textContent;
        }
        bibBtn.textContent = '[copied]';
        bibBtn.classList.add('is-copied');
        clearTimeout(Number(bibBtn.dataset.copyTimer || 0));
        bibBtn.dataset.copyTimer = String(setTimeout(() => {
          bibBtn.textContent = bibBtn.dataset.origLabel || '[bib]';
          bibBtn.classList.remove('is-copied');
        }, 1500));
      }
    }
  });

  /* ------------------------------------------------------------------------
   * 6. News expand/collapse toggle
   * ------------------------------------------------------------------------ */
  const newsToggle = document.querySelector('[data-news-toggle]');
  if (newsToggle) {
    const extraNews = document.querySelectorAll('.news-entry[data-news-extra]');
    newsToggle.addEventListener('click', () => {
      const expanded = newsToggle.getAttribute('aria-expanded') === 'true';
      extraNews.forEach((item) => { item.hidden = expanded; });
      newsToggle.setAttribute('aria-expanded', String(!expanded));
      newsToggle.textContent = expanded ? '(see all)' : '(show less)';
    });
  }

  /* ------------------------------------------------------------------------
   * 7. Publications page filters & keyword search
   * ------------------------------------------------------------------------ */
  const filterBar = document.querySelector('[data-pub-filters]');
  if (filterBar) {
    const pills = Array.from(filterBar.querySelectorAll('.filter-pill'));
    const yearGroups = Array.from(document.querySelectorAll('.pub-year-group'));
    const pubListEl = document.querySelector('.pub-list');
    const pubCountEl = document.querySelector('[data-pub-count]');
    const searchInput = document.querySelector('[data-pub-search]');
    const emptyEl = document.querySelector('[data-pub-empty]');
    const resetBtns = Array.from(document.querySelectorAll('[data-pub-reset]'));
    const allItems = Array.from(document.querySelectorAll('.pub-item')).map((item) => {
      const text = [
        item.querySelector('.pub-title-line a')?.textContent || item.querySelector('.pub-title-line')?.textContent || '',
        item.querySelector('.pub-authors')?.textContent || '',
        item.querySelector('.pub-venue')?.textContent || '',
        item.dataset.tags || '',
        item.dataset.year || '',
      ].join(' ').toLowerCase().replace(/\s+/g, ' ');
      return { item, text };
    });
    const totalPapers = allItems.length;
    let activeFilter = 'all';

    const updatePublications = () => {
      const terms = (searchInput?.value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
      const isFiltered = activeFilter !== 'all' || terms.length > 0;

      pills.forEach((p) => {
        const active = p.dataset.filter === activeFilter;
        p.classList.toggle('is-active', active);
        p.setAttribute('aria-pressed', String(active));
      });

      const visibleSet = new Set();
      for (const { item, text } of allItems) {
        const topic = item.dataset.topic || '';
        const tags = (item.dataset.tags || '').toLowerCase();
        const isFirst = item.dataset.firstAuthor === 'true';
        const matchesFilter =
          activeFilter === 'all' ||
          topic === activeFilter ||
          (activeFilter === 'first-author' && isFirst) ||
          (activeFilter === 'ccf-a' && tags.includes('ccf-a')) ||
          (activeFilter === 'award' && tags.includes('best paper'));
        const matchesSearch = terms.every((t) => text.includes(t));
        const show = matchesFilter && matchesSearch;
        item.hidden = !show;
        if (show) visibleSet.add(item);
      }

      yearGroups.forEach((group) => {
        const hasVisible = Array.from(group.querySelectorAll('.pub-item')).some((el) => visibleSet.has(el));
        group.hidden = !hasVisible;
      });

      const totalVisible = visibleSet.size;
      if (pubCountEl) {
        pubCountEl.textContent = isFiltered
          ? `${totalVisible} of ${totalPapers} papers`
          : `${totalPapers} papers`;
      }
      if (emptyEl) emptyEl.hidden = totalVisible > 0;
      if (pubListEl) pubListEl.hidden = totalVisible === 0;
      resetBtns.forEach((btn) => {
        if (btn.closest('.pub-meta-info')) btn.hidden = !isFiltered;
      });
    };

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      activeFilter = btn.dataset.filter || 'all';
      updatePublications();
    });

    searchInput?.addEventListener('input', updatePublications);

    resetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = 'all';
        if (searchInput) searchInput.value = '';
        updatePublications();
      });
    });
  }
})();
