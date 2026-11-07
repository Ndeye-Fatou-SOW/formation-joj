# PRD — Ndam bu wóor : résultats certifiés

**Statut** : Validé

## Problème

Pendant les JOJ Dakar 2026, les journalistes doivent publier les résultats du jour vite, mais ils les vérifient à la main d'une source à l'autre. Une erreur de podium, une fois publiée, se corrige mal : elle circule, et le public perd confiance dans les résultats officiels.

## Utilisateurs

- Journaliste présent sur une épreuve : saisir le podium qu'il a constaté, et savoir s'il est certifié avant de le publier.
- Supporter : savoir où en est son pays au tableau des médailles.

## Proposition

Un podium n'est certifié que si deux journalistes différents l'ont saisi chacun de leur côté, sans voir la saisie de l'autre. Si les deux saisies concordent, le podium devient officiel ; sinon, il est en litige, et les écarts sont montrés. Une double saisie à l'aveugle détecte l'erreur mieux qu'une simple relecture, où l'on valide souvent sans vérifier. L'erreur est arrêtée avant d'être publiée, au lieu d'être corrigée après coup.

## Mesure du succès

Pendant la démo, deux journalistes saisissent le même podium : il devient officiel. Pour une autre épreuve, leurs saisies diffèrent sur la médaille d'or : le podium est en litige, et l'écart est affiché. Un même journaliste ne peut pas saisir deux fois la même épreuve.

## Tranches

### TR1 — La double saisie à l'aveugle

Un journaliste saisit le podium d'une épreuve (or, argent, bronze) ; un second journaliste le saisit de son côté. Règles : un même journaliste ne saisit pas deux fois la même épreuve ; deux saisies identiques rendent le podium officiel, deux saisies différentes le mettent en litige, avec les écarts.

### TR2 — Le tableau des médailles officiel

Pour chaque pays, le nombre de médailles d'or, d'argent et de bronze, trié par or, puis argent, puis bronze. Règle : seuls les podiums officiels comptent.

### TR3 — Résoudre un litige

Un troisième journaliste, différent des deux premiers, tranche un podium en litige en saisissant le podium correct, avec un motif. Règle : une résolution sans motif est refusée.

### TR4 — Expliquer un litige avec l'IA

Pour un podium en litige, un assistant IA rédige en une phrase l'écart entre les deux saisies, prête à être lue par la rédaction. Règles : l'assistant ne tranche jamais le litige ; il ne cite que des pays présents dans les saisies.

## Hors périmètre

- Les comptes et mots de passe des journalistes ; la publication automatique vers les médias.
- Les ex aequo et les épreuves à plusieurs médailles de bronze.

## Hypothèses et risques

- Hypothèse : un journaliste est identifié par son nom ; sans compte, une même personne peut saisir sous deux noms. Les pays participants sont connus à l'avance (code à trois lettres).
- Hypothèse : une épreuve reçoit au plus deux saisies avant d'être officielle ou en litige ; une troisième saisie est à préciser dans la spec TR1.
- Risque : TR1 a deux règles et une comparaison ; si elle ne tient pas en 2 heures, le litige passe dans une tranche à part. Sans écran, la démo se fait par l'API.
