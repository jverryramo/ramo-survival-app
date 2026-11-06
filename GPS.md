# Géoréférencement des décomptes — 4 novembre 2026

## Portrait par aire — 6 novembre 2026

Dans Relevés, la vue « Par aire » regroupe les comptages par session et numéro d’aire. Sélectionner une session affiche un plan relatif des points GPS, nord en haut, sans fond satellite ni limites de parcelles. Chaque aire utilise le GPS valide le plus récent de ses relevés; les coordonnées d’origine restent conservées dans chaque relevé et dans l’export Excel. Les aires sans GPS restent dans la liste, sans point inventé. Toucher une aire affiche ses relevés.

Le portrait additionne tous les relevés de l’aire (répétitions incluses) et affiche les six catégories, le total et le pourcentage Vivant / total, pondéré par le nombre de plants. Les sessions restent séparées. Un relevé existant peut recevoir une position ou la réactualiser depuis son écran de modification, en se plaçant sur l’aire. Changer d’aire dans le formulaire de comptage efface la position précédente.

Validation : 33 tests réussis et un test préexistant ignoré, contrôle TypeScript et export web réussis. La capture GPS et le rendu sur iPhone restent à vérifier sur appareil. Ces changements ne sont pas encore distribués dans TestFlight.

Dans la configuration du comptage, utiliser « Capturer ma position » en étant au point à relever, puis commencer et enregistrer le décompte. La permission de localisation n'est demandée qu'au clic. Aucun suivi en arrière-plan.

Chaque FieldRecord peut contenir un champ optionnel gps : latitude et longitude WGS84 en degrés décimaux, accuracyMeters (null si inconnue), capturedAt (instant du relevé en ISO UTC). La position apparaît dans Données et dans quatre nouvelles colonnes Excel. L'heure affichée dans l'app est locale ; l'export indique explicitement UTC.

La position est effacée du formulaire après l'enregistrement et lors d'un changement de session. Les anciens décomptes sans GPS restent compatibles. Un refus de permission, une position indisponible ou un délai de 20 secondes affiche une erreur sans inventer de coordonnées. L'enregistrement sans GPS reste possible.

Vérifications : TypeScript réussi ; 25 tests réussis, 1 test de déconnexion déjà ignoré ; exports JavaScript iOS, Android et web réussis. Tests spécifiques : validation des coordonnées, permissions refusées, services désactivés, délai dépassé, stockage par décompte et export Excel. Deux dépendances Babel manquantes ont été déclarées et la création du cache NativeWind avant indexation Metro a été ajoutée pour rendre la compilation reproductible.

Avant diffusion : tester les permissions iOS/Android, une capture en extérieur et hors connexion, la fermeture/réouverture après sauvegarde et les coordonnées exportées. L'ajout du module natif expo-location nécessite un nouveau build installé ; aucune publication n'est déclenchée par ces modifications locales.
