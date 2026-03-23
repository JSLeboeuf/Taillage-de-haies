# Séquence de suivi client — Post-job, avis Google, relance annuelle

**Version :** 1.0
**Date création :** 2026-03-23
**Auteur :** Jean-Samuel Leboeuf

> Tous les messages ci-dessous sont configurés dans ServiceM8 comme templates SMS/courriel.
> Les balises `[NOM]`, `[MONTANT]`, `[DATE]` sont remplacées automatiquement.

---

## VUE D'ENSEMBLE — CALENDRIER

```
J0  → Job complété → Facture émise
J0  → SMS-01 : Remerciement + avis Google
J3  → SMS-02 : Suivi satisfaction (si pas d'avis reçu)
J14 → SMS-03 : Relance contrat annuel (si non encore client annuel)
J90 → SMS-04 : Rappel mi-saison (pour clients 1 taille/saison)
M10 → EMAIL-01 : Pré-saison suivante (renouvellement ou 1ère récurrence)
```

---

## MESSAGES SMS

### SMS-01 — Remerciement immédiat (J0, après paiement)

**Délai :** Automatique dès que le job est marqué « Completed » et payé dans ServiceM8.

**Objet :** —
**Texte :**

```
Bonjour [NOM], merci de nous avoir choisis! Votre haie est taillée
et les débris ramassés. Si vous avez des questions dans les 48h,
répondez à ce message. On adorerait votre avis Google :
[LIEN AVIS GOOGLE]
— Haie Lite
```

**Note :** Insérer le lien Google My Business raccourci (créer via g.page/haieilite ou équivalent).

---

### SMS-02 — Suivi satisfaction (J+3, si pas d'avis Google reçu)

**Délai :** 3 jours après SMS-01. Ne pas envoyer si avis déjà laissé.

**Texte :**

```
Bonjour [NOM]! On espère que vous êtes satisfait de votre haie.
Si quelque chose ne vous convient pas, dites-le-nous — on revient
corriger gratuitement dans les 48h. Si tout est bien, 30 secondes
pour un avis nous aideraient beaucoup : [LIEN AVIS GOOGLE]
Merci! — Haie Lite
```

---

### SMS-03 — Relance contrat annuel (J+14, non-clients annuels seulement)

**Délai :** 14 jours après le job. Tag ServiceM8 : envoyer seulement aux clients sans contrat annuel actif.

**Texte :**

```
Bonjour [NOM]! Votre haie sera prête pour une deuxième taille
en août. Si vous réservez maintenant avec notre contrat annuel,
vous économisez [MONTANT ECONOMIE] $ et bloquez votre date.
Répondez OUI pour qu'on vous rappelle, ou appelez Henri :
[TELEPHONE]. — Haie Lite
```

---

### SMS-04 — Rappel deuxième taille (J+90, clients 1 taille)

**Délai :** ~3 mois après la première taille (août).

**Texte :**

```
Bonjour [NOM], c'est Haie Lite. Votre haie est probablement
prête pour sa deuxième taille de la saison! On a encore
quelques disponibilités en août. Répondez pour réserver
ou appelez-nous au [TELEPHONE]. — Haie Lite
```

---

## COURRIELS

### EMAIL-01 — Pré-saison (envoi en mars de l'année suivante)

**Délai :** 1er mars de chaque année, à tous les clients de la saison précédente.

**Objet :** Votre haie est prête pour 2026 — réservez maintenant

**Corps :**

```
Bonjour [PRENOM],

La saison de taillage 2026 approche! Comme vous avez fait
confiance à Haie Lite l'an dernier, on vous écrit en premier
pour réserver votre créneau avant que le calendrier se remplisse.

VOTRE SERVICE L'AN DERNIER :
  Date : [DATE DERNIER JOB]
  Service : [DESCRIPTION]
  Prix payé : [MONTANT] $

POUR 2026 :
  [ ] Même service — prix garanti : [MONTANT] $
  [ ] Contrat annuel (2 tailles) — vous économisez [ÉCONOMIE] $

Pour réserver, répondez simplement à ce courriel ou
écrivez-nous par SMS au [TELEPHONE].

Calendrier : les premières semaines de mai se remplissent
rapidement. Les clients qui réservent avant le 15 avril
obtiennent leur date prioritaire.

À bientôt,
Henri et l'équipe Haie Lite
[TELEPHONE]
```

---

### EMAIL-02 — Confirmation de rendez-vous (J-1)

**Délai :** La veille du job, vers 17h.

**Objet :** Votre taillage de haie demain — [DATE]

**Corps :**

```
Bonjour [PRENOM],

On vous confirme notre passage demain, [DATE], entre [HEURE DEBUT]
et [HEURE FIN] à [ADRESSE].

RAPPEL :
  Service : [DESCRIPTION]
  Prix : [MONTANT] $ (taxes incluses)
  Paiement : à la complétion des travaux

Pour modifier ou annuler (sans frais si avant ce soir 18h) :
répondez à ce courriel ou appelez le [TELEPHONE].

À demain,
L'équipe Haie Lite
```

---

### EMAIL-03 — Facture + photos (J0, après job)

ServiceM8 envoie la facture automatiquement. Personnaliser le message joint :

**Objet :** Votre facture Haie Lite #[NUMERO] + photos de votre haie

**Corps :**

```
Bonjour [PRENOM],

Merci pour votre confiance aujourd'hui! Vous trouverez ci-joint :
  - Votre facture #[NUMERO]
  - Les photos avant/après de votre haie

CONSEILS POST-TAILLAGE :
  - Arroser abondamment dans les 48h (surtout si >25°C)
  - Une fertilisation au printemps favorise une repousse dense
  - Pour maintenir la forme, nous recommandons 2 tailles/saison

Une question? Insatisfait d'un détail? Répondez dans les 48h
— on revient corriger gratuitement.

Au plaisir de vous revoir l'an prochain!
L'équipe Haie Lite
[TELEPHONE]
```

---

## REPONSES AUX AVIS GOOGLE

### Modèle réponse avis positif (4-5 étoiles)

```
Merci beaucoup [PRENOM]! C'est un plaisir de travailler sur
la Rive-Sud et on est contents que le résultat vous satisfasse.
Au plaisir de revenir l'an prochain!
— L'équipe Haie Lite
```

### Modèle réponse avis négatif (1-3 étoiles)

```
Bonjour [PRENOM], merci de nous avoir avisés. Ce genre de
feedback nous aide à nous améliorer. Pouvez-vous nous joindre
directement au [TELEPHONE] pour qu'on puisse discuter de la
situation et, si approprié, corriger? On prend la qualité
très au sérieux. — Henri, Haie Lite
```

---

## TAGS SERVICEM8 — CONFIGURATION

Créer ces tags dans ServiceM8 pour automatiser les séquences :

| Tag | Description | Déclencheur séquence |
|-----|-------------|---------------------|
| `1-taille` | Client avec 1 taille à la saison | SMS-04 en août |
| `contrat-annuel` | Client avec contrat annuel actif | Ne pas envoyer SMS-03 |
| `avis-donne` | Avis Google reçu | Ne pas envoyer SMS-02 |
| `relance-printemps` | À contacter en mars | EMAIL-01 |
| `ne-pas-relancer` | Client ayant demandé à ne plus être contacté | Exclure toutes séquences |

---

## METRIQUES DE SUCCES

| Métrique | Cible |
|----------|-------|
| Taux d'avis Google laissé après SMS-01 | > 20 % |
| Taux de conversion SMS-03 → contrat annuel | > 15 % |
| Taux d'ouverture EMAIL-01 (pré-saison) | > 45 % |
| Taux de clients récurrents saison sur saison | > 60 % |

---

*Version 1.0 — 2026-03-23*
