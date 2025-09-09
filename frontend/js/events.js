import { handleLogout, handleLogin } from './auth.js';
import { filterAgents, agents } from './ui.js';
import { addAgent } from './api.js';
import { capitalizeEachWord } from './helpers.js';
import { setupCascade } from './services.js';

// Chargement de la hiérarchie des services
fetch("/api/services.json")
  .then(res => res.json())
  .then(services => {
    const selects = [
      document.getElementById("service-level-1"),
      document.getElementById("service-level-2"),
      document.getElementById("service-level-3")
    ].filter(Boolean);
    setupCascade(selects, services);
  })
  .catch(err => {
    console.error("Erreur lors du chargement des services :", err);
  });

// Gestion des événements généraux
document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
document.querySelector('.search-bar')?.addEventListener('input', filterAgents);
document.querySelector('#service')?.addEventListener('change', filterAgents);
document.getElementById('login-form')?.addEventListener('submit', handleLogin);

// Tri alphabétique
let sortAsc = true;
document.getElementById('sort-alpha-btn')?.addEventListener('click', () => {
  agents.sort((a, b) => {
    const nameA = (a.nom + a.prenom).toLowerCase();
    const nameB = (b.nom + b.prenom).toLowerCase();
    return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
  sortAsc = !sortAsc;
  filterAgents();
});

// Gestion du formulaire d'ajout d'agent
const addForm = document.getElementById('add-agent-form');
const addFormBtn = document.getElementById('add-agent-btn');
const cancelAddBtn = document.getElementById('cancel-add-btn');

addFormBtn?.addEventListener('click', () => {
  addForm.style.display = 'block';
  addForm.querySelector('input')?.focus();
});

cancelAddBtn?.addEventListener('click', () => {
  addForm.reset();
  addForm.style.display = 'none';
});

addForm?.addEventListener('submit', e => {
  e.preventDefault();

  const { prenom, nom, portable, fixe, numeroPoste, poste, email } = addForm.elements;

  // Validation simple
  if (!nom.value.trim() || !prenom.value.trim()) {
    showMessage("Nom et prénom sont obligatoires.", "error");
    return;
  }

  const serviceId = ["service-level-3", "service-level-2", "service-level-1"]
    .map(id => document.getElementById(id)?.value)
    .find(Boolean);

  if (!serviceId) {
    showMessage("Veuillez sélectionner un service.", "error");
    return;
  }

  const agent = {
    nom: nom.value.trim().toUpperCase(),
    prenom: capitalizeEachWord(prenom.value.trim()),
    portable: portable.value.trim(),
    fixe: fixe.value.trim(),
    numeroPoste: numeroPoste.value.trim(),
    poste: poste.value.trim(),
    email: email.value.trim(),
    service_id: parseInt(serviceId, 10)
  };

  addAgent(agent)
    .then(() => {
      agents.push(agent);
      filterAgents();
      addForm.reset();
      addForm.style.display = 'none';
      showMessage("Agent ajouté avec succès.", "success");
    })
    .catch(() => showMessage("Erreur lors de l'ajout.", "error"));
});

// Affichage d'un message temporaire (succès/erreur)
function showMessage(text, type = "success") {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3500);
}

