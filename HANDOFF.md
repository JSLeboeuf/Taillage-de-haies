# HANDOFF — Continuer demain (4 avril 2026)

**Date** : 3 avril 2026 (fin de session)
**Engine** : Claude Opus 4.6 (1M context)
**Branche** : `main`
**Derniers commits** : `67e09c0` → `9098918` → `2bd6047` → `dd20573`

---

## CE QUI A ETE FAIT CETTE SESSION

### Decisions strategiques majeures
1. **Modele Satellite 80/20** — Holding (JS+Henri) 80% Class A + Chef 20% Class B. Vesting 3 ans cliff 1 an.
2. **Parcours 5 niveaux Chick-fil-A** — Aide-tailleur → Tailleur autonome → Chef equipe → Chef partenaire → Directeur territoire
3. **Gym Launch framing** — Operating system IA installe chez un gars motive. On garde 80%. L'IA est le moat.
4. **CLI-FIRST** — Tout se controle depuis Claude Code. Aucun outil sans API. Connecteam ANNULE → on construit notre Employee OS sur Supabase + SMS + chatbot IA.
5. **Henri = partenaire 50/50** — Pas un employe. Respect absolu.
6. **WaterFed** — Tucker RIVAL-V2 ~5,300$ decide.
7. **PRIIME** — Conditionnel (pas impossible) pour TET/EIMT. Henri appelle CLE.

### Documents crees / commites
| Commit | Fichier | Contenu |
|--------|---------|---------|
| `67e09c0` | `operations/MODELE-SATELLITE-CHEFS-EQUIPE.md` | 776 lignes: modele complet satellite |
| `9098918` | `operations/CONNECTEAM-SETUP-ONBOARDING.md` | Setup + onboarding (A REMPLACER par Employee OS) |
| `dd20573` | `CLAUDE.md` | Principes CLI-first, stack, conventions |
| earlier | `2026-saison/WATERFED-SETUP-ET-PRICING-VITRES.md` | WaterFed + pricing vitres |
| earlier | `subventions/FORMULAIRE-FINAL-JUAN-LUIS.md` | MAJ candidat TET |
| earlier | `subventions/FORMULAIRE-FINAL-JULIO-CESAR.md` | MAJ candidat TET |

### Recherche web (3 agents paralleles)
- **Connecteam** — gratuit <10 users MAIS pas d'API → ANNULE
- **Neighborly** — #1 mondial, 8.7M$/an rabais, coaching → benchmark
- **ServiceTitan** — 245-398$/tech/mois, Titan Intelligence → trop cher
- **Booke.ai** — bookkeeper IA QBO ~50$/mois → A ADOPTER
- **Aucun concurrent** n'offre coach IA bilingue + recrutement intl + equity

---

## PLAN — CE QU'IL FAUT FAIRE DEMAIN

### PRIORITE 1 — Employee OS (construire, pas acheter)

Migration Supabase + 4 crons pour remplacer Connecteam par notre propre systeme CLI-first.

```
TABLES A CREER (migration Supabase):
  training_modules        — Cours de formation (FR + ES)
  quiz_questions          — Questions + reponses
  quiz_results            — Scores par employe
  employee_checklists     — Checklists matin/soir
  onboarding_progress     — Progression J1-J10

CRONS A CREER (Next.js API routes):
  /api/cron/morning-checklist     — SMS 6h30, checklist equipement
  /api/cron/daily-quiz            — SMS quiz securite/technique
  /api/cron/onboarding-sequence   — SMS onboarding J1-J10
  /api/cron/weekly-leaderboard    — SMS vendredi 17h, score + rang

WEBHOOK:
  /api/webhooks/quiz-response     — Traite reponses SMS quiz

UPGRADE CHATBOT GUATEMALTEQUES:
  Ajouter mode "quiz" au system prompt
  Ajouter progression employe (query Supabase)
  Ajouter contenu formation (securite, techniques, upsell)
```

### PRIORITE 2 — Onboarding TET (fin avril)

Mettre a jour `operations/CONNECTEAM-SETUP-ONBOARDING.md` → renommer en `EMPLOYEE-OS-ONBOARDING.md` et remplacer toutes les refs Connecteam par SMS + chatbot IA + Supabase.

### PRIORITE 3 — Henri actions terrain

| Action | Qui | Quand |
|--------|-----|-------|
| Appeler CLE 450-778-6567 (PRIIME) | Henri | 4 avril 8h30 |
| Appeler Shooga (admin WordPress) | Henri | 4 avril |
| Confirmer nom "gars de 40 ans" | Henri | Cette semaine |
| Verifier documents TET Equinox | Henri | J-30 |
| Preparer logement TET | Henri | J-30 |

### PRIORITE 4 — Tech blockers

| Blocker | Action | Temps |
|---------|--------|-------|
| GCP Billing | Activer (carte credit, $200/mois gratuit) | 5 min |
| 10DLC Twilio | Enregistrer marque + campagne | 1-2 semaines |
| WordPress admin | Shooga upgrade role | 2 min (si elle repond) |
| Prospects M&A emails | Enrichir via Clay MCP | 1-2h |

---

## CONTEXTE POUR LA PROCHAINE SESSION

### L'entreprise en un paragraphe
Taillage Haie Lite Inc. — compagnie de taillage de haies de cedres a Montreal/Rive-Sud. Henri (partenaire 50/50) opere le terrain, JS gere la tech/strategie. 173 jobs pre-bookes pour la saison 2026. 2 TET du Guatemala (Juan Luis + Julio Cesar) arrivent fin avril. 1 candidat local ("gars de 40 ans") pour devenir chef d'equipe. Target 700K$ CA en 2026. Modele satellite: creer des divisions autonomes avec des chefs partenaires a 20% equity, propulsees par un stack IA complet.

### Le modele en un paragraphe
On est le Gym Launch du service residentiel. On prend un gars motive, on lui donne un operating system IA complet (receptionniste 24/7, qualification SMS, weather scheduling, traducteur ES↔FR, coach formation, route optimization, comptabilite auto), on lui recrute des TET au Guatemala, on lui envoie les clients (SEO, Ads), on lui fournit l'equipement, et on garde 80% de l'entite. Le chef garde 20%, fait 110-160K$/an, et a un chemin de carriere de 5 niveaux jusqu'a directeur de territoire. Le switching cost est ~300K$ — il ne part jamais.

### Stack technique
- **Supabase** : DB principale (20+ tables, MCP connecte)
- **Vercel** : Next.js 15, 14 crons actifs
- **Cloudflare Workers** : 3 deployes (SMS qualifier, chatbot TET, VAPI webhook)
- **VAPI** : Receptionniste IA Sophie (production)
- **Twilio** : SMS (a enregistrer 10DLC)
- **ServiceM8** : Jobs, scheduling, time tracking
- **Stripe** : Paiements + abonnements
- **Resend** : Emails transactionnels
- **GitHub** : `JSLeboeuf/Taillage-de-haies`

### Candidats chefs d'equipe
1. **"Gars de 40 ans"** — nom inconnu, Henri le connait, 25$/h, pret full-time. CANDIDAT #1.
2. **Juan Luis Terete Toj** — TET Guatemala, EW 1907, arrive fin avril
3. **Julio Cesar Riz Salvador** — TET Guatemala, EW G33, 11 ans exp, arrive fin avril

### Blockers actifs
Voir `memory/blockers.md` pour la liste complete.

### Credentials
Voir `memory/MEMORY.md` — tout est la (Supabase, VAPI, Twilio, Infisical, Meta, GCP, WordPress, Cloudflare, ServiceM8, Stripe, Resend, etc.)

---

## COMMANDE POUR DEMARRER DEMAIN

```
Lis CLAUDE.md + HANDOFF.md + memory/MEMORY.md.

Priorite 1: Construire Employee OS CLI-first.
- Migration Supabase (5 tables)
- 4 crons Next.js (morning-checklist, daily-quiz, onboarding-sequence, weekly-leaderboard)
- 1 webhook (quiz-response)
- Upgrade chatbot guatemalteques (mode quiz + formation)
- Renommer CONNECTEAM-SETUP-ONBOARDING.md → EMPLOYEE-OS-ONBOARDING.md
- Deploy Vercel

Priorite 2: Verifier si Henri a appele CLE (PRIIME).
Priorite 3: Enrichir emails prospects M&A via Clay.
```

---

*HANDOFF finalise le 3 avril 2026 — Pret a continuer demain matin.*
