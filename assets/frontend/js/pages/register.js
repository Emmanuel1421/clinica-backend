/* ═══════════════════════════════════════════════════════════════
   Register Page
   ═══════════════════════════════════════════════════════════════ */

function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <div class="login-logo-icon">🏥</div>
          <h1>Criar Conta</h1>
          <p>Cadastre sua clínica no sistema</p>
        </div>

        <div class="login-alert" id="register-alert">
          <span>⚠</span>
          <span id="register-alert-msg"></span>
        </div>

        <form class="login-form" id="register-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="reg-cnpj">CNPJ <span class="required">*</span></label>
            <input
              type="text"
              id="reg-cnpj"
              class="form-control"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              required
            />
            <span class="form-error" id="reg-cnpj-error"></span>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">E-mail <span class="required">*</span></label>
            <input
              type="email"
              id="reg-email"
              class="form-control"
              placeholder="clinica@email.com"
              maxlength="254"
              required
            />
            <span class="form-error" id="reg-email-error"></span>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password">Senha <span class="required">*</span></label>
            <div class="password-wrapper">
              <input
                type="password"
                id="reg-password"
                class="form-control"
                placeholder="Mínimo 8 caracteres"
                minlength="8"
                maxlength="128"
                required
                autocomplete="new-password"
              />
              <button type="button" class="password-toggle" id="reg-pw-toggle" aria-label="Mostrar senha">👁</button>
            </div>
            <span class="form-error" id="reg-password-error"></span>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password-confirm">Confirmar Senha <span class="required">*</span></label>
            <div class="password-wrapper">
              <input
                type="password"
                id="reg-password-confirm"
                class="form-control"
                placeholder="Repita a senha"
                minlength="8"
                maxlength="128"
                required
                autocomplete="new-password"
              />
            </div>
            <span class="form-error" id="reg-password-confirm-error"></span>
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="reg-terms" class="checkbox-input" required />
            <label for="reg-terms" class="checkbox-label">
              Li e aceito o <a href="#" id="reg-terms-link">Termo de Compromisso</a>
            </label>
          </div>
          <span class="form-error" id="reg-terms-error" style="margin-top: -8px; display: block;"></span>

          <button type="submit" class="btn btn-primary" id="register-submit-btn">
            Cadastrar
          </button>
        </form>

        <div class="login-footer">
          Já tem conta? <a href="#/login">Fazer login</a>
        </div>
      </div>
    </div>
  `;

  // ── Mask ──
  const cnpjInput = document.getElementById('reg-cnpj');
  applyMask(cnpjInput, maskCnpj);

  // ── Password toggles ──
  document.getElementById('reg-pw-toggle').addEventListener('click', () => {
    const pw = document.getElementById('reg-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // ── Terms link ──
  document.getElementById('reg-terms-link').addEventListener('click', (e) => {
    e.preventDefault();
    showTermsModal();
  });

  // ── Submit ──
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById('register-alert');
    const alertMsg = document.getElementById('register-alert-msg');
    alertEl.classList.remove('visible');

    const cnpj = cnpjInput.value;
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    const terms = document.getElementById('reg-terms').checked;

    let valid = true;

    if (!cnpj || !isValidCnpj(cnpj)) {
      validateField(cnpjInput, false, 'CNPJ inválido.');
      valid = false;
    } else {
      validateField(cnpjInput, true);
    }

    const emailInput = document.getElementById('reg-email');
    if (!email || !isValidEmail(email)) {
      validateField(emailInput, false, 'E-mail inválido.');
      valid = false;
    } else {
      validateField(emailInput, true);
    }

    const pwInput = document.getElementById('reg-password');
    if (!password || password.length < 8 || password.length > 128) {
      validateField(pwInput, false, 'Senha deve ter entre 8 e 128 caracteres.');
      valid = false;
    } else {
      validateField(pwInput, true);
    }

    const pwConfirmInput = document.getElementById('reg-password-confirm');
    if (password !== passwordConfirm) {
      validateField(pwConfirmInput, false, 'As senhas não coincidem.');
      valid = false;
    } else if (passwordConfirm) {
      validateField(pwConfirmInput, true);
    }

    if (!terms) {
      document.getElementById('reg-terms-error').textContent = 'É necessário aceitar o Termo de Compromisso para continuar.';
      valid = false;
    } else {
      document.getElementById('reg-terms-error').textContent = '';
    }

    if (!valid) return;

    const btn = document.getElementById('register-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Cadastrando...';

    try {
      await api.register(cnpj, email, password, terms);
      showToast('Conta criada com sucesso! Faça login.', 'success');
      window.location.hash = '#/login';
    } catch (err) {
      alertMsg.textContent = err.message || 'Erro ao cadastrar.';
      alertEl.classList.add('visible');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Cadastrar';
    }
  });
}
