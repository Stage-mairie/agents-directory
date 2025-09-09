from http.server import SimpleHTTPRequestHandler
import json
import http.cookies
from db import with_db
from auth import is_authorized, is_admin
import sqlite3
import os
from urllib.parse import urlparse

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '../frontend')

class MyHandler(SimpleHTTPRequestHandler):

    def get_user_from_cookie(self):
        cookie_header = self.headers.get('Cookie')
        if not cookie_header:
            return None
        cookie = http.cookies.SimpleCookie(cookie_header)
        user = cookie.get('user')
        return user.value if user else None

    def is_admin_user(self):
        user = self.get_user_from_cookie()
        return is_admin(user)

    def serve_file(self, filename):
        path = os.path.join(FRONTEND_DIR, filename)
        try:
            with open(path, 'rb') as f:
                self.send_response(200)
                content_type = 'text/html' if filename.endswith('.html') else 'text/plain'
                if filename.endswith('.css'):
                    content_type = 'text/css'
                elif filename.endswith('.js'):
                    content_type = 'application/javascript'
                elif filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg'):
                    content_type = 'image/png'
                self.send_header('Content-Type', content_type)
                self.end_headers()
                self.wfile.write(f.read())
        except:
            self.send_error(404)

    def do_GET(self):
        path = urlparse(self.path).path

        if path.startswith('/css/') or path.startswith('/js/') or path.startswith('/images/'):
            return self.serve_file(path.lstrip('/'))

        elif path == '/api/agents.json':
            user = self.get_user_from_cookie()
            if not user:
                self.send_error(401, 'Non authentifié')
                return
            with with_db(write=False) as conn:
                c = conn.cursor()
                c.execute("""
                    SELECT a.nom, a.prenom, a.portable, a.fixe, a.numeroPoste, a.poste, a.email, s.nom as service
                    FROM agents a
                    LEFT JOIN services s ON a.service_id = s.id
                """)
                agents = [dict(zip(['nom','prenom','portable','fixe','numeroPoste','poste','email','service'], row)) for row in c.fetchall()]
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(agents).encode())

        elif path == '/api/userinfo':
            user = self.get_user_from_cookie()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                'user': user,
                'is_admin': is_admin(user) if user else False
            }).encode())

        elif path == '/login' or path == '/login.html':
            self.serve_file('login.html')

        elif path == '/' or path == '/agents.html':
            user = self.get_user_from_cookie()
            if not user:
                self.send_response(302)
                self.send_header('Location', '/login')
                self.end_headers()
            else:
                self.serve_file('agents.html')

        elif path == '/api/services.json':
            with with_db(write=False) as conn:
                c = conn.cursor()
                c.execute("SELECT id, nom, parent_id FROM services")
                services = [dict(zip(['id', 'nom', 'parent_id'], row)) for row in c.fetchall()]
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(services).encode())

        else:
            self.send_error(404)

    def do_POST(self):
        path = urlparse(self.path).path

        if path == '/api/login':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
                username = data.get('username')
                password = data.get('password')
                if is_authorized(username, password):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header('Set-Cookie', f'user={username}; Path=/')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True}).encode())
                else:
                    self.send_response(401)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Identifiants incorrects"}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())

        elif path == '/api/add':
            if not self.is_admin_user():
                self.send_error(403)
                return
            length = int(self.headers.get('Content-Length'))
            data = json.loads(self.rfile.read(length))
            prenom = data.get('prenom', '').strip().capitalize()
            nom = data.get('nom', '').upper()
            try:
                with with_db(write=True) as conn:
                    c = conn.cursor()
                    c.execute("INSERT INTO agents (nom, prenom, portable, fixe, numeroPoste, poste, email, service_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                              (nom, prenom, data.get('portable', ''), data.get('fixe', ''), data.get('numeroPoste', ''), data.get('poste', ''), data['email'], data['service_id']))
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode())

            except sqlite3.IntegrityError:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'error',
                    'error': 'Cet email est déjà utilisé.'
                }).encode())

            except sqlite3.OperationalError as e:
                self.send_error(500, f"Database error: {str(e)}")

        elif path == '/logout' or path == '/api/logout':
            self.send_response(302)
            self.send_header('Location', '/login')
            self.send_header('Set-Cookie', 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/')
            self.end_headers()

        else:
            self.send_error(404)

    def do_DELETE(self):
        path = urlparse(self.path).path

        if path == '/api/delete':
            if not self.is_admin_user():
                self.send_error(403)
                return

            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "Missing request body")
                return

            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
                email = data.get('email')
                if not email:
                    self.send_error(400, "Missing 'email' field")
                    return

                with with_db(write=True) as conn:
                    c = conn.cursor()
                    c.execute("DELETE FROM agents WHERE email = ?", (email,))

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'deleted'}).encode())

            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404)

    def do_PUT(self):
        path = urlparse(self.path).path

        if path == '/api/edit':
            if not self.is_admin_user():
                self.send_error(403)
                return

            content_length = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(content_length))
            prenom = data.get('prenom', '').strip().capitalize()
            nom = data.get('nom', '').upper()
            try:
                with with_db(write=True) as conn:
                    c = conn.cursor()
                    c.execute("""
                        UPDATE agents SET nom=?, prenom=?, portable=?, fixe=?, numeroPoste=?, poste=?, email=?, service_id=?
                        WHERE email=?
                    """,
                    (nom, prenom, data.get('portable', ''), data.get('fixe', ''),
                    data.get('numeroPoste', ''), data.get('poste', ''), data['email'], data['service_id'],
                    data['originalEmail']))
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(json.dumps({'status': 'updated'}).encode())))
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'updated'}).encode())

            except sqlite3.IntegrityError:
                self.send_error(400, "Conflit : email déjà utilisé.")
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404)
