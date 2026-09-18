/* ═══════════════════════════════════════════════════════════════
   API Module — Centralised HTTP communication
   ═══════════════════════════════════════════════════════════════ */

const API_BASE = '/api';

const api = {
  // ── Internal fetch wrapper ──
  async _request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    // Handle 401 — redirect to login
    if (res.status === 401) {
      sessionStorage.removeItem('token');
      window.location.hash = '#/login';
      throw new Error('Não autenticado.');
    }

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || 'Erro inesperado.');
      err.status = res.status;
      err.errors = data.errors || {};
      throw err;
    }

    return data;
  },

  // ── Auth ──
  login(cnpj, password, termsAccepted) {
    return this._request('POST', '/auth/login', { cnpj, password, termsAccepted });
  },

  register(cnpj, email, password, termsAccepted) {
    return this._request('POST', '/auth/register', { cnpj, email, password, termsAccepted });
  },

  // ── Patients ──
  getPatients(page = 1, limit = 10) {
    return this._request('GET', `/pacientes?page=${page}&limit=${limit}`);
  },

  getPatient(id) {
    return this._request('GET', `/pacientes/${id}`);
  },

  createPatient(data) {
    return this._request('POST', '/pacientes', data);
  },

  updatePatient(id, data) {
    return this._request('PUT', `/pacientes/${id}`, data);
  },

  deletePatient(id) {
    return this._request('DELETE', `/pacientes/${id}`);
  },

  // ── Products ──
  getProducts(page = 1, limit = 10) {
    return this._request('GET', `/produtos?page=${page}&limit=${limit}`);
  },

  getProduct(id) {
    return this._request('GET', `/produtos/${id}`);
  },

  createProduct(data) {
    return this._request('POST', '/produtos', data);
  },

  updateProduct(id, data) {
    return this._request('PUT', `/produtos/${id}`, data);
  },

  deleteProduct(id) {
    return this._request('DELETE', `/produtos/${id}`);
  },

  // ── Appointments ──
  getAppointments(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    return this._request('GET', `/agendamentos?${params.toString()}`);
  },

  getAppointment(id) {
    return this._request('GET', `/agendamentos/${id}`);
  },

  createAppointment(data) {
    return this._request('POST', '/agendamentos', data);
  },

  updateAppointment(id, data) {
    return this._request('PUT', `/agendamentos/${id}`, data);
  },

  deleteAppointment(id) {
    return this._request('DELETE', `/agendamentos/${id}`);
  },
};
