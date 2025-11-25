import { renderAgents } from './render.js';
import { agents } from './main.js';
import { services } from './main.js';

export function filterAgents() {
  const searchTerm = document.querySelector('.search-bar')?.value.trim().toLowerCase() || '';
  const normalizedTerm = searchTerm.replace(/\s+/g, '');
  const selectedServiceId = document.querySelector('#service')?.value || 'all';

  const filtered = agents.filter(agent => {
    const fullName = `${agent.prenom} ${agent.nom}`.toLowerCase().replace(/\s+/g, '');
    const matchesName = fullName.includes(normalizedTerm);
    const matchesPhone = [agent.portable, agent.fixe, agent.numeroPoste]
      .some(p => p && p.replace(/\s+/g, '').includes(normalizedTerm));
    const matchesService = selectedServiceId === 'all' || agent.service_id.toString() === selectedServiceId;

    return (matchesName || matchesPhone) && matchesService;
  });

  renderAgents(filtered, searchTerm, services, window.isAdmin);
}
