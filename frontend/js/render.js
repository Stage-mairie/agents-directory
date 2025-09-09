import { highlight, getInitials } from './helpers.js';
import { openEditForm } from './editForm.js';
import { deleteAgent } from './api.js';

// Hypothèse : tu as un tableau global "services" accessible ici
// avec la hiérarchie complète, pour afficher le nom du service.

function getFullServicePath(serviceId, services) {
  let path = [];
  let currentId = Number(serviceId);
  while (currentId) {
    const service = services.find(s => s.id === currentId);
    if (!service) break;
    path.unshift(service.nom);
    currentId = service.parent_id;
  }
  return path.join(' > ');
}

export function renderAgents(filteredAgents, searchTerm = '', services = []) {
  const agentList = document.querySelector('.agent-list');
  agentList.innerHTML = '';

  if (filteredAgents.length === 0) {
    agentList.innerHTML = '<p style="text-align:center;">Aucun agent trouvé.</p>';
    return;
  }

  filteredAgents.forEach(agent => {
    const wrapper = document.createElement('div');
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.email = agent.email;  // identifiant unique

    const photo = document.createElement('div');
    photo.className = 'agent-photo';
    photo.textContent = getInitials(agent.nom, agent.prenom);

    const headerRow = document.createElement('div');
    headerRow.className = 'agent-header-row';

    const info = document.createElement('div');
    info.className = 'agent-info';

    // On découpe le nom/prenom en spans séparés pour update plus simple
    info.innerHTML = highlight('', searchTerm); // reset avant d'ajouter

    const nomSpan = document.createElement('span');
    nomSpan.className = 'agent-nom';
    nomSpan.textContent = agent.nom + ' ';

    const prenomSpan = document.createElement('span');
    prenomSpan.className = 'agent-prenom';
    prenomSpan.textContent = agent.prenom;

    info.appendChild(nomSpan);
    info.appendChild(prenomSpan);

    headerRow.appendChild(info);

    if (window.isAdmin) {
      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.style.display = 'flex';
      buttonsWrapper.style.gap = '5px';

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(`Supprimer ${agent.prenom} ${agent.nom} ?`)) {
          deleteAgent(agent.email).then(() => {
            wrapper.remove();
          });
        }
      });

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.className = 'edit-btn';
      editBtn.addEventListener('click', e => {
        e.stopPropagation();
        openEditForm(agent, services);
      });

      buttonsWrapper.appendChild(editBtn);
      buttonsWrapper.appendChild(deleteBtn);
      headerRow.appendChild(buttonsWrapper);
    }

    card.appendChild(photo);
    card.appendChild(headerRow);

    const details = document.createElement('div');
    details.className = 'agent-details';

    details.innerHTML = `
      <div>
        <div class="row">
          <div><strong>Nom :</strong> <span class="agent-nom">${agent.nom}</span></div>
          <div><strong>Prénom(s) :</strong> <span class="agent-prenom">${agent.prenom}</span></div>
        </div>
        <div><strong>Portable :</strong> <span class="agent-portable">${agent.portable || '-'}</span></div>
        <div><strong>Fixe :</strong> <span class="agent-fixe">${agent.fixe || '-'}</span></div>
        <div><strong>Numéro de Poste :</strong> <span class="agent-numeroPoste">${agent.numeroPoste || '-'}</span></div>
        <div><strong>Poste :</strong> <span class="agent-poste">${agent.poste || '-'}</span></div>
        <div><strong>Service :</strong> <span class="agent-service">${getFullServicePath(agent.service_id, services)}</span>
        <div><strong>Mail :</strong> <a href="mailto:${agent.email}" class="agent-email">${agent.email}</a></div>
      </div>
    `;

    const container = document.createElement('div');
    container.className = 'agent-details-container';
    container.appendChild(details);

    card.addEventListener('click', () => {
      container.classList.toggle('open');
    });

    wrapper.appendChild(card);
    wrapper.appendChild(container);
    agentList.appendChild(wrapper);
  });
}
