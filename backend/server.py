from http.server import HTTPServer
from handlers import MyHandler
import os

os.chdir(os.path.dirname(__file__))

if __name__ == '__main__':
    server = HTTPServer(('localhost', 5000), MyHandler)
    try:
        print("Serveur démarré sur http://localhost:5000. Ctrl+C pour arrêter.")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté manuellement.")
    finally:
        server.server_close()
        print("Connexion fermée.")
