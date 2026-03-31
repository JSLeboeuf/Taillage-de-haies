# Audit des 5 flux critiques - haie-lite-app

Date d'audit: `2026-03-23`

## Portee

Audit cible sur 5 flux critiques pour le lancement:

1. lead entrant
2. calcul / soumission
3. creation job / sync ServiceM8
4. confirmation / rappel client
5. paiement / avis

## Limite importante

Les fichiers source critiques de `haie-lite-app` sont presents dans le repo mais restent `dataless` cote iCloud au moment de l'audit. Les chemins existent, mais leur logique interne n'a pas pu etre lue depuis le CLI.

Conclusion:

- je peux confirmer la structure des routes et composants
- je ne peux pas confirmer la logique applicative
- je ne peux pas confirmer qu'un flux passe de bout en bout

## Resume executif

Le repo montre une intention produit tres claire: il existe des routes et composants pour tous les flux critiques. En revanche, le niveau de preuve actuel reste insuffisant pour declarer l'app "prete lancement".

Verdict rapide:

- lead entrant: `partiel`
- calcul / soumission: `partiel`
- creation job / ServiceM8: `inconnu critique`
- confirmation / rappel client: `partiel`
- paiement / avis: `partiel`

Risque central:

Le produit semble couvrir beaucoup plus que le lancement immediate. Sans test de bout en bout, il faut supposer que le flux le plus fragile est `lead -> job -> ServiceM8 -> confirmation`.

## Preuves structurelles vues dans le repo

### Routes API detectees

- `app/api/leads/create/route.ts`
- `app/api/quotes/calculate/route.ts`
- `app/api/quotes/send-payment/route.ts`
- `app/api/webhooks/servicem8/route.ts`
- `app/api/webhooks/meta-leads/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/webhooks/twilio-sms/route.ts`
- `app/api/cron/job-confirmation/route.ts`
- `app/api/cron/lead-followup/route.ts`
- `app/api/cron/review-request/route.ts`
- `app/api/reviews/match-employee/route.ts`

### Composants / pages detectes

- `app/components/QuoteCalculator.tsx`
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/employee/jobs/page.tsx`

### Tests visibles

La recherche locale n'a pas revele de tests applicatifs evidents hors `node_modules`.

Conclusion:

- presence de surface fonctionnelle: `oui`
- preuve de qualite automatisee dans l'app: `non visible`

## Audit par flux

### 1. Lead entrant

Preuves:

- `app/page.tsx`
- `app/components/QuoteCalculator.tsx`
- `app/api/leads/create/route.ts`
- `app/api/webhooks/meta-leads/route.ts`

Lecture:

Le repo contient clairement une entree web et une entree pub potentielle via Meta Leads.

Verdict:

`partiel`

Pourquoi:

- la surface existe
- la logique de creation n'est pas lisible
- impossible de confirmer validation, anti-spam, persistence, ou message de succes

Test minimum a faire:

1. soumettre un lead web
2. verifier creation reelle
3. verifier arrivee dans la vue de suivi
4. verifier delai de rappel

### 2. Calcul / soumission

Preuves:

- `app/components/QuoteCalculator.tsx`
- `app/api/quotes/calculate/route.ts`

Lecture:

Il existe un calculateur et une route dediee au calcul.

Verdict:

`partiel`

Pourquoi:

- le flux semble prevu
- impossible de verifier le modele de pricing, les seuils, ou la sortie utilisateur
- impossible de confirmer si le calcul est aligne avec la grille operationnelle 2026

Test minimum a faire:

1. tester 3 cas simples
2. tester 2 cas limites
3. verifier que le prix ne descend jamais sous le minimum interne
4. verifier que la soumission peut etre envoyee ou transformee en next step

### 3. Creation job / sync ServiceM8

Preuves:

- `app/api/webhooks/servicem8/route.ts`
- `app/api/leads/create/route.ts`
- `app/api/commercial/pipeline/route.ts`
- `app/employee/jobs/page.tsx`

Lecture:

Le repo montre une integration ServiceM8 et une vue jobs, mais la preuve d'un create-job outbound fiable n'est pas visible a partir des fichiers lisibles.

Verdict:

`inconnu critique`

Pourquoi:

- un webhook inbound ServiceM8 ne prouve pas la creation outbound
- la logique peut exister dans `leads/create` ou ailleurs, mais elle n'est pas lisible
- c'est le point de rupture le plus probable du lancement

Test minimum a faire:

1. transformer un lead en job
2. verifier que le job existe bien dans ServiceM8
3. verifier les champs critiques:
   - client
   - adresse
   - service
   - date
   - statut
4. verifier qu'aucun doublon n'est cree

Decision pratique:

Si ce flux n'est pas teste rapidement, il faut prevoir un fallback manuel documente.

### 4. Confirmation / rappel client

Preuves:

- `app/api/cron/job-confirmation/route.ts`
- `app/api/cron/lead-followup/route.ts`
- `app/api/webhooks/twilio-sms/route.ts`

Lecture:

Le repo montre une architecture de suivi automatisable pour la confirmation et les relances.

Verdict:

`partiel`

Pourquoi:

- les briques sont la
- impossible de verifier les triggers, la frequence, le contenu, et les garde-fous
- impossible de confirmer si les cron jobs sont actives en environnement reel

Test minimum a faire:

1. creer un job test
2. verifier l'envoi de la confirmation
3. verifier un rappel programme
4. verifier que la reponse SMS est bien captee si applicable

### 5. Paiement / avis

Preuves:

- `app/api/quotes/send-payment/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/cron/review-request/route.ts`
- `app/api/reviews/match-employee/route.ts`

Lecture:

Le repo prevoit le paiement et la demande d'avis, possiblement avec attribution employe.

Verdict:

`partiel`

Pourquoi:

- les routes existent
- impossible de verifier les liens entre paiement reussi, statut job, puis demande d'avis
- impossible de verifier l'idempotence cote Stripe

Test minimum a faire:

1. generer un lien de paiement
2. payer un montant test
3. verifier webhook Stripe
4. verifier declenchement demande d'avis
5. verifier attribution review -> employee si cette logique est importante au lancement

## Risques prioritaires

### 1. Faux sentiment de preparation

Le repo donne l'impression que "tout existe" car les chemins sont la. Sans lecture source ni test bout en bout, ce n'est pas une preuve de readiness.

### 2. Flux critique non teste

Le plus dangereux n'est pas un cron secondaire. C'est la transformation `lead -> quote -> job -> confirmation`.

### 3. Absence de tests app visibles

Je n'ai pas trouve de tests applicatifs evidents hors dependances tierces.

## Recommandation operative

Avant lancement, traiter l'app comme `support de vente`, pas comme systeme autonome prouve.

Ordre de verification recommande:

1. lead entrant
2. calcul / soumission
3. creation job / ServiceM8
4. confirmation client
5. paiement / avis

## Decision simple

### Si les 5 tests passent

On garde l'app dans le flux reel.

### Si un test critique casse

On garde l'app pour capter ou assister, mais on remplace le maillon casse par un process manuel documente jusqu'a correction.
