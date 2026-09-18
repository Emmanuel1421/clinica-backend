/* ═══════════════════════════════════════════════════════════════
   Validators & Input Masks — Clínica Sistema
   ═══════════════════════════════════════════════════════════════ */

// ── CNPJ ──
function isValidCnpj(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (digits, factors) => {
    let sum = 0;
    for (let i = 0; i < factors.length; i++) {
      sum += parseInt(digits[i]) * factors[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const f1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const f2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  const d1 = calc(cnpj, f1);
  if (parseInt(cnpj[12]) !== d1) return false;

  const d2 = calc(cnpj, f2);
  if (parseInt(cnpj[13]) !== d2) return false;

  return true;
}

function maskCnpj(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// ── CPF ──
function isValidCpf(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cpf[10])) return false;

  return true;
}

function maskCpf(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ── Phone ──
function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

// ── Currency ──
function maskCurrency(value) {
  let v = value.replace(/[^\d.,]/g, '');
  // Allow only one dot or comma as decimal separator
  const parts = v.split(/[.,]/);
  if (parts.length > 2) {
    v = parts[0] + '.' + parts.slice(1).join('');
  } else if (parts.length === 2) {
    v = parts[0] + '.' + parts[1];
  }
  return v;
}

// ── Email ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Date ──
function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

// ── Generic ──
function isNotEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isWithinLength(value, max) {
  return typeof value === 'string' && value.length <= max;
}

function isNonNegativeNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

function isNonNegativeInteger(value) {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && Number.isInteger(Number(value));
}

// ── Apply mask to input ──
function applyMask(inputEl, maskFn) {
  inputEl.addEventListener('input', () => {
    const pos = inputEl.selectionStart;
    const oldLen = inputEl.value.length;
    inputEl.value = maskFn(inputEl.value);
    const newLen = inputEl.value.length;
    const newPos = pos + (newLen - oldLen);
    inputEl.setSelectionRange(newPos, newPos);
  });
}

// ── Character counter ──
function setupCharCounter(inputEl, max) {
  const counter = document.createElement('span');
  counter.className = 'char-counter';
  inputEl.parentElement.style.position = 'relative';
  inputEl.parentElement.appendChild(counter);

  const update = () => {
    const len = inputEl.value.length;
    counter.textContent = `${len}/${max}`;
    counter.classList.remove('warning', 'danger');
    if (len >= max) counter.classList.add('danger');
    else if (len >= max * 0.8) counter.classList.add('warning');
  };

  inputEl.addEventListener('input', update);
  update();
}

// ── Validate form field with visual feedback ──
function validateField(inputEl, isValid, errorMsg) {
  const errorEl = inputEl.closest('.form-group')?.querySelector('.form-error');
  if (isValid) {
    inputEl.classList.remove('error');
    inputEl.classList.add('success');
    if (errorEl) errorEl.textContent = '';
    return true;
  } else {
    inputEl.classList.remove('success');
    inputEl.classList.add('error');
    if (errorEl) errorEl.textContent = errorMsg || '';
    return false;
  }
}

// ── Clear all field validation ──
function clearFieldValidation(inputEl) {
  inputEl.classList.remove('error', 'success');
  const errorEl = inputEl.closest('.form-group')?.querySelector('.form-error');
  if (errorEl) errorEl.textContent = '';
}
