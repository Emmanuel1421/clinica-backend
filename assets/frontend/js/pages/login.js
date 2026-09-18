/* ═══════════════════════════════════════════════════════════════
   Login Page
   ═══════════════════════════════════════════════════════════════ */

function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <div class="login-logo-icon">🏥</div>
          <h1>Clínica Sistema</h1>
          <p>Acesse sua conta para continuar</p>
        </div>

        <div class="login-alert" id="login-alert">
          <span>⚠</span>
          <span id="login-alert-msg"></span>
        </div>

        <form class="login-form" id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-cnpj">CNPJ <span class="required">*</span></label>
            <input
              type="text"
              id="login-cnpj"
              class="form-control"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              required
              autocomplete="username"
            />
            <span class="form-error" id="login-cnpj-error"></span>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Senha <span class="required">*</span></label>
            <div class="password-wrapper">
              <input
                type="password"
                id="login-password"
                class="form-control"
                placeholder="Mínimo 8 caracteres"
                minlength="8"
                maxlength="128"
                required
                autocomplete="current-password"
              />
              <button type="button" class="password-toggle" id="login-pw-toggle" aria-label="Mostrar senha">👁</button>
            </div>
            <span class="form-error" id="login-password-error"></span>
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="login-terms" class="checkbox-input" required />
            <label for="login-terms" class="checkbox-label">
              Li e aceito o <a href="#" id="login-terms-link">Termo de Compromisso</a>
            </label>
          </div>
          <span class="form-error" id="login-terms-error" style="margin-top: -8px; display: block;"></span>

          <button type="submit" class="btn btn-primary" id="login-submit-btn">
            Entrar
          </button>
        </form>

        <div class="login-footer">
          Não tem conta? <a href="#/register">Cadastre-se</a>
        </div>
      </div>
    </div>
  `;

  // ── Mask ──
  const cnpjInput = document.getElementById('login-cnpj');
  applyMask(cnpjInput, maskCnpj);

  // ── Password toggle ──
  const pwInput = document.getElementById('login-password');
  document.getElementById('login-pw-toggle').addEventListener('click', () => {
    const isPassword = pwInput.type === 'password';
    pwInput.type = isPassword ? 'text' : 'password';
  });

  // ── Terms link ──
  document.getElementById('login-terms-link').addEventListener('click', (e) => {
    e.preventDefault();
    showTermsModal();
  });

  // ── Submit ──
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById('login-alert');
    const alertMsg = document.getElementById('login-alert-msg');
    alertEl.classList.remove('visible');

    const cnpj = cnpjInput.value;
    const password = pwInput.value;
    const terms = document.getElementById('login-terms').checked;

    // ── Front-end validation ──
    let valid = true;

    if (!cnpj || !isValidCnpj(cnpj)) {
      validateField(cnpjInput, false, 'CNPJ inválido.');
      valid = false;
    } else {
      validateField(cnpjInput, true);
    }

    if (!password || password.length < 8 || password.length > 128) {
      validateField(pwInput, false, 'Senha deve ter entre 8 e 128 caracteres.');
      valid = false;
    } else {
      validateField(pwInput, true);
    }

    if (!terms) {
      document.getElementById('login-terms-error').textContent = 'É necessário aceitar o Termo de Compromisso para continuar.';
      valid = false;
    } else {
      document.getElementById('login-terms-error').textContent = '';
    }

    if (!valid) return;

    const btn = document.getElementById('login-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Entrando...';

    try {
      const res = await api.login(cnpj, password, terms);
      sessionStorage.setItem('token', res.data.token);
      showToast('Login realizado com sucesso!', 'success');
      window.location.hash = '#/pacientes';
    } catch (err) {
      alertMsg.textContent = err.message || 'Erro ao fazer login.';
      alertEl.classList.add('visible');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Entrar';
    }
  });
}
