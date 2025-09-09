import sqlite3
import os

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'data.db')
SCHEMA_PATH = os.path.join(BASE_DIR, 'sql', 'schema.sql')
DATA_PATH = os.path.join(BASE_DIR, 'sql', 'data.sql')

# Connexion à la base
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Exécution du schéma
with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
    c.executescript(f.read())

# Insertion des données
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    c.executescript(f.read())

conn.commit()
conn.close()

print("Base de données créée avec succès à partir de schema.sql et data.sql")
