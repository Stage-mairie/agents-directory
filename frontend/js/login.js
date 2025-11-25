// login.js

const adminBtn = document.getElementById('admin-btn');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const loginOverlay = document.getElementById('login-overlay');
const loginCloseBtn = document.getElementById('login-close-btn');

// --- Afficher / masquer le mini formulaire admin ---
adminBtn?.addEventListener('click', () => {
  const show = loginForm.style.display === 'block';
  loginForm.style.display = show ? 'none' : 'block';

  if (!show) {
    loginForm.querySelector('input')?.focus();
  }
});

// --- Soumission du formulaire de login ---
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Identifiants incorrects");
    }

    const data = await res.json();

    // 🔹 Vérifier si l'utilisateur est admin
    if (!data.is_admin) {
      loginError.textContent = "Seuls les administrateurs peuvent se connecter ici !";
      loginForm.reset();
      return;
    }

    // 🔹 Si admin : recharger la page pour afficher les boutons
    window.isLoggedIn = true;
    window.isAdmin = true;
    loginForm.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    window.location.reload();

  } catch (err) {
    loginError.textContent = err.message;
  }
});


// --- Déconnexion ---
export async function handleLogout() {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // Réinitialiser l'affichage (admin hidden)
    window.location.reload();

  } catch (err) {
    console.error("Erreur déconnexion:", err);
  }
}

loginCloseBtn?.addEventListener('click', () => {
  loginOverlay.style.display = 'none';
});

logoutBtn?.addEventListener('click', handleLogout);
