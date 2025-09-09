import { fetchAgents, getUserInfo } from './api.js';
import { showLoggedInUI, showLoggedOutUI } from './ui.js';
import { renderAgents } from './render.js'; 
import './events.js'; 

let services = [];

async function loadServices() {
  try {
    const res = await fetch('/api/services.json', { credentials: 'include' });
    if (!res.ok) throw new Error('Erreur chargement services');
    services = await res.json();
  } catch (err) {
    console.error('Impossible de charger les services', err);
  }
}

async function loadAndRenderAgents() {
  try {
    const agents = await fetchAgents();
    renderAgents(agents, '', services);
  } catch (err) {
    console.error('Erreur chargement agents', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await getUserInfo();
    if (data.user) {
      window.isAdmin = data.is_admin;
      showLoggedInUI();
    } else {
      showLoggedOutUI();
    }
  } catch {
    showLoggedOutUI();
  }

  await loadServices();
  await loadAndRenderAgents();
});
