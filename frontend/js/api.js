// api.js
import { updateAgentInDOM } from './render.js';
import { getFlatServices } from './services.js';

export async function fetchAgents() {
  try {
    const res = await fetch('/api/agents.json', { credentials: 'include' });
    if (!res.ok) throw new Error('Non authentifié ou erreur serveur');
    return await res.json();
  } catch (err) {
    console.error('Erreur fetchAgents:', err);
    return [];
  }
}

export async function getUserInfo() {
  try {
    const res = await fetch('/api/userinfo', { credentials: 'include' });
    if (!res.ok) return {};
    return await res.json();
  } catch (err) {
    console.error('Erreur getUserInfo:', err);
    return {};
  }
}

export async function handleLogin({ username, password }) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur login');
    }
    return await res.json();
  } catch (err) {
    console.error('Erreur handleLogin:', err);
    throw err;
  }
}

export async function handleLogout() {
  try {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    window.isAdmin = false;
    window.isLoggedIn = false;
    window.location.reload();
  } catch (err) {
    console.error('Erreur handleLogout:', err);
  }
}

export async function addAgent(agent) {
  try {
    const res = await fetch('/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(agent)
    });
    if (!res.ok) throw new Error('Erreur ajout agent');
    return await res.json();
  } catch (err) {
    console.error('Erreur addAgent:', err);
    throw err;
  }
}

export async function deleteAgent(email) {
  try {
    const res = await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Erreur suppression agent');
    return await res.json();
  } catch (err) {
    console.error('Erreur deleteAgent:', err);
    throw err;
  }
}

export async function editAgent(agent, updatedData) {
  try {
    const body = { originalEmail: agent.email, ...updatedData };

    const res = await fetch('/api/edit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error('Erreur modification');

    const updatedAgent = await res.json();

    // Trouver le nom du service
    const flat = getFlatServices();
    const serv = flat.find(s => s.id === updatedAgent.service_id);
    updatedAgent.service_nom = serv ? serv.nom : '';

    updateAgentInDOM(updatedAgent);

    return updatedAgent;
  } catch (err) {
    console.error('Impossible de modifier l’agent:', err);
    throw err;
  }
}
