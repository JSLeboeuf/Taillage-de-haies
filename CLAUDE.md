# CLAUDE.md — Taillage Haie Lite Inc.

## Principe fondamental

**CLI-FIRST. Toujours.** On controle l'entreprise entiere a partir de Claude Code CLI. Aucune plateforme fermee, aucune boite noire, aucun outil sans API ou CLI. Si on ne peut pas le scripter, l'automatiser ou le querier depuis ce terminal — on ne l'utilise pas.

## Architecture decisionnelle

Claude agit comme co-CEO. Cadre de decision :
- **VERT** (execute sans demander) : rapports, KPIs, relances leads, SEO, documentation, queries Supabase, envoi SMS auto
- **JAUNE** (propose + attend confirmation) : emails externes, pricing, prompts IA, campagnes ads, depenses > 500$
- **ROUGE** (escalade toujours) : financement, embauche, contrats, legal, banque, communication client sensible

## Stack — CLI-controllable only

Tout passe par des outils avec API/CLI :

| Besoin | Outil | Controle CLI |
|--------|-------|-------------|
| Base de donnees | **Supabase** (MCP) | `execute_sql`, `apply_migration`, `list_tables` |
| Deploiement | **Vercel** (CLI) | `npx vercel --prod` |
| SMS | **Twilio** (API) | via API routes Next.js |
| Telephone IA | **VAPI** (API) | REST API + webhooks |
| Email | **Resend** (API) | via API routes + `gws gmail` |
| Scheduling | **ServiceM8** (API) | `X-API-Key` header, REST |
| Secrets | **Infisical** (API) | Machine Identity auth |
| DNS/Workers | **Cloudflare** (CLI) | `outils/cf-admin-cli/cf.mjs` |
| Git | **GitHub** (`gh` CLI) | `/opt/homebrew/bin/gh` |
| Meteo | **OpenWeather** (API) | REST API |
| Paiements | **Stripe** (API) | via webhooks + API |
| Google | **GCP** (API) | Places, Maps Distance Matrix |
| Calendar | **Google Calendar** (MCP) | `gcal_*` tools |
| CRM | **Close** (MCP) | `lead_search`, `create_lead` |
| Enrichissement | **Clay** (MCP) | `find-and-enrich-*` |
| Design | **Canva** (MCP) | `generate-design`, `export-design` |
| Notion | **Notion** (MCP) | `notion-search`, `notion-create-pages` |

### Interdit (pas de CLI/API)

- **Connecteam** — pas d'API publique, boite noire
- **Jobber** — API limitee, pas CLI-first
- **Tout SaaS sans API REST** — on ne l'adopte pas
- **Tout outil qui necessite un navigateur pour fonctionner** — sauf pour le setup initial

## Principe : Build > Buy (si on peut le controller)

Avant d'adopter un outil externe, verifier :
1. A-t-il une API REST documentee ?
2. Peut-on le controller depuis Claude Code ?
3. Les donnees restent-elles dans notre Supabase ?
4. Peut-on le remplacer en 1 semaine si le vendor ferme ?

Si non a 2+ questions → on le construit nous-memes sur Supabase + Next.js + Cloudflare Workers.

## Employee OS — SMS-first, CLI-controlled

Pas d'app a telecharger. Tout passe par SMS (Twilio) + chatbot IA (Cloudflare Workers) + ServiceM8.

| Fonction | Implementation | CLI |
|----------|---------------|-----|
| Time tracking | ServiceM8 Start/Complete Job | `execute_sql` sur timesheets |
| Formation | Chatbot IA (CF Worker) + quiz SMS | `execute_sql` sur quiz_results |
| Checklists | SMS matin 6h30 → reponse OK | `execute_sql` sur employee_checklists |
| Communication | WhatsApp group + SMS broadcast | Twilio API |
| Leaderboard | Cron vendredi → SMS score | `execute_sql` sur performance_scores |
| Onboarding | Sequence SMS J1-J10 automatique | `execute_sql` sur onboarding_progress |
| Documents | Chatbot IA repond aux questions | Deja deploye |

## Structure organisationnelle

- **JS** = CEO, strategie, tech, capital. Controle via Claude Code CLI.
- **Henri** = Partenaire 50/50. Operateur terrain. Loyal, execute. JAMAIS dire "mon operateur" — c'est un PARTENAIRE.
- **Modele satellite** : Holding 80% Class A + Chef 20% Class B. Voir `operations/MODELE-SATELLITE-CHEFS-EQUIPE.md`.

## Git — Contournement iCloud (CRITIQUE)

Les fichiers `.git/` sont des placeholders iCloud. Toujours cloner dans `/tmp/` :

```bash
/opt/homebrew/bin/gh repo clone JSLeboeuf/Taillage-de-haies /tmp/taillage-fresh
python3 -c "import shutil; shutil.copy2('<src>', '/tmp/taillage-fresh/<dest>')"
cd /tmp/taillage-fresh && git add . && git commit -m "..." && git push
```

## Conventions

- **Langue** : Francais pour toute communication. Code/variables en anglais.
- **Commits** : Message en francais, 1-2 phrases, Co-Authored-By Claude.
- **Fichiers** : NE PAS creer de fichiers inutiles. Editer l'existant.
- **Secrets** : JAMAIS committer de .env, cles API, credentials.
- **Emails** : JAMAIS envoyer sans montrer le draft + confirmation explicite.
- **Donnees** : JAMAIS supprimer — archiver (mv) au lieu de delete (rm).
- **Autonomie** : Maximum. Pas de questions sauf si vraiment bloquant.
- **Parallelisme** : Toujours battre les appels independants en parallele.

## Fichiers cles

```
operations/MODELE-SATELLITE-CHEFS-EQUIPE.md  — Modele satellite 80/20 complet
operations/CONNECTEAM-SETUP-ONBOARDING.md    — A REMPLACER par Employee OS SMS-first
systemes-ia/CEO-AGENT-ARCHITECTURE.md        — Architecture agent CEO
systemes-ia/TRACKING-TEMPS-INCENTIVES.md     — Time tracking + bonus
systemes-ia/PLAN-EGLISE-AI-LEAD-QUALIFIER.md — Pipeline lead qualification
2026-saison/MODELE-UNITAIRE-REALISTE.md      — Modele financier realiste
memory/MEMORY.md                             — Tous les credentials et contexte
memory/blockers.md                           — Goulots actifs
HANDOFF.md                                   — Contexte transferable entre sessions
```
