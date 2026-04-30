# Guide de build — Ramo Survival App

Ce guide te permet de construire l'app iOS et Android depuis ton terminal. EAS Build compile tout dans le cloud Expo — pas besoin de Xcode ni d'Android Studio.

---

## Prérequis (à faire une seule fois)

### 1. Node.js v18+

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

Requis pour les builds iOS. Abonnement annuel de 99 $ USD sur [developer.apple.com](https://developer.apple.com). Le compte doit être **actif**.

---

## Étape 1 — Télécharger et ouvrir le projet

Télécharge le projet depuis l'interface Manus (menu ⋯ → **Download as ZIP**), décompresse-le, puis dans le Terminal :

```bash
cd ~/Downloads/ramo-survival-app
```

> Remplace le chemin si tu l'as décompressé ailleurs.

---

## Étape 2 — Installer les dépendances

```bash
npm install
```

---

## Étape 3 — Connexion et initialisation EAS

```bash
eas login
eas init
```

À `eas login` : entre ton courriel et mot de passe Expo.
À `eas init` : réponds **Y** pour confirmer le nom du projet.

---

## Étape 4 — Builder l'app

### Android (APK)

```bash
eas build --platform android --profile preview
```

Build en 10-15 minutes dans le cloud. À la fin, EAS donne un **lien de téléchargement** pour le `.apk`.

**Installation sur Android :**
1. Envoie le lien par courriel/texto
2. La personne ouvre le lien sur son téléphone → le `.apk` se télécharge
3. Elle ouvre le fichier → Android demande d'autoriser les sources inconnues → **Paramètres → Activer → Installer**

---

### iOS — TestFlight (recommandé)

```bash
eas build --platform ios --profile production
```

| Question EAS | Réponse |
|---|---|
| `Do you want to log in to your Apple account?` | **Y** |
| `Would you like to set up Push Notifications?` | **No** |
| `Would you like to automatically manage credentials?` | **Y** |

Build en 15-20 minutes. Ensuite :

```bash
eas submit --platform ios
```

Sélectionne le dernier build dans la liste. EAS soumet à App Store Connect automatiquement.

Après 5-15 minutes de traitement Apple :
1. Va sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → ton app → onglet **TestFlight**
2. **Testeurs externes** → **Ajouter un groupe** → nomme le groupe
3. Active **Lien public** → copie le lien → envoie à l'équipe

**Installation (membres de l'équipe) :**
1. Installer l'app **TestFlight** depuis l'App Store
2. Ouvrir le lien → **Installer** — pas besoin d'enregistrer les appareils

---

### iOS — Ad Hoc (distribution rapide, max 100 appareils)

```bash
# Enregistrer chaque iPhone (ouvre un lien à ouvrir dans Safari sur l'iPhone)
eas device:create

# Builder
eas build --platform ios --profile preview
```

**Installation :**
1. Activer le **Mode développeur** : Réglages → Confidentialité et sécurité → Mode développeur → Activer → Redémarrer
2. Ouvrir le lien du build (visible sur [expo.dev](https://expo.dev) → projet → Builds) → **Installer**

---

## Mises à jour futures

Pour les mises à jour mineures (sans nouveau code natif) :

```bash
eas update --branch preview --message "Description de la mise à jour"
```

L'app se met à jour au prochain lancement. Pour les mises à jour majeures, refaire un `eas build`.

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

## En cas de problème

**Erreur "Unable to resolve module"** → Exécute `git clean -fd` pour supprimer les fichiers fantômes, puis relance le build.

**Build iOS échoue avec erreur de certificat** → Réponds **Y** à "Would you like to automatically manage credentials?".

**L'app crashe à l'ouverture** → Ne pas utiliser Expo Go. Utiliser uniquement les builds EAS.
