# Système Referral Complet

**Version :** 1.0 — 2026-03-23
**Référence :** Livrable 4 — Playbook Hormozi
**Note :** L'API `/api/referrals/create` et `/api/referrals/track` sont déjà implémentées dans `haie-lite-app/`.

---

## LOGIQUE DU SYSTÈME

```
Client existant (referrer)
        ↓
   Code unique généré (ex: JEAN-4X7K)
        ↓
   Partage à un ami
        ↓
   Ami visite [LIEN]?ref=JEAN-4X7K
        ↓
   Ami book + paye → referral "converti"
        ↓
   Referrer reçoit la récompense automatiquement
```

---

## NIVEAUX DE RÉCOMPENSE

| Niveau | Condition | Récompense referrer | Récompense ami |
|---|---|---|---|
| Visite simple | Ami bookte 1 visite one-time | Prochaine visite gratuite (~175-250$) | Aucune |
| Plan annuel | Ami signe Plan Tranquillité 1 400$ | 2 visites gratuites (~400$) | 100$ de crédit |
| 3 referrals | 3 amis bookent dans la saison | Plan annuel gratuit (~1 400$) | 100$ de crédit chacun |
| Agent immo | Client envoyé par un agent signe | 10% commission (140$ pour plan annuel) | 50$ de crédit |

---

## SCRIPTS PAR CANAL

### Script terrain — à la fin de chaque visite (obligatoire)

> *"[Prénom], content que vous soyez satisfait. Une dernière chose — si vous avez un voisin ou un ami qui pourrait bénéficier de nos services, on vous offre votre prochaine visite gratuitement si ils bookent. Pas besoin de faire quoi que ce soit de compliqué — juste nous envoyer leur nom et numéro, ou leur partager votre code."*

**Puis :** montrer le code referral sur la tablette ou l'envoyer par SMS.

---

### SMS post-visite J+1 (automatique via API)

```
Bonjour [PRENOM], merci pour la visite d'hier! Votre code referral : [CODE].
Partagez-le à un voisin qui a besoin de vitres/haies/gouttières —
votre prochaine visite est offerte si ils bookent.
[LIEN]?ref=[CODE] - Haie Lite
```

---

### SMS de rappel mensuel (pour clients sans referral actif)

```
[PRENOM], votre code Haie Lite est toujours actif : [CODE].
Si vous le partagez ce mois-ci et quelqu'un bookte, votre prochaine visite est offerte.
[LIEN]?ref=[CODE] - Haie Lite STOP pour arrêter
```

---

## TRACKER GOOGLE SHEETS — STRUCTURE

> **Note :** Le tracker automatique est dans Supabase (table `referrals`).
> Ce Sheets est pour le suivi visuel et les récompenses manuelles.

### Onglet "Referrals Actifs"

| Date création | Referrer | Code | Ami référé | Date booking | Valeur job | Statut | Récompense accordée |
|---|---|---|---|---|---|---|---|
| 2026-03-15 | Jean Tremblay | JEAN-4X7K | Marie Gagnon | 2026-03-20 | 250$ | Converti | Visite gratuite ✅ |

### Onglet "Récompenses en cours"

| Referrer | Téléphone | Récompense due | Valeur | Expiration | Statut |
|---|---|---|---|---|---|
| Jean Tremblay | 514-XXX | Visite gratuite | 175$ | 2026-09-01 | En attente |

---

## RÈGLES OPÉRATIONNELLES

1. **Code unique par client** — l'API gère les doublons (retourne le code existant si déjà créé)
2. **Récompense accordée dès paiement** du job référé — pas à la soumission
3. **Expiration des récompenses** : visite gratuite valide pour la saison en cours seulement
4. **Pas de limite** sur le nombre de referrals d'un même client
5. **Transparence** : le referrer reçoit un SMS dès que son ami bookte (*"Votre ami [Prénom] vient de réserver! Votre prochaine visite est offerte."*)

---

## MÉTRIQUES CIBLES

| Métrique | Cible |
|---|---|
| % clients avec code référal actif | > 80% |
| % clients qui partagent leur code | > 20% |
| Taux de conversion des referrals | > 35% |
| CAC via referral | 0–50$ (coût de la récompense seulement) |
| Objectif referrals saison 2026 | 30–50 nouveaux clients via referral |
