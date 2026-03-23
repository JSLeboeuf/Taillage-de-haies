# Déploiement — Haie Lite App

**Dernière mise à jour :** 2026-03-23
**Stack :** Next.js 14 → Cloudflare Pages | Supabase (ca-central-1, déjà configuré)

---

## ÉTAT ACTUEL

- [x] Code TypeScript — compile sans erreurs
- [x] `export const runtime = 'edge'` — ajouté sur les 33 routes
- [x] `wrangler.toml` — configuré avec nodejs_compat + 12 cron triggers
- [x] `@cloudflare/next-on-pages` + `wrangler` — ajoutés dans package.json
- [x] Supabase `haie-lite` — 10 migrations, 23 tables, RLS activé, 0 warnings sécurité
- [x] `.env.local` — Supabase URL + anon key + CRON_SECRET remplis
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — à remplir (voir étape 1)
- [ ] Compte Cloudflare — créer sur cloudflare.com (gratuit)
- [ ] Clés API externes — ServiceM8, Twilio, etc. (voir étape 3)

---

## ETAPE 1 — SUPABASE SERVICE ROLE KEY

1. Aller sur : https://supabase.com/dashboard/project/ydtmnqqqmfxvrcpjprwi/settings/api
2. Copier la clé **service_role** (section "Project API Keys")
3. La coller dans `.env.local` à la ligne `SUPABASE_SERVICE_ROLE_KEY=`

> Cette clé contourne le RLS — ne jamais l'exposer côté client ni la committer.

---

## ETAPE 2 — INSTALLATION ET AUTH CLOUDFLARE

```bash
cd /tmp/taillage-haies/haie-lite-app
npm install

# Authentifier wrangler (ouvre le navigateur)
npx wrangler login
```

Créer le projet Pages (première fois seulement) :

```bash
npx wrangler pages project create haie-lite-app
```

---

## ETAPE 3 — VARIABLES D'ENVIRONNEMENT CLOUDFLARE

Ajouter toutes les variables via wrangler CLI.
**Remplacer chaque valeur manquante avant d'exécuter.**

```bash
cd /tmp/taillage-haies/haie-lite-app

# Supabase (déjà connus)
npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL --project-name haie-lite-app <<< "https://ydtmnqqqmfxvrcpjprwi.supabase.co"
npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY --project-name haie-lite-app <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdG1ucXFxbWZ4dnJjcGpwcndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODQ4MjMsImV4cCI6MjA4ODg2MDgyM30.6bfvGJ-MI8j9fS-pPfSsEy8QvCVIn14jvziT9a8cyuQ"
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name haie-lite-app <<< "COLLER_ICI"

# Cron
npx wrangler pages secret put CRON_SECRET --project-name haie-lite-app <<< "AvQ92K04QyJmCI7YeZ0BZet8TgzOnVKOBkoo7TE8xWo="

# App config
npx wrangler pages secret put HENRI_PHONE --project-name haie-lite-app <<< "+1XXXXXXXXXX"
npx wrangler pages secret put JEAN_SAMUEL_PHONE --project-name haie-lite-app <<< "+1XXXXXXXXXX"
npx wrangler pages secret put BASE_URL --project-name haie-lite-app <<< "https://haie-lite-app.pages.dev"

# ServiceM8
npx wrangler pages secret put SERVICEM8_API_KEY --project-name haie-lite-app <<< "COLLER_ICI"

# Twilio (SMS)
npx wrangler pages secret put TWILIO_ACCOUNT_SID --project-name haie-lite-app <<< "COLLER_ICI"
npx wrangler pages secret put TWILIO_AUTH_TOKEN --project-name haie-lite-app <<< "COLLER_ICI"
npx wrangler pages secret put TWILIO_PHONE_NUMBER --project-name haie-lite-app <<< "+1XXXXXXXXXX"

# Resend (email)
npx wrangler pages secret put RESEND_API_KEY --project-name haie-lite-app <<< "COLLER_ICI"

# OpenAI
npx wrangler pages secret put OPENAI_API_KEY --project-name haie-lite-app <<< "COLLER_ICI"

# Stripe
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name haie-lite-app <<< "COLLER_ICI"
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name haie-lite-app <<< "COLLER_ICI"

# Vapi (voice AI)
npx wrangler pages secret put VAPI_API_KEY --project-name haie-lite-app <<< "COLLER_ICI"

# Google Business Profile
npx wrangler pages secret put GOOGLE_BUSINESS_PROFILE_API_KEY --project-name haie-lite-app <<< "COLLER_ICI"
npx wrangler pages secret put GOOGLE_PLACE_ID --project-name haie-lite-app <<< "COLLER_ICI"
```

---

## ETAPE 4 — PREMIER DÉPLOIEMENT

```bash
cd /tmp/taillage-haies/haie-lite-app
npm run pages:deploy
```

Cette commande :
1. Build Next.js avec `@cloudflare/next-on-pages`
2. Déploie sur `haie-lite-app.pages.dev`

---

## ETAPE 5 — DOMAINE PERSONNALISÉ (optionnel)

Dans Cloudflare Dashboard → Pages → haie-lite-app → Custom Domains :
- Ajouter `app.taillagehaie.ca` (ou autre domaine)
- Cloudflare gère automatiquement le SSL

---

## ETAPE 6 — WEBHOOKS À CONFIGURER

Une fois `BASE_URL` connue (`https://haie-lite-app.pages.dev`), configurer :

| Service | URL webhook | Où configurer |
|---------|-------------|---------------|
| ServiceM8 | `BASE_URL/api/webhooks/servicem8` | ServiceM8 → Settings → Webhooks |
| Twilio (SMS entrant) | `BASE_URL/api/webhooks/twilio-sms` | Twilio Console → Phone Numbers → [numéro] → Messaging |
| Stripe | `BASE_URL/api/webhooks/stripe` | Stripe Dashboard → Developers → Webhooks |
| Meta (Facebook Leads) | `BASE_URL/api/webhooks/meta-leads` | Meta Business Suite → Leads Access |
| Vapi | `BASE_URL/api/webhooks/vapi` | Vapi Dashboard → Assistants → Server URL |

---

## ETAPE 7 — STRIPE WEBHOOK SECRET

Après avoir configuré le webhook Stripe :

1. Stripe Dashboard → Developers → Webhooks → [webhook créé]
2. Copier le "Signing secret" (format : `whsec_...`)
3. Mettre à jour :
   ```bash
   npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name haie-lite-app <<< "whsec_COLLER_ICI"
   npm run pages:deploy
   ```

---

## ETAPE 8 — VÉRIFICATION FINALE

```bash
# Health check
curl https://haie-lite-app.pages.dev/api/health

# Test quote calculator
curl -X POST https://haie-lite-app.pages.dev/api/quotes/calculate \
  -H "Content-Type: application/json" \
  -d '{"hedge_type":"cedar","length_meters":25,"height_meters":1.8,"sides":2,"includes_top":true,"includes_cleanup":true,"includes_rejuvenation":false,"access_difficulty":"easy"}'
```

---

## RECAP CLÉS API À OBTENIR

| Variable | Où la trouver |
|----------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com/dashboard/project/ydtmnqqqmfxvrcpjprwi/settings/api |
| `SERVICEM8_API_KEY` | ServiceM8 → Settings → API |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` | console.twilio.com → Account Info |
| `TWILIO_PHONE_NUMBER` | Twilio → Phone Numbers |
| `RESEND_API_KEY` | resend.com → API Keys |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys |
| `VAPI_API_KEY` | dashboard.vapi.ai → Account → API Keys |
| `GOOGLE_BUSINESS_PROFILE_API_KEY` | console.cloud.google.com → APIs → Credentials |
| `GOOGLE_PLACE_ID` | Google Maps → chercher "Taillage Haie Lite" |

---

*Créé le 2026-03-23 — Cloudflare Pages + nodejs_compat + 33 routes edge*
