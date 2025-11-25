import { renderAgents } from './render.js';
import { fetchAgents } from './api.js';
import { agents, services } from './main.js';

/**
 * Affiche l'interface principale et charge les agents
 */
export async function initAgentsUI() {
  document.getElementById('main-container').style.display = 'block';
  document.getElementById('logout-btn').style.display = window.isLoggedIn ? 'inline-block' : 'none';
  document.getElementById('add-agent-btn').style.display = window.isAdmin ? 'inline-block' : 'none';
  await loadAgents();
}

/**
 * Charge les agents et met à jour le tableau global
 */
export async function loadAgents() {
  const result = await fetchAgents();

  // met à jour le tableau global sans réassigner
  agents.length = 0;
  agents.push(...result);

  renderAgents(agents, '', services, window.isAdmin || false);
}

/**
 * Filtrage par nom / téléphone / service
 */
export function filterAgents() {
  const searchTerm = document.querySelector('.search-bar')?.value.trim().toLowerCase() || '';

  const selects = [
    document.getElementById('service-level-1'),
    document.getElementById('service-level-2'),
    document.getElementById('service-level-3')
  ];

  const selectedServiceId =
    selects.map(s => s?.value).filter(v => v)?.pop() || 'all';

  const filtered = agents.filter(agent => {
    const fullName = (agent.prenom + ' ' + agent.nom).toLowerCase();

    const matchesName = fullName.includes(searchTerm);
    const matchesPhone = [agent.portable, agent.fixe, agent.numeroPoste].some(
      p => p?.includes(searchTerm)
    );

    const matchesService =
      selectedServiceId === 'all' ||
      agent.service_id?.toString() === selectedServiceId;

    return (matchesName || matchesPhone) && matchesService;
  });

  renderAgents(filtered, searchTerm, getFlatServices(), window.isAdmin || false);
}

