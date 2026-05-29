// =============================================
// ORÇAMENTO
// =============================================
function renderBudget() {
  const month    = thisMonth();
  const txs      = monthlyTx(month).filter(t => t.type === 'expense');
  const spentMap = {};
  txs.forEach(t => {
    if (t.catId) spentMap[t.catId] = (spentMap[t.catId] || 0) + t.amount;
  });

  const cats = S.categories.filter(c => c.type === 'expense' && c.budget > 0);

  if (!cats.length) {
    document.getElementById('budget-card').innerHTML = `
      <div class="card-title">Orçamento por categoria</div>
      <div class="empty-state">
        <i class="ti ti-chart-pie-off"></i>
        Nenhuma categoria com orçamento definido.<br><br>
        <button class="btn btn-primary"
                onclick="showPage('categories', document.querySelectorAll('.nav-item')[3])">
          <i class="ti ti-tag"></i>Configurar categorias
        </button>
      </div>`;
    return;
  }

  const rows = cats.map(c => {
    const spent    = spentMap[c.id] || 0;
    const pct      = Math.min(Math.round(spent / c.budget * 100), 100);
    const barColor = pct > 90 ? '#E24B4A' : pct > 70 ? '#EF9F27' : c.color;
    return `<div style="margin-bottom:1.25rem">
      <div style="display:flex;justify-content:space-between;font-size:13px;
                  margin-bottom:4px;align-items:center">
        <span style="display:flex;align-items:center;gap:6px">
          <i class="ti ${c.icon}" style="color:${c.color};font-size:15px"></i>
          ${c.name}
        </span>
        <span style="color:#666">
          ${fmt(spent)}
          <span style="color:#aaa">/ ${fmt(c.budget)}</span>
        </span>
      </div>
      <div class="budget-bar-bg">
        <div class="budget-bar-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div style="font-size:11px;color:#aaa;margin-top:3px">
        ${pct}% utilizado · Restam ${fmt(Math.max(c.budget - spent, 0))}
      </div>
    </div>`;
  }).join('');

  document.getElementById('budget-card').innerHTML =
    '<div class="card-title">Orçamento vs gastos — mês atual</div>' + rows;
}
