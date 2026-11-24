(() => {
  'use strict';

  const triggers = Array.from(document.querySelectorAll('[data-annotate-trigger]'));
  if (triggers.length === 0) return;

  const statusEl = document.querySelector('[data-annotate-status]');
  const EMBED_SRC = 'https://hypothes.is/embed.js';
  let state = 'idle'; // 'idle' | 'loading' | 'ready'

  function setButtonLabel(btn, key) {
    const labelEl = btn.querySelector('[data-annotate-label]');
    const nextText = btn.dataset[key];
    if (!nextText) return;
    if (labelEl) {
      labelEl.textContent = nextText;
    } else {
      btn.textContent = nextText;
    }
  }

  function updateUI(nextState, errorMessage = '') {
    state = nextState;
    for (const btn of triggers) {
      btn.disabled = nextState === 'loading';
      btn.setAttribute('aria-pressed', nextState === 'ready' ? 'true' : 'false');
      if (nextState === 'loading') {
        setButtonLabel(btn, 'labelLoading');
      } else if (nextState === 'ready') {
        setButtonLabel(btn, 'labelReady');
        btn.classList.add('is-active');
      } else {
        setButtonLabel(btn, 'labelIdle');
        btn.classList.remove('is-active');
      }
    }

    if (statusEl) {
      if (errorMessage) {
        statusEl.textContent = errorMessage;
        statusEl.hidden = false;
      } else {
        statusEl.textContent = '';
        statusEl.hidden = true;
      }
    }
  }

  function openExistingSidebar() {
    const host = document.querySelector('hypothesis-sidebar');
    const root = host && host.shadowRoot;
    if (root) {
      const toggleBtn = root.querySelector('button[aria-label*="sidebar" i], button[title*="sidebar" i], .annotator-frame-button--sidebar_toggle');
      if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'false') {
        toggleBtn.click();
        return;
      }
    }
    const annotator = document.querySelector('.annotator-frame');
    if (annotator && annotator.classList.contains('annotator-collapsed')) {
      const toggle = annotator.querySelector('[title*="Show" i], [aria-label*="Show" i]');
      if (toggle) toggle.click();
    }
  }

  function loadHypothesis() {
    if (state === 'loading') return;
    if (state === 'ready' || document.querySelector(`script[src="${EMBED_SRC}"]`)) {
      updateUI('ready');
      openExistingSidebar();
      return;
    }

    updateUI('loading');

    window.hypothesisConfig = () => ({
      openSidebar: true,
      showHighlights: true,
      theme: 'clean',
      branding: {
        accentColor: '#7B2130',
        appBackgroundColor: '#FAFAF8',
        ctaBackgroundColor: '#7B2130'
      }
    });

    const script = document.createElement('script');
    script.src = EMBED_SRC;
    script.async = true;
    script.onload = () => updateUI('ready');
    script.onerror = () => {
      script.remove();
      const errMsg = triggers[0]?.dataset.errorMsg || 'Failed to load Hypothes.is.';
      updateUI('idle', errMsg);
    };
    document.head.appendChild(script);
  }

  for (const btn of triggers) {
    btn.addEventListener('click', loadHypothesis);
  }

  if (
    window.location.hash.startsWith('#annotations:') ||
    new URLSearchParams(window.location.search).get('annotations') === '1'
  ) {
    loadHypothesis();
  }
})();
