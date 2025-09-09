from http.server import HTTPServer
from handlers import MyHandler
import os

os.chdir(os.path.dirname(__file__))

if __name__ == '__main__':
    print("Serveur sur http://localhost:5000")
    HTTPServer(('localhost', 5000), MyHandler).serve_forever()
