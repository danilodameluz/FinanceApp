// =============================================
// RELATÓRIOS
// =============================================
function renderReports() {
  const data    = getMonthlyData();
  const totInc  = data.reduce((s,d) => s + d.income,  0);
  const totExp  = data.reduce((s,d) => s + d.expense, 0);
  const savings = totInc - totExp;

  document.getElementById('report-metrics').innerHTML = `
    <div class="metric-card">
      <div class="metric-label">Total receitas (6m)</div>
      <div class="metric-value income">${fmt(totInc)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Total despesas (6m)</div>
      <div class="metric-value expense">${fmt(totExp)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Economia total</div>
      <div class="metric-value ${savings >= 0 ? 'income' : 'expense'}">${fmt(savings)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Taxa de poupança</div>
      <div class="metric-value">${totInc ? Math.round(savings / totInc * 100) : 0}%</div>
    </div>
  `;

  const ctx = document.getElementById('reportChart');
  if (S.reportChart) S.reportChart.destroy();

  S.reportChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: 'Receitas',
          data: data.map(d => d.income),
          backgroundColor: '#1D9E75',
          borderRadius: 4
        },
        {
          label: 'Despesas',
          data: data.map(d => d.expense),
          backgroundColor: '#E24B4A',
          borderRadius: 4
        },
        {
          label: 'Resultado',
          data: data.map(d => d.income - d.expense),
          type: 'line',
          fill: false,
          tension: 0.3,
          borderColor: '#378ADD',
          backgroundColor: '#378ADD',
          pointBackgroundColor: '#378ADD'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            callback: v => 'R$' + v.toLocaleString('pt-BR'),
            font: { size: 11 }
          }
        }
      }
    }
  });
}
