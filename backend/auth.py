# backend/auth.py
import bcrypt
from db import with_db

def is_authorized(username, password):
    """Vérifie si le login/mot de passe est correct."""
    with with_db(write=False) as conn:
        c = conn.cursor()
        c.execute("SELECT hash_password FROM users WHERE login=%s", (username,))
        row = c.fetchone()
        if not row:
            return False
        stored_hash = row[0].encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), stored_hash)

def is_admin(username):
    """Retourne True si l'utilisateur est admin."""
    if not username:
        return False
    with with_db(write=False) as conn:
        c = conn.cursor()
        c.execute("SELECT isAdmin FROM users WHERE login=%s", (username,))
        row = c.fetchone()
        return bool(row and int(row[0]) == 1)
