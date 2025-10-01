import { highlight, getInitials } from './helpers.js';
import { openEditForm } from './editForm.js';
import { deleteAgent } from './api.js';

// Fonction utilitaire pour retrouver le chemin complet du service
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

// --- Fonction utilitaire pour formater les numéros à la française ---
function formatPhoneNumber(num) {
  if (!num) return '';
  const digits = num.replace(/\D/g, '');
  if (digits.length !== 10) return num;  // si ce n'est pas 10 chiffres, on retourne tel quel
  return digits.slice(0, 4) + ' ' + digits.slice(4).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

// --- Fonction pour créer un bouton de copie ---
function createCopyButton(textToCopy, useFormattedDisplay = false) {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.title = 'Copier';

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const value = useFormattedDisplay ? formatPhoneNumber(textToCopy) : textToCopy.replace(/\D/g, '');
    navigator.clipboard.writeText(value).then(() => {
      btn.style.opacity = "1";
      btn.style.color = "#2e7d32";
      setTimeout(() => {
        btn.style.opacity = "";
        btn.style.color = "";
      }, 800);
    });
  });

  return btn;
}

export function renderAgents(filteredAgents, searchTerm = '', services = []) {
  const agentList = document.querySelector('.agent-list');
  agentList.innerHTML = '';

  if (filteredAgents.length === 0) {
    agentList.innerHTML = '<p style="text-align:center;">Aucun agent trouvé.</p>';
    return;
  }

  const queryNormalized = searchTerm.replace(/\s+/g, '').toLowerCase();

  filteredAgents.forEach(agent => {
    const wrapper = document.createElement('div');
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.email = agent.email;

    const photo = document.createElement('div');
    photo.className = 'agent-photo';
    photo.textContent = getInitials(agent.nom, agent.prenom);

    const headerRow = document.createElement('div');
    headerRow.className = 'agent-header-row';

    const info = document.createElement('div');
    info.className = 'agent-info';
    info.innerHTML = highlight('', searchTerm);

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

    // ----- détails -----
    const details = document.createElement('div');
    details.className = 'agent-details';

    // Nom / Prénom
    const nameRow = document.createElement('div');
    nameRow.className = 'row';
    nameRow.innerHTML = `
      <div><strong>Nom :</strong> <span class="agent-nom">${agent.nom}</span></div>
      <div><strong>Prénom(s) :</strong> <span class="agent-prenom">${agent.prenom}</span></div>
    `;
    details.appendChild(nameRow);

    // Portable
    const portableDiv = document.createElement('div');
    portableDiv.innerHTML = `<strong>Portable :</strong> <span class="agent-portable">${formatPhoneNumber(agent.portable) || '-'}</span>`;
    if (agent.portable) portableDiv.appendChild(createCopyButton(agent.portable, false));
    details.appendChild(portableDiv);

    // Fixe
    const fixeDiv = document.createElement('div');
    fixeDiv.innerHTML = `<strong>Fixe :</strong> <span class="agent-fixe">${formatPhoneNumber(agent.fixe) || '-'}</span>`;
    if (agent.fixe) fixeDiv.appendChild(createCopyButton(agent.fixe, false));
    details.appendChild(fixeDiv);

    // Numéro de Poste 
    const numPosteDiv = document.createElement('div');
    numPosteDiv.innerHTML = `<strong>Numéro de Poste :</strong> <span class="agent-numeroPoste">${agent.numeroPoste || '-'}</span>`;
    details.appendChild(numPosteDiv);

    // Poste
    const posteDiv = document.createElement('div');
    posteDiv.innerHTML = `<strong>Poste :</strong> <span class="agent-poste">${agent.poste || '-'}</span>`;
    details.appendChild(posteDiv);

    // Service
    const serviceDiv = document.createElement('div');
    serviceDiv.innerHTML = `<strong>Service :</strong> <span class="agent-service">${getFullServicePath(agent.service_id, services)}</span>`;
    details.appendChild(serviceDiv);

    // Mail
    const mailDiv = document.createElement('div');
    mailDiv.innerHTML = `<strong>Mail :</strong> <a href="mailto:${agent.email}" class="agent-email">${agent.email}</a>`;
    if (agent.email) {
      const copyBtn = createCopyButton(agent.email, true);
      copyBtn.style.marginLeft = '5px';
      mailDiv.appendChild(copyBtn);
    }
    details.appendChild(mailDiv);

    const containerDetails = document.createElement('div');
    containerDetails.className = 'agent-details-container';
    containerDetails.appendChild(details);

    // Clic pour ouvrir/fermer normalement
    card.addEventListener('click', () => {
      containerDetails.classList.toggle('open');
    });

    wrapper.appendChild(card);
    wrapper.appendChild(containerDetails);
    agentList.appendChild(wrapper);

    // --- Ouvrir automatiquement si la recherche match un numéro ---
    if (searchTerm) {
      const queryNormalized = searchTerm.replace(/\s+/g, '');
      const phoneFields = [agent.portable, agent.fixe, agent.numeroPoste];
      const phoneMatches = phoneFields.some(p => p && p.replace(/\s+/g, '').includes(queryNormalized));
      if (phoneMatches) {
        containerDetails.classList.add('open');
      }
    }
  });
}
