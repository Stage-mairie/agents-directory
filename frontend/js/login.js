import { handleLogin } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
});
