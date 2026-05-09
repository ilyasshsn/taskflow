const API = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Show/hide pages
const showPage = (pageId) => {
  ['login-page', 'register-page', 'dashboard-page'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById(pageId).style.display = 'block';
};

// On page load
window.onload = () => {
  if (getToken()) {
    showPage('dashboard-page');
    loadDashboard();
    loadProjects();
  } else {
    showPage('login-page');
  }

  // Draft restore for project form
  const draft = localStorage.getItem('project-draft');
  if (draft) {
    document.getElementById('project-title').value = draft;
  }
};

// Navigation
document.getElementById('go-register').onclick = () => showPage('register-page');
document.getElementById('go-login').onclick = () => showPage('login-page');

// Logout
document.getElementById('logout-btn').onclick = () => {
  localStorage.removeItem('token');
  showPage('login-page');
};

// Register
document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: document.getElementById('register-name').value,
      email: document.getElementById('register-email').value,
      password: document.getElementById('register-password').value
    })
  });
  const data = await res.json();
  alert(data.message);
  if (res.ok) showPage('login-page');
};

// Login
document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value
    })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    showPage('dashboard-page');
    loadDashboard();
    loadProjects();
  } else {
    alert(data.message);
  }
};

// Load dashboard stats
const loadDashboard = async () => {
  const res = await fetch(`${API}/dashboard`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await res.json();
  document.getElementById('stats').innerHTML = `
    <div class="stats">
      <div>Projets actifs: <b>${data.activeProjects}</b></div>
      <div>Tâches assignées: <b>${data.assignedTasks}</b></div>
      <div>Tâches terminées: <b>${data.completedTasks}</b></div>
      <div>Tâches en retard: <b>${data.lateTasks}</b></div>
    </div>
  `;
};

// Load projects
const loadProjects = async () => {
  const res = await fetch(`${API}/projects`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const projects = await res.json();
  document.getElementById('projects-list').innerHTML = projects.map(p => `
    <div class="project-card">
      <h4>${p.title}</h4>
      <p>Status: ${p.status}</p>
    </div>
  `).join('');
};

// Create project with draft autosave
document.getElementById('project-title').oninput = (e) => {
  localStorage.setItem('project-draft', e.target.value);
};

document.getElementById('project-form').onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('project-title').value;
  const res = await fetch(`${API}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ title })
  });
  if (res.ok) {
    localStorage.removeItem('project-draft');
    document.getElementById('project-title').value = '';
    loadProjects();
  }
};

