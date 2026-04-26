// API Configuration
const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadApp();
});

function loadApp() {
  if (token) {
    verifyToken();
  } else {
    showPage('login');
  }
}

// API Helpers
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: getHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error en la solicitud');
    }

    return result;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

// Auth
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const result = await apiCall('/auth/login', 'POST', { email, password });
    token = result.token;
    currentUser = result.user;
    localStorage.setItem('token', token);
    showToast('Bienvenido ' + currentUser.name, 'success');
    showPage(currentUser.role === 'admin' ? 'admin' : 'home');
    loadDashboard();
  } catch (error) {
    showToast('Error al iniciar sesión', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    await apiCall('/auth/register', 'POST', { name, email, password });
    showToast('Cuenta creada. Por favor inicia sesión', 'success');
    showPage('login');
  } catch (error) {
    showToast('Error al registrar', 'error');
  }
}

async function verifyToken() {
  try {
    // There shouldn't be a generic /auth/verify built according to the provided routes. We'll simulate its logic loosely
    // Alternatively, just load the app directly if we had a verifiable verify endpoint
    // To make it functional, I am just fetching simple health or assuming token works until failure
    currentUser = jwtDecode(token); // Just assuming token is fine for UI, or letting API calls fail
    showPage(currentUser.role === 'admin' ? 'admin' : 'home');
    loadDashboard();
  } catch (error) {
    // if fail, silently go to login
    logout();
  }
}

function jwtDecode(t) {
  try {
    return JSON.parse(atob(t.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  showPage('login');
  showToast('Sesión cerrada', 'success');
}

// Pages
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.classList.add('active');
  }
  renderPage(page);
}

function renderPage(page) {
  const app = document.getElementById('app');

  if (page === 'login') {
    renderLoginPage();
  } else if (page === 'register') {
    renderRegisterPage();
  } else if (page === 'home') {
    renderHomePage();
  } else if (page === 'admin') {
    renderAdminPage();
  } else if (page === 'new-report') {
    renderNewReportPage();
  } else if (page === 'gallery') {
    renderGalleryPage();
  }
}

function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav>
      <div class="nav-content">
        <h1>🏢 Monterrey Reporta</h1>
        <div>
          <a href="#" onclick="showPage('register'); return false" class="btn" style="margin-right: 1rem;">Registrarse</a>
        </div>
      </div>
    </nav>

    <div class="page active">
      <div class="form-container">
        <h2>Iniciar Sesión</h2>
        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" id="login-email" required>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" id="login-password" required>
          </div>
          <button type="submit" class="btn" style="width: 100%; margin-top: 1rem;">Iniciar Sesión</button>
        </form>
        <p style="text-align: center; margin-top: 1rem;">
          ¿No tienes cuenta? <a href="#" onclick="showPage('register'); return false">Registrarse</a>
        </p>
        <!-- Credenciales de prueba -->
        <div style="background: #f0f0f0; padding: 1rem; margin-top: 2rem; border-radius: 0.5rem;">
          <strong>Credenciales de prueba:</strong>
          <p>Admin: admin@monterrey.mx / password123</p>
          <p>Usuario: juan@example.com / password123</p>
        </div>
      </div>
    </div>
  `;
}

function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav>
      <div class="nav-content">
        <h1>🏢 Monterrey Reporta</h1>
        <div>
          <a href="#" onclick="showPage('login'); return false" class="btn">Iniciar Sesión</a>
        </div>
      </div>
    </nav>

    <div class="page active">
      <div class="form-container">
        <h2>Crear Cuenta</h2>
        <form onsubmit="handleRegister(event)">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" id="register-name" required>
          </div>
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" id="register-email" required>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" id="register-password" required minlength="6">
          </div>
          <button type="submit" class="btn" style="width: 100%; margin-top: 1rem;">Registrarse</button>
        </form>
        <p style="text-align: center; margin-top: 1rem;">
          ¿Ya tienes cuenta? <a href="#" onclick="showPage('login'); return false">Iniciar sesión</a>
        </p>
      </div>
    </div>
  `;
}

function renderHomePage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav>
      <div class="nav-content">
        <h1>🏢 Monterrey Reporta</h1>
        <div>
          <a href="#" onclick="showPage('gallery'); return false" class="btn" style="margin-right: 1rem;">Galería</a>
          <a href="#" onclick="showPage('new-report'); return false" class="btn" style="margin-right: 1rem;">Nuevo Reporte</a>
          <a href="#" onclick="logout(); return false" class="btn btn-danger">Cerrar Sesión</a>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="hero">
        <h1>Bienvenido ${currentUser.name}</h1>
        <p>Reporta problemas urbanos y ayuda a mejorar tu ciudad</p>
      </div>

      <div id="my-reports-section"></div>
    </div>
  `;

  loadMyReports();
}

function renderNewReportPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav>
      <div class="nav-content">
        <h1>🏢 Monterrey Reporta</h1>
        <button onclick="showPage('home')" class="btn btn-secondary">← Volver</button>
      </div>
    </nav>

    <div class="container">
      <div class="form-container">
        <h2>Nuevo Reporte</h2>
        <form onsubmit="handleNewReport(event)">
          <div class="form-group">
            <label>Título</label>
            <input type="text" id="report-title" required>
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select id="report-category" required>
              <option>Bache</option>
              <option>Basura</option>
              <option>Luminaria</option>
              <option>Fuga de agua</option>
              <option>Señalización</option>
            </select>
          </div>
          <div class="form-group">
            <label>Ubicación</label>
            <input type="text" id="report-location" required>
          </div>
          <div class="form-group">
            <label>Municipio</label>
            <select id="report-municipality" required>
              <option>Monterrey</option>
              <option>Apodaca</option>
              <option>San Pedro Garza García</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea id="report-description" required rows="5"></textarea>
          </div>
          <button type="submit" class="btn" style="width: 100%;">Enviar Reporte</button>
        </form>
      </div>
    </div>
  `;
}

function renderGalleryPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav>
      <div class="nav-content">
        <h1>🏢 Monterrey Reporta</h1>
        <button onclick="showPage('home')" class="btn btn-secondary">← Volver</button>
      </div>
    </nav>

    <div class="container">
      <h2>Galería de Resoluciones</h2>
      <div id="gallery-content" class="gallery-grid"></div>
    </div>
  `;

  loadGallery();
}

function renderAdminPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav>
      <div class="nav-content">
        <h1>🏢 Monterrey Reporta - Admin</h1>
        <button onclick="logout()" class="btn btn-danger">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="container">
      <h2>Panel Administrativo</h2>
      
      <div id="admin-stats" class="stats-grid"></div>
      
      <h3 style="margin-top: 2rem;">Reportes para Gestionar</h3>
      <div id="admin-reports"></div>
    </div>
  `;

  loadAdminDashboard();
}

// Load functions
async function loadMyReports() {
  try {
    const result = await apiCall('/reports/my-reports');
    const section = document.getElementById('my-reports-section');
    
    if (result.reports.length === 0) {
      section.innerHTML = '<p>No has creado reportes aún</p>';
      return;
    }

    let html = '<h3>Mis Reportes</h3><table><thead><tr><th>Título</th><th>Categoría</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>';
    
    result.reports.forEach(report => {
      html += `
        <tr>
          <td>${report.title}</td>
          <td>${report.category}</td>
          <td><span class="badge badge-${report.status.toLowerCase().replace(' ', '-')}">${report.status}</span></td>
          <td>${new Date(report.created_at).toLocaleDateString('es-ES')}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    section.innerHTML = html;
  } catch (error) {
    console.error('Error cargando reportes:', error);
  }
}

async function loadGallery() {
  try {
    const result = await apiCall('/reports/all');
    const gallery = document.getElementById('gallery-content');
    
    const resolved = result.reports.filter(r => r.status === 'Resuelto' && r.photo_url);
    
    if (resolved.length === 0) {
      gallery.innerHTML = '<p>No hay resoluciones con fotos aún</p>';
      return;
    }

    let html = '';
    resolved.forEach(report => {
      html += `
        <div class="gallery-item" onclick="viewReportDetail(${report.id})">
          <img src="http://localhost:3000${report.photo_url}" alt="${report.title}">
        </div>
      `;
    });

    gallery.innerHTML = html;
  } catch (error) {
    console.error('Error cargando galería:', error);
  }
}

async function loadAdminDashboard() {
  try {
    const result = await apiCall('/admin/stats');
    const statsDiv = document.getElementById('admin-stats');
    
    const stats = result.stats;
    statsDiv.innerHTML = `
      <div class="stat-card">
        <h4>Total de Reportes</h4>
        <div class="number">${stats.total}</div>
      </div>
      <div class="stat-card">
        <h4>Pendientes</h4>
        <div class="number">${stats.pending || 0}</div>
      </div>
      <div class="stat-card">
        <h4>En Proceso</h4>
        <div class="number">${stats.progress || 0}</div>
      </div>
      <div class="stat-card">
        <h4>Resueltos</h4>
        <div class="number">${stats.resolved || 0}</div>
      </div>
    `;

    loadAdminReports();
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

async function loadAdminReports() {
  try {
    const result = await apiCall('/admin/reports');
    const reportsDiv = document.getElementById('admin-reports');
    
    if (result.reports.length === 0) {
      reportsDiv.innerHTML = '<p>No hay reportes</p>';
      return;
    }

    let html = '<table><thead><tr><th>Título</th><th>Categoría</th><th>Usuario</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    
    result.reports.forEach(report => {
      html += `
        <tr>
          <td>${report.title}</td>
          <td>${report.category}</td>
          <td>${report.user_name}</td>
          <td>
            <select onchange="updateStatus(${report.id}, this.value)">
              <option value="Pendiente" ${report.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="En proceso" ${report.status === 'En proceso' ? 'selected' : ''}>En proceso</option>
              <option value="Resuelto" ${report.status === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
            </select>
          </td>
          <td>
            <button class="btn" onclick="openEvidenceModal(${report.id})">Evidencia</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    reportsDiv.innerHTML = html;
  } catch (error) {
    console.error('Error cargando reportes admin:', error);
  }
}

async function handleNewReport(e) {
  e.preventDefault();

  const data = {
    title: document.getElementById('report-title').value,
    category: document.getElementById('report-category').value,
    location: document.getElementById('report-location').value,
    municipality: document.getElementById('report-municipality').value,
    description: document.getElementById('report-description').value
  };

  try {
    await apiCall('/reports', 'POST', data);
    showToast('Reporte creado exitosamente', 'success');
    showPage('home');
  } catch (error) {
    showToast('Error al crear reporte', 'error');
  }
}

async function updateStatus(reportId, status) {
  try {
    await apiCall(`/admin/reports/${reportId}/status`, 'PUT', { status });
    showToast('Estado actualizado', 'success');
    loadAdminReports();
  } catch (error) {
    showToast('Error al actualizar estado', 'error');
  }
}

function openEvidenceModal(reportId) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.parentElement.parentElement.remove()">×</span>
      <h2>Agregar Evidencia</h2>
      <form onsubmit="handleEvidenceSubmit(event, ${reportId})">
        <div class="form-group">
          <label>Foto</label>
          <input type="file" id="evidence-photo" accept="image/*" required>
        </div>
        <div class="form-group">
          <label>Comentarios</label>
          <textarea id="evidence-comments" required rows="4"></textarea>
        </div>
        <div class="form-group">
          <label>Fecha de Resolución</label>
          <input type="date" id="evidence-date" required>
        </div>
        <button type="submit" class="btn" style="width: 100%;">Guardar Evidencia</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

async function handleEvidenceSubmit(e, reportId) {
  e.preventDefault();

  const fileInput = document.getElementById('evidence-photo');
  const comments = document.getElementById('evidence-comments').value;
  const date = document.getElementById('evidence-date').value;

  const formData = new FormData();
  formData.append('photo', fileInput.files[0]);
  formData.append('comments', comments);
  formData.append('resolution_date', date);

  try {
    const response = await fetch(`${API_URL}/admin/reports/${reportId}/evidence`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al guardar evidencia');
    }

    showToast('Evidencia guardada', 'success');
    document.querySelector('.modal').remove();
    loadAdminReports();
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

function loadDashboard() {
  if (currentUser && currentUser.role === 'admin') {
    loadAdminDashboard();
  }
}

// Utilities
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function viewReportDetail(reportId) {
  alert('Ver detalles del reporte ' + reportId);
}
