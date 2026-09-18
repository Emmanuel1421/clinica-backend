/* ═══════════════════════════════════════════════════════════════
   Main App & Router
   ═══════════════════════════════════════════════════════════════ */

const routes = {
  '#/login': renderLoginPage,
  '#/register': renderRegisterPage,
  '#/pacientes': renderPatientsPage,
  '#/produtos': renderProductsPage,
};

function initRouter() {
  const handleRouteChange = () => {
    let hash = window.location.hash || '#/login';

    // Auth guard
    const token = sessionStorage.getItem('token');
    const isAuthRoute = !['#/login', '#/register'].includes(hash);

    if (isAuthRoute && !token) {
      window.location.hash = '#/login';
      return;
    }

    if (!isAuthRoute && token) {
      window.location.hash = '#/pacientes';
      return;
    }

    // Default route
    if (!routes[hash]) {
      hash = token ? '#/pacientes' : '#/login';
      window.location.hash = hash;
      return;
    }

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[href="${hash}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Toggle layout vs login container
    const layout = document.getElementById('app-layout');
    const appDiv = document.getElementById('app');

    if (isAuthRoute) {
      if (layout) layout.style.display = 'flex';
      if (appDiv) appDiv.style.display = 'none';
    } else {
      if (layout) layout.style.display = 'none';
      if (appDiv) appDiv.style.display = 'block';
    }

    // Render page
    const renderFn = routes[hash];
    if (renderFn) renderFn();
  };

  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

function initApp() {
  // Global Logout
  document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('#btn-logout');
    if (logoutBtn) {
      e.preventDefault();
      sessionStorage.removeItem('token');
      window.location.hash = '#/login';
      showToast('Sessão encerrada.', 'info');
    }
  });

  // Mobile Menu
  document.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('#mobile-menu-btn');
    if (menuBtn) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.classList.add('visible');
      }
    }

    const overlay = e.target.closest('#sidebar-overlay');
    if (overlay) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
      }
    }
  });

  initRouter();
}

document.addEventListener('DOMContentLoaded', initApp);
