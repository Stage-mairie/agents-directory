export async function fetchAgents() {
  const res = await fetch('/api/agents.json', { credentials: 'include' });

  if (res.status === 401) {
    window.location.href = 'login.html';
    throw new Error('Non authentifié');
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur lors du chargement des agents : ${err}`);
  }

  return res.json();
}

export async function deleteAgent(email) {
  const res = await fetch('/api/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur lors de la suppression : ${err}`);
  }

  return res.json();
}

export async function addAgent(agent) {
  const res = await fetch('/api/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(agent)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur lors de l'ajout : ${err}`);
  }
}

export async function editAgent(agent) {
  const res = await fetch('/api/edit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent),
  });

  if (!res.ok) {
    alert('Erreur lors de la modification');
  }
}

export async function getUserInfo() {
  const res = await fetch('/api/userinfo', { credentials: 'include' });

  if (!res.ok) {
    throw new Error('Utilisateur non connecté');
  }

  return res.json();
}

export async function logout() {
  const res = await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include'
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur lors de la déconnexion : ${err}`);
  }

  window.location.href = 'login.html';
}

export function refreshAgentList(renderAgentsCallback) {
  fetch('/api/agents')
    .then(res => {
      if (!res.ok) throw new Error('Erreur lors du chargement des agents');
      return res.json();
    })
    .then(data => {
      if (typeof renderAgentsCallback === 'function') {
        renderAgentsCallback(data);
      } else {
        console.warn('renderAgentsCallback non fourni ou invalide.');
      }
    })
    .catch(err => {
      console.error('Échec de la mise à jour de la liste des agents:', err);
    });
}
