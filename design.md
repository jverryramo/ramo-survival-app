# Design — Ramo Survival App

## Concept

Application mobile de terrain pour le **comptage de survie des plants de saules**. Utilisée par les agronomes Ramo directement sur le terrain, en conditions extérieures (soleil, gants). Interface épurée, boutons larges, lisibilité maximale.

## Palette de couleurs

| Rôle | Couleur | Hex |
|------|---------|-----|
| Primary (header, boutons) | Vert forêt | `#003c38` |
| Accent | Chartreuse | `#DCF21E` |
| Background | Sable clair | `#F5F2EE` |
| Surface (cartes) | Blanc | `#FFFFFF` |
| Texte principal | Noir doux | `#1A1A1A` |
| Texte secondaire | Gris | `#6B6560` |
| Bordure | Sable | `#D3CBBF` |

### Couleurs des états de plants

| État | Fond | Texte |
|------|------|-------|
| Vivant | `#003c38` | `#FFFFFF` |
| Base | `#DCF21E` | `#000000` |
| Non débourré | `#D3CBBF` | `#000000` |
| Mort | `#8A6F48` | `#FFFFFF` |
| Manquant | `#FFFFFF` (bordure noire) | `#000000` |
| Plant échappé | `#000000` | `#FFFFFF` |

## Écrans

### 1. Écran Session (onglet "Session")
**Contenu :**
- Logo Ramo en haut (centré)
- Titre "Survival App"
- Champ Date (date picker natif, pré-rempli avec aujourd'hui)
- Champ Numéro de projet (texte libre, ex: "2025-001")
- Bouton "Démarrer session" (vert forêt, pleine largeur)
- Liste des sessions existantes (cartes cliquables pour reprendre)

**Fonctionnalité :** Création/sélection de session. Une session = un projet + une date.

### 2. Écran Comptage (onglet "Comptage")
**Contenu :**
- Header : Projet + Date de la session active
- Sélecteur Aire (1-20, picker ou segmented)
- Champ Longueur (m) — numérique
- Sélecteur Variété (1-20, picker ou segmented)
- Section "Comptage" : 6 grands boutons colorés (tap = +1)
  - Chaque bouton affiche le label à gauche et le compteur à droite
  - Bouton de reset individuel (long press ou bouton `-`)
- Champ Commentaire (texte libre)
- Bouton "Enregistrer l'aire" (vert forêt, pleine largeur)

**Fonctionnalité :** Saisie rapide des comptages par aire. Les boutons sont larges (min 80px) pour faciliter le tap avec des gants.

### 3. Écran Données (onglet "Données")
**Contenu :**
- Filtre par session (picker)
- Liste des enregistrements (FlatList) avec cartes compactes
  - Chaque carte : Aire, Variété, Longueur, badges colorés pour chaque état
  - Swipe to delete ou bouton supprimer
- Bouton "Exporter XLSX" (chartreuse, pleine largeur)
- Bouton "Réinitialiser" (rouge, pleine largeur, avec confirmation)

**Fonctionnalité :** Visualisation et export des données saisies.

## Flux utilisateurs principaux

### Flux 1 — Démarrer une nouvelle session
1. Onglet "Session" → Remplir date + numéro de projet → "Démarrer session"
2. Navigation automatique vers l'onglet "Comptage"
3. Saisir Aire, Longueur, Variété, compter les plants → "Enregistrer l'aire"
4. Répéter pour chaque aire

### Flux 2 — Reprendre une session existante
1. Onglet "Session" → Tap sur une session existante dans la liste
2. Navigation vers l'onglet "Comptage" avec la session sélectionnée

### Flux 3 — Exporter les données
1. Onglet "Données" → Sélectionner une session (ou toutes)
2. "Exporter XLSX" → Partage natif iOS/Android

## Navigation

Tab bar en bas avec 3 onglets :
- 🌱 Session (house.fill)
- ✏️ Comptage (pencil.and.list.clipboard)
- 📊 Données (chart.bar.fill)

## Principes de design

- **Boutons larges** : min 80px de hauteur pour usage terrain avec gants
- **Contraste élevé** : texte blanc sur fond vert, noir sur chartreuse
- **Feedback immédiat** : animation flash sur tap des boutons de comptage + haptic
- **Portrait uniquement** : orientation fixe
- **Hors-ligne** : 100% AsyncStorage, aucune connexion requise
