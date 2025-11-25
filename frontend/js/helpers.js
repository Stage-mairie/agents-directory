// Échappe les caractères spéciaux pour une utilisation sûre dans un RegExp
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Met en surbrillance un terme dans un texte
export function highlight(text, searchTerm) {
  if (!searchTerm || !text) return text || '';

  const escaped = escapeRegExp(searchTerm);
  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}

// Retourne les initiales : p.ex. "Jean Dupont" → "JD"
export function getInitials(nom, prenom) {
  if (!nom || !prenom) return '';
  return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
}

// Capitalise chaque mot correctement, y compris accents et apostrophes
export function capitalizeEachWord(str) {
  if (!str) return '';
  return str.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

// Lit un fichier et retourne une base64
export const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
