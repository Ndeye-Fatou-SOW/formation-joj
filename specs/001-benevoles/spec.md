# 001 — Bénévoles : ouvrir un créneau et s'y inscrire

**Statut** : Validée
**PRD** : specs/prd-benevoles.md, TR1

## Contexte

Les responsables de discipline gèrent les inscriptions des bénévoles d'accueil sur papier, et des créneaux débordent. Cette première tranche remplace la feuille par un créneau qui compte ses places et refuse l'inscription de trop. Elle passe seulement par l'API, sans écran.

## User stories

- En tant que responsable de discipline, je veux ouvrir un créneau d'accueil avec un horaire et une capacité, afin de dire combien de bénévoles il me faut.
- En tant que bénévole, je veux m'inscrire à un créneau avec mon nom et mon email, afin de réserver ma place.
- En tant que responsable de discipline, je veux qu'un créneau complet refuse toute nouvelle inscription, afin qu'il ne déborde plus.

## Scénarios d'acceptation

### AS1 — Ouvrir un créneau

- **Étant donné** la discipline « Lutte » · **Quand** le responsable ouvre un créneau de 9 h à 12 h avec une capacité de 2 · **Alors** le créneau est enregistré pour la Lutte, avec son début, sa fin, sa capacité de 2 et aucun inscrit.

### AS2 — Créneau invalide

- **Étant donné** une capacité inférieure à 1, ou une fin qui n'est pas après le début · **Quand** le responsable ouvre le créneau · **Alors** c'est refusé, la réponse dit pourquoi, et aucun créneau n'est enregistré.

### AS3 — Discipline introuvable

- **Étant donné** une discipline qui n'existe pas · **Quand** le responsable lui ouvre un créneau · **Alors** l'application dit que la discipline est introuvable, et aucun créneau n'est enregistré.

### AS4 — S'inscrire à un créneau

- **Étant donné** un créneau de capacité 2 sans inscrit · **Quand** Awa Diop s'y inscrit avec l'email awa@example.sn · **Alors** son inscription est enregistrée avec son nom et son email, et le créneau compte 1 inscrit.

### AS5 — Créneau complet

- **Étant donné** un créneau de capacité 2 qui compte déjà 2 inscrits · **Quand** un troisième bénévole s'y inscrit · **Alors** c'est refusé avec un statut 409 et le code SLOT_FULL, et le créneau compte toujours 2 inscrits.

### AS6 — Inscription invalide

- **Étant donné** un nom vide ou un email mal formé · **Quand** le bénévole s'inscrit · **Alors** c'est refusé, la réponse dit pourquoi, et rien n'est enregistré.

### AS7 — Créneau introuvable

- **Étant donné** un créneau qui n'existe pas · **Quand** un bénévole s'y inscrit · **Alors** l'application dit que le créneau est introuvable.

## Hors périmètre

- L'écran : tout passe par l'API (l'écran arrive en TR3).
- Consulter un créneau et la liste de ses inscrits, et le refus d'un même email inscrit deux fois (TR2).
- La désinscription (TR3), la modification et la suppression d'un créneau.
- Les comptes et les droits : n'importe qui peut ouvrir un créneau ou s'inscrire.

## Questions ouvertes

- Longueur maximale du nom du bénévole : hypothèse, 100 caractères, comme pour une discipline.
- Créneau dans le passé : hypothèse, accepté ; aucune règle ne l'interdit dans le PRD.
- Deux inscriptions simultanées à la dernière place : hypothèse, une seule passe, l'autre reçoit SLOT_FULL ; le plan dira comment le garantir.
