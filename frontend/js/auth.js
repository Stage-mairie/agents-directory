import { logout } from './api.js';

// Connexion utilisateur
export function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const loginError = document.getElementById('login-error');
  loginError.textContent = '';

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error('Échec HTTP');
      return res.json();
    })
    .then(data => {
      if (data.success) {
        window.location.href = 'agents.html';
      } else {
        loginError.textContent = 'Échec de la connexion.';
      }
    })
    .catch(() => {
      loginError.textContent = 'Identifiants incorrects.';
    });
}

// Déconnexion utilisateur
export function handleLogout() {
  logout().then(() => {
    window.location.href = 'login.html';
  });
}
