// render.js
import { highlight } from './helpers.js';
import { openEditForm } from './editAgentForm.js';
import { deleteAgent } from './api.js';
import { getFlatServices } from './services.js';

let sortState = 'none'; // 'none' | 'asc' | 'desc'

export function getFullServicePath(serviceId) {
  const services = getFlatServices();
  let path = [];
  let currentId = Number(serviceId);

  while (currentId) {
    const s = services.find(s => s.id === currentId);
    if (!s) break;
    path.unshift(s.nom);
    currentId = s.parent_id;
  }
  return path.join(' > ');
}

function formatPhoneNumber(num) {
  if (!num) return '';
  const digits = num.replace(/\D/g, '');
  if (digits.length !== 10) return num;
  return digits.slice(0, 2) + ' ' + digits.slice(2).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

function highlightText(text, searchTerm) {
  if (!searchTerm) return text;
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  return text.replace(regex, match => `<mark>${match}</mark>`);
}

function createCopyButton(textToCopy, useFormatted = false) {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.title = 'Copier';
  btn.textContent = '📋';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const value = useFormatted ? formatPhoneNumber(textToCopy) : textToCopy.replace(/\D/g, '');
    navigator.clipboard.writeText(value).then(() => {
      btn.style.opacity = "1";
      btn.style.color = "#2e7d32";
      setTimeout(() => { btn.style.opacity = ""; btn.style.color = ""; }, 800);
    });
  });
  return btn;
}

export function renderAgents(agentList, searchTerm = '', services = [], isAdmin = false) {
  const container = document.getElementById('agents-container');
  if (!container) return;
  container.innerHTML = '';

  // --- Tri bouton ---
  let sortBtn = document.getElementById('sort-alpha-btn');
  if (!sortBtn) {
    sortBtn = document.createElement('button');
    sortBtn.id = 'sort-alpha-btn';
    sortBtn.textContent = 'Trier A-Z';
    sortBtn.style.marginBottom = '15px';
    container.parentNode.insertBefore(sortBtn, container);
  }

  sortBtn.onclick = () => {
    sortState = sortState === 'asc' ? 'desc' : 'asc';
    renderAgents(agentList, searchTerm, services, isAdmin);
  };

  let displayList = [...agentList];
  if (searchTerm) {
    const lower = searchTerm.toLowerCase().replace(/\s+/g, '');
    displayList = displayList.filter(a => {
      const fields = [
        a.nom, a.prenom, a.email, 
        a.portable, a.fixe
      ];
      return fields.some(f => f && f.toLowerCase().replace(/\s+/g,'').includes(lower));
    });
  }

  if (sortState === 'asc') {
    displayList.sort((a,b) => (a.nom || '').localeCompare(b.nom || '', 'fr', { sensitivity: 'base' }));
    sortBtn.textContent = 'Trier Z-A';
  } else if (sortState === 'desc') {
    displayList.sort((a,b) => (b.nom || '').localeCompare(a.nom || '', 'fr', { sensitivity: 'base' }));
    sortBtn.textContent = 'Trier A-Z';
  } else {
    sortBtn.textContent = 'Trier A-Z';
  }

  if (!displayList.length) {
    container.innerHTML = '<p style="text-align:center;">Aucun agent trouvé.</p>';
    return;
  }

  displayList.forEach(agent => {
    const wrapper = document.createElement('div');
    wrapper.className = 'agent-wrapper';

    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.email = agent.email;

    const photoDiv = document.createElement('div');
    photoDiv.className = 'agent-photo';
    const img = document.createElement('img');
    if (agent.photo) {
      img.src = agent.photo.startsWith('data:') ? agent.photo : `/photos/${agent.photo}?t=${Date.now()}`;
    } else {
      img.src = 'https://th.bing.com/th/id/OIP.pSsEZ9p68wlgE_MwzgzyugHaHa?w=186&h=186&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3';
    }
    img.alt = `${agent.prenom} ${agent.nom}`;
    photoDiv.appendChild(img);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'agent-header';
    const namesDiv = document.createElement('div');
    namesDiv.className = 'agent-names';
    namesDiv.innerHTML = `<span class="agent-nom">${highlight(agent.nom, searchTerm)}</span> 
                          <span class="agent-prenom">${highlight(agent.prenom, searchTerm)}</span>`;
    headerDiv.appendChild(namesDiv);

    if (isAdmin) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'agent-actions';
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', e => { e.stopPropagation(); openEditForm(agent); });
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '🗑️';
      deleteBtn.addEventListener('click', async e => {
        e.stopPropagation();
        if (confirm(`Supprimer ${agent.prenom} ${agent.nom} ?`)) {
          await deleteAgent(agent.email);
          wrapper.remove();
        }
      });
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      headerDiv.appendChild(actionsDiv);
    }

    card.appendChild(photoDiv);
    card.appendChild(headerDiv);

    const details = document.createElement('div');
    details.className = 'agent-details';

    const emailDiv = document.createElement('div');
    emailDiv.innerHTML = `<strong>Email :</strong> <a href="mailto:${agent.email}">${highlight(agent.email, searchTerm)}</a>`;
    if (agent.email) emailDiv.appendChild(createCopyButton(agent.email, true));
    details.appendChild(emailDiv);

    const portableDiv = document.createElement('div');
    portableDiv.innerHTML = `<strong>Portable :</strong> ${highlight(formatPhoneNumber(agent.portable) || '-', searchTerm)}`;
    if (agent.portable) portableDiv.appendChild(createCopyButton(agent.portable));
    details.appendChild(portableDiv);

    const fixeDiv = document.createElement('div');
    fixeDiv.innerHTML = `<strong>Fixe :</strong> ${highlight(formatPhoneNumber(agent.fixe) || '-', searchTerm)}`;
    if (agent.fixe) fixeDiv.appendChild(createCopyButton(agent.fixe));
    details.appendChild(fixeDiv);

    const numDiv = document.createElement('div');
    numDiv.innerHTML = `<strong>Numéro de Poste :</strong> ${highlight(agent.numeroPoste || '-', searchTerm)}`;
    details.appendChild(numDiv);

    const serviceDiv = document.createElement('div');
    serviceDiv.innerHTML = `<strong>Service :</strong> ${highlight(getFullServicePath(agent.service_id), searchTerm)}`;
    details.appendChild(serviceDiv);

    const containerDetails = document.createElement('div');
    containerDetails.className = 'agent-details-container';
    containerDetails.appendChild(details);

    card.addEventListener('click', () => containerDetails.classList.toggle('open'));

    wrapper.appendChild(card);
    wrapper.appendChild(containerDetails);
    container.appendChild(wrapper);

    // ouvrir détails si recherche match
    if (searchTerm) {
      const queryNormalized = searchTerm.replace(/\s+/g, '');
      const phoneFields = [agent.portable, agent.fixe, agent.numeroPoste];
      const phoneMatches = phoneFields.some(p => p && p.replace(/\s+/g, '').includes(queryNormalized));
      const textFields = [agent.nom, agent.prenom, agent.email];
      const textMatches = textFields.some(f => f && f.toLowerCase().replace(/\s+/g, '').includes(queryNormalized.toLowerCase()));
      if (phoneMatches || textMatches) containerDetails.classList.add('open');
    }
  });
}

/**
 * Met à jour uniquement la carte d'un agent dans le DOM
 * @param {Object} agent - l'agent modifié
 */
export function updateAgentInDOM(agent) {
  const card = document.querySelector(`.agent-card[data-email="${agent.email}"]`);
  if (!card) return;

  card.querySelector('.agent-nom').textContent = agent.nom;
  card.querySelector('.agent-prenom').textContent = agent.prenom;
  card.querySelector('.agent-service').textContent = getFullServicePath(agent.service_id) || '';

  if (agent.portable !== undefined) card.querySelector('.agent-portable').textContent = formatPhoneNumber(agent.portable);
  if (agent.fixe !== undefined) card.querySelector('.agent-fixe').textContent = formatPhoneNumber(agent.fixe);
  if (agent.numeroPoste !== undefined) card.querySelector('.agent-numeroPoste').textContent = agent.numeroPoste;
  if (agent.email !== undefined) card.querySelector('.agent-email').textContent = agent.email;

  if (agent.photo) {
    const img = card.querySelector('img');
    if (img) img.src = `/photos/${agent.photo}?t=${Date.now()}`;
  }
}
