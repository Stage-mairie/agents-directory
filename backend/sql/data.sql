INSERT INTO agents (nom, prenom, portable, fixe, numeroPoste, poste, email, service_id) VALUES
('KESSORI', 'Yannis', '0612345678', '0145678901', '1234', 'TECHNICIEN', 'yannis.kessori@mairie.fr', 92),
('NARAYANIN', 'Shiva', '0623456789', '0145678902', '2345', 'CHARGÉ DE MISSION', 'shiva.narayanin@mairie.fr', 92),
('BERNARD', 'Claire', '0634567890', '0145678903', '3456', 'TECHNICIENNE', 'claire.bernard@mairie.fr', 5),
('DURAND', 'Paul', '0645678901', '0145678904', '4567', 'RESPONSABLE ADMINISTRATIF', 'paul.durand@mairie.fr', 20),
('LEMOINE', 'Alice', '0656789012', '0145678905', '5678', 'COORDINATRICE PÉDAGOGIQUE', 'alice.lemoine@mairie.fr', 21),
('MARTIN', 'Jean', '0667890123', '0145678906', '6789', 'AGENT', 'jean.martin@mairie.fr', 28),
('DUPONT', 'Marie', '0678901234', '0145678907', '7890', 'CHARGÉE DE MISSION', 'marie.dupont@mairie.fr', 41),
('LEROY', 'Sophie', '0689012345', '0145678908', '8901', 'TECHNICIENNE', 'sophie.leroy@mairie.fr', 73),
('FAURE', 'Nicolas', '0690123456', '0145678909', '9012', 'RESPONSABLE', 'nicolas.faure@mairie.fr', 93),
('GARNIER', 'Isabelle', '0611122233', '0145678910', '1122', 'SECRÉTAIRE', 'isabelle.garnier@mairie.fr', 107);


INSERT INTO services (id, nom, parent_id) VALUES (1, 'Cabinet du Maire', NULL);

INSERT INTO services (id, nom, parent_id) VALUES (2, 'Directeur Général des Services', 1);

-- DGA Aménagement et Grands Projets
INSERT INTO services (id, nom, parent_id) VALUES (3, 'DGA Aménagement et Grands Projets', 2);

-- Direction des Services Techniques
INSERT INTO services (id, nom, parent_id) VALUES (4, 'Direction des Services Techniques', 3);
INSERT INTO services (id, nom, parent_id) VALUES (5, 'Service Environnement', 4);
INSERT INTO services (id, nom, parent_id) VALUES (6, 'Service Infrastructure', 4);
INSERT INTO services (id, nom, parent_id) VALUES (7, 'Service Bâtiments', 4);

-- Autres sous-services DGA Aménagement et Grands Projets
INSERT INTO services (id, nom, parent_id) VALUES (8, 'Cellule BAUX', 3);
INSERT INTO services (id, nom, parent_id) VALUES (9, 'Service Economique', 3);
INSERT INTO services (id, nom, parent_id) VALUES (10, 'Service Foncier', 3);
INSERT INTO services (id, nom, parent_id) VALUES (11, 'Service Habitat', 3);
INSERT INTO services (id, nom, parent_id) VALUES (12, 'Service NPRU', 3);
INSERT INTO services (id, nom, parent_id) VALUES (13, 'Service Urbanisme et Planification', 3);
INSERT INTO services (id, nom, parent_id) VALUES (14, 'Chargé de mission Transition écologique', 3);
INSERT INTO services (id, nom, parent_id) VALUES (15, 'Mission Financement projets investissements', 3);
INSERT INTO services (id, nom, parent_id) VALUES (16, 'Mission Gestion GIP Projet Industriel Bois Rouge', 3);

-- DGA Epanouissement Humain
INSERT INTO services (id, nom, parent_id) VALUES (17, 'DGA Epanouissement Humain', 2);

-- Direction de la Réussite Educative
INSERT INTO services (id, nom, parent_id) VALUES (18, 'Direction de la Réussite Educative', 17);
INSERT INTO services (id, nom, parent_id) VALUES (19, 'Chargé de mission', 18);
INSERT INTO services (id, nom, parent_id) VALUES (20, 'Service Administratif', 18);
INSERT INTO services (id, nom, parent_id) VALUES (21, 'Service Enfance', 18);
INSERT INTO services (id, nom, parent_id) VALUES (22, 'Service Gestion des Ecoles', 18);
INSERT INTO services (id, nom, parent_id) VALUES (23, 'Service Inscriptions Scolaires', 18);
INSERT INTO services (id, nom, parent_id) VALUES (24, 'Service Projet Educatif du Territoire', 18);
INSERT INTO services (id, nom, parent_id) VALUES (25, 'Service Restauration Scolaire', 18);

-- Direction des Sports
INSERT INTO services (id, nom, parent_id) VALUES (26, 'Direction des Sports', 17);
INSERT INTO services (id, nom, parent_id) VALUES (27, 'Service des Sports', 26);
INSERT INTO services (id, nom, parent_id) VALUES (28, 'Service Patrimoines Sportifs', 26);
INSERT INTO services (id, nom, parent_id) VALUES (29, 'Services Piscines', 26);

-- Direction du Développement Culturel
INSERT INTO services (id, nom, parent_id) VALUES (30, 'Direction du Développement Culturel', 17);
INSERT INTO services (id, nom, parent_id) VALUES (31, 'Médiathèque Adrien Minienpoullé', 30);
INSERT INTO services (id, nom, parent_id) VALUES (32, 'Ecole de Musique', 30);
INSERT INTO services (id, nom, parent_id) VALUES (33, 'Ecole Municipale de Danse', 30);
INSERT INTO services (id, nom, parent_id) VALUES (34, 'Espace Culturel de Champ Borne', 30);
INSERT INTO services (id, nom, parent_id) VALUES (35, 'Médiathèque Auguste Lacaussade', 30);
INSERT INTO services (id, nom, parent_id) VALUES (36, 'Service Archives', 30);
INSERT INTO services (id, nom, parent_id) VALUES (37, 'Service Culturel', 30);

-- Service Evènementiel (sous DGA Epanouissement Humain)
INSERT INTO services (id, nom, parent_id) VALUES (38, 'Service Evènementiel', 17);

-- DGA Politiques de proximité
INSERT INTO services (id, nom, parent_id) VALUES (39, 'DGA Politiques de proximité', 2);

-- Direction de la Cohésion des Territoires et Citoyenneté
INSERT INTO services (id, nom, parent_id) VALUES (40, 'Direction de la Cohésion des Territoires et Citoyenneté', 39);
INSERT INTO services (id, nom, parent_id) VALUES (41, 'Service Politique de la Ville', 40);
INSERT INTO services (id, nom, parent_id) VALUES (42, 'Service Développement Locale', 40);
INSERT INTO services (id, nom, parent_id) VALUES (43, 'Service Animation et location de salles', 40);

-- Direction de la Prévention et de l'Insertion
INSERT INTO services (id, nom, parent_id) VALUES (44, 'Direction de la Prévention et de l Insertion', 39);
INSERT INTO services (id, nom, parent_id) VALUES (45, 'Service contentieux pénal de l urbanisme', 44);
INSERT INTO services (id, nom, parent_id) VALUES (46, 'Service Médiation et Tranquillité Publique', 44);
INSERT INTO services (id, nom, parent_id) VALUES (47, 'Cadre de vie', 44);
INSERT INTO services (id, nom, parent_id) VALUES (48, 'Service Réinsertion', 44);
INSERT INTO services (id, nom, parent_id) VALUES (49, 'Service Insertion', 44);

-- Direction des Services à la Population
INSERT INTO services (id, nom, parent_id) VALUES (50, 'Direction des Services à la Population', 39);
INSERT INTO services (id, nom, parent_id) VALUES (51, 'Chargé de mission funéraire', 50);
INSERT INTO services (id, nom, parent_id) VALUES (52, 'Service Accueil Général', 50);
INSERT INTO services (id, nom, parent_id) VALUES (53, 'Service Elections', 50);
INSERT INTO services (id, nom, parent_id) VALUES (54, 'Service Etat Civil/Titres', 50);
INSERT INTO services (id, nom, parent_id) VALUES (55, 'Service Funéraire', 50);

-- Service Public de Proximité et ses pôles
INSERT INTO services (id, nom, parent_id) VALUES (56, 'Service Public de Proximité', 50);
INSERT INTO services (id, nom, parent_id) VALUES (57, 'Pôle Champ Borne', 56);
INSERT INTO services (id, nom, parent_id) VALUES (58, 'Pôle Cressonière', 56);
INSERT INTO services (id, nom, parent_id) VALUES (59, 'Pôle Rivière du Mât les Bas', 56);
INSERT INTO services (id, nom, parent_id) VALUES (60, 'Pôle Ravine-Creuse', 56);
INSERT INTO services (id, nom, parent_id) VALUES (61, 'Pôle Cambuston', 56);
INSERT INTO services (id, nom, parent_id) VALUES (62, 'Pôle Bras des Chevrettes', 56);

-- Autres cellules et services DGA Politiques de proximité
INSERT INTO services (id, nom, parent_id) VALUES (63, 'Cellule Mission d Appui et de Coordination des Politiques de Proximité', 39);
INSERT INTO services (id, nom, parent_id) VALUES (64, 'Cellule Administrative', 39);
INSERT INTO services (id, nom, parent_id) VALUES (65, 'Cellule Technique', 39);
INSERT INTO services (id, nom, parent_id) VALUES (66, 'Service Instruction des Subventions aux associations', 39);

-- DGA Qualité de la Gestion Publique
INSERT INTO services (id, nom, parent_id) VALUES (67, 'DGA Qualité de la Gestion Publique', 2);
INSERT INTO services (id, nom, parent_id) VALUES (68, 'Chargé de mission badgeuse', 67);

-- Direction de la Commande Publique
INSERT INTO services (id, nom, parent_id) VALUES (69, 'Direction de la Commande Publique', 67);

-- Direction de la Logistique
INSERT INTO services (id, nom, parent_id) VALUES (70, 'Direction de la Logistique', 67);
INSERT INTO services (id, nom, parent_id) VALUES (71, 'Service Entretien des locaux', 70);
INSERT INTO services (id, nom, parent_id) VALUES (72, 'Service Gardiennage', 70);
INSERT INTO services (id, nom, parent_id) VALUES (73, 'Service Logistique des manifestations', 70);
INSERT INTO services (id, nom, parent_id) VALUES (74, 'Service Mobilier et fournitures admin', 70);
INSERT INTO services (id, nom, parent_id) VALUES (75, 'Service Parc Automobile', 70);

-- Direction des Affaires Financières
INSERT INTO services (id, nom, parent_id) VALUES (76, 'Direction des Affaires Financières', 67);
INSERT INTO services (id, nom, parent_id) VALUES (77, 'Service gestion budgétaire comptable et financière', 76);
INSERT INTO services (id, nom, parent_id) VALUES (78, 'Service Recettes', 76);

-- Direction des Affaires Juridiques et Instances
INSERT INTO services (id, nom, parent_id) VALUES (79, 'Direction des Affaires Juridiques et Instances', 67);
INSERT INTO services (id, nom, parent_id) VALUES (80, 'Service des Instances', 79);
INSERT INTO services (id, nom, parent_id) VALUES (81, 'Service Juridique', 79);

-- Direction des Ressources Humaines
INSERT INTO services (id, nom, parent_id) VALUES (82, 'Direction des Ressources Humaines', 67);
INSERT INTO services (id, nom, parent_id) VALUES (83, 'Mission d appui', 82);
INSERT INTO services (id, nom, parent_id) VALUES (84, 'Service Formation et Dvlppt des compétences', 82);
INSERT INTO services (id, nom, parent_id) VALUES (85, 'Service Gestion administrative du personnel', 82);
INSERT INTO services (id, nom, parent_id) VALUES (86, 'Service Prévention et Santé au travail', 82);
INSERT INTO services (id, nom, parent_id) VALUES (87, 'Service QVCT', 82);
INSERT INTO services (id, nom, parent_id) VALUES (88, 'Service recrutement et évolution professionnelle', 82);

-- Direction des Systèmes d'Information
INSERT INTO services (id, nom, parent_id) VALUES (89, 'Direction des Systèmes d Information', 67);
INSERT INTO services (id, nom, parent_id) VALUES (90, 'Service Applicatifs métiers et projets', 89);
INSERT INTO services (id, nom, parent_id) VALUES (91, 'Service Gestion de la donnée', 89);
INSERT INTO services (id, nom, parent_id) VALUES (92, 'Service Informatique des Ecoles', 89);
INSERT INTO services (id, nom, parent_id) VALUES (93, 'Service Infrastructure et réseaux', 89);
INSERT INTO services (id, nom, parent_id) VALUES (94, 'Service Support Informatique', 89);

-- Autres services DGA Qualité de la Gestion Publique
INSERT INTO services (id, nom, parent_id) VALUES (95, 'Service Assurance', 67);
INSERT INTO services (id, nom, parent_id) VALUES (96, 'Service Fiscalité', 67);
INSERT INTO services (id, nom, parent_id) VALUES (97, 'Service Recensement', 67);
INSERT INTO services (id, nom, parent_id) VALUES (98, 'Service Régie Centrale', 67);

-- Direction du COLOSSE
INSERT INTO services (id, nom, parent_id) VALUES (99, 'Direction du COLOSSE', 2);
INSERT INTO services (id, nom, parent_id) VALUES (100, 'Service Evènementiel et promotion', 99);
INSERT INTO services (id, nom, parent_id) VALUES (101, 'Service Exploitation bassin', 99);
INSERT INTO services (id, nom, parent_id) VALUES (102, 'Service Exploitation technique et environnementale', 99);

-- Autres missions et services
INSERT INTO services (id, nom, parent_id) VALUES (103, 'Mission Audit et Contrôles', 2);
INSERT INTO services (id, nom, parent_id) VALUES (104, 'Secrétariat général', 2);
INSERT INTO services (id, nom, parent_id) VALUES (105, 'Service Courrier', 2);
INSERT INTO services (id, nom, parent_id) VALUES (106, 'Service ERP', 2);
INSERT INTO services (id, nom, parent_id) VALUES (107, 'Service Communication', 2);

-- Services hors DGS
INSERT INTO services (id, nom, parent_id) VALUES (108, 'Service Protocole', NULL);
INSERT INTO services (id, nom, parent_id) VALUES (109, 'Police Municipale', NULL);
INSERT INTO services (id, nom, parent_id) VALUES (110, 'Secrétariat PM', 109);
INSERT INTO services (id, nom, parent_id) VALUES (111, 'Caisse des écoles', NULL);
