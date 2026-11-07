# 004 — Ndam bu wóor : comparer un podium aux résultats officiels

**Statut** : Validée
**PRD** : specs/prd-ndam-bu-woor.md, TR1

## Contexte

Les journalistes vérifient les podiums à la main avant de publier, et une erreur publiée se corrige mal. Cette première tranche compare chaque podium saisi par un journaliste au résultat officiel des Jeux, quand il existe. Les résultats officiels sont fournis par des données chargées au démarrage. Elle passe seulement par l'API, sans écran.

## User stories

- En tant que journaliste présent sur une épreuve, je veux saisir le podium que j'ai constaté, afin de savoir s'il est conforme au résultat officiel.
- En tant que journaliste, je veux voir les différences quand mon podium ne correspond pas, afin de corriger avant de publier.

## Scénarios d'acceptation

### AS1 — Podium conforme

- **Étant donné** le résultat officiel du « 100 m filles » : or CIV, argent EGY, bronze JPN · **Quand** la journaliste Awa saisit or CIV, argent EGY, bronze JPN · **Alors** le podium est enregistré au statut « certifié », sans écart.

### AS2 — Podium en écart

- **Étant donné** le résultat officiel du « 100 m filles » : or CIV, argent EGY, bronze JPN · **Quand** Awa saisit or EGY, argent CIV, bronze JPN · **Alors** le podium est enregistré au statut « en écart », et les écarts sont listés : l'or (saisi EGY, officiel CIV) et l'argent (saisi CIV, officiel EGY).

### AS3 — Pas de résultat officiel

- **Étant donné** aucun résultat officiel pour le « 1500 m garçons » · **Quand** Awa saisit or JPN, argent CHN, bronze CIV · **Alors** le podium est enregistré au statut « provisoire », sans écart.

### AS4 — Saisie invalide

- **Étant donné** un nom de journaliste vide, un nom d'épreuve vide, un code pays qui n'a pas trois lettres majuscules, ou un même pays cité deux fois dans le podium · **Quand** la saisie est envoyée · **Alors** c'est refusé avec un statut 400, la réponse dit pourquoi, et rien n'est enregistré.

### AS5 — Consulter un podium

- **Étant donné** le podium en écart saisi par Awa · **Quand** un journaliste le consulte par son identifiant · **Alors** il voit l'épreuve, le podium saisi, son statut et ses écarts ; un identifiant inconnu donne un refus 404 avec le code PODIUM_NOT_FOUND.

## Hors périmètre

- Publier un résultat officiel et recomparer les podiums provisoires (TR2), le tableau des médailles (TR3), l'explication par l'IA (TR4).
- La vérification que le pays participe aux Jeux : seul le format du code est contrôlé.
- Les comptes des journalistes.

## Questions ouvertes

- Une épreuve est identifiée par son nom : hypothèse, comparé sans tenir compte des majuscules ni des espaces autour.
- Un même journaliste peut saisir plusieurs fois la même épreuve : hypothèse, oui, chaque saisie est comparée séparément.
