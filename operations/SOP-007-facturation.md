# SOP-007 : Facturation et encaissement

**Version :** 1.0
**Date création :** 2026-03-23
**Auteur :** Jean-Samuel Leboeuf
**Approuvé par :** Henri

---

## 1. OBJECTIF

Encaisser le paiement le jour même du job, émettre une facture conforme (TPS/TVQ), et transmettre les données comptables sans friction.

**Résultat attendu :** 100 % des jobs résidentiels payés le jour de la prestation. Aucun solde impayé >30 jours.

---

## 2. PORTEE

**S'applique a :** Tous les jobs — résidentiels, commerciaux, contrats annuels.

**Ne s'applique PAS a :**
- Appels d'offres publics (facturation selon conditions d'appel)
- Dépôts de garantie pré-saison (procédure séparée)

---

## 3. RESPONSABILITES

| Role | Responsabilite |
|------|----------------|
| Crew leader (Juan ou chef désigné) | Confirme la complétion du job, remet la facture papier si disponible |
| Henri | Collecte les paiements en personne si présent sur place |
| Jean-Samuel | Émet les factures ServiceM8, gère les paiements en ligne, relance les impayés |
| Comptable | Reçoit l'export mensuel ServiceM8 pour les déclarations de TPS/TVQ |

---

## 4. PROCEDURE — JOB RESIDENTIEL STANDARD

### Etape 1 — Complétion du job

Avant de s'adresser au client pour le paiement :

- [ ] Job finalisé selon SOP-003 (ou SOP applicable)
- [ ] Chantier nettoyé — aucun débris visible
- [ ] Photos après uploadées dans ServiceM8
- [ ] **Complete Job** tapé dans ServiceM8

---

### Etape 2 — Vérification prix avant d'approcher le client

Recalculer si des éléments imprévus sont apparus (haie plus longue que devis, supplément découvert) :

```
Prix convenu à la soumission
± Ajustements (travaux supplémentaires convenus avec le client EN COURS de job)
= Prix final
```

**Règle absolue :** Jamais annoncer un prix différent de la soumission APRES le job sans avoir eu l'accord du client AVANT de faire le travail supplémentaire.

---

### Etape 3 — Présentation au client

Trouver le client ou sonner à la porte.

> *« Bonjour [Prénom], tout est terminé. Venez voir si vous êtes satisfait. »*

Faire le tour avec le client. Pointer les zones travaillées. Demander :

> *« Est-ce que c'est à votre satisfaction ? »*

Si oui → procéder au paiement.
Si insatisfaction → voir Section 7.

---

### Etape 4 — Encaissement

Annoncer le montant avec taxes :

> *« Ça fait [X] $ avec les taxes. Comment préférez-vous payer ? »*

**Modes de paiement acceptés :**

| Mode | Procédure |
|------|-----------|
| **Virement Interac** | Donner l'adresse courriel/numéro associée au compte Haie Lite. Confirmation par SMS/courriel. |
| **Carte crédit/débit** | Lien de paiement ServiceM8 envoyé par SMS sur place (client paie sur son téléphone). |
| **Chèque** | À l'ordre de *[Raison sociale officielle]*. Vérifier : nom, date, montant, signature. |
| **Argent comptant** | Accepté. Émettre reçu papier immédiatement. Remettre à Henri le jour même. |

**Ne jamais accepter :**
- Paiement partiel sans entente écrite préalable
- Promesse verbale de payer plus tard (sauf contrat annuel avec conditions établies)

---

### Etape 5 — Émettre la facture dans ServiceM8

**Immédiatement après encaissement ou avant de quitter le chantier :**

1. Ouvrir le job dans ServiceM8
2. Passer le statut à **« Completed »**
3. Générer la facture (Invoice) → vérifier :
   - [ ] Nom et adresse du client corrects
   - [ ] Description des travaux complète
   - [ ] TPS (5 %) calculée correctement
   - [ ] TVQ (9,975 %) calculée correctement
   - [ ] Total avec taxes exact
4. Envoyer la facture par courriel (ou SMS lien PDF) via ServiceM8
5. Marquer le paiement comme **reçu** dans ServiceM8 avec le mode de paiement

---

### Etape 6 — Pitch contrat annuel (si non encore client annuel)

Avant de partir :

> *« Si vous souhaitez qu'on revienne automatiquement l'an prochain sans avoir à nous rappeler — et avec le prix d'aujourd'hui garanti — on a un programme annuel. Ça vous économise [X] $ sur l'année. »*

Si intérêt : créer un job récurrent dans ServiceM8. Envoyer le contrat par courriel.

---

## 5. PROCEDURE — CONTRAT ANNUEL

### Facturation en 2 versements (par défaut)

| Moment | Montant |
|--------|---------|
| Signature du contrat | 50 % du total annuel |
| Après la 2e taille | 50 % restant |

**Option tout inclus :** Client peut payer 100 % à la signature (pas de remise additionnelle).

### Renouvellement automatique

- JS envoie un rappel de renouvellement en **mars** de chaque année
- Si pas de réponse en 30 jours → considéré comme renouvelé (voir contrat client art. 3)
- Si annulation : mettre à jour ServiceM8 immédiatement

---

## 6. PROCEDURE — COMMERCIAL / INSTITUTIONNEL

- Facturation 30 jours net (sauf entente différente)
- Facture émise le jour même de la complétion via ServiceM8
- Rappel automatique à J+15 si non payé
- Escalade à J+30 : appel téléphonique de JS
- Escalade à J+45 : mise en demeure (modèle dans `/operations/`)

---

## 7. INSATISFACTION CLIENT AU MOMENT DU PAIEMENT

Si le client refuse de payer en invoquant une insatisfaction :

**Ne jamais argumenter sur place.** Procéder ainsi :

1. > *« Je comprends. Décrivez-moi ce qui ne vous convient pas. »*
2. Prendre des photos supplémentaires
3. > *« Je transmets ça immédiatement à mon responsable. Il vous rappelle dans les 2 heures. »*
4. Appeler Henri ou JS depuis le véhicule — ne pas repartir avant d'avoir un plan
5. Si problème fondé : revenir corriger sous 48h, sans frais (garantie de satisfaction)
6. Si problème non fondé (changement d'avis, demande hors soumission) : JS gère la négociation

**Ne jamais quitter un chantier sans un plan de résolution.**

---

## 8. GESTION DES IMPAYES

| Délai | Action |
|-------|--------|
| J+1 | SMS automatique ServiceM8 : *« Bonjour, rappel de votre facture #[X]... »* |
| J+7 | Courriel de relance (JS) |
| J+15 | Appel téléphonique (Henri ou JS) |
| J+30 | Mise en demeure par courriel (modèle disponible) |
| J+45 | Mise en demeure recommandée (poste) |
| J+60 | Recours Petites créances (≤15 000 $ — Cour du Québec) |

**Intérêts sur retard :** 2 % par mois (24 % par an) — mentionner dans la relance à J+30.

---

## 9. EXPORT COMPTABLE

**Fréquence :** Mensuel, le 1er du mois suivant.

**Ce que JS envoie au comptable :**

- [ ] Export ServiceM8 : toutes les factures du mois (PDF ou CSV)
- [ ] Relevé bancaire du mois
- [ ] Reçus de dépenses (carburant, équipement, fournitures)
- [ ] Feuilles de paie (confirmées par Henri)

**Pour les déclarations TPS/TVQ :** Trimestrielles (fréquence standard petite entreprise). Comptable gère.

---

## 10. METRIQUES DE SUCCES

| Métrique | Cible |
|----------|-------|
| % jobs résidentiels payés le jour même | > 95 % |
| Délai moyen encaissement | < 1 jour |
| Soldes impayés >30 jours | < 2 % du CA mensuel |
| Factures émises dans ServiceM8 le jour du job | 100 % |

---

## 11. REFERENCES

- [Grille de prix](./grille-prix.md)
- [Contrat client](./contrat-client.md)
- [SOP-001 : Prise d'appel](./SOP-001-prise-appel.md)
- [SOP-002 : Évaluation terrain](./SOP-002-evaluation-terrain.md)

---

*Version 1.0 — 2026-03-23*
