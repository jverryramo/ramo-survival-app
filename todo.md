# Ramo Survival App — TODO

## Configuration & Thème
- [x] Configurer le thème Ramo dans theme.config.js (couleurs forêt, sable, chartreuse)
- [x] Générer et intégrer le logo de l'application
- [x] Mettre à jour app.config.ts (nom, slug, logo)
- [x] Configurer les icônes de la tab bar

## Architecture de données
- [x] Créer lib/types.ts (Session, Record, PlantCounts, STATE_KEYS)
- [x] Créer lib/store.ts (CRUD AsyncStorage)
- [x] Créer lib/session-context.tsx (Provider + hooks)

## Écrans
- [x] Écran Session (app/(tabs)/index.tsx) — création et sélection de session
- [x] Écran Comptage (app/(tabs)/comptage.tsx) — formulaire de saisie terrain
- [x] Écran Données (app/(tabs)/donnees.tsx) — historique et export

## Composants
- [x] Composant CounterButton (bouton de comptage coloré avec animation flash)
- [x] Composant SessionCard (carte de session dans la liste)
- [x] Composant RecordCard (carte d'enregistrement dans l'historique)

## Navigation
- [x] Configurer la tab bar avec 3 onglets (Session, Comptage, Données)
- [x] Ajouter les icônes dans icon-symbol.tsx

## Export XLSX
- [x] Installer xlsx + expo-sharing + expo-file-system
- [x] Implémenter la fonction exportXLSX dans lib/export.ts
- [x] Intégrer le bouton d'export dans l'écran Données

## Tests
- [x] Tests unitaires pour le store (CRUD AsyncStorage)
- [x] Tests unitaires pour l'export XLSX

## Build & Déploiement
- [x] Préparer eas.json
- [x] Vérifier la checklist pré-build
- [x] Créer DEPLOY.md

## Améliorations v1.1
- [x] Ajouter un sélecteur de date natif (calendrier) dans l'écran Session
- [x] Fallback web pour le date picker (champ texte sur web)

## Améliorations v1.2
- [x] Graphique de répartition coloré (barres horizontales) dans l'onglet Données
- [x] Auto-incrément du numéro d'aire après chaque enregistrement dans Comptage

## Améliorations v1.3
- [x] Keep-awake dans l'onglet Comptage (écran reste allumé sur terrain)
- [x] Validation longueur obligatoire avec avertissement avant enregistrement
- [x] Champ Opérateur dans la session (nom de la personne qui fait le comptage)
- [x] Afficher l'opérateur dans le header de l'écran Comptage
- [x] Inclure l'opérateur dans l'export XLSX

## Améliorations v1.4
- [x] Mémoriser le dernier opérateur localement (AsyncStorage) et pré-remplir le champ
- [x] Écran de verrouillage par mot de passe (ramo26) à l'ouverture de l'app

## Corrections v1.5
- [x] Corriger l'export XLSX — fonctionne sur iOS/Android natif (pas seulement aperçu web)

## Build & Distribution v1.5
- [x] Rédiger BUILD.md complet avec guide étape par étape iOS + Android
- [x] Vérifier eas.json (profils preview et production)
- [x] Vérifier app.config.ts (ITSAppUsesNonExemptEncryption, bundleId)

## Ergonomie v1.9
- [x] Refaire écran Comptage — Étape 1 : formulaire Aire/Longueur/Variété + bouton "Commencer le comptage"
- [x] Refaire écran Comptage — Étape 2 : mode plein écran terrain, 6 grands boutons, compteurs en gros chiffres, bouton Enregistrer fixe en bas
