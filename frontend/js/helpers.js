export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlight(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function getInitials(nom, prenom) {
  return (prenom[0] + nom[0]).toUpperCase();
}

export function capitalizeEachWord(str) {
  return str
    .toLowerCase()
    .split(/[-\s]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(str.includes('-') ? '-' : ' ');
}
