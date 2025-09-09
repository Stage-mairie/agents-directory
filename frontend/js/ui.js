import { renderAgents } from './render.js';
import { fetchAgents } from './api.js';

export let agents = [];
export let services = []; // à charger une fois, à définir depuis le module principal

export function showLoggedInUI() {
  document.getElementById('add-agent-btn').style.display = window.isAdmin ? 'inline-block' : 'none';
  document.getElementById('logout-btn').style.display = 'inline-block';
  document.getElementById('add-agent-form').style.display = 'none';
  document.getElementById('main-container').style.display = 'block';

  loadAgents();
}

export function getServiceNameById(serviceId) {
  const service = services.find(s => s.id === serviceId);
  return service ? service.nom : '';
}

export function showLoggedOutUI() {
  alert("Session expirée ou non authentifiée. Veuillez vous reconnecter.");
  window.location.href = 'login.html';
}

export async function loadAgents() {
  try {
    const data = await fetchAgents();
    agents = data.sort((a, b) => {
      const nameA = (a.nom + a.prenom).toLowerCase();
      const nameB = (b.nom + b.prenom).toLowerCase();
      return nameA.localeCompare(nameB);
    });
    filterAgents();
  } catch (err) {
    console.error('Erreur lors du chargement des agents:', err);
  }
}

export function filterAgents() {
  const searchTerm = document.querySelector('.search-bar')?.value.trim().toLowerCase() || '';
  const selectedServiceId = document.querySelector('#service')?.value || 'all';

  const filtered = agents.filter(agent => {
    const fullName = `${agent.prenom} ${agent.nom}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm);

    const matchesService = 
      selectedServiceId === 'all' || 
      (agent.service_id && agent.service_id.toString() === selectedServiceId);

    return matchesSearch && matchesService;
  });

  renderAgents(filtered, searchTerm, services);
}

// Fonction pour peupler un select avec les services enfants d'un parent donné
function populateSelectWithServices(select, parentId, services, selectedId = null) {
  select.innerHTML = '<option value="">-- Choisir --</option>';
  const children = services.filter(s => s.parent_id === parentId);
  children.forEach(service => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = service.nom;
    if (service.id === selectedId) option.selected = true;
    select.appendChild(option);
  });
}

// Fonction pour remonter la hiérarchie d'un service
function getServiceHierarchy(serviceId, services) {
  const hierarchy = [];
  let currentId = serviceId;
  while (currentId) {
    const service = services.find(s => s.id === currentId);
    if (!service) break;
    hierarchy.unshift(service); // On insère en début (niveau 1 -> niveau 3)
    currentId = service.parent_id;
  }
  return hierarchy;
}

// Fonction pour ouvrir et préremplir le formulaire d'édition avec cascade
export function openEditForm(agent, services) {
  const form = document.getElementById('edit-agent-form');
  if (!form) return;

  form.style.display = 'block';

  form['edit-email-original'].value = agent.email || '';
  form['edit-nom'].value = agent.nom || '';
  form['edit-prenom'].value = agent.prenom || '';
  form['edit-portable'].value = agent.portable || '';
  form['edit-fixe'].value = agent.fixe || '';
  form['edit-numeroPoste'].value = agent.numeroPoste || '';
  form['edit-poste'].value = agent.poste || '';
  form['edit-email'].value = agent.email || '';

  // Récupérer la hiérarchie du service de l'agent
  const hierarchy = getServiceHierarchy(agent.service_id, services);

  // Récupérer les selects
  const level1Select = document.getElementById('edit-service-level-1');
  const level2Select = document.getElementById('edit-service-level-2');
  const level3Select = document.getElementById('edit-service-level-3');

  // Niveau 1 : parent_id null
  populateSelectWithServices(level1Select, null, services, hierarchy[0]?.id || null);

  // Niveau 2 : enfants du niveau 1 sélectionné
  if (hierarchy.length > 1) {
    populateSelectWithServices(level2Select, hierarchy[0].id, services, hierarchy[1].id);
  } else {
    level2Select.innerHTML = '';
  }

  // Niveau 3 : enfants du niveau 2 sélectionné
  if (hierarchy.length > 2) {
    populateSelectWithServices(level3Select, hierarchy[1].id, services, hierarchy[2].id);
  } else {
    level3Select.innerHTML = '';
  }
}
