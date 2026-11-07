# 005 — Ndam : le tableau des médailles officiel

**Statut** : Brouillon
**PRD** : specs/prd-ndam.md, TR3

## Contexte

Les supporters veulent savoir où en est leur pays. Cette tranche affiche le tableau des médailles calculé à partir des seuls résultats officiels des Jeux, jamais des podiums saisis par les journalistes.

## User stories

- En tant que supporter, je veux voir le nombre de médailles d'or, d'argent et de bronze de chaque pays, afin de savoir où en est le mien.

## Scénarios d'acceptation

### AS1 — Compter les médailles

- **Étant donné** les résultats officiels du « 100 m filles » (or CIV, argent EGY, bronze JPN) et du « Basketball 3x3 filles » (or USA, argent FRA, bronze SEN) · **Quand** un supporter consulte le tableau · **Alors** chaque pays médaillé apparaît une fois, avec son nombre de médailles d'or, d'argent, de bronze et son total.

### AS2 — Trier le tableau

- **Étant donné** des pays avec des médailles différentes · **Quand** un supporter consulte le tableau · **Alors** il est trié par nombre d'or, puis d'argent, puis de bronze, du plus grand au plus petit ; à égalité, par code pays.

### AS3 — Seuls les résultats officiels comptent

- **Étant donné** un podium saisi par un journaliste, certifié ou à vérifier · **Quand** un supporter consulte le tableau · **Alors** le tableau ne change pas.

## Hors périmètre

- Publier un résultat officiel (TR2), l'explication par l'IA (TR4).
- Les pays sans médaille.

## Questions ouvertes

- Ordre à égalité parfaite : hypothèse, par code pays, de A à Z.
