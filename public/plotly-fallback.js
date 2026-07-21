(function () {
  if (window.Plotly && typeof window.Plotly.newPlot === 'function') {
    return;
  }

  window.Plotly = {
    newPlot(container, traces, layout) {
      renderFallbackChart(container, traces || [], layout || {});
      return Promise.resolve();
    },
    purge(container) {
      if (container) container.innerHTML = '';
    }
  };

  function renderFallbackChart(container, traces, layout) {
    if (!container) return;

    const trace = traces[0] || {};
    const xValues = Array.isArray(trace.x) ? trace.x : [];
    const yValues = Array.isArray(trace.y) ? trace.y.map((value) => Number(value) || 0) : [];
    const width = Math.max(container.clientWidth || 520, 320);
    const height = Math.max(container.clientHeight || 260, 220);
    const padding = { top: 28, right: 16, bottom: 46, left: 46 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxY = Math.max(1, ...yValues);
    const isLine = trace.type === 'scatter';

    if (!xValues.length || !yValues.length) {
      container.innerHTML = '<div class="empty chart-empty">Sem dados para exibir.</div>';
      return;
    }

    const points = yValues.map((value, index) => {
      const x = padding.left + (xValues.length === 1 ? chartWidth / 2 : (chartWidth * index) / (xValues.length - 1));
      const y = padding.top + chartHeight - (value / maxY) * chartHeight;
      return { x, y, value, label: String(xValues[index]) };
    });

    const bars = points.map((point, index) => {
      const barGap = 8;
      const slot = chartWidth / points.length;
      const barWidth = Math.max(12, Math.min(46, slot - barGap));
      const x = padding.left + slot * index + (slot - barWidth) / 2;
      const y = point.y;
      const h = padding.top + chartHeight - y;
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3" fill="#0d6efd"><title>${escapeHtml(point.label)}: ${point.value}</title></rect>`;
    }).join('');

    const line = points
      .map((point) => `${point.x},${point.y}`)
      .join(' ');
    const circles = points
      .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#0d6efd"><title>${escapeHtml(point.label)}: ${point.value}</title></circle>`)
      .join('');

    const labels = points.map((point, index) => {
      if (points.length > 8 && index % Math.ceil(points.length / 8) !== 0) return '';
      const label = escapeHtml(point.label);
      return `<text x="${point.x}" y="${height - 16}" text-anchor="middle" font-size="10" fill="#667085">${label}</text>`;
    }).join('');

    const title = layout.title && layout.title.text ? layout.title.text : '';
    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" role="img" aria-label="${escapeHtml(title)}">
        <rect width="${width}" height="${height}" fill="#ffffff"></rect>
        <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="#d8dee8"></line>
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#d8dee8"></line>
        <text x="${padding.left}" y="18" font-size="12" font-weight="700" fill="#172033">${escapeHtml(title)}</text>
        <text x="${padding.left - 8}" y="${padding.top + 4}" text-anchor="end" font-size="10" fill="#667085">${formatNumber(maxY)}</text>
        ${isLine ? `<polyline points="${line}" fill="none" stroke="#0d6efd" stroke-width="3"></polyline>${circles}` : bars}
        ${labels}
      </svg>
    `;
  }

  function formatNumber(value) {
    return String(Math.round((Number(value) || 0) * 10) / 10).replace('.', ',');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
