# Guide de build — Ramo Survival App

EAS Build compile l'app dans le cloud Expo. Pas besoin de Xcode ni d'Android Studio.

---

## Prérequis (à faire une seule fois)

**Node.js v18+**
```bash
node --version
```
Si inférieur à v18 : [nodejs.org](https://nodejs.org)

**EAS CLI**
```bash
npm install -g eas-cli
```

**Compte Expo (gratuit)** : [expo.dev/signup](https://expo.dev/signup)

**Compte Apple Developer (iOS seulement)** : 99 $/an sur [developer.apple.com](https://developer.apple.com) — doit être actif.

---

## Étape 1 — Télécharger et ouvrir le projet

Télécharge le ZIP depuis l'interface Manus (menu **⋯** → **Download as ZIP**), décompresse-le, puis :

```bash
cd ~/Downloads/ramo-survival-app
```

---

## Étape 2 — Installer les dépendances

```bash
npm install
```

---

## Étape 3 — Connexion Expo

```bash
eas login
```

Entre ton courriel et mot de passe Expo. Si déjà connecté, réponds **yes** à "Do you want to continue?".

---

## Étape 4 — Builder

### Android (APK)

```bash
eas build --platform android --profile preview
```

Build en 10-15 minutes. À la fin, EAS donne un **lien de téléchargement** pour le `.apk`.

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
2. Ouvrir le lien reçu → **Installer**

---

### iOS — Ad Hoc (max 100 appareils, sans TestFlight)

```bash
eas device:create
```

Choisis **Website** → la personne ouvre le lien dans **Safari** sur son iPhone et installe le profil. Ensuite :

```bash
eas build --platform ios --profile preview
```

**Installation :**
1. Activer le **Mode développeur** : Réglages → Confidentialité et sécurité → Mode développeur → Activer → Redémarrer
2. Ouvrir le lien du build (visible sur [expo.dev](https://expo.dev) → projet → Builds) → **Installer**

---

## Mises à jour futures (sans recompiler)

```bash
eas update --branch preview --message "Description"
```

L'app se met à jour au prochain lancement. Pour les mises à jour majeures, refaire un `eas build`.

---

## Résumé des commandes

| Action | Commande |
|--------|----------|
| Connexion Expo | `eas login` |
| Build Android APK | `eas build --platform android --profile preview` |
| Build iOS TestFlight | `eas build --platform ios --profile production` |
| Soumettre iOS | `eas submit --platform ios` |
| Enregistrer un iPhone | `eas device:create` |
| Mise à jour OTA | `eas update --branch preview --message "..."` |
| Voir les builds | [expo.dev](https://expo.dev) → projet → Builds |

---

## En cas de problème

**"Unexpected arguments: #, Android"** → Les commandes ont été copiées avec le commentaire. Taper uniquement la commande sans le `#` et ce qui suit.

**Build iOS échoue avec erreur de certificat** → Réponds **Y** à "Would you like to automatically manage credentials?".

**L'app crashe à l'ouverture** → Ne pas utiliser Expo Go. Utiliser uniquement les builds EAS.
