# HANDOFF — Session Strategie Satellite + Onboarding TET

**Date** : 3 avril 2026
**Engine** : Claude Opus 4.6 (1M context)
**Branche** : `main`
**Derniers commits** : `67e09c0` (modele satellite) + `9098918` (Connecteam setup)

---

## RESUME DE LA SESSION

Session strategique majeure avec JS (CEO). On a concu et formalise le modele complet "Chick-fil-A du taillage de haies" — un systeme de satellites avec equity 20% pour les chefs d'equipe, parcours 5 niveaux pour TOUS les employes, ecosysteme IA complet, et comparaison au modele Gym Launch d'Hormozi (mais en mieux: 80% equity, IA comme moat, 0$ d'investissement du chef).

## DOCUMENTS CREES CETTE SESSION

| Fichier | Contenu |
|---------|---------|
| `operations/MODELE-SATELLITE-CHEFS-EQUIPE.md` | Document maitre 776 lignes: 5 niveaux carriere, structure satellite 80/20, vesting 3 ans, ecosysteme IA, pitchs par niveau, chiffres, implementation |
| `operations/CONNECTEAM-SETUP-ONBOARDING.md` | Setup Connecteam 7 etapes + checklist onboarding TET J-30 a Semaine 2 + quiz securite espagnol |

## DOCUMENTS CREES SESSIONS PRECEDENTES (meme conversation)

| Fichier | Contenu |
|---------|---------|
| `2026-saison/WATERFED-SETUP-ET-PRICING-VITRES.md` | Setup WaterFed (Tucker RIVAL-V2 ~5,300$) + pricing vitres (8$/fenetre ext, 12$ int+ext) |
| `subventions/FORMULAIRE-FINAL-JUAN-LUIS.md` | MAJ avec nom complet + email + tel Guatemala |
| `subventions/FORMULAIRE-FINAL-JULIO-CESAR.md` | MAJ avec nom complet + tel Guatemala |

## DECISIONS STRATEGIQUES PRISES

1. **Modele Satellite 80/20** : Holding (JS+Henri 50/50) garde 80% Class A (vote). Chef recoit 20% Class B (sans vote). Vesting 3 ans cliff 1 an.
2. **Parcours 5 niveaux Chick-fil-A** : Aide-tailleur → Tailleur autonome → Chef d'equipe → Chef partenaire → Directeur territoire
3. **Gym Launch framing** : Le modele est un "operating system IA" qu'on installe chez un gars motive. On garde 80% car on apporte TOUT sauf les bras.
4. **Henri = partenaire 50/50** : JAMAIS dire "mon operateur". C'est un partenaire qui execute le terrain. JS = strategie/tech/capital.
5. **4 vehicules de JS** : Taillage-de-haies (avec Henri), ServiceOS (SaaS), Rollup-Entretien (acquisitions), Plateforme-Services (marketplace)
6. **WaterFed Option A** : Tucker RIVAL-V2 + Gardiner SLX 39' + Shurflo 12V = ~5,300$ CAD
7. **Connecteam** : Adopte comme outil gratuit pour formation/engagement employes (gratuit <10 users)
8. **PRIIME conditionnel** : Pas un non ferme pour TET/EIMT. Agent CLE decide. Henri doit appeler 450-778-6567.

## ECOSYSTEME TECHNOLOGIQUE COMPLET POUR LES SATELLITES

### Deja construit (dans le repo)
- Sophie SMS qualifier (Cloudflare Worker DEPLOYED)
- VAPI receptionniste 24/7 (DEPLOYED)
- Chatbot guatemalteques FR/ES (Cloudflare Worker DEPLOYED)
- Weather scheduler intelligent (Vercel cron)
- Cascade escalation SMS→Call→WhatsApp→Email
- 14 crons Vercel actifs
- ~20 tables Supabase
- 25 templates SMS
- 9 sequences email M&A
- 73 prospects pipeline acquisitions
- 52 pages SEO indexees
- Manuel employe complet (FR + resume ES)
- SOP-005 onboarding TET (5 jours structures)
- KPIs chefs d'equipe (dashboards quotidien/hebdo/mensuel)
- Profit-sharing 3 niveaux
- Strategie equity 7 leviers
- Moat & avatar ideal
- Tracking temps + 4 types incentives
- Contrats employe (TET + local)

### A deployer / construire
- Coach IA formation (upgrade chatbot existant → academy avec quiz)
- Comptabilite automatisee (ServiceM8 → QBO via Booke.ai)
- Route optimization IA (Google Maps Distance Matrix)
- Equipment tracker QR codes
- Gamification / leaderboard
- AI Financial Advisor (chatbot P&L pour chefs)
- Client retention AI (prediction churn)
- Connecteam (gratuit, a setup maintenant)
- Benefits pool (assurance collective quand 5+ employes)

## CANDIDATS CHEFS D'EQUIPE

1. **"Gars de 40 ans"** (nom inconnu) — Henri l'a re-contacte, travaille dans un entrepot, dispo toute la saison, pret a quitter si full-time garanti, Henri le paie 25$/h. CANDIDAT #1 pour Niveau 3→4.
2. **Juan Luis Terete Toj** — TET Guatemala, permis EW 1907, email Teretejuan25@gmail.com, tel +502 31-02 10-80. Arrive fin avril. Niveau 1→2 puis potentiel Niveau 3.
3. **Julio Cesar Riz Salvador** — TET Guatemala, permis EW G33, 11 ans experience, tel +502 37-68 05-36. Arrive fin avril. Niveau 1→2.
4. **"Autre candidat"** — JS a mentionne avoir un contact. Pas de details.

## BLOCKERS ACTIFS

1. PRIIME conditionnel pour TET/EIMT — Henri doit appeler CLE 450-778-6567
2. Capital ~14K$ cash vs besoins — subventions + seller financing
3. Role WordPress Editeur (pas Admin) — appeler Shooga (mariane@shooga.ca)
4. Acces Google + Facebook d'Henri non recus
5. 10DLC Canada non enregistre (Twilio)
6. GCP Billing pas active (bloque Places API)
7. 72/73 prospects M&A sans email (enrichissement requis)

## PROCHAINES ACTIONS IMMEDIATES

1. **Setup Connecteam** — Guide PRET (`operations/CONNECTEAM-SETUP-ONBOARDING.md`). Henri cree le compte, JS configure les cours.
2. **Preparer onboarding TET** — Checklist J-30 a S2 PRETE dans le meme document, integree avec Connecteam
3. **Henri appelle CLE** — Confirmer PRIIME pour TET/EIMT
4. **Henri appelle Shooga** — WordPress admin
5. **Commander WaterFed** — Tucker RIVAL-V2 quand budget permet
6. **Gars de 40 ans** — Henri confirme le nom + disponibilite + salaire

## RECHERCHE WEB COMPLETEE (3 agents)

### Agent 1 — Formation IA + Outils terrain
- Connecteam: gratuit <10 users, formation + quiz + certifications + scheduling
- Booke.ai: bookkeeper IA pour QBO (~50$/mois)
- LeanScaper: IA specifique paysagement (gratuit 250 credits/mois)
- Gamification: +40% retention connaissances, +25% revenus

### Agent 2 — Franchises tech platforms
- Neighborly: 8.7M$/an rabais fournisseurs, coaching dedie, appels 24/7
- ServiceTitan: 245-398$/tech/mois, Titan Intelligence (AI dispatch)
- Jobber franchise: 69-349$/mois, route optimization, multi-account
- Aucun concurrent n'offre: coach IA bilingue, recrutement intl, traducteur IA, equity operateur

### Agent 3 — Inventaire repo complet
- 14 crons, 3 Workers CF, ~20 tables Supabase
- Tout documente dans le output file de l'agent

## STRUCTURE REPO CLES

```
operations/
  MODELE-SATELLITE-CHEFS-EQUIPE.md  <- DOCUMENT MAITRE (cette session)
  profit-sharing-chef-equipe.md
  strategie-equity-chefs.md
  moat-et-avatar-chefs.md
  kpi-chefs-equipe.md
  manuel-employe.md
  SOP-005-onboarding-TET.md
systemes-ia/
  chatbot-guatemalteques/          <- Cloudflare Worker DEPLOYED
  sms-ai-qualifier/                <- Cloudflare Worker DEPLOYED
  receptionniste-ia/               <- VAPI + CF Worker DEPLOYED
  ia-traducteur-tet.md
  TRACKING-TEMPS-INCENTIVES.md
  CEO-AGENT-ARCHITECTURE.md
2026-saison/
  WATERFED-SETUP-ET-PRICING-VITRES.md
  MODELE-UNITAIRE-REALISTE.md
subventions/
  FORMULAIRE-FINAL-JUAN-LUIS.md
  FORMULAIRE-FINAL-JULIO-CESAR.md
  RESUME-SUBVENTIONS-MAX.md
```

## ACCES & CREDENTIALS

Voir `memory/MEMORY.md` pour tous les credentials (Supabase, VAPI, Twilio, Infisical, Meta, GCP, WordPress, Cloudflare, etc.)

---

*HANDOFF cree le 3 avril 2026 — Session strategie satellite + Gym Launch model + Connecteam onboarding*
