/* ═══════════════════════════════════════════════════════════════
   Products Page — CRUD with pagination
   ═══════════════════════════════════════════════════════════════ */

let productsPage = 1;
const PRODUCTS_LIMIT = 10;

// ── List View ──
async function renderProductsPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h2><span class="page-header-icon">📦</span> Produtos</h2>
      <button class="btn btn-primary" id="btn-new-product">+ Novo Produto</button>
    </div>
    <div id="products-stats" class="stats-grid"></div>
    <div id="products-table-wrapper">
      <div class="loading-overlay"><div class="spinner spinner-lg"></div></div>
    </div>
  `;

  document.getElementById('btn-new-product').addEventListener('click', () => {
    renderProductForm();
  });

  await loadProducts();
}

async function loadProducts() {
  const wrapper = document.getElementById('products-table-wrapper');

  try {
    const res = await api.getProducts(productsPage, PRODUCTS_LIMIT);
    const products = res.data || [];
    const meta = res.meta || { total: 0, page: 1, limit: PRODUCTS_LIMIT };

    // Stats
    const statsEl = document.getElementById('products-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon cyan">📦</div>
          <div>
            <div class="stat-value">${meta.total}</div>
            <div class="stat-label">Total de Produtos</div>
          </div>
        </div>
      `;
    }

    if (products.length === 0) {
      wrapper.innerHTML = `
        <div class="table-container">
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <p>Nenhum produto cadastrado.</p>
            <button class="btn btn-primary" id="btn-first-product">+ Cadastrar Primeiro Produto</button>
          </div>
        </div>
      `;
      document.getElementById('btn-first-product').addEventListener('click', () => renderProductForm());
      return;
    }

    const totalPages = Math.ceil(meta.total / meta.limit);

    wrapper.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="products-tbody"></tbody>
        </table>
        <div class="pagination">
          <span class="pagination-info">Exibindo ${products.length} de ${meta.total} registros</span>
          <div class="pagination-controls">
            <button class="pagination-btn" id="products-prev" ${productsPage <= 1 ? 'disabled' : ''}>← Anterior</button>
            <span class="pagination-page">Página ${productsPage} de ${totalPages || 1}</span>
            <button class="pagination-btn" id="products-next" ${productsPage >= totalPages ? 'disabled' : ''}>Próximo →</button>
          </div>
        </div>
      </div>
    `;

    const tbody = document.getElementById('products-tbody');
    products.forEach(p => {
      const tr = document.createElement('tr');
      const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco);
      tr.innerHTML = `
        <td><span class="badge badge-info">${escapeHtml(p.codigo)}</span></td>
        <td style="color: var(--text-primary); font-weight: 500;">${escapeHtml(p.name)}</td>
        <td>${formattedPrice}</td>
        <td>
          <span class="badge ${p.estoque > 10 ? 'badge-success' : p.estoque > 0 ? 'badge-warning' : 'badge-danger'}">
            ${p.estoque} un
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-icon" title="Editar" data-edit="${p.id}">✏️</button>
            <button class="btn btn-ghost btn-icon" title="Excluir" data-delete="${p.id}" data-name="${escapeHtml(p.name)}">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Events
    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => renderProductForm(btn.dataset.edit));
    });

    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        showModal({
          title: 'Excluir Produto',
          body: `<p style="color: var(--text-secondary)">Tem certeza que deseja excluir o produto <strong>${btn.dataset.name}</strong>? Esta ação não pode ser desfeita.</p>`,
          confirmText: 'Excluir',
          danger: true,
          onConfirm: async () => {
            try {
              await api.deleteProduct(btn.dataset.delete);
              showToast('Produto excluído com sucesso!', 'success');
              await loadProducts();
            } catch (err) {
              showToast(err.message || 'Erro ao excluir.', 'error');
            }
          }
        });
      });
    });

    document.getElementById('products-prev')?.addEventListener('click', () => {
      if (productsPage > 1) { productsPage--; loadProducts(); }
    });

    document.getElementById('products-next')?.addEventListener('click', () => {
      if (productsPage < totalPages) { productsPage++; loadProducts(); }
    });

  } catch (err) {
    wrapper.innerHTML = `
      <div class="table-container">
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>Erro ao carregar produtos: ${escapeHtml(err.message)}</p>
          <button class="btn btn-secondary" id="btn-retry-products">Tentar novamente</button>
        </div>
      </div>
    `;
    document.getElementById('btn-retry-products').addEventListener('click', loadProducts);
  }
}

// ── Form View ──
async function renderProductForm(editId) {
  const content = document.getElementById('page-content');
  const isEdit = !!editId;
  let product = {};

  if (isEdit) {
    try {
      const res = await api.getProduct(editId);
      product = res.data || {};
    } catch (err) {
      showToast(err.message || 'Produto não encontrado.', 'error');
      renderProductsPage();
      return;
    }
  }

  content.innerHTML = `
    <div class="page-header">
      <h2><span class="page-header-icon">${isEdit ? '✏️' : '➕'}</span> ${isEdit ? 'Editar' : 'Novo'} Produto</h2>
      <button class="btn btn-secondary" id="btn-back-products">← Voltar</button>
    </div>

    <div class="form-card">
      <form id="product-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="product-code">Código <span class="required">*</span></label>
            <input type="text" id="product-code" class="form-control" placeholder="Ex: PRD-001" maxlength="50" required value="${escapeHtml(product.codigo || '')}" />
            <span class="form-error" id="product-code-error"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="product-name">Nome <span class="required">*</span></label>
            <input type="text" id="product-name" class="form-control" placeholder="Nome do produto" maxlength="150" required value="${escapeHtml(product.name || '')}" />
            <span class="form-error" id="product-name-error"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="product-desc">Descrição</label>
          <textarea id="product-desc" class="form-control" placeholder="Descrição opcional..." maxlength="500" rows="3">${escapeHtml(product.description || '')}</textarea>
          <span class="form-error" id="product-desc-error"></span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="product-price">Preço (R$) <span class="required">*</span></label>
            <input type="text" id="product-price" class="form-control" placeholder="0.00" required value="${product.preco !== undefined ? product.preco : ''}" />
            <span class="form-error" id="product-price-error"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="product-stock">Estoque Inicial <span class="required">*</span></label>
            <input type="number" id="product-stock" class="form-control" min="0" step="1" required value="${product.estoque !== undefined ? product.estoque : ''}" />
            <span class="form-error" id="product-stock-error"></span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="product-submit-btn">
            ${isEdit ? '💾 Salvar Alterações' : '✓ Cadastrar Produto'}
          </button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-product">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  // ── Masks & Counters ──
  setupCharCounter(document.getElementById('product-code'), 50);
  setupCharCounter(document.getElementById('product-name'), 150);
  setupCharCounter(document.getElementById('product-desc'), 500);

  const priceInput = document.getElementById('product-price');
  applyMask(priceInput, maskCurrency);
  blockCopyPasteInForm(document.getElementById('product-form'));

  // ── Navigation ──
  document.getElementById('btn-back-products').addEventListener('click', () => renderProductsPage());
  document.getElementById('btn-cancel-product').addEventListener('click', () => renderProductsPage());

  // ── Submit ──
  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = document.getElementById('product-code').value;
    const name = document.getElementById('product-name').value;
    const desc = document.getElementById('product-desc').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value;

    let valid = true;

    if (!isNotEmpty(code) || !isWithinLength(code, 50)) {
      validateField(document.getElementById('product-code'), false, 'Código obrigatório (máx 50).');
      valid = false;
    } else {
      validateField(document.getElementById('product-code'), true);
    }

    if (!isNotEmpty(name) || !isWithinLength(name, 150)) {
      validateField(document.getElementById('product-name'), false, 'Nome obrigatório (máx 150).');
      valid = false;
    } else {
      validateField(document.getElementById('product-name'), true);
    }

    if (desc && !isWithinLength(desc, 500)) {
      validateField(document.getElementById('product-desc'), false, 'Descrição muito longa.');
      valid = false;
    } else {
      clearFieldValidation(document.getElementById('product-desc'));
    }

    if (!isNonNegativeNumber(price)) {
      validateField(document.getElementById('product-price'), false, 'Preço inválido.');
      valid = false;
    } else {
      validateField(document.getElementById('product-price'), true);
    }

    if (!isNonNegativeInteger(stock)) {
      validateField(document.getElementById('product-stock'), false, 'Estoque deve ser inteiro positivo.');
      valid = false;
    } else {
      validateField(document.getElementById('product-stock'), true);
    }

    if (!valid) return;

    const btn = document.getElementById('product-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Salvando...';

    const data = {
      codigo: code.trim(),
      name: name.trim(),
      preco: parseFloat(price.replace(',', '.')),
      estoque: parseInt(stock, 10)
    };
    if (desc.trim()) data.description = desc.trim();

    try {
      if (isEdit) {
        await api.updateProduct(editId, data);
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        await api.createProduct(data);
        showToast('Produto cadastrado com sucesso!', 'success');
      }
      productsPage = 1;
      renderProductsPage();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar produto.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = isEdit ? '💾 Salvar Alterações' : '✓ Cadastrar Produto';
    }
  });
}
