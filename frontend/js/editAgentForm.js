import { editAgent } from './api.js';
import { capitalizeEachWord, readFileAsBase64 } from './helpers.js';
import { getFlatServices, setupCascade, getFullServiceName } from './services.js';
import { updateAgentInDOM } from './render.js';

let currentForm = null;

export async function openEditForm(agent) {
  if (currentForm) currentForm.remove();

  const card = document.querySelector(`.agent-card[data-email="${agent.email}"]`);
  if (!card) return;

  const form = document.createElement('form');
  form.className = 'simple-form';
  form.innerHTML = `
    <h3>Modifier l'agent</h3>
    <input type="hidden" name="originalEmail" value="${agent.email}" />
    <label>Nom <input name="nom" value="${agent.nom}" required /></label>
    <label>Prénom <input name="prenom" value="${agent.prenom}" required /></label>
    <label>Portable <input name="portable" value="${agent.portable||''}" /></label>
    <label>Fixe <input name="fixe" value="${agent.fixe||''}" /></label>
    <label>Numéro de poste <input name="numeroPoste" value="${agent.numeroPoste||''}" /></label>
    <label>Email <input name="email" value="${agent.email}" required /></label>
    <label>Photo 
      <input type="file" name="photo" accept="image/*" />
      ${agent.photo ? `<small>Photo actuelle disponible</small>` : ''}
    </label>

    <label>Service niveau 1 <select name="service-level-1"></select></label>
    <label>Service niveau 2 <select name="service-level-2"></select></label>
    <label>Service niveau 3 <select name="service-level-3"></select></label>
    <label>Service niveau 4 <select name="service-level-4"></select></label>
    <label>Service niveau 5 <select name="service-level-5"></select></label>
    <label>Service niveau 6 <select name="service-level-6"></select></label>

    <div class="button-row">
      <button type="submit" class="save-btn">Enregistrer</button>
      <button type="button" class="cancel-btn">Annuler</button>
    </div>
  `;

  const parent = card.parentNode;
  parent.replaceChild(form, card);
  currentForm = form;

  // 🔥 6 niveaux dans la cascade
  const selects = [
    form.querySelector('[name="service-level-1"]'),
    form.querySelector('[name="service-level-2"]'),
    form.querySelector('[name="service-level-3"]'),
    form.querySelector('[name="service-level-4"]'),
    form.querySelector('[name="service-level-5"]'),
    form.querySelector('[name="service-level-6"]')
  ];

  // Préremplir la cascade
  setupCascade(selects, agent.service_id);

  // Soumission
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // récupérer le niveau le plus profond non-vide
    let selectedServiceId = null;
    for (let i = selects.length - 1; i >= 0; i--) {
      if (selects[i].value) {
        selectedServiceId = parseInt(selects[i].value);
        break;
      }
    }
    if (!selectedServiceId) return alert('Veuillez choisir un service.');

    const updated = {
      originalEmail: form['originalEmail'].value,
      nom: form.nom.value.trim().toUpperCase(),
      prenom: capitalizeEachWord(form.prenom.value.trim()),
      portable: form.portable.value.trim(),
      fixe: form.fixe.value.trim(),
      numeroPoste: form.numeroPoste.value.trim(),
      email: form.email.value.trim(),
      service_id: selectedServiceId
    };

    try {
      // Photo
      const fileInput = form.photo;
      if (fileInput.files.length > 0) {
        updated.photo = await readFileAsBase64(fileInput.files[0]);
      } else {
        updated.photo = agent.photo || null;
      }

      // envoyer au backend
      const updatedAgent = await editAgent(agent, updated);

      // mettre à jour le nom complet du service
      updatedAgent.service_nom = getFullServiceName(updatedAgent.service_id);

      updateAgentInDOM(updatedAgent);

      window.location.reload();
      currentForm.remove();
      currentForm = null;

    } catch (err) {
      alert('Erreur lors de la modification : ' + err.message);
      console.error(err);
    }
  });

  // Annuler
  form.querySelector('.cancel-btn').addEventListener('click', () => {
    parent.replaceChild(card, form);
    currentForm = null;
  });

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
