# Guide de build — Ramo Survival App

EAS Build compile l'app dans le cloud Expo. Pas besoin de Xcode ni d'Android Studio.

---

## ⚠️ IMPORTANT — Toujours commencer par ça

**Avant toute commande**, aller dans le dossier du projet :

```bash
cd ~/Downloads/ramo-survival-app
```

Si le dossier n'existe pas encore :
```bash
cd ~/Downloads
git clone https://github.com/jverryramo/ramo-survival-app.git
cd ramo-survival-app
npm install
```

---

## Prérequis (à faire une seule fois)

**EAS CLI** — mettre à jour :
```bash
npm install -g eas-cli
```

**Compte Expo (gratuit)** : [expo.dev/signup](https://expo.dev/signup)

**Compte Apple Developer (iOS seulement)** : 99 $/an sur [developer.apple.com](https://developer.apple.com) — doit être actif.

---

## Étape 1 — Mettre à jour le code

```bash
cd ~/Downloads/ramo-survival-app
git pull
npm install
```

---

## Étape 2 — Connexion Expo

```bash
eas login
```

Entre ton courriel et mot de passe Expo. Si déjà connecté, réponds **yes** à "Do you want to continue?".

---

## Étape 3 — Builder iOS ET Android en même temps

```bash
cd ~/Downloads/ramo-survival-app
eas build --platform all --profile production --non-interactive
```

Cette commande lance les deux builds simultanément dans le cloud :
- **iOS** → App Store / TestFlight (`.ipa`)
- **Android** → Google Play (`.aab`)

> Si EAS demande de se connecter au compte Apple → répondre **Y** et entrer les identifiants Apple Developer.

**Durée** : 15-25 minutes. Suivre l'avancement sur [expo.dev](https://expo.dev) → projet → Builds.

---

## Étape 4 — Après le build

### iOS — Soumettre sur TestFlight

```bash
cd ~/Downloads/ramo-survival-app
eas submit --platform ios
```

Sélectionner le dernier build dans la liste. EAS soumet à App Store Connect automatiquement.

Après 5-15 minutes de traitement Apple :
1. Aller sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → app → onglet **TestFlight**
2. **Testeurs externes** → **Ajouter un groupe** → nommer le groupe
3. Activer **Lien public** → copier le lien → envoyer à l'équipe

**Installation (membres de l'équipe) :**
1. Installer l'app **TestFlight** depuis l'App Store
2. Ouvrir le lien reçu → **Installer**

---

### Android — APK direct (alternative au Play Store)

Pour un APK téléchargeable directement (sans Play Store) :

```bash
cd ~/Downloads/ramo-survival-app
eas build --platform android --profile preview --non-interactive
```

EAS donne un **lien de téléchargement** pour le `.apk` à la fin du build.

**Installation sur Android :**
1. Envoyer le lien par courriel/texto
2. La personne ouvre le lien sur son téléphone → le `.apk` se télécharge
3. Elle ouvre le fichier → Android demande d'autoriser les sources inconnues → **Paramètres → Activer → Installer**

---

## Mises à jour futures

Pour les mises à jour mineures (sans nouveau code natif) :

```bash
cd ~/Downloads/ramo-survival-app
git pull
eas update --branch production --message "Description de la mise à jour"
```

L'app se met à jour au prochain lancement. Pour les mises à jour majeures (nouveaux modules natifs), refaire un `eas build`.

---

## Résumé des commandes

| Action | Commande |
|--------|----------|
| **Aller dans le projet** | `cd ~/Downloads/ramo-survival-app` |
| Mettre à jour | `git pull && npm install` |
| **Build iOS + Android** | `eas build --platform all --profile production --non-interactive` |
| Build Android APK seul | `eas build --platform android --profile preview --non-interactive` |
| Build iOS seul | `eas build --platform ios --profile production --non-interactive` |
| Soumettre iOS | `eas submit --platform ios` |
| Voir les builds | [expo.dev](https://expo.dev) → projet → Builds |

---

## En cas de problème

**"fatal: not a git repository"** → Tu n'es pas dans le bon dossier. Taper `cd ~/Downloads/ramo-survival-app` d'abord.

**"npm error: Could not read package.json"** → Même cause : mauvais dossier. Taper `cd ~/Downloads/ramo-survival-app`.

**Build iOS échoue avec erreur de certificat** → Réponds **Y** à "Would you like to automatically manage credentials?".

**L'app crashe à l'ouverture** → Ne pas utiliser Expo Go. Utiliser uniquement les builds EAS.
