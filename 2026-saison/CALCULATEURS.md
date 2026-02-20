# Calculateurs Rapides - Haie Lite 2026

Outils pratiques pour ajustements en temps réel du modèle financier.

---

## Calculateur 1: Objectif CA → Crews Nécessaires

**Formule**: `Crews = CA cible / 600,000$`

| CA cible | Crews équivalents | Configuration recommandée |
|----------|-------------------|---------------------------|
| 1.0M$ | 1.67 | 2 crews TET saison complète |
| 1.5M$ | 2.50 | 2 TET + 1 étudiant |
| 2.0M$ | 3.33 | 3 TET + 2 étudiants |
| 2.5M$ | 4.17 | 4 TET + 2 étudiants |
| 3.0M$ | 5.00 | 5 TET saison complète |

**Notes**:
- 1 crew TET = 130 jours = 1,200 clients
- 1 crew étudiant = 75 jours = 692 clients
- Buffer recommandé: +15% capacité vs objectif

---

## Calculateur 2: Ticket Moyen → EBITDA

**Configuration**: 5 crews (scénario D), 4,984 clients

| Ticket moyen | CA total | Coûts variables | Coûts fixes | EBITDA | Marge % |
|--------------|----------|-----------------|-------------|--------|---------|
| 350$ | 1,744k$ | 1,715k$ | 294k$ | -265k$ | -15% ❌ |
| 375$ | 1,869k$ | 1,715k$ | 294k$ | -140k$ | -7% ❌ |
| 400$ | 1,994k$ | 1,715k$ | 294k$ | -15k$ | -1% ⚠️ |
| 425$ | 2,118k$ | 1,715k$ | 294k$ | +109k$ | 5% ✅ |
| 450$ | 2,243k$ | 1,715k$ | 294k$ | +234k$ | 10% ✅ |
| 475$ | 2,367k$ | 1,715k$ | 294k$ | +358k$ | 15% ✅ |
| 500$ | 2,492k$ | 1,715k$ | 294k$ | +483k$ | 19% ✅ |

**Formule EBITDA**: `(Ticket × Clients) - Coûts variables - Coûts fixes`

**Point mort**: Ticket moyen ~405$

---

## Calculateur 3: CAC → Budget Marketing

**Objectif**: 4,444 nouveaux clients en 2026

| CAC cible | Budget marketing total | % du CA (2M$) | LTV:CAC ratio | Verdict |
|-----------|------------------------|---------------|---------------|---------|
| 20$ | 89k$ | 4.4% | 51× | ✅ Optimiste |
| 30$ | 133k$ | 6.7% | 34× | ✅ Très bon |
| 40$ | 178k$ | 8.9% | 26× | ✅ Bon (base case) |
| 50$ | 222k$ | 11.1% | 21× | ⚠️ Acceptable |
| 60$ | 267k$ | 13.3% | 17× | ⚠️ Limite |
| 75$ | 333k$ | 16.7% | 14× | ❌ Problématique |
| 100$ | 444k$ | 22.2% | 10× | ❌ Intenable |

**Formule**: `Budget marketing = CAC × Nombre de clients`

**Note**: LTV = 1,026$ (3 ans avec rétention 80%)

**Règle**: LTV:CAC >3:1 (minimum industrie), >10:1 (excellent)

---

## Calculateur 4: Acquisition de Compagnie → ROI

**Hypothèses**:
- Prix d'achat: 250$/client
- Rétention post-acquisition: 70%
- Down payment: 30%
- Financement: 70% sur 24 mois

### Acquisition 800 clients @ 200k$

| Métrique | Valeur | Calcul |
|----------|--------|--------|
| **Prix total** | 200k$ | 800 clients × 250$ |
| **Down payment (30%)** | 60k$ | Cash immédiat |
| **Financement (70%)** | 140k$ | Sur 24 mois = 5.8k$/mois |
| **Clients retenus année 1** | 560 | 800 × 70% |
| **CA année 1** | 252k$ | 560 × 450$ |
| **Coût MO additionnel** | 84k$ | 560 clients × 150$ coût variable |
| **Marketing économisé** | 22k$ | 560 × 40$ CAC |
| **Profit brut année 1** | 190k$ | 252k$ - 84k$ + 22k$ |
| **Payback down payment** | 3.8 mois | 60k$ / (190k$/12) |
| **ROI année 1** | 217% | (190k$ - 70k$) / 60k$ |

**Verdict**: ✅ Très rentable si prix <300$/client

### Quick ROI Formula

```
ROI année 1 = [(Clients retenus × Ticket) - (Coûts MO) + (Marketing économisé) - (Paiements financement)] / Down payment
```

**Points d'attention**:
- Vérifier taux rétention réel (due diligence clients)
- Négocier paiement étalé maximum (réduire down payment)
- Valider qualité des clients (éviter comptes en retard)

---

## Calculateur 5: Attrition Étudiants → Impact

**Configuration base**: 4 étudiants, 75 jours, 2 crews

| Taux attrition | Étudiants effectifs | Jours perdus | Clients perdus | CA perdu | Impact EBITDA |
|----------------|---------------------|--------------|----------------|----------|---------------|
| 0% | 4.0 | 0 | 0 | 0 | 0 |
| 10% | 3.6 | 30 | 87 | -39k$ | -21k$ |
| 20% | 3.2 | 60 | 173 | -78k$ | -42k$ |
| 30% | 2.8 | 90 | 260 | -117k$ | -62k$ |
| 40% | 2.4 | 120 | 346 | -156k$ | -83k$ |
| 50% | 2.0 | 150 | 433 | -195k$ | -104k$ |

**Formule clients perdus**: `(Jours perdus / 75) × 692 clients/crew × 2 crews`

**Mitigation**:
- **Embaucher 6 étudiants** au lieu de 4 → buffer 50%
- **Bonus rétention**: 500$ si saison complète → coût 2k$, réduit attrition à 10%
- **Pool remplaçants**: 2 étudiants pré-formés en standby

**Coût buffer**: +28k$ (2 étudiants × 14k$)

**Bénéfice net**: Économie ~40k$ vs perte clients

---

## Calculateur 6: Breakeven Mensuel

**Formule**: `Clients breakeven = Coûts fixes mensuels / Marge contribution par client`

### Données
- **Coûts fixes mensuels moyens**: 24.5k$
- **Marge contribution/client**: 106$ (450$ - 344$ coûts variables)

### Breakeven par mois

| Mois | Coûts fixes | Clients breakeven | Revenus breakeven |
|------|-------------|-------------------|-------------------|
| Jan-Fév | 12k$ | 113 | 51k$ |
| Mars | 12k$ + 25k$ formation | 349 | 157k$ |
| Avr-Oct | 15-18k$ | 142-170 | 64-77k$ |
| Nov-Déc | 12k$ | 113 | 51k$ |

**Utilisation**:
- Objectif hebdomadaire = Breakeven mensuel / 4.3 semaines
- Avril breakeven hebdo: 170 / 4.3 = **40 clients/semaine minimum**

---

## Calculateur 7: Cash Runway

**Formule**: `Runway (mois) = Cash disponible / Burn rate mensuel moyen`

### Scénarios

| Cash disponible | Burn rate (off-season) | Runway | Verdict |
|-----------------|------------------------|--------|---------|
| 50k$ | 17k$/mois | 2.9 mois | ⚠️ Court |
| 100k$ | 17k$/mois | 5.9 mois | ✅ Confortable |
| 150k$ | 17k$/mois | 8.8 mois | ✅ Sécuritaire |
| 200k$ | 17k$/mois | 11.8 mois | ✅ Très sécuritaire |

**En saison (avril-octobre)**:
- Burn rate peak (juin): 230k$/mois dépenses
- Revenus peak: 400k$/mois
- Net cash flow: +170k$/mois ✅

**Recommandation**: Maintenir minimum 100k$ cash en tout temps = 6 mois runway off-season

---

## Calculateur 8: Prix Acquisition Max

**Formule**: `Prix max/client = LTV × 0.25` (payback <1 an)

| LTV (3 ans) | Prix max/client | Prix max 800 clients | Down payment 30% |
|-------------|-----------------|----------------------|------------------|
| 900$ | 225$ | 180k$ | 54k$ |
| 1,000$ | 250$ | 200k$ | 60k$ |
| 1,100$ | 275$ | 220k$ | 66k$ |
| 1,200$ | 300$ | 240k$ | 72k$ |

**LTV conservatrice** (base case):
- Année 1: 450$ (100% rétention)
- Année 2: 360$ (80% rétention)
- Année 3: 288$ (64% rétention)
- **Total LTV 3 ans**: 1,098$ ≈ **1,100$**

**Prix cible négociation**: 200-250$/client (0.20-0.25× LTV)

**Red flags** (refuser deal):
- Prix >300$/client
- Rétention historique <60%
- Comptes receivable >45 jours
- Réputation négative (reviews <3.5/5)

---

## Calculateur 9: Crews Additionnels → Impact

**Coût d'ajout 1 crew TET saison complète**:
- Chef: 130k$
- 2 TET: 260k$
- **Total coût**: 390k$

**Revenu additionnel**:
- Capacité: +1,200 clients
- Revenus: 1,200 × 450$ = **540k$**

**Profit incrémental**:
- Revenus: 540k$
- Coûts MO: 390k$
- Marketing (CAC 40$): 48k$
- CNESST: 8k$
- Véhicule + équipement: 8k$
- **EBITDA**: 540k$ - 454k$ = **86k$** (16% marge)

**ROI**: 86k$ / 390k$ = 22% annuel

**Payback**: 4.5 ans

**Verdict**: ✅ Rentable si taux utilisation >80% (960+ clients)

---

## Calculateur 10: Scénario Builder Rapide

**Template à remplir**:

```
Objectif CA: _________$
Ticket moyen: _________$
→ Clients nécessaires: CA / Ticket = _________

Crews TET: _________ (× 390k$ = _______k$)
Crews étudiants: _________ (× 140k$ = _______k$)
→ Coût MO total: _________k$

Capacité TET: _________ crews × 1,200 = _________
Capacité étudiants: _________ crews × 692 = _________
→ Capacité totale: _________

Budget marketing (CAC 40$): _________ clients × 40$ = _________k$
Coûts fixes: 295k$ (standard)

EBITDA = CA - Coût MO - Marketing - Fixes
       = _______k$ - _______k$ - _______k$ - 295k$
       = _______k$ (________%)
```

**Exemple rempli**:
```
Objectif CA: 2,000k$
Ticket moyen: 450$
→ Clients nécessaires: 4,444

Crews TET: 3 (× 390k$ = 1,170k$)
Crews étudiants: 2 (× 140k$ = 280k$)
→ Coût MO total: 1,450k$

Capacité TET: 3 × 1,200 = 3,600
Capacité étudiants: 2 × 692 = 1,384
→ Capacité totale: 4,984 ✅

Budget marketing: 4,444 × 40$ = 178k$
Coûts fixes: 295k$

EBITDA = 2,000k$ - 1,450k$ - 178k$ - 295k$
       = 77k$ (3.9%) ⚠️
```

---

## Quick Reference: Métriques Clés

| Métrique | Valeur cible | Alerte si |
|----------|--------------|-----------|
| **Ticket moyen** | 450$ | <400$ |
| **CAC** | 40$ | >60$ |
| **LTV:CAC** | 25× | <10× |
| **Marge contribution** | 24% | <15% |
| **EBITDA %** | 15-20% | <5% |
| **Cash disponible** | >100k$ | <50k$ |
| **Taux rétention** | 80% | <70% |
| **Attrition étudiants** | <15% | >30% |
| **Utilisation crews** | >85% | <70% |
| **NPS** | >50 | <30 |

---

## Formules Essentielles

### Revenus
```
CA mensuel = Clients × Ticket moyen
CA annuel = Σ CA mensuel
```

### Coûts
```
Coût MO/client = (Salaires terrain annuels) / (Clients totaux)
CAC = Budget marketing / Nouveaux clients
Coût total/client = Coût MO + CAC + (Fixes / Clients)
```

### Marges
```
Marge contribution = Ticket - Coût variable/client
Marge contribution % = Marge contribution / Ticket
EBITDA = Revenus - Coûts MO - Coûts fixes - Marketing
EBITDA % = EBITDA / Revenus
```

### Cash
```
Cash flow mensuel = Revenus encaissés - Dépenses payées
Cash cumulatif = Cash début + Cash flow mensuel
Runway = Cash disponible / Burn rate mensuel
```

### Clients
```
Capacité crew TET = 1,200 clients / saison (130 jours)
Capacité crew étudiant = 692 clients / été (75 jours)
Breakeven clients = Coûts fixes / Marge contribution
```

### Acquisitions
```
Prix max/client = LTV × 25%
ROI acquisition = (CA acquis - Coûts - Paiements) / Down payment
Payback = Down payment / (Profit mensuel acquis)
```

---

**Dernière mise à jour**: 2026-02-19
**Usage**: Copier-coller les calculateurs dans un spreadsheet pour ajustements dynamiques
