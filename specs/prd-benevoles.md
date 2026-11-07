# PRD — Bénévoles

**Statut** : Validé

## Problème

Chaque discipline des JOJ Dakar 2026 a besoin de bénévoles pour accueillir le public. Aujourd'hui, les responsables de discipline gèrent les inscriptions sur papier : personne ne voit en temps réel qui est inscrit, et des créneaux débordent. Pendant les Jeux, un créneau trop plein désorganise l'accueil, et un créneau vide le laisse sans personne.

## Utilisateurs

- Responsable de discipline : ouvrir des créneaux d'accueil avec un nombre de places, et savoir qui y est inscrit.
- Bénévole : s'inscrire à un créneau qui a encore de la place, et s'en retirer s'il ne peut plus venir.

## Proposition

Le responsable ouvre un créneau avec une capacité ; les bénévoles s'y inscrivent ; l'application refuse toute inscription au-delà de la capacité. Une liste partagée qui compte elle-même les places remplace la feuille papier : le débordement devient impossible, au lieu d'être découvert le jour même.

## Mesure du succès

Pendant la démo, un créneau de capacité 2 accepte deux bénévoles et refuse le troisième, avec un message qui dit que le créneau est complet.

## Tranches

### TR1 — Ouvrir un créneau et s'y inscrire

Le responsable ouvre un créneau avec une capacité ; un bénévole s'y inscrit. Règle : une inscription est refusée quand le créneau est complet.

### TR2 — Consulter un créneau et ses inscrits

On consulte un créneau : sa capacité, ses places restantes et la liste de ses inscrits. Règle : un même email ne peut pas s'inscrire deux fois au même créneau.

### TR3 — Se désinscrire, et l'écran du créneau

Un bénévole se désinscrit d'un créneau, ce qui libère sa place. Un écran permet de voir un créneau, de s'y inscrire et de s'en désinscrire.

## Hors périmètre

- La modification ou la suppression d'un créneau.
- Les emails de confirmation.
- Les comptes des bénévoles : un bénévole n'a pas d'identifiant ni de mot de passe.

## Hypothèses et risques

- Hypothèse : un créneau appartient à une discipline existante et a un horaire (début, fin) ; sinon, il faudra le préciser dans la spec TR1.
- Hypothèse : un bénévole est identifié par son nom et son email, saisis à l'inscription. Sans compte, n'importe qui peut inscrire ou désinscrire un autre email.
- Hypothèse : la capacité est un entier d'au moins 1.
- Risque : deux inscriptions simultanées à la dernière place pourraient dépasser la capacité ; la règle doit tenir même dans ce cas.
- Risque : sans écran avant TR3, la démo des tranches 1 et 2 se fait par l'API, moins parlante pour un responsable.
