/* ═══════════════════════════════════════════════════════
   CONFIG — Altere a URL da sua API aqui
═══════════════════════════════════════════════════════ */
const API_BASE = 'http://localhost:3000';

/* ═══════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════ */
let authToken = sessionStorage.getItem('token') || '';
let userCnpj  = sessionStorage.getItem('cnpj')  || '';

let pacientesPage = 1;
let produtosPage  = 1;
const PAGE_SIZE   = 10;

let confirmCallback = null;

/* ═══════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

function maskCnpj(v) {
  v = v.replace(/\D/g,'');
  return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5')
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4}?)$/,'$1.$2.$3/$4')
    .replace(/^(\d{2})(\d{3})(\d{3}?)$/,'$1.$2.$3')
    .replace(/^(\d{2})(\d{3}?)$/,'$1.$2');
}

function maskCpf(v) {
  v = v.replace(/\D/g,'');
  if (v.length > 11) v = v.slice(0,11);
  return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/,'$1.$2.$3-$4')
    .replace(/^(\d{3})(\d{3})(\d{3}?)$/,'$1.$2.$3')
    .replace(/^(\d{3})(\d{3}?)$/,'$1.$2');
}

function maskPhone(v) {
  v = v.replace(/\D/g,'');
  if (v.length > 11) v = v.slice(0,11);
  if (v.length === 11) return v.replace(/^(\d{2})(\d{5})(\d{4})$/,'($1) $2-$3');
  return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/,'($1) $2-$3').replace(/\($,'');
}

function isValidCnpj(c) {
  const n = c.replace(/\D/g,'');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (len) => {
    let s=0, pos=len-7;
    for(let i=len;i>=1;i--){s+=parseInt(n[len-i])*pos--;if(pos<2)pos=9;}
    return s%11<2?0:11-(s%11);
  };
  return calc(12)===parseInt(n[12]) && calc(13)===parseInt(n[13]);
}

function isValidCpf(c) {
  const n = c.replace(/\D/g,'');
  if (n.length!==11 || /^(\d)\1+$/.test(n)) return false;
  let s=0;
  for(let i=0;i<9;i++) s+=parseInt(n[i])*(10-i);
  let r=(s*10)%11; if(r===10||r===11)r=0; if(r!==parseInt(n[9])) return false;
  s=0;
  for(let i=0;i<10;i++) s+=parseInt(n[i])*(11-i);
  r=(s*10)%11; if(r===10||r===11)r=0;
  return r===parseInt(n[10]);
}

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function showErr(id, msg) {
  const el = $(id);
  if (el) { el.textContent = msg; }
}
function clearErr(id) { showErr(id,''); }

function showAlert(id, msg, type='error') {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.classList.remove('hidden');
}
function hideAlert(id) { const el=$(id); if(el){ el.classList.add('hidden'); } }

function fmtCpf(c='') {
  const n=c.replace(/\D/g,'');
  return n.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/,'$1.$2.$3-$4') || c;
}
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('pt-BR',{timeZone:'UTC'});
}
function fmtMoney(v) {
  return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

/* ═══════════════════════════════════════════════════════
   API
═══════════════════════════════════════════════════════ */
async function apiFetch(path, opts={}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const json = await res.json().catch(()=>({success:false,message:'Erro ao processar resposta.'}));
  return { status: res.status, ...json };
}

/* ═══════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════ */
function initLogin() {
  const cnpjEl = $('login-cnpj');
  const pwdEl  = $('login-password');

  // Mask CNPJ
  cnpjEl.addEventListener('input', e => {
    const pos = e.target.selectionStart;
    e.target.value = maskCnpj(e.target.value);
  });

  // Toggle password
  $('toggle-pwd').addEventListener('click', () => {
    const isPass = pwdEl.type === 'password';
    pwdEl.type = isPass ? 'text' : 'password';
    $('eye-icon').textContent = isPass ? '🔒' : '👁';
  });

  // Terms modal
  $('open-terms').addEventListener('click', e => { e.preventDefault(); openModal('modal-terms'); });
  $('close-terms').addEventListener('click', () => closeModal('modal-terms'));
  $('accept-terms').addEventListener('click', () => {
    $('terms').checked = true;
    closeModal('modal-terms');
  });

  $('form-login').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  hideAlert('login-error');
  clearErr('err-cnpj'); clearErr('err-pwd'); clearErr('err-terms');

  const cnpj = $('login-cnpj').value.trim();
  const pwd  = $('login-password').value;
  const terms= $('terms').checked;
  let ok = true;

  if (!cnpj || !isValidCnpj(cnpj)) { showErr('err-cnpj','CNPJ inválido.'); ok=false; }
  if (!pwd || pwd.length < 8)       { showErr('err-pwd','Mínimo 8 caracteres.'); ok=false; }
  if (!terms) {
    showErr('err-terms','É necessário aceitar o Termo de Compromisso para continuar.');
    ok=false;
  }
  if (!ok) return;

  setLoading('btn-login', true);

  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ cnpj: cnpj.replace(/\D/g,''), password: pwd, termsAccepted: true })
  });

  setLoading('btn-login', false);

  if (res.success) {
    authToken = res.data.token;
    userCnpj  = maskCnpj(res.data.user.cnpj || cnpj);
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('cnpj', userCnpj);
    enterApp();
  } else {
    showAlert('login-error', res.message || 'Credenciais inválidas.');
  }
}

function enterApp() {
  $('page-login').classList.remove('active');
  $('page-app').classList.add('active');
  $('user-cnpj-display').textContent = userCnpj;
  loadPacientes();
}

function logout() {
  authToken = ''; userCnpj = '';
  sessionStorage.clear();
  $('page-app').classList.remove('active');
  $('page-login').classList.add('active');
  $('form-login').reset();
}

function setLoading(btnId, loading) {
  const btn = $(btnId);
  if (!btn) return;
  btn.disabled = loading;
  const txt = btn.querySelector('.btn-text');
  const spn = btn.querySelector('.btn-spinner');
  if (txt) txt.style.opacity = loading ? '0' : '1';
  if (spn) spn.classList.toggle('hidden', !loading);
}

/* ═══════════════════════════════════════════════════════
   NAVEGAÇÃO
═══════════════════════════════════════════════════════ */
function initNav() {
  document.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const p = a.dataset.page;
      document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.content-section').forEach(x=>x.classList.remove('active'));
      $(`section-${p}`).classList.add('active');
      $('page-title').textContent = p.charAt(0).toUpperCase()+p.slice(1);
      if (p==='pacientes') loadPacientes();
      else if (p==='produtos') loadProdutos();
    });
  });

  $('btn-logout').addEventListener('click', logout);
}

/* ═══════════════════════════════════════════════════════
   MODAL HELPERS
═══════════════════════════════════════════════════════ */
function openModal(id) {
  $(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  $(id).classList.add('hidden');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════
   CONFIRM DIALOG
═══════════════════════════════════════════════════════ */
function confirm(msg, cb) {
  $('confirm-msg').textContent = msg;
  confirmCallback = cb;
  openModal('modal-confirm');
}

function initConfirm() {
  $('cancel-confirm').addEventListener('click', () => closeModal('modal-confirm'));
  $('ok-confirm').addEventListener('click', () => {
    closeModal('modal-confirm');
    if (confirmCallback) { confirmCallback(); confirmCallback=null; }
  });
}

/* ═══════════════════════════════════════════════════════
   PAGINAÇÃO
═══════════════════════════════════════════════════════ */
function renderPagination(containerId, total, page, onPage) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const el = $(containerId);
  el.innerHTML = '';

  const prev = document.createElement('button');
  prev.className = 'pag-btn'; prev.textContent = '‹';
  prev.disabled = page <= 1;
  prev.addEventListener('click', () => onPage(page-1));
  el.appendChild(prev);

  for (let i=1; i<=pages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pag-btn' + (i===page ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => onPage(i));
    el.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'pag-btn'; next.textContent = '›';
  next.disabled = page >= pages;
  next.addEventListener('click', () => onPage(page+1));
  el.appendChild(next);
}

/* ═══════════════════════════════════════════════════════
   PACIENTES — CRUD
═══════════════════════════════════════════════════════ */
function initPacientes() {
  $('btn-novo-paciente').addEventListener('click', () => openPacienteModal());
  $('close-paciente').addEventListener('click', () => closeModal('modal-paciente'));
  $('cancel-paciente').addEventListener('click', () => closeModal('modal-paciente'));

  // Masks
  $('p-cpf').addEventListener('input', e => { e.target.value = maskCpf(e.target.value); });
  $('p-phone').addEventListener('input', e => { e.target.value = maskPhone(e.target.value); });

  $('form-paciente').addEventListener('submit', handleSavePaciente);

  // Search
  let timer;
  $('search-pacientes').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { pacientesPage=1; loadPacientes(); }, 400);
  });
}

async function loadPacientes() {
  const tbody = $('tbody-pacientes');
  tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Carregando...</td></tr>';
  const res = await apiFetch(`/pacientes?page=${pacientesPage}&limit=${PAGE_SIZE}`);
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Erro ao carregar.</td></tr>'; return; }

  const items = res.data || [];
  const total = res.meta?.total || 0;

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Nenhum paciente cadastrado.</td></tr>';
  } else {
    tbody.innerHTML = items.map(p => `
      <tr>
        <td>${escHtml(p.name)}</td>
        <td>${fmtCpf(p.cpf)}</td>
        <td>${fmtDate(p.birthDate)}</td>
        <td>${escHtml(p.phone||'—')}</td>
        <td>${escHtml(p.email||'—')}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-ghost btn-sm" onclick="openPacienteModal('${p.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deletePaciente('${p.id}','${escHtml(p.name)}')">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  }

  renderPagination('pag-pacientes', total, pacientesPage, p => { pacientesPage=p; loadPacientes(); });
}

async function openPacienteModal(id) {
  $('form-paciente').reset();
  $('paciente-id').value = '';
  hideAlert('paciente-form-error');
  ['err-p-name','err-p-cpf','err-p-birth','err-p-email'].forEach(clearErr);

  if (id) {
    $('modal-paciente-title').textContent = 'Editar Paciente';
    const res = await apiFetch(`/pacientes/${id}`);
    if (res.success) {
      const p = res.data;
      $('paciente-id').value = p.id;
      $('p-name').value    = p.name || '';
      $('p-cpf').value     = fmtCpf(p.cpf);
      $('p-birth').value   = p.birthDate ? p.birthDate.split('T')[0] : '';
      $('p-phone').value   = p.phone || '';
      $('p-email').value   = p.email || '';
      $('p-address').value = p.address || '';
    }
  } else {
    $('modal-paciente-title').textContent = 'Novo Paciente';
  }
  openModal('modal-paciente');
}

async function handleSavePaciente(e) {
  e.preventDefault();
  hideAlert('paciente-form-error');
  ['err-p-name','err-p-cpf','err-p-birth','err-p-email'].forEach(clearErr);

  const name    = $('p-name').value.trim();
  const cpf     = $('p-cpf').value.trim();
  const birth   = $('p-birth').value;
  const phone   = $('p-phone').value.trim();
  const email   = $('p-email').value.trim();
  const address = $('p-address').value.trim();
  const id      = $('paciente-id').value;

  let ok = true;
  if (!name) { showErr('err-p-name','Nome obrigatório.'); ok=false; }
  if (!isValidCpf(cpf)) { showErr('err-p-cpf','CPF inválido.'); ok=false; }
  if (!birth) { showErr('err-p-birth','Data obrigatória.'); ok=false; }
  if (email && !isValidEmail(email)) { showErr('err-p-email','E-mail inválido.'); ok=false; }
  if (!ok) return;

  const body = { name, cpf, birthDate: birth };
  if (phone)   body.phone   = phone;
  if (email)   body.email   = email;
  if (address) body.address = address;

  setLoading('save-paciente', true);
  const res = id
    ? await apiFetch(`/pacientes/${id}`, { method:'PUT', body: JSON.stringify(body) })
    : await apiFetch('/pacientes', { method:'POST', body: JSON.stringify(body) });
  setLoading('save-paciente', false);

  if (res.success) {
    closeModal('modal-paciente');
    loadPacientes();
  } else {
    showAlert('paciente-form-error', res.message || 'Erro ao salvar.');
  }
}

function deletePaciente(id, name) {
  confirm(`Excluir o paciente "${name}"? Esta ação não pode ser desfeita.`, async () => {
    const res = await apiFetch(`/pacientes/${id}`, { method:'DELETE' });
    if (res.success) loadPacientes();
    else showAlert('pacientes-alert', res.message || 'Erro ao excluir.');
  });
}

/* ═══════════════════════════════════════════════════════
   PRODUTOS — CRUD
═══════════════════════════════════════════════════════ */
function initProdutos() {
  $('btn-novo-produto').addEventListener('click', () => openProdutoModal());
  $('close-produto').addEventListener('click', () => closeModal('modal-produto'));
  $('cancel-produto').addEventListener('click', () => closeModal('modal-produto'));

  $('form-produto').addEventListener('submit', handleSaveProduto);

  let timer;
  $('search-produtos').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { produtosPage=1; loadProdutos(); }, 400);
  });
}

async function loadProdutos() {
  const tbody = $('tbody-produtos');
  tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Carregando...</td></tr>';
  const res = await apiFetch(`/produtos?page=${produtosPage}&limit=${PAGE_SIZE}`);
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Erro ao carregar.</td></tr>'; return; }

  const items = res.data || [];
  const total = res.meta?.total || 0;

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Nenhum produto cadastrado.</td></tr>';
  } else {
    tbody.innerHTML = items.map(p => `
      <tr>
        <td><code style="color:var(--primary-hover)">${escHtml(p.codigo)}</code></td>
        <td>${escHtml(p.name)}</td>
        <td>${fmtMoney(p.preco)}</td>
        <td>
          <span class="badge ${p.estoque > 0 ? 'badge-green' : 'badge-red'}">${p.estoque}</span>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn btn-ghost btn-sm" onclick="openProdutoModal('${p.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduto('${p.id}','${escHtml(p.name)}')">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  }

  renderPagination('pag-produtos', total, produtosPage, p => { produtosPage=p; loadProdutos(); });
}

async function openProdutoModal(id) {
  $('form-produto').reset();
  $('produto-id').value = '';
  hideAlert('produto-form-error');
  ['err-prod-codigo','err-prod-name','err-prod-preco','err-prod-estoque'].forEach(clearErr);

  if (id) {
    $('modal-produto-title').textContent = 'Editar Produto';
    const res = await apiFetch(`/produtos/${id}`);
    if (res.success) {
      const p = res.data;
      $('produto-id').value   = p.id;
      $('prod-codigo').value  = p.codigo || '';
      $('prod-name').value    = p.name || '';
      $('prod-preco').value   = p.preco;
      $('prod-estoque').value = p.estoque;
      $('prod-desc').value    = p.description || '';
    }
  } else {
    $('modal-produto-title').textContent = 'Novo Produto';
  }
  openModal('modal-produto');
}

async function handleSaveProduto(e) {
  e.preventDefault();
  hideAlert('produto-form-error');
  ['err-prod-codigo','err-prod-name','err-prod-preco','err-prod-estoque'].forEach(clearErr);

  const codigo   = $('prod-codigo').value.trim();
  const name     = $('prod-name').value.trim();
  const preco    = parseFloat($('prod-preco').value);
  const estoque  = parseInt($('prod-estoque').value, 10);
  const descricao= $('prod-desc').value.trim();
  const id       = $('produto-id').value;

  let ok = true;
  if (!codigo) { showErr('err-prod-codigo','Código obrigatório.'); ok=false; }
  if (!name)   { showErr('err-prod-name','Nome obrigatório.'); ok=false; }
  if (isNaN(preco) || preco < 0)   { showErr('err-prod-preco','Preço inválido.'); ok=false; }
  if (isNaN(estoque) || estoque < 0 || !Number.isInteger(estoque)) {
    showErr('err-prod-estoque','Estoque inválido.'); ok=false;
  }
  if (!ok) return;

  const body = { codigo, name, preco, estoque };
  if (descricao) body.description = descricao;

  setLoading('save-produto', true);
  const res = id
    ? await apiFetch(`/produtos/${id}`, { method:'PUT', body: JSON.stringify(body) })
    : await apiFetch('/produtos', { method:'POST', body: JSON.stringify(body) });
  setLoading('save-produto', false);

  if (res.success) {
    closeModal('modal-produto');
    loadProdutos();
  } else {
    showAlert('produto-form-error', res.message || 'Erro ao salvar.');
  }
}

function deleteProduto(id, name) {
  confirm(`Excluir o produto "${name}"? Esta ação não pode ser desfeita.`, async () => {
    const res = await apiFetch(`/produtos/${id}`, { method:'DELETE' });
    if (res.success) loadProdutos();
    else showAlert('produtos-alert', res.message || 'Erro ao excluir.');
  });
}

/* ═══════════════════════════════════════════════════════
   XSS PREVENTION
═══════════════════════════════════════════════════════ */
function escHtml(str='') {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ═══════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initNav();
  initConfirm();
  initPacientes();
  initProdutos();

  // Se já estava logado (sessionStorage), entra direto
  if (authToken) {
    $('user-cnpj-display').textContent = userCnpj;
    $('page-login').classList.remove('active');
    $('page-app').classList.add('active');
    loadPacientes();
  }
});
