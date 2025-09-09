export function populateSelect(select, services, parentId) {
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

export function setupCascade(container, servicesTree) {
  container.innerHTML = ""; // Vide tout au départ

  const createSelect = (level, options, parentId = null) => {
    const select = document.createElement("select");
    select.className = `service-select level-${level}`;
    select.innerHTML = `<option value="">-- Choisir --</option>`;

    for (const option of options) {
      const opt = document.createElement("option");
      opt.value = option.id;
      opt.textContent = option.nom;
      select.appendChild(opt);
    }

    select.addEventListener("change", () => {
      // Supprime les niveaux suivants
      const nextSiblings = [...container.querySelectorAll(`.level-${level + 1}, .level-${level + 2}, .level-${level + 3}`)];
      nextSiblings.forEach(el => el.remove());

      const selected = options.find(o => o.id == select.value);
      if (selected?.children?.length) {
        createSelect(level + 1, selected.children, selected.id);
      }
    });

    container.appendChild(select);
  };

  createSelect(1, servicesTree);
}
