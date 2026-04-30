# Déploiement — Ramo Survival App

Guide complet pour builder et distribuer l'application sur iOS et Android.

## Prérequis (à faire une seule fois)

1. **Node.js v18+** sur ton Mac — vérifier avec `node --version`
2. **EAS CLI** : `npm install -g eas-cli`
3. **Compte Expo** (gratuit) : [expo.dev/signup](https://expo.dev/signup)
4. **Compte Apple Developer** (99 $/an) pour iOS : [developer.apple.com](https://developer.apple.com)

## Étapes avant chaque build

Ouvre un Terminal sur ton Mac et tape ces commandes dans l'ordre :

```bash
# 1. Aller dans le dossier du projet
cd ~/Downloads/ramo-survival-app

# 2. Vérifier les fichiers fantômes (fichiers supprimés mais encore présents localement)
git clean -n

# 3. Se connecter à Expo (si pas déjà connecté)
eas login

# 4. Vérifier que les tests passent
npm test
```

## Build Android (APK)

Le plus simple — pas besoin de compte Apple.

```bash
eas build --platform android --profile preview
```

- EAS te posera quelques questions → réponds **Y** à tout
- Le build prend environ 10-15 minutes dans le cloud
- À la fin, EAS donne un **lien .apk**
- Envoie ce lien par courriel/texto à l'équipe
- Sur Android : ouvrir le lien → télécharger → autoriser les sources inconnues → installer

## Build iOS (TestFlight) — Recommandé pour l'équipe

```bash
# Build production
eas build --platform ios --profile production
```

- Répondre **Y** à "Do you want to log in to your Apple account?"
- Répondre **No** à "Would you like to set up Push Notifications?"
- Le build prend environ 15-20 minutes

```bash
# Soumettre à TestFlight
eas submit --platform ios
```

- Choisir "Select a build from EAS" → sélectionner le dernier build
- Aller sur **appstoreconnect.apple.com** → onglet TestFlight
- Le build apparaît après 5-15 min de traitement Apple
- Créer un groupe de testeurs → activer le lien public → envoyer le lien
- Les testeurs installent l'app **TestFlight** depuis l'App Store → ouvrent le lien → Installer

## Mise à jour OTA (sans nouveau build)

Pour les corrections mineures (pas de nouveaux modules natifs) :

```bash
eas update --branch preview --message "Description de la mise à jour"
```

## Commandes utiles

| Action | Commande |
|--------|----------|
| Login Expo | `eas login` |
| Build Android APK | `eas build --platform android --profile preview` |
| Build iOS production | `eas build --platform ios --profile production` |
| Soumettre App Store | `eas submit --platform ios` |
| Voir les builds | expo.dev → projet → Builds |
| Nettoyer fichiers fantômes | `git clean -fd` |

## Checklist pré-build

- [ ] `eas.json` présent dans le projet
- [ ] `package.json` sans champ `packageManager`
- [ ] Pas de `pnpm-lock.yaml` ni `.npmrc` dans le projet
- [ ] `npm test` passe sans erreur
- [ ] Fichiers fantômes vérifiés avec `git clean -n`
