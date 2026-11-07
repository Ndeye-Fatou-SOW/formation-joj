# PRD — Ndam : résultats certifiés

**Statut** : Validé

## Problème

Pendant les JOJ Dakar 2026, les journalistes doivent publier les résultats du jour vite, mais ils les vérifient à la main d'une source à l'autre. Une erreur de podium, une fois publiée, se corrige mal : elle circule, et le public perd confiance dans les résultats.

## Utilisateurs

- Journaliste présent sur une épreuve : saisir le podium qu'il a constaté, et savoir s'il est conforme aux résultats officiels avant de le publier.
- Supporter : savoir où en est son pays au tableau des médailles.

## Proposition

Chaque podium saisi par un journaliste est comparé aux résultats officiels des Jeux. S'il est identique, il est certifié ; s'il diffère, il est en écart, et les différences sont montrées. Tant que les Jeux n'ont pas publié le résultat officiel de l'épreuve, le podium reste provisoire. Le journaliste sait avant de publier si son résultat est sûr, au lieu de le vérifier à la main d'une source à l'autre.

## Mesure du succès

Pendant la démo, un podium identique au résultat officiel est certifié ; un podium qui inverse l'or et l'argent est en écart, et les deux différences sont affichées ; un podium d'une épreuve sans résultat officiel reste provisoire.

## Tranches

### TR1 — Comparer un podium aux résultats officiels

Un journaliste saisit le podium d'une épreuve (or, argent, bronze). Règles : si le résultat officiel de l'épreuve existe, le podium est certifié s'il est identique, en écart sinon, avec les différences ; s'il n'existe pas, le podium reste provisoire.

### TR2 — Publier un résultat officiel

L'organisation publie le résultat officiel d'une épreuve ; les podiums provisoires de cette épreuve sont alors comparés, et deviennent certifiés ou en écart. Règle : une épreuve n'a qu'un seul résultat officiel.

### TR3 — Le tableau des médailles officiel

Pour chaque pays, le nombre de médailles d'or, d'argent et de bronze, trié par or, puis argent, puis bronze. Règle : seuls les résultats officiels comptent.

### TR4 — Expliquer un écart avec l'IA

Pour un podium en écart, un assistant IA rédige en une phrase la différence avec le résultat officiel, prête à être lue par la rédaction. Règles : l'assistant ne modifie jamais le statut ; il ne cite que des pays présents dans le podium ou le résultat officiel.

## Hors périmètre

- Les comptes et mots de passe des journalistes ; la publication automatique vers les médias.
- Les ex aequo et les épreuves à plusieurs médailles de bronze.

## Hypothèses et risques

- Hypothèse : les résultats officiels des Jeux sont connus de l'application (chargés au démarrage en TR1, publiés par l'organisation en TR2).
- Hypothèse : une épreuve est identifiée par son nom ; un journaliste par son nom, sans compte.
- Risque : sans écran, la démo se fait par l'API.
