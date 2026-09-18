/* ═══════════════════════════════════════════════════════════════
   Modal Component
   ═══════════════════════════════════════════════════════════════ */

function showModal({ title, body, confirmText, cancelText, onConfirm, danger }) {
  // Remove existing modal
  const existing = document.getElementById('global-modal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'global-modal';
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        ${body}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">${cancelText || 'Cancelar'}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">${confirmText || 'Confirmar'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Animate in
  requestAnimationFrame(() => backdrop.classList.add('visible'));

  const close = () => {
    backdrop.classList.remove('visible');
    setTimeout(() => backdrop.remove(), 300);
  };

  backdrop.querySelector('#modal-close-btn').addEventListener('click', close);
  backdrop.querySelector('#modal-cancel-btn').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  backdrop.querySelector('#modal-confirm-btn').addEventListener('click', () => {
    if (onConfirm) onConfirm();
    close();
  });
}

function showTermsModal() {
  const existing = document.getElementById('terms-modal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'terms-modal';
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" style="max-width: 600px;">
      <div class="modal-header">
        <h3>📋 Termo de Compromisso</h3>
        <button class="modal-close" id="terms-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="terms-content">
          <h4>1. Aceitação dos Termos</h4>
          <p>Ao acessar e utilizar o sistema de gestão da clínica, você declara estar ciente e de acordo com os termos aqui descritos.</p>

          <h4>2. Uso Adequado do Sistema</h4>
          <p>O usuário se compromete a:</p>
          <ul>
            <li>Utilizar o sistema exclusivamente para fins profissionais relacionados à clínica;</li>
            <li>Manter a confidencialidade de suas credenciais de acesso;</li>
            <li>Não compartilhar login e senha com terceiros;</li>
            <li>Informar imediatamente qualquer uso não autorizado de sua conta.</li>
          </ul>

          <h4>3. Proteção de Dados</h4>
          <p>O usuário reconhece que os dados inseridos no sistema, incluindo dados de pacientes, são de natureza sensível e se compromete a:</p>
          <ul>
            <li>Tratar os dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD);</li>
            <li>Não copiar, transferir ou divulgar informações de pacientes sem autorização;</li>
            <li>Zelar pela integridade e confidencialidade dos registros.</li>
          </ul>

          <h4>4. Responsabilidades</h4>
          <p>O usuário é responsável por todas as ações realizadas em sua conta e pelas informações inseridas no sistema.</p>

          <h4>5. Segurança</h4>
          <p>O sistema adota medidas de segurança para proteger os dados armazenados, incluindo criptografia de senhas e autenticação por token. Contudo, o usuário deve contribuir para a segurança mantendo suas credenciais protegidas.</p>

          <h4>6. Modificações</h4>
          <p>Estes termos podem ser atualizados a qualquer momento, sendo responsabilidade do usuário verificar periodicamente as alterações.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="terms-accept-btn">Li e entendi</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('visible'));

  const close = () => {
    backdrop.classList.remove('visible');
    setTimeout(() => backdrop.remove(), 300);
  };

  backdrop.querySelector('#terms-close-btn').addEventListener('click', close);
  backdrop.querySelector('#terms-accept-btn').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
}
