# Guide de build — Ramo Survival App

Ce guide te permet de construire l'app iOS et Android depuis ton terminal, sans Xcode ni Android Studio. EAS Build compile tout dans le cloud Expo.

---

## Prérequis (à faire une seule fois)

### 1. Node.js v18+

Vérifie ta version :
```bash
node --version
```
Si inférieur à v18, télécharge depuis [nodejs.org](https://nodejs.org).

### 2. EAS CLI

```bash
npm install -g eas-cli
```

### 3. Compte Expo (gratuit)

Crée un compte sur [expo.dev/signup](https://expo.dev/signup) si tu n'en as pas.

### 4. Compte Apple Developer (iOS seulement)

Requis pour les builds iOS. Abonnement annuel de 99 $ USD sur [developer.apple.com](https://developer.apple.com). Le compte doit être **actif** (pas "En attente de paiement").

---

## Étape 1 — Télécharger le projet

Télécharge le projet depuis l'interface Manus (bouton **Download as ZIP** dans le menu ⋯), puis décompresse-le. Ensuite dans le Terminal :

```bash
cd ~/Downloads/ramo-survival-app
```

> **Important :** Remplace `~/Downloads/ramo-survival-app` par le chemin exact où tu as décompressé le dossier.

---

## Étape 2 — Préparer le projet pour EAS

Ces commandes sont à exécuter **une seule fois** pour adapter le projet au système de build EAS (qui utilise npm, pas pnpm).

```bash
# 1. Supprimer les fichiers spécifiques à pnpm
rm -f pnpm-lock.yaml .npmrc

# 2. Retirer le champ "packageManager" de package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete pkg.packageManager;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('packageManager retiré de package.json');
"

# 3. Installer les dépendances avec npm (génère package-lock.json)
npm install

# 4. Connexion à ton compte Expo
eas login
```

À l'étape `eas login`, entre ton adresse courriel et ton mot de passe Expo.

---

## Étape 3 — Initialiser le projet EAS

```bash
eas init
```

EAS va te demander de confirmer le nom du projet. Réponds **Y** (oui). Cette commande ajoute automatiquement le `projectId` dans `app.config.ts`.

---

## Étape 4 — Builder l'app

### Android (APK — le plus simple)

```bash
eas build --platform android --profile preview
```

EAS va compiler l'app dans le cloud (environ 10-15 minutes). À la fin, tu reçois un **lien de téléchargement** pour le fichier `.apk`.

**Pour installer sur un téléphone Android :**
1. Envoie le lien par courriel ou texto à la personne
2. Elle ouvre le lien sur son téléphone → le `.apk` se télécharge
3. Elle ouvre le fichier téléchargé
4. Android demande d'autoriser les sources inconnues → **Paramètres → Activer → Installer**
5. L'app apparaît sur l'écran d'accueil

---

### iOS — Option A : TestFlight (recommandé pour l'équipe)

TestFlight est la méthode la plus simple pour distribuer à plusieurs personnes sur iPhone. Nécessite un compte Apple Developer actif.

```bash
eas build --platform ios --profile production
```

EAS va te poser plusieurs questions — voici quoi répondre :

| Question EAS | Réponse |
|---|---|
| `Do you want to log in to your Apple account?` | **Y** |
| `Would you like to set up Push Notifications?` | **No** |
| `Would you like to automatically manage credentials?` | **Y** |

Le build prend environ 15-20 minutes. Ensuite :

```bash
eas submit --platform ios
```

| Question | Réponse |
|---|---|
| `Select a build` | Choisis le dernier build dans la liste |

EAS soumet automatiquement à App Store Connect. Attends 5-15 minutes que Apple traite le build, puis :

1. Va sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Ouvre ton app → onglet **TestFlight**
3. Va dans **Testeurs externes** → **Ajouter un groupe** → nomme le groupe (ex. "Équipe terrain")
4. Active **Lien public** → copie le lien
5. Envoie le lien à l'équipe

**Pour installer (membres de l'équipe) :**
1. Installer l'app gratuite **TestFlight** depuis l'App Store
2. Ouvrir le lien reçu → appuyer sur **Installer**
3. Pas besoin d'enregistrer les appareils ni d'activer le mode développeur

---

### iOS — Option B : Ad Hoc (distribution rapide, max 100 appareils)

```bash
# Enregistrer chaque iPhone (répéter pour chaque appareil)
eas device:create
```

Choisis **Website** → EAS génère un lien. La personne ouvre ce lien **dans Safari sur son iPhone** (pas Chrome) et suit les instructions pour installer le profil.

Ensuite :
```bash
eas build --platform ios --profile preview
```

Une fois le build terminé, le lien de téléchargement est visible sur [expo.dev](https://expo.dev) dans ton projet → **Builds**.

**Pour installer :**
1. Activer le **Mode développeur** sur l'iPhone : Réglages → Confidentialité et sécurité → Mode développeur → Activer → Redémarrer → Confirmer
2. Ouvrir le lien du build → **Installer**

> **Note :** Chaque nouvel appareil nécessite un nouveau build.

---

## Étape 5 — Mises à jour futures

Pour les mises à jour mineures (sans changement de code natif), tu peux utiliser une mise à jour OTA (Over-The-Air) sans recompiler :

```bash
eas update --branch preview --message "Description de la mise à jour"
```

L'app se met à jour automatiquement au prochain lancement.

Pour les mises à jour majeures (nouveaux modules natifs, changement de permissions), refaire un `eas build`.

---

## Résumé des commandes

| Action | Commande |
|--------|----------|
| Connexion Expo | `eas login` |
| Initialiser EAS | `eas init` |
| Build Android APK | `eas build --platform android --profile preview` |
| Build iOS TestFlight | `eas build --platform ios --profile production` |
| Soumettre iOS | `eas submit --platform ios` |
| Enregistrer un iPhone | `eas device:create` |
| Mise à jour OTA | `eas update --branch preview --message "..."` |
| Voir les builds | [expo.dev](https://expo.dev) → projet → Builds |

---

## Informations du projet

| Champ | Valeur |
|-------|--------|
| Nom | Survival |
| Bundle ID iOS | `space.manus.ramo.survival.app.t20260430142419` |
| Package Android | `space.manus.ramo.survival.app.t20260430142419` |
| SDK Expo | 54 |
| Version | 1.0.0 |

---

## En cas de problème

**Erreur "Unable to resolve module"** → Exécute `git clean -fd` pour supprimer les fichiers fantômes, puis relance le build.

**Erreur "packageManager not supported"** → Vérifie que le champ `packageManager` a bien été retiré de `package.json` (Étape 2).

**Build iOS échoue avec erreur de certificat** → Réponds **Y** à "Would you like to automatically manage credentials?" pour laisser EAS gérer les certificats automatiquement.

**L'app crashe à l'ouverture sur iOS** → Ne pas utiliser Expo Go. Utiliser uniquement les builds EAS (preview ou production).
