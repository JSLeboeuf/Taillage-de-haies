# Tracker pre-saison - Semaine 1

Periode active: `2026-03-24` au `2026-03-30`

## Regle

Cette feuille sert a piloter la semaine 1 seulement.

- une ligne = un livrable clair
- un responsable unique
- un statut parmi: `a faire`, `en cours`, `bloque`, `fait`
- mise a jour quotidienne avant le huddle

## KPI snapshot

| KPI | Cible semaine | Actuel | Ecart | Owner |
|---|---:|---:|---:|---|
| Pre-booke cumule | 15k-25k$ | 10k$ | +5k$ a +15k$ | Henri |
| Pages recall completees | 7/12 pages | 2/12 pages | +5 pages | Henri |
| Offres etudiants publiees | 1 campagne live sur 3 canaux | 0 | +1 | JS |
| Soumissions assurances | 3 soumissions recues | 0 | +3 | JS |
| Chef valide | 1 decision claire | 0 | +1 | Henri |
| Date de lancement ads fixee | 1 date confirmee | 0 | +1 | Henri |
| Flux tech critiques listes | 5 flux listes et owners nommes | 0 | +5 | JS |

## Top priorites

| Livrable | Responsable | Deadline | KPI cible | Dependances | Statut | Notes |
|---|---|---|---|---|---|---|
| Atteindre 7/12 pages recall | Henri | 2026-03-30 17:00 | +15k$ nouveaux bookings | offre + pricing verrouilles | en cours | base actuelle: 2/12 pages et 10k$ bookes |
| Ecrire l'offre prepayee 1 page | JS | 2026-03-24 18:00 | 1 page validee + script rappel | aucun | fait | voir `OFFRE-PREPAYEE-RAPPEL-CLIENTS-2026.md` |
| Fixer prix minimum et hausse | Henri | 2026-03-24 18:00 | minimum `400$+`, renouvellement `+4-5%`, nouveau client `+15%` | offre prepayee | a faire | pricing tranche avant autres appels |
| Valider chef ou plan B | Henri | 2026-03-25 12:00 | 1 decision ecrite | discussion avec employe ~40 ans | a faire | si non, ouvrir recherche chef externe le jour meme |
| Publier offres etudiants | JS | 2026-03-24 17:00 | 3 canaux live | salaire/bonus valides | a faire | Indeed, groupes Facebook, portails etudiants |
| Obtenir 3 soumissions assurances | JS | 2026-03-26 17:00 | 3 soumissions comparees | infos vehicules/equipement | a faire | RC + vehicules |
| Fixer la date de lancement ads | Henri | 2026-03-24 16:00 | call reserve + date confirmee | contact Jean-Michel | a faire | cible de lancement: 2026-03-30 |
| Lister equipement critique manquant | Henri | 2026-03-25 17:00 | 1 liste avec cout + acheteur | inspection camion/nacelle | a faire | separer essentiel vs nice-to-have |
| Lister les 5 flux tech critiques | JS | 2026-03-24 17:00 | 5 flux + owner + mode test | aucun | fait | voir `AUDIT-FLUX-CRITIQUES-HAIE-LITE-2026-03-23.md` |
| Nettoyer ServiceM8 minimum viable | JS | 2026-03-27 17:00 | 3 vues propres: recall, leads, jobs | liste flux critiques | a faire | enlever bruit et doublons avant campagne |
| Tester flux lead -> job -> paiement | JS | 2026-03-29 17:00 | 1 test complet passe | ServiceM8 propre | a faire | si echec, definir fallback manuel |

## Flux tech critiques a confirmer

| Flux | Test owner | Deadline | Statut | Notes |
|---|---|---|---|---|
| Lead entrant | JS | 2026-03-28 12:00 | a faire | formulaire, webhook ou process manuel documente |
| Calcul / soumission | JS | 2026-03-28 15:00 | a faire | prix minimum et upsell simple alignes |
| Creation job / sync ServiceM8 | JS | 2026-03-29 10:00 | a faire | tester creation propre et assignation |
| Confirmation / rappel client | JS | 2026-03-29 12:00 | a faire | SMS/email ou fallback manuel |
| Paiement / avis | JS | 2026-03-29 17:00 | a faire | lien paiement + demande avis post-job |

## Blocages

| Blocage | Impact | Owner | Prochaine action |
|---|---|---|---|
| REQ Saint-Hyacinthe -> Longueuil non regle | bloque M4 et cree du bruit admin | Tania | confirmer la marche a suivre avant 2026-03-25 12:00 |
| Assurances non souscrites | no-go operationnel | JS | envoyer demandes de soumission le 2026-03-24 avant 15:00 |
| Ads non planifiees avec Jean-Michel | risque de creux leads en avril | Henri | texte + call reserve le 2026-03-24 avant 16:00 |
| Chef d'equipe non confirme | plafond a 1.5-2 crews | Henri | discussion + decision ecrite le 2026-03-25 avant midi |
| ServiceM8 sale pour recall | ralentit booking et suivi | JS | creer vues propres recall / leads / jobs avant 2026-03-27 |

## Decisions a prendre cette semaine

1. 2026-03-25 12:00: qui est le chef d'equipe du base case?
2. 2026-03-24 18:00: quel est le prix minimum acceptable par job?
3. 2026-03-24 18:00: quelle offre prepayee poussee sur le recall?
4. 2026-03-27 17:00: est-ce que le site actuel reste en place jusqu'apres lancement?
5. 2026-03-24 16:00: quel canal marketing devient prioritaire si les ads ne partent pas a temps?

## Agenda 7 jours

| Date | Focus | Livrables du jour |
|---|---|---|
| 2026-03-24 mardi | verrouiller l'offre | offre prepayee, prix minimum, annonces etudiants, call ads reserve, demandes assurances envoyees, 5 flux tech listes |
| 2026-03-25 mercredi | trancher les dependances humaines | decision chef, liste equipement, suivi REQ, debut nettoyage ServiceM8 |
| 2026-03-26 jeudi | fermer les bloqueurs admin | 3 soumissions assurances, angle ads valide, campagne referral branchee au recall |
| 2026-03-27 vendredi | stabiliser l'outil | vues ServiceM8 propres, script lead/quote final, shortlist recrues etudiantes |
| 2026-03-28 samedi | tester le funnel | test lead entrant + soumission, sprint recall, revue des leads chauds |
| 2026-03-29 dimanche | test complet | job cree, confirmation envoyee, paiement/avis testes, fallback manuel si besoin |
| 2026-03-30 lundi | lancer avec controle | 7/12 pages recall atteintes, lancement ads si prerequisites OK, planning semaine 1 et 2 visible |

## Huddle quotidien

Durée max: 15 minutes

1. Chiffres d'hier
2. Ce qui bloque aujourd'hui
3. Une seule priorite par personne
4. Decision a prendre avant midi
