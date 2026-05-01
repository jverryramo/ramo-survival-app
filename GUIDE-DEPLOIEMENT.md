# Guide de mise en ligne — Ramo Survival App
### iOS (TestFlight) et Android (APK)

> **À qui s'adresse ce guide ?** À toute personne de l'équipe Ramo qui doit publier une nouvelle version de l'application Survival, sans être développeuse. Aucune connaissance technique n'est requise — suivez les étapes dans l'ordre.

---

## Ce dont vous avez besoin (à préparer avant de commencer)

| Élément | Détail |
|---|---|
| Un Mac | Ce guide est pour macOS |
| Node.js installé | Version 18 ou plus — vérifier avec `node --version` dans Terminal |
| Un compte Expo | Gratuit sur [expo.dev](https://expo.dev) — demander les identifiants à Jérôme |
| Un compte Apple Developer | Payant (99 $/an) — demander les identifiants à Jérôme |
| L'app **Terminal** | Déjà installée sur votre Mac — chercher "Terminal" dans Spotlight (Cmd + Espace) |

---

## PARTIE 1 — Installation (à faire une seule fois)

### Étape 1 — Installer EAS CLI

Ouvrez **Terminal** et tapez exactement cette commande, puis appuyez sur **Entrée** :

```bash
npm install -g eas-cli
```

Attendez que ça se termine (30 secondes environ). Vous verrez des lignes défiler — c'est normal.

---

### Étape 2 — Télécharger le projet

Toujours dans Terminal, tapez ces commandes **une par une**, en appuyant sur **Entrée** après chacune :

```bash
cd ~/Downloads
```

```bash
git clone https://github.com/jverryramo/ramo-survival-app.git
```

```bash
cd ramo-survival-app
```

```bash
npm install
```

La dernière commande peut prendre 1-2 minutes. Attendez qu'elle se termine avant de continuer.

---

### Étape 3 — Se connecter à Expo

```bash
eas login
```

EAS va vous demander votre courriel et mot de passe Expo. Tapez-les et appuyez sur **Entrée** après chacun.

> **Note :** Le mot de passe ne s'affiche pas à l'écran pendant que vous tapez — c'est normal et voulu pour la sécurité.

---

## PARTIE 2 — Mise en ligne (à faire à chaque nouvelle version)

### Étape 4 — Aller dans le bon dossier et mettre à jour

**⚠️ Cette étape est obligatoire à chaque fois, sans exception.**

```bash
cd ~/Downloads/ramo-survival-app
```

```bash
git pull
```

```bash
npm install
```

---

### Étape 5 — Lancer les builds iOS et Android

```bash
eas build --platform all --profile production --non-interactive
```

EAS va vous poser quelques questions. Voici exactement quoi répondre :

| Question d'EAS | Votre réponse |
|---|---|
| `Do you want to log in to your Apple account?` | Taper **Y** puis Entrée |
| `Apple ID:` | Votre adresse courriel Apple Developer |
| `Password:` | Votre mot de passe Apple Developer (ne s'affiche pas) |
| `Would you like to automatically manage credentials?` | Taper **Y** puis Entrée |
| `Would you like to set up Push Notifications?` | Taper **No** puis Entrée |

Après ça, EAS lance les deux builds dans le cloud. **Vous pouvez fermer Terminal** — les builds continuent en ligne.

**Durée** : 15 à 25 minutes.

Pour suivre l'avancement : ouvrez [expo.dev](https://expo.dev) dans votre navigateur → connectez-vous → cliquez sur **ramo-survival-app** → **Builds**. Vous verrez deux builds en cours (un iOS, un Android).

---

### Étape 6 — Récupérer l'APK Android

Une fois le build Android terminé (statut **Finished** en vert sur expo.dev) :

1. Cliquer sur le build Android dans la liste
2. Cliquer sur **Download** pour télécharger le fichier `.apk`
3. Envoyer ce fichier par courriel ou lien de téléchargement aux utilisateurs Android

**Installation sur un téléphone Android :**
1. La personne ouvre le lien ou le fichier `.apk` sur son téléphone
2. Android demande d'autoriser les sources inconnues → aller dans **Paramètres → Autoriser**
3. L'app s'installe et apparaît sur l'écran d'accueil

---

### Étape 7 — Publier sur TestFlight (iOS)

Une fois le build iOS terminé (statut **Finished** en vert sur expo.dev), ouvrez Terminal et tapez :

```bash
cd ~/Downloads/ramo-survival-app
```

```bash
eas submit --platform ios
```

EAS va vous demander quel build soumettre. Choisissez le plus récent dans la liste (utilisez les flèches du clavier, puis **Entrée**).

EAS soumet automatiquement à Apple. Attendez le message **"Scheduled iOS submission"** — c'est bon signe.

---

### Étape 8 — Activer TestFlight pour l'équipe

Après 5 à 15 minutes de traitement par Apple :

1. Aller sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Se connecter avec le compte Apple Developer
3. Cliquer sur l'app **Survival**
4. Aller dans l'onglet **TestFlight**
5. Sous **Testeurs externes**, cliquer sur **+** pour ajouter un groupe (si pas encore créé)
6. Nommer le groupe (ex: "Équipe Ramo")
7. Activer le **Lien public** (toggle bleu)
8. Copier le lien généré
9. Envoyer ce lien à l'équipe par courriel ou texto

**Installation sur un iPhone (membres de l'équipe) :**
1. Installer l'app gratuite **TestFlight** depuis l'App Store (chercher "TestFlight")
2. Ouvrir le lien reçu → appuyer sur **Installer**
3. L'app Survival apparaît sur l'écran d'accueil

---

## Résumé rapide — Commandes à copier-coller

Pour les fois suivantes (après l'installation initiale), voici toutes les commandes dans l'ordre :

```bash
cd ~/Downloads/ramo-survival-app
git pull
npm install
eas build --platform all --profile production --non-interactive
```

Puis, une fois les builds terminés :

```bash
cd ~/Downloads/ramo-survival-app
eas submit --platform ios
```

---

## En cas de problème

### "fatal: not a git repository" ou "npm error: Could not read package.json"

**Cause :** Vous n'êtes pas dans le bon dossier.

**Solution :** Taper cette commande et recommencer :
```bash
cd ~/Downloads/ramo-survival-app
```

---

### "eas: command not found"

**Cause :** EAS CLI n'est pas installé.

**Solution :**
```bash
npm install -g eas-cli
```

---

### "You are not logged in"

**Cause :** Vous n'êtes pas connecté à Expo.

**Solution :**
```bash
eas login
```

---

### Le build iOS échoue avec une erreur de certificat

**Solution :** Relancer le build et répondre **Y** à "Would you like to automatically manage credentials?".

---

### "npm: command not found" ou "node: command not found"

**Cause :** Node.js n'est pas installé sur votre Mac.

**Solution :** Télécharger et installer Node.js depuis [nodejs.org](https://nodejs.org) (choisir la version **LTS**), puis recommencer depuis l'Étape 1.

---

## Contact

En cas de blocage, contacter **Jérôme Verry** — il peut relancer les builds depuis son propre ordinateur.

Projet GitHub : [github.com/jverryramo/ramo-survival-app](https://github.com/jverryramo/ramo-survival-app)
