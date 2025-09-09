DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS agents;

CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES services(id)
);

CREATE TABLE agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    prenom TEXT,
    portable TEXT,
    fixe TEXT,
    numeroPoste TEXT,
    poste TEXT,
    email TEXT UNIQUE,
    service_id INTEGER,
    FOREIGN KEY (service_id) REFERENCES services(id)
);
