import { editAgent } from './api.js';
import { capitalizeEachWord } from './helpers.js';

let currentEditForm = null;
let servicesCache = [];

// Chargement (unique) des services
async function loadServicesIfNeeded() {
  if (servicesCache.length > 0) return servicesCache;
  const res = await fetch("/api/services.json");
  servicesCache = await res.json();
  return servicesCache;
}

function populateServiceSelects(selects, services, selectedServiceId) {
  function populateSelect(select, parentId) {
    select.innerHTML = '<option value="">-- Choisir --</option>';
    services
      .filter(s => s.parent_id === parentId)
      .forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.textContent = s.nom;
        select.appendChild(option);
      });
  }

  const chain = [];
  let currentId = selectedServiceId;
  while (currentId) {
    const serv = services.find(s => s.id === currentId);
    if (!serv) break;
    chain.unshift(serv.id);
    currentId = serv.parent_id;
  }

  populateSelect(selects[0], null);
  for (let i = 1; i < selects.length; i++) {
    populateSelect(selects[i], chain[i - 1] || null);
  }

  selects.forEach((select, i) => {
    select.value = chain[i] || "";
  });

  selects.forEach((select, level) => {
    select.addEventListener("change", () => {
      const nextSelect = selects[level + 1];
      if (nextSelect) {
        populateSelect(nextSelect, parseInt(select.value) || null);
        for (let i = level + 2; i < selects.length; i++) {
          selects[i].innerHTML = '';
        }
      }
    });
  });
}

export async function openEditForm(agent) {
  if (currentEditForm) {
    currentEditForm.remove();
    currentEditForm = null;
  }

  const card = document.querySelector(`.agent-card[data-email="${agent.email}"]`);
  if (!card) return;

  const services = await loadServicesIfNeeded();

  const formContainer = document.createElement('div');
  formContainer.className = 'edit-form-container';

  formContainer.innerHTML = `
    <form class="simple-form inline-edit-form" data-original-email="${agent.email}">
      <input type="hidden" name="originalEmail" value="${agent.email}" />
      <label>Nom
        <input name="nom" value="${agent.nom}" placeholder="Ex: DUPONT" required />
      </label>
      <label>Prénom(s)
        <input name="prenom" value="${agent.prenom}" placeholder="Ex: Alice" required />
      </label>
      <label>Portable
        <input name="portable" value="${agent.portable || ''}" placeholder="Ex: 0612345678" pattern="\\d{10}" maxlength="10" />
      </label>
      <label>Fixe
        <input name="fixe" value="${agent.fixe || ''}" placeholder="Ex: 0147253648" pattern="\\d{10}" maxlength="10" />
      </label>
      <label>Numéro de Poste
        <input name="numeroPoste" value="${agent.numeroPoste || ''}" placeholder="Ex: 1234" pattern="\\d{4}" maxlength="4" />
      </label>
      <label>Poste
        <input name="poste" value="${agent.poste || ''}" placeholder="Ex: Chargé de mission" />
      </label>
      <label>Email
        <input name="email" value="${agent.email}" placeholder="Ex: alice.dupont@mairie.fr" required />
      </label>
      <label>Service niveau 1
        <select id="edit-service-level-1" name="service-level-1" required></select>
      </label>
      <label>Service niveau 2
        <select id="edit-service-level-2" name="service-level-2"></select>
      </label>
      <label>Service niveau 3
        <select id="edit-service-level-3" name="service-level-3"></select>
      </label>
      <div class="button-row">
        <button type="submit" class="save-btn">Enregistrer</button>
        <button type="button" class="cancel-btn">Annuler</button>
      </div>
    </form>
  `;

  card.after(formContainer);
  currentEditForm = formContainer;
  formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const editSelects = [
    formContainer.querySelector('#edit-service-level-1'),
    formContainer.querySelector('#edit-service-level-2'),
    formContainer.querySelector('#edit-service-level-3'),
  ];

  populateServiceSelects(editSelects, services, agent.service_id);

  const form = formContainer.querySelector('form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);

    let selectedServiceId = null;
    for (let i = editSelects.length - 1; i >= 0; i--) {
      if (editSelects[i].value) {
        selectedServiceId = parseInt(editSelects[i].value, 10);
        break;
      }
    }
    if (!selectedServiceId) {
      alert("Veuillez choisir un service valide.");
      return;
    }

    const updated = {
      originalEmail: formData.get('originalEmail'),
      nom: (formData.get('nom') || '').trim().toUpperCase(),
      prenom: capitalizeEachWord((formData.get('prenom') || '').trim()),
      portable: (formData.get('portable') || '').trim(),
      fixe: (formData.get('fixe') || '').trim(),
      numeroPoste: (formData.get('numeroPoste') || '').trim(),
      poste: (formData.get('poste') || '').trim(),
      email: (formData.get('email') || '').trim(),
      service_id: selectedServiceId
    };

    try {
      const result = await editAgent(updated);

      updateAgentCard(agent.email, updated);

      showSuccessMessage(card, "Agent modifié avec succès.");

      formContainer.classList.add('fade-out');
      setTimeout(() => {
        formContainer.remove();
        currentEditForm = null;
      }, 300);

    } catch (err) {
      console.error("Erreur lors de la modification :", err);
      alert("Erreur lors de la modification.");
    }
  });

  form.querySelector('.cancel-btn').addEventListener('click', () => {
    formContainer.classList.add('fade-out');
    setTimeout(() => {
      formContainer.remove();
      currentEditForm = null;
    }, 300);
  });
}

function updateAgentCard(originalEmail, updatedAgent) {
  const card = document.querySelector(`.agent-card[data-email="${originalEmail}"]`);
  if (!card) return;

  card.querySelector('.agent-nom').textContent = updatedAgent.nom;
  card.querySelector('.agent-prenom').textContent = updatedAgent.prenom;
  card.querySelector('.agent-portable').textContent = updatedAgent.portable || '';
  card.querySelector('.agent-fixe').textContent = updatedAgent.fixe || '';
  card.querySelector('.agent-poste').textContent = updatedAgent.poste || '';
  card.querySelector('.agent-email').textContent = updatedAgent.email;

  if (originalEmail !== updatedAgent.email) {
    card.dataset.email = updatedAgent.email;
  }
}

function showSuccessMessage(card, message) {
  const msg = document.createElement('div');
  msg.className = 'success-message';
  msg.textContent = message;
  card.appendChild(msg);

  msg.classList.add('fade-in');
  setTimeout(() => {
    msg.classList.remove('fade-in');
    msg.classList.add('fade-out');
    msg.addEventListener('animationend', () => msg.remove());
  }, 2000);
}

document.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const agent = getAgentFromButton(btn);
    openEditForm(agent);
  });
});