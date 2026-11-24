(() => {
  'use strict';

  const dataScript = document.getElementById('research-map-data');
  const canvas = document.getElementById('rmap-canvas');
  if (!dataScript || !canvas) return;

  let papers = [];
  try {
    papers = JSON.parse(dataScript.textContent);
  } catch {
    return;
  }

  const TOPICS = ['llm-safety', 'llm-evaluation', 'adversarial'];
  const YEARS = Array.from(
    new Set(papers.map((p) => Number(p.year)).filter(Number.isFinite))
  ).sort((a, b) => b - a);
  if (YEARS.length === 0) return;

  const shell = canvas.closest('.rmap-shell');
  const keyBox = document.getElementById('rmap-key');
  const cardBox = document.getElementById('rmap-card');
  const cardTitle = document.getElementById('rmap-card-title');
  const cardVenue = document.getElementById('rmap-card-venue');
  const cardMeta = document.getElementById('rmap-card-meta');

  const measureColumns = (totalW) => {
    const colHeads = shell ? Array.from(shell.querySelectorAll('.rmap-col-head')) : [];
    const canvasRect = canvas.getBoundingClientRect();
    if (colHeads.length === TOPICS.length && canvasRect.width > 0) {
      return colHeads.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - canvasRect.left,
          width: r.width,
        };
      });
    }
    const yearColW = 50;
    const colGap = 20;
    const colW = (totalW - yearColW - colGap * 3) / 3;
    return TOPICS.map((_, idx) => ({
      left: yearColW + colGap * (idx + 1) + idx * colW,
      width: colW,
    }));
  };

  const renderMap = () => {
    canvas.innerHTML = '';
    const totalW = canvas.clientWidth;
    if (totalW < 300) return;

    const colMetrics = measureColumns(totalW);

    // Group papers by year & topic to calculate vertical spacing dynamically
    const byYearTopic = new Map();
    for (const p of papers) {
      const k = `${p.year}:${p.topic}`;
      if (!byYearTopic.has(k)) byYearTopic.set(k, []);
      byYearTopic.get(k).push(p);
    }

    const rowHeightUnit = 29;
    const yearTopPadding = 16;
    const yearBottomPadding = 16;

    const yearBands = [];
    let cursorY = 0;

    for (const y of YEARS) {
      let maxInYear = 1;
      for (const t of TOPICS) {
        const list = byYearTopic.get(`${y}:${t}`) || [];
        if (list.length > maxInYear) maxInYear = list.length;
      }
      const bandH = yearTopPadding + maxInYear * rowHeightUnit + yearBottomPadding;
      yearBands.push({ year: y, top: cursorY, height: bandH });
      cursorY += bandH;
    }

    canvas.style.height = `${cursorY}px`;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'rmap-svg');
    svg.setAttribute('viewBox', `0 0 ${totalW} ${cursorY}`);
    svg.setAttribute('aria-hidden', 'true');
    canvas.appendChild(svg);

    // Draw horizontal year dividers & labels
    yearBands.forEach((band, idx) => {
      if (idx > 0) {
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('class', 'rmap-year-line');
        line.setAttribute('x1', '0');
        line.setAttribute('x2', String(totalW));
        line.setAttribute('y1', String(band.top));
        line.setAttribute('y2', String(band.top));
        svg.appendChild(line);
      }

      const label = document.createElement('span');
      label.className = 'rmap-year-label';
      label.textContent = String(band.year);
      label.style.top = `${band.top + yearTopPadding + rowHeightUnit * 0.5}px`;
      canvas.appendChild(label);
    });

    // Compute node coordinates
    const nodePos = new Map();
    const topicPoints = new Map(TOPICS.map((t) => [t, []]));

    for (const band of yearBands) {
      TOPICS.forEach((topic, colIdx) => {
        const list = byYearTopic.get(`${band.year}:${topic}`) || [];
        const { left, width: colW } = colMetrics[colIdx];
        const railX = left + 6;
        list.forEach((paper, i) => {
          const y = band.top + yearTopPadding + rowHeightUnit * (i + 0.5);
          nodePos.set(paper.id, { x: railX, y, colIdx, colW, paper });
          topicPoints.get(topic).push({ x: railX, y, id: paper.id });
        });
      });
    }

    // Draw vertical subway rails per topic
    const railEls = [];
    for (const topic of TOPICS) {
      const pts = topicPoints.get(topic);
      if (pts.length >= 2) {
        const rail = document.createElementNS(svgNS, 'line');
        rail.setAttribute('class', 'rmap-rail-line');
        rail.setAttribute('data-topic', topic);
        rail.setAttribute('x1', String(pts[0].x));
        rail.setAttribute('x2', String(pts[0].x));
        rail.setAttribute('y1', String(pts[0].y));
        rail.setAttribute('y2', String(pts[pts.length - 1].y));
        svg.appendChild(rail);
        railEls.push(rail);
      }
    }

    // Draw curved dashed links for related papers (hidden until hover)
    const linkEls = [];
    const seenPairs = new Set();
    for (const p of papers) {
      const src = nodePos.get(p.id);
      if (!src || !Array.isArray(p.related)) continue;
      for (const relId of p.related) {
        const dst = nodePos.get(relId);
        if (!dst) continue;
        const pairKey = [p.id, relId].sort().join('--');
        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('class', 'rmap-rel-link');
        path.dataset.a = p.id;
        path.dataset.b = relId;

        const dx = dst.x - src.x;
        const dy = dst.y - src.y;
        let d;
        if (Math.abs(dx) < 2) {
          // Same column: slight bow to the left within the gutter
          const bow = Math.min(18, Math.max(10, Math.abs(dy) * 0.18));
          d = `M ${src.x} ${src.y} C ${src.x - bow} ${src.y + dy * 0.3}, ${dst.x - bow} ${dst.y - dy * 0.3}, ${dst.x} ${dst.y}`;
        } else {
          // Cross column: smooth S-curve
          d = `M ${src.x} ${src.y} C ${src.x + dx * 0.45} ${src.y}, ${dst.x - dx * 0.45} ${dst.y}, ${dst.x} ${dst.y}`;
        }
        path.setAttribute('d', d);
        svg.appendChild(path);
        linkEls.push(path);
      }
    }

    // Render interactive paper nodes
    const pubsBase = canvas.dataset.pubsBase || '';
    const nodeEls = new Map();
    for (const [id, info] of nodePos.entries()) {
      const { x, y, colW, paper } = info;
      const a = document.createElement('a');
      a.className = 'rmap-node' + (paper.highlight ? ' rmap-node--highlight' : '');
      a.href = paper.url || `${pubsBase}#pub-${paper.id}`;
      if (paper.url) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.style.left = `${x - 6}px`;
      a.style.top = `${y}px`;
      a.style.maxWidth = `${Math.max(120, colW - 6)}px`;
      a.dataset.id = id;

      const dotSlot = document.createElement('span');
      dotSlot.className = 'rmap-dot-slot';
      dotSlot.setAttribute('aria-hidden', 'true');

      const dot = document.createElement('span');
      dot.className = 'rmap-dot';
      dotSlot.appendChild(dot);

      const text = document.createElement('span');
      text.className = 'rmap-node-text';

      const shortSpan = document.createElement('span');
      shortSpan.className = 'rmap-node-short';
      shortSpan.textContent = paper.short || paper.title;
      text.appendChild(shortSpan);

      if (paper.sub) {
        const subSpan = document.createElement('span');
        subSpan.className = 'rmap-node-sub';
        subSpan.textContent = paper.sub;
        text.appendChild(subSpan);
      }

      a.appendChild(dotSlot);
      a.appendChild(text);
      canvas.appendChild(a);
      nodeEls.set(id, a);
    }

    const activate = (id) => {
      const info = nodePos.get(id);
      if (!info) return;
      const { paper } = info;
      const relatedSet = new Set([id, ...(paper.related || [])]);
      // Also include reverse links
      for (const other of papers) {
        if (Array.isArray(other.related) && other.related.includes(id)) {
          relatedSet.add(other.id);
        }
      }

      for (const [nid, el] of nodeEls.entries()) {
        el.classList.toggle('is-active', nid === id);
        el.classList.toggle('is-dim', !relatedSet.has(nid));
      }

      for (const link of linkEls) {
        const match = link.dataset.a === id || link.dataset.b === id;
        link.classList.toggle('is-active', match);
      }

      if (keyBox && cardBox && cardTitle && cardVenue && cardMeta) {
        keyBox.style.display = 'none';
        cardBox.classList.add('is-visible');
        cardTitle.textContent = paper.title;
        cardTitle.title = paper.title;
        cardVenue.className = paper.award
          ? 'venue-chip venue-chip--award'
          : (paper.highlight ? 'venue-chip' : 'venue-chip venue-chip--muted');
        cardVenue.textContent = paper.award
          ? `${paper.venue_short} · ${paper.award}`
          : (paper.venue_short || String(paper.year));
        const authors = (paper.authors || '').replace(/\.$/, '');
        cardMeta.textContent = authors;
        cardMeta.title = [paper.authors, paper.venue].filter(Boolean).join(' ');
      }
    };

    const clear = () => {
      for (const el of nodeEls.values()) {
        el.classList.remove('is-active', 'is-dim');
      }
      for (const link of linkEls) {
        link.classList.remove('is-active');
      }
      if (keyBox && cardBox) {
        keyBox.style.display = '';
        cardBox.classList.remove('is-visible');
      }
    };

    for (const [id, el] of nodeEls.entries()) {
      el.addEventListener('mouseenter', () => activate(id));
      el.addEventListener('focus', () => activate(id));
      el.addEventListener('mouseleave', clear);
      el.addEventListener('blur', clear);
    }
  };

  renderMap();

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderMap, 120);
  });
})();
