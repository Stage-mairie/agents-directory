# backend/server.py
from flask import Flask, request, jsonify, send_from_directory, session
import os
import base64
from auth import is_authorized, is_admin
from db import with_db

app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.secret_key = "CHANGE_ME_TO_SOMETHING_SECRET"  # obligatoire pour session

PHOTOS_DIR = os.path.join(os.path.dirname(__file__), '../photos')
os.makedirs(PHOTOS_DIR, exist_ok=True)

# ---------- UTILITAIRES ----------
def get_db():
    from db import DB_CONFIG
    import mysql.connector
    return mysql.connector.connect(**DB_CONFIG)

def build_service_tree(services):
    """Construit la hiérarchie des services pour le frontend."""
    tree = []
    lookup = {s['id']: s for s in services}
    for s in services:
        s['children'] = []
    for s in services:
        parent_id = s['parent_id']
        if parent_id and parent_id in lookup:
            lookup[parent_id]['children'].append(s)
        else:
            tree.append(s)
    return tree

def login_required(f):
    """Décorateur pour vérifier qu'un utilisateur est connecté."""
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'username' not in session:
            return jsonify({'error': 'Unauthorized'}), 403
        return f(*args, **kwargs)
    return wrapper

def admin_required(f):
    """Décorateur pour vérifier que l'utilisateur est admin."""
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'username' not in session or not is_admin(session['username']):
            return jsonify({'error': 'Admin required'}), 403
        return f(*args, **kwargs)
    return wrapper

# ---------- ROUTES AUTH ----------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Missing credentials'}), 400
    if is_authorized(username, password):
        session['username'] = username
        session['is_admin'] = is_admin(username)
        return jsonify({'success': True, 'user': username, 'is_admin': session['is_admin']})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/userinfo')
def user_info():
    user = session.get('username')
    return jsonify({'user': user, 'is_admin': session.get('is_admin', False)})

# ---------- ROUTES API ----------
@app.route('/api/agents.json')
def get_agents():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT a.id, a.nom, a.prenom, a.portable, a.fixe, a.numeroPoste,
               a.email, a.photo, a.service_id, s.nom as service_nom
        FROM agents a
        LEFT JOIN services s ON a.service_id = s.id
    """)
    columns = ['id','nom','prenom','portable','fixe','numeroPoste','email','photo','service_id','service_nom']
    agents = [dict(zip(columns, row)) for row in c.fetchall()]
    conn.close()
    return jsonify(agents)

@app.route('/api/services.json')
def get_services():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, nom, parent_id FROM services")
    services = [dict(zip(['id','nom','parent_id'], row)) for row in c.fetchall()]
    conn.close()
    tree = build_service_tree(services)
    return jsonify(tree)

# ---------- ROUTES AGENT ----------
@app.route('/api/add', methods=['POST'])
@admin_required
def add_agent():
    data = request.get_json()
    prenom = data.get('prenom','').capitalize()
    nom = data.get('nom','').upper()
    photo_b64 = data.get('photo')

    conn = get_db()
    c = conn.cursor()
    c.execute("""
        INSERT INTO agents (nom, prenom, portable, fixe, numeroPoste, email, service_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (nom, prenom, data.get('portable',''), data.get('fixe',''), data.get('numeroPoste',''),
          data['email'], data['service_id']))
    agent_id = c.lastrowid
    conn.commit()  # commit avant photo pour sécuriser ID

    photo_filename = None
    if photo_b64:
        photo_data = base64.b64decode(photo_b64.split(',')[-1])
        photo_filename = f"{agent_id}.png"
        with open(os.path.join(PHOTOS_DIR, photo_filename), 'wb') as f:
            f.write(photo_data)
        c.execute("UPDATE agents SET photo=%s WHERE id=%s", (photo_filename, agent_id))
        conn.commit()
    conn.close()

    agent = {
        'id': agent_id, 'nom': nom, 'prenom': prenom,
        'portable': data.get('portable',''), 'fixe': data.get('fixe',''),
        'numeroPoste': data.get('numeroPoste',''),
        'email': data['email'], 'service_id': data['service_id'], 'photo': photo_filename
    }
    return jsonify(agent)

@app.route('/api/delete', methods=['DELETE'])
@admin_required
def delete_agent():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': "Champ 'email' manquant"}), 400
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT photo FROM agents WHERE email=%s", (email,))
    row = c.fetchone()
    if row and row[0]:
        try:
            os.remove(os.path.join(PHOTOS_DIR, row[0]))
        except FileNotFoundError:
            pass
    c.execute("DELETE FROM agents WHERE email=%s", (email,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/edit', methods=['PUT'])
@admin_required
def edit_agent():
    data = request.get_json()
    original_email = data.get('originalEmail')
    if not original_email:
        return jsonify({'error': "Champ 'originalEmail' manquant"}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT nom, prenom, portable, fixe, numeroPoste, email, photo, service_id FROM agents WHERE email=%s", (original_email,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Agent introuvable'}), 404

    current = dict(zip(['nom','prenom','portable','fixe','numeroPoste','email','photo','service_id'], row))

    nom = data.get('nom', current['nom']).upper()
    prenom = data.get('prenom', current['prenom']).capitalize()
    portable = data.get('portable', current['portable'])
    fixe = data.get('fixe', current['fixe'])
    numeroPoste = data.get('numeroPoste', current['numeroPoste'])
    email = data.get('email', current['email'])
    service_id = data.get('service_id', current['service_id'])
    photo = data.get('photo', current['photo'])

    c.execute("""
        UPDATE agents SET nom=%s, prenom=%s, portable=%s, fixe=%s,
        numeroPoste=%s, email=%s, photo=%s, service_id=%s
        WHERE email=%s
    """, (nom, prenom, portable, fixe, numeroPoste, email, photo, service_id, original_email))
    conn.commit()

    c.execute("""
        SELECT a.id, a.nom, a.prenom, a.portable, a.fixe, a.numeroPoste,
               a.email, a.photo, a.service_id, s.nom as service_nom
        FROM agents a
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.email=%s
    """, (email,))
    row = c.fetchone()
    conn.close()

    updated_agent = dict(zip(['id','nom','prenom','portable','fixe','numeroPoste','email','photo','service_id','service_nom'], row))
    return jsonify(updated_agent)

# ---------- ROUTES FRONTEND ----------
@app.route('/photos/<filename>')
def photos(filename):
    return send_from_directory(PHOTOS_DIR, filename)

@app.route('/')
@app.route('/agents.html')
def agents_page():
    return app.send_static_file('agents.html')

if __name__ == '__main__':
    app.run(debug=True)
