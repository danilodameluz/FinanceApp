// =============================================
// CATEGORIAS — Listagem
// =============================================
function renderCategories() { renderCatGrid(); }

function setCatTab(type, el) {
  S.catTabType = type;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderCatGrid();
}

function renderCatGrid() {
  const cats     = S.categories.filter(c => c.type === S.catTabType);
  const month    = thisMonth();
  const txs      = monthlyTx(month).filter(t => t.type === 'expense');
  const spentMap = {};
  txs.forEach(t => {
    if (t.catId) spentMap[t.catId] = (spentMap[t.catId] || 0) + t.amount;
  });

  document.getElementById('cat-grid').innerHTML = cats.length
    ? cats.map(c => {
        const bg       = COLOR_BG[c.color] || '#f5f5f3';
        const spent    = spentMap[c.id] || 0;
        const pct      = c.budget > 0 ? Math.min(Math.round(spent / c.budget * 100), 100) : 0;
        const barColor = pct > 90 ? '#E24B4A' : pct > 70 ? '#EF9F27' : c.color;
        return `<div class="cat-card">
          <div class="cat-card-top">
            <div class="cat-emoji" style="background:${bg}">
              <i class="ti ${c.icon}" style="color:${c.color};font-size:18px"></i>
            </div>
            <span class="cat-name">${c.name}</span>
          </div>
          ${c.budget > 0
            ? `<div class="cat-budget">${fmt(spent)} / ${fmt(c.budget)}</div>
               <div class="budget-bar-bg">
                 <div class="budget-bar-fill" style="width:${pct}%;background:${barColor}"></div>
               </div>`
            : `<div class="cat-budget" style="color:#aaa">Sem orçamento</div>`
          }
          <div class="cat-actions">
            <button class="icon-btn" onclick="editCat(${c.id})" title="Editar">
              <i class="ti ti-edit"></i>
            </button>
            <button class="icon-btn danger" onclick="deleteCat(${c.id})" title="Excluir">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </div>`;
      }).join('')
    : `<div class="empty-state" style="grid-column:1/-1">
         <i class="ti ti-tag-off"></i>
         Nenhuma categoria de ${S.catTabType === 'expense' ? 'despesa' : 'receita'} ainda<br><br>
         <button class="btn btn-primary" onclick="openCatModal()">
           <i class="ti ti-plus"></i>Criar categoria
         </button>
       </div>`;
}

async function deleteCat(id) {
  if (!confirm('Excluir esta categoria?')) return;
  try {
    await api('DELETE', '/categories/' + id);
    await loadAll();
    renderCatGrid();
  } catch(e) { alert(e.message); }
}

function editCat(id) {
  const c = getCat(id);
  if (!c) return;
  S.editingCatId  = id;
  S.catModalType  = c.type;
  S.selectedIcon  = c.icon;
  S.selectedColor = c.color;
  document.getElementById('cat-modal-title').textContent = 'Editar categoria';
  document.getElementById('c-name').value   = c.name;
  document.getElementById('c-budget').value = c.budget || '';
  ['expense','income'].forEach(t => {
    document.getElementById('crb-' + t).className =
      'radio-btn' + (t === c.type ? ' sel-' + t : '');
  });
  buildIconPicker();
  buildColorPicker();
  document.getElementById('modal-cat').classList.add('open');
}

// =============================================
// MODAL: CATEGORIA
// =============================================
function openCatModal() {
  S.editingCatId  = null;
  S.catModalType  = S.catTabType || 'expense';
  S.selectedIcon  = 'ti-shopping-cart';
  S.selectedColor = '#1D9E75';
  document.getElementById('cat-modal-title').textContent = 'Nova categoria';
  document.getElementById('c-name').value   = '';
  document.getElementById('c-budget').value = '';
  ['expense','income'].forEach(t => {
    document.getElementById('crb-' + t).className =
      'radio-btn' + (t === S.catModalType ? ' sel-' + t : '');
  });
  buildIconPicker();
  buildColorPicker();
  document.getElementById('modal-cat').classList.add('open');
}

function closeCatModal() {
  document.getElementById('modal-cat').classList.remove('open');
}

function selectCatType(type) {
  S.catModalType = type;
  ['expense','income'].forEach(t => {
    document.getElementById('crb-' + t).className =
      'radio-btn' + (t === type ? ' sel-' + t : '');
  });
}

function buildIconPicker() {
  document.getElementById('icon-picker').innerHTML = ICONS.map(ic =>
    `<div class="icon-opt${ic === S.selectedIcon ? ' selected' : ''}" onclick="selectIcon('${ic}')">
       <i class="ti ${ic}" style="font-size:16px;color:#1a1a1a"></i>
     </div>`
  ).join('');
}

function selectIcon(ic) {
  S.selectedIcon = ic;
  document.querySelectorAll('.icon-opt').forEach(el => {
    el.classList.toggle('selected', el.querySelector('i').className.includes(ic));
  });
}

function buildColorPicker() {
  document.getElementById('color-picker').innerHTML = COLORS.map(c =>
    `<div class="color-opt${c === S.selectedColor ? ' selected' : ''}"
          style="background:${c}" onclick="selectColor('${c}')"></div>`
  ).join('');
}

function selectColor(c) {
  S.selectedColor = c;
  document.querySelectorAll('.color-opt').forEach(el => {
    el.classList.toggle('selected', el.style.background === c);
  });
}

async function saveCategory() {
  const name = document.getElementById('c-name').value.trim();
  if (!name) { alert('Informe o nome da categoria.'); return; }
  const budget = parseFloat(document.getElementById('c-budget').value) || 0;
  const body   = {
    name,
    type  : S.catModalType.toUpperCase(),
    icon  : S.selectedIcon,
    color : S.selectedColor,
    budget
  };
  try {
    if (S.editingCatId) {
      await api('PUT', '/categories/' + S.editingCatId, body);
    } else {
      await api('POST', '/categories', body);
    }
    closeCatModal();
    await loadAll();
    renderCatGrid();
  } catch(e) { alert(e.message); }
}
