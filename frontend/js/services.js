// ---------- SERVICES UTILITAIRES ----------
let servicesCache = [];
let servicesFlatCache = [];

// Charger services depuis le backend
export async function loadServices() {
  if (servicesCache.length) return servicesCache;

  const res = await fetch('/api/services.json', { credentials: 'include' });
  if (!res.ok) throw new Error('Erreur chargement services');

  servicesCache = await res.json();

  // version plate pour recherche et parcours rapide
  servicesFlatCache = [];
  function flatten(tree) {
    tree.forEach(s => {
      const { children, ...rest } = s;
      servicesFlatCache.push(rest);
      if (children && children.length) flatten(children);
    });
  }
  flatten(servicesCache);

  return servicesCache;
}

// Retourne liste plate de tous les services
export function getFlatServices() {
  return servicesFlatCache;
}

// ---------- GÉNÉRATION CHEMIN COMPLET ----------
export function getFullServiceName(serviceId) {
  const services = getFlatServices();
  const names = [];
  let currentId = serviceId;

  while (currentId) {
    const serv = services.find(s => s.id === currentId);
    if (!serv) break;
    names.unshift(serv.nom);
    currentId = serv.parent_id;
  }

  return names.join(' > ');
}

// ---------- POPULATE SELECT ----------
export function populateSelect(select, parentId) {
  select.innerHTML = '<option value="">-- Choisir --</option>';
  getFlatServices()
    .filter(s => s.parent_id === parentId)
    .forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.nom;
      select.appendChild(opt);
    });
}

// ---------- CASCADE DES SELECT ----------
export function setupCascade(selects, selectedServiceId = null) {
  const chain = [];
  let currentId = selectedServiceId ? Number(selectedServiceId) : null;

  // Construire la chaîne parent → enfant complète
  while (currentId) {
    const serv = getFlatServices().find(s => s.id === currentId);
    if (!serv) break;
    chain.unshift(serv.id);
    currentId = serv.parent_id;
  }

  selects.forEach((select, i) => {
    const parentId = i === 0 ? null : chain[i - 1] || null;
    populateSelect(select, parentId);
    select.value = chain[i] || '';

    select.addEventListener('change', () => {
      const nextSelect = selects[i + 1];
      if (nextSelect) {
        populateSelect(nextSelect, select.value ? Number(select.value) : null);
        // vider les suivants
        for (let j = i + 2; j < selects.length; j++) {
          selects[j].innerHTML = '<option value="">-- Choisir --</option>';
        }
      }
      filterAgents(); // si tu veux filtrer à la volée
    });
  });
}
