// main.js
import { handleLogout } from './login.js';
import { capitalizeEachWord } from './helpers.js';
import { loadServices, setupCascade, getFlatServices, getFullServiceName } from './services.js';
import {
  addAgent as apiAddAgent,
  fetchAgents,
  getUserInfo,
  editAgent as apiEditAgent,
  deleteAgent as apiDeleteAgent
} from './api.js';
import { renderAgents, updateAgentInDOM } from './render.js';
import { openEditForm } from './editAgentForm.js';

// ---------- VARIABLES ----------
export let agents = [];
let isAdmin = false;
let currentServiceFilter = null;

// ---------- ÉLÉMENTS ----------
const searchBar = document.querySelector('.search-bar');
const addForm = document.getElementById('add-agent-form');
const addBtn = document.getElementById('add-agent-btn');
const cancelBtn = document.getElementById('cancel-add-btn');
const adminBtn = document.getElementById('admin-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');

// ---------- UTILITAIRES ----------
const readFileAsBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ---------- LOGIN ----------
export async function apiLogin(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) return { success: false };
  const data = await res.json();
  return data; // { success: true, user: {...}, is_admin: true/false }
}


// ---------- FILTRAGE UNIQUE ----------
export function filterAgents() {
  const searchTerm = searchBar?.value.trim().toLowerCase() || '';

  // Récupération des 6 niveaux de selects
  const selects = [
    document.getElementById('service-level-1'),
    document.getElementById('service-level-2'),
    document.getElementById('service-level-3'),
    document.getElementById('service-level-4'),
    document.getElementById('service-level-5'),
    document.getElementById('service-level-6')
  ];

  // Dernier niveau choisi dans le formulaire d'ajout
  const selectedServiceId =
    selects.map(s => s?.value).filter(v => v)?.pop() || 'all';

  let filtered = agents.filter(agent => {
    const full = (agent.prenom + ' ' + agent.nom).toLowerCase();
    const matchesName = full.includes(searchTerm);
    const matchesPhone = [agent.portable, agent.fixe, agent.numeroPoste]
      .some(p => p?.toLowerCase().includes(searchTerm));

    // Filtre service du formulaire
    const matchesServiceSelect =
      selectedServiceId === 'all' ||
      agent.service_id.toString() === selectedServiceId;

    // Filtre service venant du dropdown custom
    const matchesDropdown =
      !currentServiceFilter || currentServiceFilter.includes(agent.service_id);

    return (matchesName || matchesPhone) && matchesServiceSelect && matchesDropdown;
  });

  renderAgents(filtered, searchTerm, getFlatServices(), isAdmin);
}


// ---------- CHARGEMENT INITIAL ----------
async function loadInitialData() {
  try {
    // --- Infos utilisateur ---
    const userData = await getUserInfo();
    window.isLoggedIn = !!userData?.user;
    window.isAdmin = !!userData?.is_admin;
    isAdmin = window.isAdmin;

    logoutBtn.style.display = window.isLoggedIn ? 'inline-block' : 'none';
    addBtn.style.display = isAdmin ? 'inline-block' : 'none';
    adminBtn.style.display = window.isLoggedIn ? 'none' : 'inline-block';
  } catch {
    window.isLoggedIn = false;
    window.isAdmin = false;
    isAdmin = false;
    logoutBtn.style.display = 'none';
    addBtn.style.display = 'none';
    adminBtn.style.display = 'inline-block';
  }

  // --- Services ---
  try {
    await loadServices(); // Charger services depuis le backend

    // ---- BARRE DE TRI PAR SERVICE (recherche textuelle) ----
    const serviceInput = document.getElementById('service-search');
    const clearBtn = document.getElementById('clear-service-filter');
    const dropdown = document.getElementById('custom-service-list');

    if (serviceInput && clearBtn && dropdown) {

      // 1. Construire fullPath pour chaque service
      const flat = getFlatServices();
      flat.forEach(s => {
        let path = s.nom;
        let parent = flat.find(p => p.id === s.parent_id);
        while (parent) {
          path = parent.nom + ' > ' + path;
          parent = flat.find(p => p.id === parent.parent_id);
        }
        s.fullPath = path;
      });

      // 2. Fonction pour descendance d’un service
      function getAllDescendants(services, parentId) {
        const descendants = [parentId];
        services
          .filter(s => s.parent_id === parentId)
          .forEach(s => descendants.push(...getAllDescendants(services, s.id)));
        return descendants;
      }

      // 3. Affiche le dropdown
      function buildDropdown(list) {
        dropdown.innerHTML = '';
        list.forEach(s => {
          const item = document.createElement('div');
          item.textContent = s.fullPath;
          item.dataset.id = s.id;
          dropdown.appendChild(item);
        });
      }

      // 4. Filtre texte → résultats
      function filterDropdown(value) {
        const search = value.toLowerCase();
        const matches = flat.filter(s => s.fullPath.toLowerCase().includes(search));
        buildDropdown(matches);
        dropdown.classList.toggle('hidden', matches.length === 0);
      }

      // 5. Lorsqu’on écrit dans l’input
      serviceInput.addEventListener('input', () => {
        const val = serviceInput.value.trim();
        if (!val) {
          dropdown.classList.add('hidden');
          filterAgents(); // utilise ta nouvelle fonction unifiée
          return;
        }
        filterDropdown(val);
      });

      // 6. Lorsqu’on clique un service du dropdown
      dropdown.addEventListener('click', e => {
        if (!e.target.dataset.id) return;

        const selectedId = Number(e.target.dataset.id);
        const match = flat.find(s => s.id === selectedId);

        serviceInput.value = match.fullPath;
        dropdown.classList.add('hidden');

        // On récupère les descendants
        const descendantIds = getAllDescendants(flat, match.id);

        // 👉 On met le filtre global
        currentServiceFilter = descendantIds;

        // 👉 On utilise maintenant filterAgents()
        filterAgents();
      });


      // 7. Bouton pour effacer le filtre
      clearBtn.addEventListener('click', () => {
        serviceInput.value = '';
        dropdown.classList.add('hidden');
        currentServiceFilter = null; // 👉 On reset !
        filterAgents();
      });

      // Fermer dropdown si on clique ailleurs
      document.addEventListener('click', e => {
        if (!e.target.closest('.service-filter')) dropdown.classList.add('hidden');
      });
    }

    // Sélecteurs du formulaire d'ajout
    const serviceSelects = [
      addForm.querySelector('[name="service-level-1"]'),
      addForm.querySelector('[name="service-level-2"]'),
      addForm.querySelector('[name="service-level-3"]'),
      addForm.querySelector('[name="service-level-4"]'),
      addForm.querySelector('[name="service-level-5"]'),
      addForm.querySelector('[name="service-level-6"]')
    ];

    // Configure la cascade exactement comme dans editForm
    setupCascade(serviceSelects);
  } catch (err) {
    console.error('Erreur chargement services :', err);
  }

  // --- Agents ---
  try {
    agents = await fetchAgents();

    // Ajouter service_nom complet à chaque agent
    agents.forEach(agent => {
      agent.service_nom = getFullServiceName(agent.service_id) || '';
    });

    // Affichage
    renderAgents(agents, searchBar?.value.trim() || '', getFlatServices(), isAdmin);
  } catch (err) {
    console.error('Erreur chargement agents :', err);
  }
}


// ---------- ÉVÉNEMENTS ----------

// Déconnexion
logoutBtn?.addEventListener('click', () => {
  handleLogout();
  adminBtn.style.display = 'inline-block';
  logoutBtn.style.display = 'none';
});

// Admin ? ouvre formulaire login
adminBtn?.addEventListener('click', () => {
  loginOverlay.style.display = 'flex';
});

// Soumission du formulaire login
loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const loginResult = await apiLogin(username, password);

    if (!loginResult.success) {
      document.getElementById('login-error').textContent = 'Identifiants incorrects';
      return;
    }

    if (!loginResult.is_admin) {
      document.getElementById('login-error').textContent = 'Accès refusé : compte non admin';
      return;
    }

    // ✅ Utilisateur admin
    window.isLoggedIn = true;
    window.isAdmin = true;
    isAdmin = true;

    loginOverlay.style.display = 'none';
    adminBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    addBtn.style.display = 'inline-block';
    document.getElementById('login-error').textContent = '';
  } catch (err) {
    console.error(err);
    document.getElementById('login-error').textContent = 'Erreur connexion';
  }
});

searchBar?.addEventListener('input', filterAgents);

// Ajouter un agent (ouvrir formulaire)
addBtn?.addEventListener('click', () => {
  if (!isAdmin) return alert("Vous n'êtes pas autorisé à effectuer cette action !");
  addForm.style.display = 'block';
  addForm.querySelector('input')?.focus();
});

// Annuler ajout
cancelBtn?.addEventListener('click', () => {
  addForm.reset();
  addForm.style.display = 'none';
});


// Soumission formulaire d’ajout
addForm?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!isAdmin) return alert("Vous n'êtes pas autorisé à effectuer cette action !");

  const f = addForm.elements;

  // Validations
  if (!f.nom.value.trim() || !f.prenom.value.trim()) {
    return alert('Nom et prénom obligatoires');
  }

  // --- Sélecteurs niveaux 1 → 6 ---
  const selects = [
    addForm.querySelector('[name="service-level-1"]'),
    addForm.querySelector('[name="service-level-2"]'),
    addForm.querySelector('[name="service-level-3"]'),
    addForm.querySelector('[name="service-level-4"]'),
    addForm.querySelector('[name="service-level-5"]'),
    addForm.querySelector('[name="service-level-6"]')
  ];

  // Récupérer le dernier niveau sélectionné (comme editForm)
  let selectedServiceId = null;
  for (let i = selects.length - 1; i >= 0; i--) {
    if (selects[i] && selects[i].value) {
      selectedServiceId = parseInt(selects[i].value);
      break;
    }
  }

  if (!selectedServiceId) {
    return alert("Veuillez choisir un service.");
  }

  // Création objet agent
  const agentData = {
    nom: f.nom.value.trim().toUpperCase(),
    prenom: capitalizeEachWord(f.prenom.value.trim()),
    portable: f.portable.value.trim(),
    fixe: f.fixe.value.trim(),
    numeroPoste: f.numeroPoste.value.trim(),
    email: f.email.value.trim(),
    service_id: selectedServiceId
  };

  try {
    // Photo (comme editForm, même logique)
    const file = f.photo.files[0];
    if (file) {
      agentData.photo = await readFileAsBase64(file);
    }

    // API
    const addedAgent = await apiAddAgent(agentData);

    addedAgent.service_nom = getFullServiceName(addedAgent.service_id);

    // Ajouter le nom complet du service
    addedAgent.service_nom = getFullServiceName(addedAgent.service_id);

    agents.push(addedAgent);

    // Rafraîchir l'affichage
    renderAgents(agents, searchBar?.value.trim() || '', getFlatServices(), isAdmin);

    // Reset form
    addForm.reset();
    addForm.style.display = 'none';

  } catch (err) {
    console.error('Erreur ajout agent:', err);
    alert('Impossible d’ajouter l’agent');
  }
});


// ---------- MODIFICATION AGENT ----------
export async function handleEditAgent(agent, updatedData) {
  if (!isAdmin) return alert("Vous n'êtes pas autorisé à effectuer cette action !");

  try {
    const updatedAgent = await apiEditAgent(agent, updatedData);
    const idx = agents.findIndex(a => a.email === agent.email);
    if (idx !== -1) agents[idx] = updatedAgent;
    updateAgentInDOM(updatedAgent);
  } catch (err) {
    console.error('Impossible de modifier l’agent:', err);
    alert('Erreur lors de la modification');
  }
}

// ---------- SUPPRESSION AGENT ----------
export async function handleDeleteAgent(email, wrapper) {
  if (!isAdmin) return alert("Vous n'êtes pas autorisé à effectuer cette action !");
  if (!confirm(`Supprimer cet agent ?`)) return;

  try {
    await apiDeleteAgent(email);
    agents = agents.filter(a => a.email !== email);
    wrapper.remove();
  } catch (err) {
    console.error(err);
    alert('Impossible de supprimer l’agent');
  }
}

// ---------- INITIALISATION ----------
document.addEventListener('DOMContentLoaded', loadInitialData);
