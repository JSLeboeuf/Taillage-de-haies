# Templates SMS/Email — Conversion Clients Existants en Contrat Annuel

**Version :** 1.0 — 2026-03-23
**Référence :** Livrable 2 — Playbook Hormozi
**Cible :** Convertir les clients one-time en Plan Tranquillité 1 400$/an

> Tous les templates sont conformes CRTC/LCAP — inclure opt-out sur les messages marketing.
> Configurer dans ServiceM8 comme templates avec variables `[PRENOM]`, `[DATE]`, etc.

---

## SÉQUENCE SMS — CONVERSION MARS / AVRIL

### SMS-C1 — Invitation initiale (J0 de la campagne)

**Envoi :** début mars, à tous les clients one-time de la saison précédente

**160 caractères :**
```
Bonjour [PRENOM], c'est [NOM] de Haie Lite. On réserve les plans annuels 2026 cette sem. — vitres+haies+gouttières à 1400$/an. Tarif gelé avant hausse. Répondez OUI pour qu'on vous appelle.
```

*(Si > 160 chars, découper en 2 SMS — le premier termine par "..." )*

---

### SMS-C2 — Relance J3 (si pas de réponse à C1)

```
[PRENOM], petit rappel — le tarif 2026 pour le Plan Tranquillité est garanti jusqu'au [DATE+7J]. Après ça, hausse de 8%. Répondez OUI ou visitez [LIEN]. - Haie Lite STOP pour arrêter
```

---

### SMS-C3 — Dernière chance J7

```
[PRENOM], dernière chance au tarif 2025! Le Plan Annuel (vitres+haies+gouttières) monte à 1512$/an dès [DATE]. Cette semaine c'est encore 1400$. Répondez OUI ou appelez [NUMERO]. - Haie Lite
```

---

### SMS-C4 — Récurrence pré-saison (si refus, envoyer en février suivant)

```
Bonjour [PRENOM]! La saison 2027 approche. L'an passé on avait gardé votre tarif à 1400$/an — c'est toujours disponible pour vous si vous voulez renouveler. Répondez OUI ou [LIEN]. - Haie Lite
```

---

## EMAIL DE CONVERSION — VERSION COMPLÈTE

### Objet A/B test :
- Version A : `Votre propriété 2026 — tarif gelé jusqu'au [DATE]`
- Version B : `[PRENOM], vos voisins au [RUE] ont déjà réservé leur plan annuel`

---

**Corps du message :**

```
Bonjour [PRENOM],

Merci pour votre confiance l'an passé — c'était un plaisir de travailler sur votre propriété.

On prépare notre saison 2026 et on réserve en priorité nos clients existants avant d'ouvrir
les nouvelles inscriptions dans votre secteur.

───────────────────────────────────────────
PLAN TRANQUILLITÉ 2026 — 1 400$/an + taxes
───────────────────────────────────────────

✓ Lavage de vitres extérieures (2 fois : mai et août)
✓ Nettoyage de gouttières (2 fois : mai et novembre)
✓ Taillage de haies (2 fois : juin et septembre)
✓ Photos avant/après à chaque visite
✓ Scheduling automatique — vous avez rien à gérer
✓ Priorité urgence garantie < 7 jours ouvrables

Si vous vous inscrivez avant le [DATE], vous verrouillez le tarif 2026 pour les
12 prochains mois — même si nos prix augmentent d'ici là.

[BOUTON : Réserver mon plan annuel →]

Des questions? Répondez directement à ce message — je réponds personnellement.

[PRENOM REPRESENTANT]
Haie Lite
[NUMERO DIRECT]

───────────────────────────────────────────
Pour ne plus recevoir nos messages : [LIEN DESINSCRIPTION]
Haie Lite · 3054 rue Gélineau, Saint-Hubert, QC · [NUMERO]
───────────────────────────────────────────
```

---

## EMAIL DE SUIVI — 5 JOURS APRÈS (si pas d'ouverture ou pas de clic)

### Objet : `RE: Votre propriété 2026 — une question`

```
Bonjour [PRENOM],

Je voulais juste m'assurer que mon email précédent vous avait bien rejoint.

Est-ce que le Plan Tranquillité vous intéresse pour 2026? Si ce n'est pas le bon moment,
pas de problème — dites-le moi et je vous recontacte en mars prochain.

Si vous avez des questions sur ce qui est inclus ou comment ça fonctionne,
je suis disponible par téléphone au [NUMERO] ou par réponse à ce courriel.

[PRENOM REPRESENTANT]
Haie Lite
```

---

## SÉQUENCE RENOUVELLEMENT (CLIENTS ANNUELS EXISTANTS)

### SMS-R1 — Avis de renouvellement automatique (J-30 avant échéance)

```
Bonjour [PRENOM], votre Plan Tranquillité se renouvelle le [DATE].
Nouveau tarif : [NOUVEAU PRIX]$/an (+8% selon contrat).
Si vous souhaitez changer de plan ou annuler, avisez-nous avant le [DATE-7J].
- Haie Lite
```

### SMS-R2 — Confirmation de renouvellement (J-7)

```
[PRENOM], votre abonnement Haie Lite se renouvelle dans 7 jours à [NOUVEAU PRIX]$/an.
Aucune action requise. Pour annuler : répondez ANNULER ou appelez [NUMERO]. - Haie Lite
```

### SMS-R3 — Reçu de renouvellement (J0)

```
Votre Plan Tranquillité 2027 est actif, [PRENOM]!
Tarif : [PRIX]$/an. Prochain passage schedulé en mai.
Merci de votre fidélité! - Haie Lite
```

---

## MÉTRIQUES CIBLES DE LA CAMPAGNE

| Métrique | Cible |
|---|---|
| Taux d'ouverture email | > 45% |
| Taux de clic sur bouton | > 12% |
| Taux de réponse SMS (OUI) | > 8% |
| Taux de conversion global de la campagne | > 15% des clients existants |
| Délai moyen de conversion (contact → paiement) | < 48h |
