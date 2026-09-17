(() => {
  'use strict';
  const tablist = document.querySelector('.research-tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[data-study]')];
  const panels = tabs.map(tab => document.getElementById(tab.dataset.study));
  const chart = document.getElementById('result-chart');
  const view = document.getElementById('result-view');
  let active = 0;
  function drawChart() {
    const rows = [...panels[active].querySelectorAll('tbody tr')].map(row => ({name: row.dataset.label, score: Number(row.dataset.score), hours: Number(row.dataset.hours)}));
    const mode = view.value;
    const values = rows.map(row => mode === 'time' ? row.hours : mode === 'change' ? (row.score / rows[0].score - 1) * 100 : row.score);
    const max = Math.max(...values.map(Math.abs)) || 1;
    const title = document.createElement('p');
    title.className = 'result-chart-title';
    title.textContent = mode === 'time' ? 'Recorded training duration · hours (not inference latency)' : mode === 'change' ? 'Error change against the first row · negative is better' : 'Selected minADE6 · metres · lower is better';
    const list = document.createElement('div');
    list.className = 'result-chart-rows';
    rows.forEach((row, i) => {
      const item = document.createElement('div');
      item.className = 'result-chart-row ' + (i === 0 ? 'is-reference' : row.score < rows[0].score ? 'is-improvement' : 'is-increase');
      const label = document.createElement('span');
      label.className = 'result-chart-label';
      label.textContent = row.name;
      const track = document.createElement('span');
      track.className = 'result-chart-track';
      track.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('span');
      bar.className = 'result-chart-bar';
      bar.style.width = `${Math.abs(values[i]) / max * 100}%`;
      track.append(bar);
      const value = document.createElement('span');
      value.className = 'result-chart-value';
      value.textContent = mode === 'time' ? `${row.hours.toFixed(2)} h` : mode === 'change' ? `${values[i] > 0 ? '+' : ''}${values[i].toFixed(2)}%` : `${row.score.toFixed(6)} m`;
      item.append(label, track, value);
      list.append(item);
    });
    const key = document.createElement('p');
    key.className = 'research-caption';
    key.textContent = mode === 'change' ? 'Bar length shows the magnitude of change. Read the signed value for its direction. The first configuration is the reference.' : 'Bars start at zero. Exact values and study context are available in the table below.';
    chart.replaceChildren(title, list, key);
  }
  function activate(index, focus = false) {
    active = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    drawChart();
    if (focus) tabs[index].focus();
  }
  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.id = `tab-${tab.dataset.study}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.dataset.study);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); activate(target, true); }
    });
  });
  tablist.hidden = false;
  document.querySelector('.results-controls').hidden = false;
  chart.hidden = false;
  activate(0);
  view.addEventListener('change', drawChart);
  function openLinkedStudy() {
    const index = tabs.findIndex(tab => '#' + tab.dataset.study === location.hash);
    if (index !== -1) { activate(index); panels[index].scrollIntoView({block:'start'}); }
  }
  window.addEventListener('hashchange', openLinkedStudy);
  openLinkedStudy();
  const copy = document.getElementById('copy-citation');
  if (copy && navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.getElementById('citation-status');
      try { await navigator.clipboard.writeText(document.getElementById('research-citation').textContent.trim()); status.textContent = ' Citation copied.'; }
      catch { status.textContent = ' Select the citation above to copy it.'; }
    });
  }
})();
