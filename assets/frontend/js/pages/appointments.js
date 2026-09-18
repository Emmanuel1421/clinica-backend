/* ═══════════════════════════════════════════════════════════════
   Appointments Page — Calendar + CRUD
   ═══════════════════════════════════════════════════════════════ */

let apptCurrentDate = new Date();
let apptSelectedDate = null;

const STATUS_LABELS = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  concluido: 'Concluído',
};
const STATUS_COLORS = {
  agendado: 'badge-info',
  confirmado: 'badge-success',
  cancelado: 'badge-danger',
  concluido: 'badge-warning',
};

// ── Main Page ──────────────────────────────────────────────────
async function renderAppointmentsPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h2><span class="page-header-icon">📅</span> Agendamentos</h2>
      <button class="btn btn-primary" id="btn-new-appt">+ Novo Agendamento</button>
    </div>

    <div class="appt-layout">
      <!-- Calendar -->
      <div class="calendar-card" id="calendar-card">
        <div class="calendar-header">
          <button class="calendar-nav" id="cal-prev">‹</button>
          <span class="calendar-month" id="cal-month-label"></span>
          <button class="calendar-nav" id="cal-next">›</button>
        </div>
        <div class="calendar-weekdays">
          <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
        </div>
        <div class="calendar-grid" id="calendar-grid"></div>
      </div>

      <!-- Day appointments -->
      <div class="appt-day-panel" id="appt-day-panel">
        <div class="appt-day-header" id="appt-day-header">
          <span>Selecione um dia no calendário</span>
        </div>
        <div id="appt-day-list"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-new-appt').addEventListener('click', () => renderAppointmentForm());
  document.getElementById('cal-prev').addEventListener('click', () => {
    apptCurrentDate.setMonth(apptCurrentDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    apptCurrentDate.setMonth(apptCurrentDate.getMonth() + 1);
    renderCalendar();
  });

  apptSelectedDate = formatDate(new Date());
  await renderCalendar();
}

async function renderCalendar() {
  const year = apptCurrentDate.getFullYear();
  const month = apptCurrentDate.getMonth();

  // Month label
  document.getElementById('cal-month-label').textContent =
    apptCurrentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());

  // Fetch all appointments in the month
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

  let monthAppts = {};
  try {
    // Fetch page 1 with large limit to cover the month
    const res = await api.getAppointments(1, 200, { dateFrom: startDate, dateTo: endDate });
    (res.data || []).forEach(a => {
      if (!monthAppts[a.date]) monthAppts[a.date] = [];
      monthAppts[a.date].push(a);
    });
  } catch {
    // silent
  }

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = formatDate(new Date());

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-cell empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (dateStr === today) cell.classList.add('today');
    if (dateStr === apptSelectedDate) cell.classList.add('selected');

    const count = monthAppts[dateStr]?.length || 0;
    cell.innerHTML = `
      <span class="cal-day-num">${d}</span>
      ${count > 0 ? `<span class="cal-dot" title="${count} agendamento(s)">${count}</span>` : ''}
    `;
    cell.addEventListener('click', () => {
      apptSelectedDate = dateStr;
      // Remove old selected
      grid.querySelectorAll('.cal-cell.selected').forEach(el => el.classList.remove('selected'));
      cell.classList.add('selected');
      loadDayAppointments(dateStr, monthAppts[dateStr] || []);
    });
    grid.appendChild(cell);
  }

  // Load selected date
  if (apptSelectedDate) {
    loadDayAppointments(apptSelectedDate, monthAppts[apptSelectedDate] || []);
  }
}

function loadDayAppointments(dateStr, appts) {
  const header = document.getElementById('appt-day-header');
  const list = document.getElementById('appt-day-list');

  const [y, m, d] = dateStr.split('-');
  const label = new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  header.innerHTML = `
    <span>${label.replace(/^\w/, c => c.toUpperCase())}</span>
    <button class="btn btn-primary btn-sm" id="btn-new-appt-day">+ Agendar</button>
  `;
  document.getElementById('btn-new-appt-day').addEventListener('click', () => renderAppointmentForm(null, dateStr));

  if (appts.length === 0) {
    list.innerHTML = `<div class="appt-empty">Nenhum agendamento neste dia.</div>`;
    return;
  }

  // Sort by time
  const sorted = [...appts].sort((a, b) => a.time.localeCompare(b.time));

  list.innerHTML = '';
  sorted.forEach(a => {
    const card = document.createElement('div');
    card.className = 'appt-card';
    card.innerHTML = `
      <div class="appt-time">${a.time}</div>
      <div class="appt-info">
        <div class="appt-title">${escapeHtml(a.title)}</div>
        <div class="appt-patient">👤 ${escapeHtml(a.patientName || 'Paciente')}</div>
        ${a.notes ? `<div class="appt-notes">${escapeHtml(a.notes)}</div>` : ''}
      </div>
      <div class="appt-actions">
        <span class="badge ${STATUS_COLORS[a.status] || 'badge-info'}">${STATUS_LABELS[a.status] || a.status}</span>
        <button class="btn btn-ghost btn-icon" title="Editar" data-edit-appt="${a.id}">✏️</button>
        <button class="btn btn-ghost btn-icon" title="Excluir" data-delete-appt="${a.id}" data-title="${escapeHtml(a.title)}">🗑️</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('[data-edit-appt]').forEach(btn => {
    btn.addEventListener('click', () => renderAppointmentForm(btn.dataset.editAppt));
  });

  list.querySelectorAll('[data-delete-appt]').forEach(btn => {
    btn.addEventListener('click', () => {
      showModal({
        title: 'Excluir Agendamento',
        body: `<p style="color: var(--text-secondary)">Excluir o agendamento <strong>${btn.dataset.title}</strong>?</p>`,
        confirmText: 'Excluir',
        danger: true,
        onConfirm: async () => {
          try {
            await api.deleteAppointment(btn.dataset.deleteAppt);
            showToast('Agendamento excluído.', 'success');
            await renderCalendar();
          } catch (err) {
            showToast(err.message || 'Erro ao excluir.', 'error');
          }
        }
      });
    });
  });
}

// ── Form ───────────────────────────────────────────────────────
async function renderAppointmentForm(editId, prefillDate) {
  const content = document.getElementById('page-content');
  const isEdit = !!editId;
  let appt = {};
  let patients = [];

  // Load patients for select
  try {
    const res = await api.getPatients(1, 200);
    patients = res.data || [];
  } catch {
    patients = [];
  }

  if (isEdit) {
    try {
      const res = await api.getAppointment(editId);
      appt = res.data || {};
    } catch (err) {
      showToast(err.message || 'Agendamento não encontrado.', 'error');
      renderAppointmentsPage();
      return;
    }
  }

  const dateValue = appt.date || prefillDate || formatDate(new Date());

  const patientOptions = patients.map(p =>
    `<option value="${p.id}" ${appt.patientId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
  ).join('');

  content.innerHTML = `
    <div class="page-header">
      <h2><span class="page-header-icon">${isEdit ? '✏️' : '➕'}</span> ${isEdit ? 'Editar' : 'Novo'} Agendamento</h2>
      <button class="btn btn-secondary" id="btn-back-appts">← Voltar</button>
    </div>

    <div class="form-card">
      <form id="appt-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="appt-patient">Paciente <span class="required">*</span></label>
          <select id="appt-patient" class="form-control" required>
            <option value="">— Selecione o paciente —</option>
            ${patientOptions}
          </select>
          <span class="form-error" id="appt-patient-error"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="appt-title">Título <span class="required">*</span></label>
          <input type="text" id="appt-title" class="form-control" placeholder="Ex: Consulta de rotina" maxlength="150" required value="${escapeHtml(appt.title || '')}" />
          <span class="form-error" id="appt-title-error"></span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="appt-date">Data <span class="required">*</span></label>
            <input type="date" id="appt-date" class="form-control" required value="${dateValue}" />
            <span class="form-error" id="appt-date-error"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="appt-time">Hora <span class="required">*</span></label>
            <input type="time" id="appt-time" class="form-control" required value="${appt.time || ''}" />
            <span class="form-error" id="appt-time-error"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="appt-status">Status</label>
          <select id="appt-status" class="form-control">
            <option value="agendado" ${(!appt.status || appt.status === 'agendado') ? 'selected' : ''}>Agendado</option>
            <option value="confirmado" ${appt.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
            ${isEdit ? `<option value="cancelado" ${appt.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>` : ''}
            <option value="concluido" ${appt.status === 'concluido' ? 'selected' : ''}>Concluído</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="appt-notes">Observações</label>
          <textarea id="appt-notes" class="form-control" placeholder="Observações opcionais..." maxlength="500" rows="3">${escapeHtml(appt.notes || '')}</textarea>
          <span class="form-error" id="appt-notes-error"></span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="appt-submit-btn">
            ${isEdit ? '💾 Salvar Alterações' : '✓ Agendar'}
          </button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-appt">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  setupCharCounter(document.getElementById('appt-title'), 150);
  setupCharCounter(document.getElementById('appt-notes'), 500);

  document.getElementById('btn-back-appts').addEventListener('click', () => renderAppointmentsPage());
  document.getElementById('btn-cancel-appt').addEventListener('click', () => renderAppointmentsPage());

  document.getElementById('appt-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const patientId = document.getElementById('appt-patient').value;
    const title = document.getElementById('appt-title').value;
    const date = document.getElementById('appt-date').value;
    const time = document.getElementById('appt-time').value;
    const status = document.getElementById('appt-status').value;
    const notes = document.getElementById('appt-notes').value;

    let valid = true;

    if (!patientId) {
      validateField(document.getElementById('appt-patient'), false, 'Selecione um paciente.');
      valid = false;
    } else {
      validateField(document.getElementById('appt-patient'), true);
    }

    if (!title || title.trim().length === 0 || title.length > 150) {
      validateField(document.getElementById('appt-title'), false, 'Título obrigatório (máx 150 caracteres).');
      valid = false;
    } else {
      validateField(document.getElementById('appt-title'), true);
    }

    if (!date) {
      validateField(document.getElementById('appt-date'), false, 'Data obrigatória.');
      valid = false;
    } else {
      validateField(document.getElementById('appt-date'), true);
    }

    if (!time) {
      validateField(document.getElementById('appt-time'), false, 'Hora obrigatória.');
      valid = false;
    } else {
      validateField(document.getElementById('appt-time'), true);
    }

    if (!valid) return;

    const btn = document.getElementById('appt-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Salvando...';

    const payload = { patientId, title: title.trim(), date, time, status };
    if (notes.trim()) payload.notes = notes.trim();

    try {
      if (isEdit) {
        await api.updateAppointment(editId, payload);
        showToast('Agendamento atualizado!', 'success');
      } else {
        await api.createAppointment(payload);
        showToast('Agendamento criado!', 'success');
      }
      apptSelectedDate = date;
      apptCurrentDate = new Date(date + 'T12:00:00');
      renderAppointmentsPage();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar agendamento.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = isEdit ? '💾 Salvar Alterações' : '✓ Agendar';
    }
  });
}

// ── Helpers ────────────────────────────────────────────────────
function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
