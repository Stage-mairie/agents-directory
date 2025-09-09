 📇 Annuaire des Agents de la Mairie de Saint-André

Ce projet est une application web permettant de gérer les agents de la mairie (ajout, recherche, tri, suppression).  
Il utilise une interface HTML/CSS/JS côté client et un serveur Python avec base SQLite côté serveur.


🚀 Lancement du projet

1. Créer la base de données

Avant de lancer l'application, crée la base de données avec le script suivant :

python3 init_db.py

Cela génère un fichier data.db contenant la table agents.

2. Lancer le serveur
Démarre le serveur local avec :

python3 server.py

Une fois lancé, ouvre ton navigateur à l'adresse :

http://localhost:3000

📁 Arborescence du projet
.
├── agents.html         
├── login.html          
├── script.js           
├── login.js            
├── style.css          
├── server.py          
├── init_db.py          
├── data.db             
├── README.md          
└── images/
    └── logo.png   

⚙️ Fonctionnalités
🔍 Recherche d’agents par nom ou prénom

🗂️ Filtrage par service

➕ Ajout d’un agent avec formulaire dynamique

🗑️ Suppression d’un agent par email (via modale)

💡 Affichage responsive avec mise en page simple et lisible

✅ Dépendances
Aucune installation n’est requise. Le projet utilise uniquement :

Python 3 (bibliothèques standard : http.server, sqlite3, json)

Un navigateur web récent

🛠️ À personnaliser
images/logo.png : remplace ce fichier par le logo de ta mairie.

style.css : modifie les couleurs, polices ou mise en page selon vos besoins.

📬 Contact
Pour toute question, veuillez contacter le service informatique de la mairie de Saint-André.