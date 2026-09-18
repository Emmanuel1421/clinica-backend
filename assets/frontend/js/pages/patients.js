/* ═══════════════════════════════════════════════════════════════
   Patients Page — CRUD with pagination
   ═══════════════════════════════════════════════════════════════ */

let patientsPage = 1;
const PATIENTS_LIMIT = 10;

// ── List View ──
async function renderPatientsPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h2><span class="page-header-icon">👥</span> Pacientes</h2>
      <button class="btn btn-primary" id="btn-new-patient">+ Novo Paciente</button>
    </div>
    <div id="patients-stats" class="stats-grid"></div>
    <div id="patients-table-wrapper">
      <div class="loading-overlay"><div class="spinner spinner-lg"></div></div>
    </div>
  `;

  document.getElementById('btn-new-patient').addEventListener('click', () => {
    renderPatientForm();
  });

  await loadPatients();
}

async function loadPatients() {
  const wrapper = document.getElementById('patients-table-wrapper');

  try {
    const res = await api.getPatients(patientsPage, PATIENTS_LIMIT);
    const patients = res.data || [];
    const meta = res.meta || { total: 0, page: 1, limit: PATIENTS_LIMIT };

    // Stats
    const statsEl = document.getElementById('patients-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon blue">👥</div>
          <div>
            <div class="stat-value">${meta.total}</div>
            <div class="stat-label">Total de Pacientes</div>
          </div>
        </div>
      `;
    }

    if (patients.length === 0) {
      wrapper.innerHTML = `
        <div class="table-container">
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <p>Nenhum paciente cadastrado.</p>
            <button class="btn btn-primary" id="btn-first-patient">+ Cadastrar Primeiro Paciente</button>
          </div>
        </div>
      `;
      document.getElementById('btn-first-patient').addEventListener('click', () => renderPatientForm());
      return;
    }

    const totalPages = Math.ceil(meta.total / meta.limit);

    wrapper.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Nascimento</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="patients-tbody"></tbody>
        </table>
        <div class="pagination">
          <span class="pagination-info">Exibindo ${patients.length} de ${meta.total} registros</span>
          <div class="pagination-controls">
            <button class="pagination-btn" id="patients-prev" ${patientsPage <= 1 ? 'disabled' : ''}>← Anterior</button>
            <span class="pagination-page">Página ${patientsPage} de ${totalPages || 1}</span>
            <button class="pagination-btn" id="patients-next" ${patientsPage >= totalPages ? 'disabled' : ''}>Próximo →</button>
          </div>
        </div>
      </div>
    `;

    const tbody = document.getElementById('patients-tbody');
    patients.forEach(p => {
      const cpfFormatted = maskCpf(p.cpf || '');
      const phoneFormatted = p.phone ? maskPhone(p.phone) : '—';
      const birthFormatted = p.birthDate ? new Date(p.birthDate).toLocaleDateString('pt-BR') : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-primary); font-weight: 500;">${escapeHtml(p.name)}</td>
        <td>${cpfFormatted}</td>
        <td>${birthFormatted}</td>
        <td>${phoneFormatted}</td>
        <td>${escapeHtml(p.email || '—')}</td>
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
      btn.addEventListener('click', () => renderPatientForm(btn.dataset.edit));
    });

    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        showModal({
          title: 'Excluir Paciente',
          body: `<p style="color: var(--text-secondary)">Tem certeza que deseja excluir o paciente <strong>${btn.dataset.name}</strong>? Esta ação não pode ser desfeita.</p>`,
          confirmText: 'Excluir',
          danger: true,
          onConfirm: async () => {
            try {
              await api.deletePatient(btn.dataset.delete);
              showToast('Paciente excluído com sucesso!', 'success');
              await loadPatients();
            } catch (err) {
              showToast(err.message || 'Erro ao excluir.', 'error');
            }
          }
        });
      });
    });

    document.getElementById('patients-prev')?.addEventListener('click', () => {
      if (patientsPage > 1) { patientsPage--; loadPatients(); }
    });

    document.getElementById('patients-next')?.addEventListener('click', () => {
      if (patientsPage < totalPages) { patientsPage++; loadPatients(); }
    });

  } catch (err) {
    wrapper.innerHTML = `
      <div class="table-container">
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>Erro ao carregar pacientes: ${escapeHtml(err.message)}</p>
          <button class="btn btn-secondary" id="btn-retry-patients">Tentar novamente</button>
        </div>
      </div>
    `;
    document.getElementById('btn-retry-patients').addEventListener('click', loadPatients);
  }
}

// ── Form View ──
async function renderPatientForm(editId) {
  const content = document.getElementById('page-content');
  const isEdit = !!editId;
  let patient = {};

  if (isEdit) {
    try {
      const res = await api.getPatient(editId);
      patient = res.data || {};
    } catch (err) {
      showToast(err.message || 'Paciente não encontrado.', 'error');
      renderPatientsPage();
      return;
    }
  }

  const birthValue = patient.birthDate ? patient.birthDate.split('T')[0] : '';

  content.innerHTML = `
    <div class="page-header">
      <h2><span class="page-header-icon">${isEdit ? '✏️' : '➕'}</span> ${isEdit ? 'Editar' : 'Novo'} Paciente</h2>
      <button class="btn btn-secondary" id="btn-back-patients">← Voltar</button>
    </div>

    <div class="form-card">
      <form id="patient-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="patient-name">Nome <span class="required">*</span></label>
            <input type="text" id="patient-name" class="form-control" placeholder="Nome completo" maxlength="150" required value="${escapeHtml(patient.name || '')}" />
            <span class="form-error" id="patient-name-error"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="patient-cpf">CPF <span class="required">*</span></label>
            <input type="text" id="patient-cpf" class="form-control" placeholder="000.000.000-00" maxlength="14" required value="${patient.cpf ? maskCpf(patient.cpf) : ''}" />
            <span class="form-error" id="patient-cpf-error"></span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="patient-birth">Data de Nascimento <span class="required">*</span></label>
            <input type="date" id="patient-birth" class="form-control" required value="${birthValue}" />
            <span class="form-error" id="patient-birth-error"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="patient-phone">Telefone</label>
            <input type="tel" id="patient-phone" class="form-control" placeholder="(00) 00000-0000" maxlength="15" value="${patient.phone ? maskPhone(patient.phone) : ''}" />
            <span class="form-error" id="patient-phone-error"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="patient-email">E-mail</label>
          <input type="email" id="patient-email" class="form-control" placeholder="paciente@email.com" maxlength="254" value="${escapeHtml(patient.email || '')}" />
          <span class="form-error" id="patient-email-error"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="patient-address">Endereço</label>
          <input type="text" id="patient-address" class="form-control" placeholder="Rua, número, bairro..." maxlength="255" value="${escapeHtml(patient.address || '')}" />
          <span class="form-error" id="patient-address-error"></span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="patient-submit-btn">
            ${isEdit ? '💾 Salvar Alterações' : '✓ Cadastrar Paciente'}
          </button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-patient">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  // ── Masks ──
  applyMask(document.getElementById('patient-cpf'), maskCpf);
  applyMask(document.getElementById('patient-phone'), maskPhone);
  setupCharCounter(document.getElementById('patient-name'), 150);
  setupCharCounter(document.getElementById('patient-address'), 255);

  // ── Navigation ──
  document.getElementById('btn-back-patients').addEventListener('click', () => renderPatientsPage());
  document.getElementById('btn-cancel-patient').addEventListener('click', () => renderPatientsPage());

  // ── Submit ──
  document.getElementById('patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('patient-name').value;
    const cpf = document.getElementById('patient-cpf').value;
    const birthDate = document.getElementById('patient-birth').value;
    const phone = document.getElementById('patient-phone').value.replace(/\D/g, '');
    const email = document.getElementById('patient-email').value.trim();
    const address = document.getElementById('patient-address').value;

    let valid = true;

    // Name
    if (!isNotEmpty(name) || !isWithinLength(name, 150)) {
      validateField(document.getElementById('patient-name'), false, 'Nome obrigatório (máx 150 caracteres).');
      valid = false;
    } else {
      validateField(document.getElementById('patient-name'), true);
    }

    // CPF
    if (!isValidCpf(cpf)) {
      validateField(document.getElementById('patient-cpf'), false, 'CPF inválido.');
      valid = false;
    } else {
      validateField(document.getElementById('patient-cpf'), true);
    }

    // Birth Date
    if (!isValidDate(birthDate)) {
      validateField(document.getElementById('patient-birth'), false, 'Data de nascimento inválida.');
      valid = false;
    } else {
      validateField(document.getElementById('patient-birth'), true);
    }

    // Email (optional but must be valid if provided)
    if (email && !isValidEmail(email)) {
      validateField(document.getElementById('patient-email'), false, 'E-mail inválido.');
      valid = false;
    } else {
      clearFieldValidation(document.getElementById('patient-email'));
    }

    // Address
    if (address && !isWithinLength(address, 255)) {
      validateField(document.getElementById('patient-address'), false, 'Endereço muito longo (máx 255 caracteres).');
      valid = false;
    } else {
      clearFieldValidation(document.getElementById('patient-address'));
    }

    if (!valid) return;

    const btn = document.getElementById('patient-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Salvando...';

    const data = {
      name: name.trim(),
      cpf: cpf.replace(/\D/g, ''),
      birthDate,
    };
    if (phone) data.phone = phone;
    if (email) data.email = email;
    if (address.trim()) data.address = address.trim();

    try {
      if (isEdit) {
        await api.updatePatient(editId, data);
        showToast('Paciente atualizado com sucesso!', 'success');
      } else {
        await api.createPatient(data);
        showToast('Paciente cadastrado com sucesso!', 'success');
      }
      patientsPage = 1;
      renderPatientsPage();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar paciente.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = isEdit ? '💾 Salvar Alterações' : '✓ Cadastrar Paciente';
    }
  });
}
