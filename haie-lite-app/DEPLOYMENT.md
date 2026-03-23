# Déploiement — Haie Lite App

**Dernière mise à jour :** 2026-03-23
**Stack :** Next.js 14 → Vercel | Supabase (ca-central-1, déjà configuré)

---

## ÉTAT ACTUEL

- [x] Code TypeScript — compile sans erreurs
- [x] Supabase `haie-lite` — 10 migrations, 23 tables, RLS activé
- [x] `.env.local` — Supabase URL + anon key + CRON_SECRET remplis
- [x] Vercel détecté comme projet Next.js
- [ ] Compte Vercel — **suspendu** (ajouter paiement)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — à remplir (voir étape 1)
- [ ] Clés API externes — ServiceM8, Twilio, etc. (voir étape 3)

---

## ETAPE 1 — SUPABASE SERVICE ROLE KEY

1. Aller sur : https://supabase.com/dashboard/project/ydtmnqqqmfxvrcpjprwi/settings/api
2. Copier la clé **service_role** (section "Project API Keys")
3. La coller dans `.env.local` à la ligne `SUPABASE_SERVICE_ROLE_KEY=`

> Cette clé contourne le RLS — ne jamais l'exposer côté client ni la committer.

---

## ETAPE 2 — REACTIVER VERCEL

Réactiver le compte : https://vercel.com/teams/jsleboeuf3gmailcoms-projects/settings/billing

Une fois réactivé, déployer depuis ce dossier :

```bash
cd /tmp/taillage-haies/haie-lite-app
vercel --yes
```

Vercel va :
- Créer le projet `haie-lite-app`
- Détecter automatiquement Next.js
- Déployer sur `haie-lite-app.vercel.app`

---

## ETAPE 3 — VARIABLES D'ENVIRONNEMENT VERCEL

Une fois le projet créé sur Vercel, ajouter toutes les variables en une commande.
**Remplacer chaque valeur manquante avant d'exécuter.**

```bash
cd /tmp/taillage-haies/haie-lite-app

# Supabase (déjà connus)
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://ydtmnqqqmfxvrcpjprwi.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdG1ucXFxbWZ4dnJjcGpwcndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODQ4MjMsImV4cCI6MjA4ODg2MDgyM30.6bfvGJ-MI8j9fS-pPfSsEy8QvCVIn14jvziT9a8cyuQ"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "COLLER_ICI"

# Cron (déjà généré)
vercel env add CRON_SECRET production <<< "AvQ92K04QyJmCI7YeZ0BZet8TgzOnVKOBkoo7TE8xWo="

# App config
vercel env add HENRI_PHONE production <<< "+1XXXXXXXXXX"
vercel env add JEAN_SAMUEL_PHONE production <<< "+1XXXXXXXXXX"
vercel env add BASE_URL production <<< "https://haie-lite-app.vercel.app"

# ServiceM8
vercel env add SERVICEM8_API_KEY production <<< "COLLER_ICI"

# Twilio (SMS)
vercel env add TWILIO_ACCOUNT_SID production <<< "COLLER_ICI"
vercel env add TWILIO_AUTH_TOKEN production <<< "COLLER_ICI"
vercel env add TWILIO_PHONE_NUMBER production <<< "+1XXXXXXXXXX"

# Resend (email)
vercel env add RESEND_API_KEY production <<< "COLLER_ICI"

# OpenAI
vercel env add OPENAI_API_KEY production <<< "COLLER_ICI"

# Stripe
vercel env add STRIPE_SECRET_KEY production <<< "COLLER_ICI"
vercel env add STRIPE_WEBHOOK_SECRET production <<< "COLLER_ICI"

# Vapi (voice AI)
vercel env add VAPI_API_KEY production <<< "COLLER_ICI"

# Google Business Profile
vercel env add GOOGLE_BUSINESS_PROFILE_API_KEY production <<< "COLLER_ICI"
vercel env add GOOGLE_PLACE_ID production <<< "COLLER_ICI"
```

Après avoir tout ajouté, forcer un redéploiement :

```bash
vercel --prod
```

---

## ETAPE 4 — WEBHOOKS À CONFIGURER

Une fois `BASE_URL` connue (`https://haie-lite-app.vercel.app`), configurer ces webhooks dans chaque service :

| Service | URL webhook | Où configurer |
|---------|-------------|---------------|
| ServiceM8 | `BASE_URL/api/webhooks/servicem8` | ServiceM8 → Settings → Webhooks |
| Twilio (SMS entrant) | `BASE_URL/api/webhooks/twilio-sms` | Twilio Console → Phone Numbers → [numéro] → Messaging |
| Stripe | `BASE_URL/api/webhooks/stripe` | Stripe Dashboard → Developers → Webhooks |
| Meta (Facebook Leads) | `BASE_URL/api/webhooks/meta-leads` | Meta Business Suite → Leads Access |
| Vapi | `BASE_URL/api/webhooks/vapi` | Vapi Dashboard → Assistants → Server URL |

---

## ETAPE 5 — STRIPE WEBHOOK SECRET

Après avoir configuré le webhook Stripe (étape 4), récupérer le `STRIPE_WEBHOOK_SECRET` :

1. Stripe Dashboard → Developers → Webhooks → [webhook créé]
2. Copier le "Signing secret" (format : `whsec_...`)
3. Mettre à jour dans Vercel :
   ```bash
   vercel env rm STRIPE_WEBHOOK_SECRET production
   vercel env add STRIPE_WEBHOOK_SECRET production <<< "whsec_COLLER_ICI"
   vercel --prod
   ```

---

## ETAPE 6 — VÉRIFICATION FINALE

```bash
# Health check
curl https://haie-lite-app.vercel.app/api/health

# Test quote calculator
curl -X POST https://haie-lite-app.vercel.app/api/quotes/calculate \
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

*Créé le 2026-03-23 — mettre à jour BASE_URL une fois le domaine Vercel connu*
