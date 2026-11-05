# Géoréférencement des décomptes — 4 novembre 2026

Dans la configuration du comptage, utiliser « Capturer ma position » en étant au point à relever, puis commencer et enregistrer le décompte. La permission de localisation n'est demandée qu'au clic. Aucun suivi en arrière-plan.

Chaque FieldRecord peut contenir un champ optionnel gps : latitude et longitude WGS84 en degrés décimaux, accuracyMeters (null si inconnue), capturedAt (instant du relevé en ISO UTC). La position apparaît dans Données et dans quatre nouvelles colonnes Excel. L'heure affichée dans l'app est locale ; l'export indique explicitement UTC.

La position est effacée du formulaire après l'enregistrement et lors d'un changement de session. Les anciens décomptes sans GPS restent compatibles. Un refus de permission, une position indisponible ou un délai de 20 secondes affiche une erreur sans inventer de coordonnées. L'enregistrement sans GPS reste possible.

Vérifications : TypeScript réussi ; 25 tests réussis, 1 test de déconnexion déjà ignoré ; exports JavaScript iOS, Android et web réussis. Tests spécifiques : validation des coordonnées, permissions refusées, services désactivés, délai dépassé, stockage par décompte et export Excel. Deux dépendances Babel manquantes ont été déclarées et la création du cache NativeWind avant indexation Metro a été ajoutée pour rendre la compilation reproductible.

Avant diffusion : tester les permissions iOS/Android, une capture en extérieur et hors connexion, la fermeture/réouverture après sauvegarde et les coordonnées exportées. L'ajout du module natif expo-location nécessite un nouveau build installé ; aucune publication n'est déclenchée par ces modifications locales.
