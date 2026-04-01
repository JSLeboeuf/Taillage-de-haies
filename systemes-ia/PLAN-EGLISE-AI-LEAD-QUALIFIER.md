# Plan d'Eglise — AI Lead Qualifier Haielite

> Systeme complet de qualification automatisee des leads Facebook Ads
> par cascade SMS IA → VAPI Voice → WhatsApp → Email
> Date: 31 mars 2026

---

## 0. Resume Executif

**Probleme:** Les leads Facebook arrivent, Henri les appelle manuellement 2-3h plus tard. 60%+ des leads sont deja froids. Conversion lead→client: ~8%.

**Solution:** IA qui repond en <30 secondes par SMS, qualifie en 4 questions, escalade automatiquement vers appel vocal si necessaire.

**Impact projete:**
- Speed-to-lead: 2-3h → <30 secondes (391x meilleur taux de contact)
- Conversion lead→client: 8% → 25%+ (3x)
- Cout qualification: $25/lead (humain) → $1.04/lead (IA) = -96%
- Revenue additionnel projete: +$4,200/mois (15 leads/mois × $280 marge moyenne)

---

## 1. Architecture Systeme

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FACEBOOK LEAD ADS                                │
│           (Formulaire avec consentement SMS CASL)                   │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ Webhook POST (< 5s)
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTE (Vercel Edge)                        │
│         /api/webhooks/meta-leads/route.ts                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 1. Valider X-Hub-Signature-256                              │   │
│  │ 2. Extraire champs lead (nom, tel, email, ville, cotes)    │   │
│  │ 3. Dedup (meme tel dans 24h)                                │   │
│  │ 4. INSERT → Supabase `leads`                                │   │
│  │ 5. INSERT → Supabase `sms_conversations` (init)             │   │
│  │ 6. Creer ServiceM8 company + job                            │   │
│  │ 7. TRIGGER → SMS IA (premier message < 30s)                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ Twilio SMS sortant
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CASCADE DE QUALIFICATION                                │
│                                                                     │
│  TIER 1: SMS IA (Claude Haiku via Cloudflare Worker)               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • 1er SMS: "Salut [prenom]! C'est Haie Lite. Tu as..."    │   │
│  │ • Machine a etats: GREETING → QUALIFYING → SCHEDULING      │   │
│  │ • 4 questions max: proprietaire? cotes? ville? dispo?      │   │
│  │ • Score 1-10 en temps reel                                  │   │
│  │ • Si score >= 7: proposer RDV directement                  │   │
│  │ • Si pas de reponse 2h: → TIER 2                           │   │
│  │ • Si score < 4: tag "froid" + email nurture                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                      │ Pas de reponse 2h                           │
│                      ▼                                              │
│  TIER 2: APPEL VOCAL VAPI (Sophie AI)                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • POST api.vapi.ai/call avec contexte lead                 │   │
│  │ • Sophie presente, qualifie, propose inspection             │   │
│  │ • Webhook end-of-call-report → Supabase                    │   │
│  │ • Si qualifie: book RDV + SMS confirmation                 │   │
│  │ • Si pas de reponse: → TIER 3                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                      │ Pas de reponse / voicemail                  │
│                      ▼                                              │
│  TIER 3: WHATSAPP (Click-to-WhatsApp, 72h gratuit)                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Template message pre-approuve (portfolio photos)          │   │
│  │ • Carousel avant/apres                                      │   │
│  │ • Reponse conversationnelle (meme IA Claude)               │   │
│  │ • Si pas de reponse 24h: → TIER 4                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                      │ Pas de reponse                              │
│                      ▼                                              │
│  TIER 4: EMAIL NURTURE (Sequence 5 emails / 14 jours)             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • J0: Soumission estimee + portfolio                        │   │
│  │ • J3: Temoignage client                                     │   │
│  │ • J7: Offre limitee                                         │   │
│  │ • J10: Etude de cas avant/apres                             │   │
│  │ • J14: Derniere chance                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SUPABASE (Source de Verite)                             │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ leads              │ Tous les leads Facebook              │      │
│  │ sms_conversations  │ Historique SMS + etat machine        │      │
│  │ call_results       │ Transcriptions VAPI + analyses       │      │
│  │ whatsapp_messages  │ Historique WhatsApp                  │      │
│  │ appointments       │ RDV planifies                        │      │
│  │ cascade_tracking   │ Progression dans la cascade          │      │
│  └──────────────────────────────────────────────────────────┘      │
│              ↕ Realtime (Supabase Channels)                         │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ DASHBOARD LIVE (Next.js /dashboard/leads)                 │      │
│  │ • Pipeline Kanban: nouveau → qualifie → RDV → client     │      │
│  │ • Stats temps reel: leads/jour, CPQL, conversion          │      │
│  │ • Alertes: lead chaud (score 9+), pas de reponse          │      │
│  └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Technologique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Meta Webhook** | Next.js API Route (Edge) | Deja en place, <5s latency |
| **SMS IA Engine** | Cloudflare Worker + Claude Haiku | Edge (<50ms cold start), $0.25/1000 req |
| **Conversation State** | Supabase (PostgreSQL) | Deja en place, Realtime, RLS |
| **SMS Provider** | Twilio (Conversations API) | Deja en place, stateful threads |
| **Voice AI** | VAPI (Sophie assistant) | Deja configure, $0.70/min Canada |
| **WhatsApp** | WhatsApp Cloud API (Meta) | Meme compte Meta, 72h gratuit |
| **Email** | Resend ou Supabase Edge Function | Transactionnel, templates HTML |
| **Dashboard** | Next.js + Supabase Realtime | Deja en place, extension naturelle |
| **AI Model** | Claude 3.5 Haiku | $0.80/M input, $4/M output, <500ms |
| **Monitoring** | Cloudflare Analytics + Supabase | Logs, metriques, alertes |

---

## 3. Schema Supabase (Migration 006)

```sql
-- migration: 006_ai_lead_qualifier.sql

-- ============================================================================
-- SMS Conversations (qualification IA multi-tour)
-- ============================================================================
CREATE TABLE sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'greeting'
    CHECK (state IN ('greeting', 'qualifying', 'scheduling', 'handoff', 'completed', 'dead')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualification_data JSONB DEFAULT '{}'::jsonb,
  qualification_score INT DEFAULT 0 CHECK (qualification_score BETWEEN 0 AND 10),
  turn_count INT DEFAULT 0,
  ai_model TEXT DEFAULT 'claude-3-5-haiku-20241022',
  total_input_tokens INT DEFAULT 0,
  total_output_tokens INT DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  consent_sms BOOLEAN DEFAULT false,
  opt_out BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'
);

CREATE INDEX idx_sms_conv_lead ON sms_conversations(lead_id);
CREATE INDEX idx_sms_conv_phone ON sms_conversations(phone_number);
CREATE INDEX idx_sms_conv_state ON sms_conversations(state);
CREATE UNIQUE INDEX idx_sms_conv_lead_unique ON sms_conversations(lead_id) WHERE state != 'dead';

-- ============================================================================
-- Cascade Tracking (progression dans les 4 tiers)
-- ============================================================================
CREATE TABLE cascade_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  current_tier INT NOT NULL DEFAULT 1 CHECK (current_tier BETWEEN 1 AND 4),
  tier1_sms_sent_at TIMESTAMPTZ,
  tier1_sms_responded BOOLEAN DEFAULT false,
  tier1_completed_at TIMESTAMPTZ,
  tier2_call_sent_at TIMESTAMPTZ,
  tier2_call_answered BOOLEAN DEFAULT false,
  tier2_call_id TEXT,
  tier2_completed_at TIMESTAMPTZ,
  tier3_whatsapp_sent_at TIMESTAMPTZ,
  tier3_whatsapp_responded BOOLEAN DEFAULT false,
  tier3_completed_at TIMESTAMPTZ,
  tier4_email_started_at TIMESTAMPTZ,
  tier4_email_step INT DEFAULT 0,
  tier4_completed_at TIMESTAMPTZ,
  final_outcome TEXT CHECK (final_outcome IN (
    'qualified', 'appointment_booked', 'not_interested',
    'wrong_number', 'no_response', 'disqualified'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_cascade_lead ON cascade_tracking(lead_id);

-- ============================================================================
-- Appointments (RDV planifies par IA)
-- ============================================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  source TEXT NOT NULL CHECK (source IN ('sms_ai', 'vapi_call', 'whatsapp', 'manual')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  servicem8_job_uuid TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_lead ON appointments(lead_id);

-- ============================================================================
-- Call Results (VAPI transcriptions + analyses)
-- ============================================================================
CREATE TABLE call_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  duration_seconds INT,
  status TEXT NOT NULL,
  transcript TEXT,
  analysis JSONB,
  qualification_score FLOAT,
  sentiment TEXT,
  next_steps TEXT[],
  recording_url TEXT,
  cost_usd NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_call_results_lead ON call_results(lead_id);

-- ============================================================================
-- WhatsApp Messages
-- ============================================================================
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text', 'template', 'image', 'document')),
  content TEXT,
  template_name TEXT,
  wa_message_id TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wa_messages_lead ON whatsapp_messages(lead_id);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_sms_conversations_updated
  BEFORE UPDATE ON sms_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_cascade_tracking_updated
  BEFORE UPDATE ON cascade_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: escalade automatique apres timeout
CREATE OR REPLACE FUNCTION escalate_cascade()
RETURNS void AS $$
BEGIN
  -- Tier 1 → Tier 2: SMS sans reponse depuis 2h
  UPDATE cascade_tracking SET
    current_tier = 2,
    tier1_completed_at = now()
  WHERE current_tier = 1
    AND tier1_sms_sent_at IS NOT NULL
    AND tier1_sms_responded = false
    AND tier1_sms_sent_at < now() - INTERVAL '2 hours';

  -- Tier 2 → Tier 3: Appel sans reponse depuis 4h
  UPDATE cascade_tracking SET
    current_tier = 3,
    tier2_completed_at = now()
  WHERE current_tier = 2
    AND tier2_call_sent_at IS NOT NULL
    AND tier2_call_answered = false
    AND tier2_call_sent_at < now() - INTERVAL '4 hours';

  -- Tier 3 → Tier 4: WhatsApp sans reponse depuis 24h
  UPDATE cascade_tracking SET
    current_tier = 4,
    tier3_completed_at = now()
  WHERE current_tier = 3
    AND tier3_whatsapp_sent_at IS NOT NULL
    AND tier3_whatsapp_responded = false
    AND tier3_whatsapp_sent_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cascade_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Policy: service role full access
CREATE POLICY "service_role_full_access" ON sms_conversations
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_access" ON cascade_tracking
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_access" ON appointments
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_access" ON call_results
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_access" ON whatsapp_messages
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 4. Composants a Builder

### Phase 1: SMS IA Qualification (Semaine 1-2)

#### 4.1 Cloudflare Worker — `sms-ai-qualifier`

**Fichier:** `systemes-ia/sms-ai-qualifier/src/index.ts`

**Responsabilite:** Recevoir les webhooks Twilio, gerer la conversation IA, repondre par SMS.

```
Flow:
POST /sms (Twilio webhook)
  → Parse form data (From, Body, MessageSid)
  → Fetch conversation state (Supabase)
  → Si nouvelle conversation: initialiser + envoyer greeting
  → Si conversation existante: append message + appel Claude Haiku
  → Parser reponse Claude (SMS + metadata score)
  → Envoyer SMS reponse via Twilio
  → Update conversation state + score dans Supabase
  → Si qualification complete (score >= 7):
      → Proposer creneaux disponibles
      → Si RDV accepte: INSERT appointment + notify Henri
  → Si qualification complete (score < 4):
      → Tag "disqualified" + stop conversation
  → Retourner TwiML vide
```

**Secrets requis (Cloudflare):**
- `ANTHROPIC_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Prompt systeme Claude Haiku:**
```
Tu es l'assistant SMS de Haie Lite, entreprise de taillage de haies au Quebec.

ROLE: Qualifier les prospects par SMS (court, amical, quebecois).

REGLES STRICTES:
- Max 155 caracteres par reponse (1 SMS)
- 1 seule question par message
- Francais quebecois naturel (tutoyement)
- Jamais de prix, jamais de markdown, jamais d'emoji
- Maximum 4 questions de qualification

PROGRESSION:
1. Accueil + confirmer interet
2. Proprietaire? Combien de cotes de haie?
3. Ville/secteur?
4. Disponibilite cette semaine pour une soumission gratuite?

SORTIE: Apres chaque reponse, ajouter sur une ligne separee:
[score:X/10|state:greeting|qualifying|scheduling|completed]
```

#### 4.2 Modifier `/api/webhooks/meta-leads/route.ts`

**Changements:**
1. Ajouter validation `X-Hub-Signature-256` (HMAC SHA256)
2. Ajouter INSERT `sms_conversations` + `cascade_tracking`
3. Trigger SMS IA premier message (au lieu du SMS template statique actuel)
4. Ajouter consentement CASL tracking (`consent_sms` field)

#### 4.3 Modifier `/api/webhooks/twilio-sms/route.ts`

**Changements:**
1. Avant le switch/case actuel: verifier si `sms_conversations` active existe
2. Si oui: router vers le Cloudflare Worker SMS AI (ou traiter localement)
3. Si non: comportement actuel (confirmation quote, upsell, etc.)
4. Ajouter gestion STOP/opt-out CASL

#### 4.4 Cron `/api/cron/cascade-escalation/route.ts`

**Nouveau fichier.** Tourne toutes les 15 minutes.
```
1. Appeler escalate_cascade() SQL function
2. Pour chaque lead passant a Tier 2:
   → Declencher appel VAPI outbound
3. Pour chaque lead passant a Tier 3:
   → Envoyer template WhatsApp
4. Pour chaque lead passant a Tier 4:
   → Demarrer sequence email
```

---

### Phase 2: VAPI Voice Fallback (Semaine 3)

#### 4.5 Endpoint `/api/acquisitions/outbound/call/route.ts`

**Deja documente dans rapport VAPI.** Declenchement:
```typescript
// Appel VAPI avec contexte lead
POST api.vapi.ai/call {
  phoneNumber: lead.phone,
  assistantId: "sophie-qualifier",  // assistant VAPI existant
  assistantOverrides: {
    variableValues: {
      firstName: lead.name.split(' ')[0],
      hedgeSides: lead.hedge_sides,
      city: lead.city,
      smsContext: "Le prospect n'a pas repondu aux SMS"
    }
  }
}
```

#### 4.6 Modifier `/api/webhooks/vapi/route.ts`

**Changements:**
1. Ajouter handler `end-of-call-report` → INSERT `call_results`
2. Update `cascade_tracking` (tier2_call_answered, tier2_completed_at)
3. Si qualifie par VAPI: creer appointment + notifier Henri
4. Si voicemail: marquer et passer a Tier 3

---

### Phase 3: WhatsApp + Email (Semaine 4)

#### 4.7 WhatsApp Cloud API Setup

**Prerequis:**
- WhatsApp Business Account lie au meme Meta Business (Page Taillage Haielite)
- Numero de telephone dedie (ou meme numero Twilio via WhatsApp Business API)
- Templates pre-approuves par Meta (delai 24-48h)

**Templates a soumettre:**
1. `lead_followup` — "Bonjour {{1}}, merci pour votre interet pour le taillage de haies! Voici quelques exemples de notre travail: [image]. Repondez OUI pour une soumission gratuite."
2. `appointment_reminder` — "Rappel: votre inspection gratuite est prevue le {{1}} a {{2}}. Confirmez avec OUI."
3. `portfolio_showcase` — Carousel 3-5 photos avant/apres

#### 4.8 Endpoint `/api/webhooks/whatsapp/route.ts`

**Nouveau fichier.** Recoit les webhooks WhatsApp Cloud API.
```
POST /api/webhooks/whatsapp
  → Valider signature Meta
  → Parser message (text, button_reply, etc.)
  → Si conversation active: router vers Claude Haiku (meme logique SMS)
  → Update whatsapp_messages + cascade_tracking
```

#### 4.9 Email Nurture Sequence

**Via Supabase Edge Function ou Resend.** 5 emails sur 14 jours:
- J0: Soumission estimee + 3 photos avant/apres
- J3: Temoignage client video (embed)
- J7: "Offre semaine: 10% sur votre premiere taille"
- J10: Etude de cas voisin (avec permission)
- J14: "Derniere chance — calendrier se remplit vite!"

---

## 5. Conformite CASL (Loi Canadienne Anti-Spam)

### 5.1 Consentement Facebook Lead Form

**OBLIGATOIRE:** Checkbox non pre-cochee dans le formulaire Facebook Lead:
```
☐ J'accepte de recevoir des communications par SMS de Haie Lite
  concernant ma demande de soumission. Des frais de messagerie
  standard peuvent s'appliquer. Repondez STOP pour vous desinscrire.
```

**Ceci constitue un "consentement expres" sous CASL** si:
- Non pre-coche
- Specifique au canal SMS
- Mentionne l'opt-out
- L'entreprise est identifiee

### 5.2 Premier SMS (obligations legales)

Le premier SMS DOIT contenir:
1. Identification de l'entreprise ("C'est Haie Lite")
2. Raison du message ("suite a ta demande")
3. Opt-out ("STOP pour se desinscrire")

**Exemple conforme:**
```
Salut [prenom]! C'est Haie Lite, suite a ta demande de soumission.
T'es proprietaire? STOP pour se desinscrire.
```

### 5.3 Gestion STOP

```typescript
// Dans le Cloudflare Worker
if (body.toUpperCase().includes('STOP') ||
    body.toUpperCase().includes('ARRET') ||
    body.toUpperCase().includes('DESINSCRIRE')) {
  // 1. Marquer opt_out = true dans sms_conversations
  // 2. Marquer dans Twilio (compliance auto)
  // 3. Confirmer: "Vous etes desinscrits. Haie Lite."
  // 4. NE PLUS JAMAIS contacter ce numero
}
```

### 5.4 Conservation des preuves

Stocker dans Supabase pour chaque lead:
- `consent_timestamp` — quand le formulaire a ete soumis
- `consent_source` — "facebook_lead_form"
- `consent_text` — texte exact de la checkbox
- `form_id` — ID du formulaire Meta

---

## 6. Cout et ROI

### 6.1 Couts par lead qualifie

| Composant | Cout unitaire | Par lead (5 SMS avg) |
|-----------|---------------|----------------------|
| Claude Haiku (input) | $0.80/M tokens | $0.0004 |
| Claude Haiku (output) | $4.00/M tokens | $0.0003 |
| Twilio SMS Canada (sortant) | $0.0085/SMS | $0.0425 |
| Twilio SMS Canada (entrant) | $0.0075/SMS | $0.0375 |
| Cloudflare Worker | $0.50/M req | $0.000005 |
| Supabase (inclus dans plan) | $0 | $0 |
| **TOTAL SMS IA** | | **$0.08/lead** |

**Avec VAPI fallback (30% des leads):**

| Composant | Cout | Par lead (3 min avg) |
|-----------|------|----------------------|
| VAPI appel Canada | $0.70/min | $2.10 |
| Probabilite fallback | 30% | $0.63 |

**TOTAL moyen par lead:** $0.08 + $0.63 = **~$0.71/lead qualifie**

### 6.2 Comparaison

| Methode | Cout/lead | Temps reponse | Conversion |
|---------|-----------|---------------|------------|
| **Humain (Henri)** | $25-35 | 2-3 heures | 8% |
| **SMS IA + cascade** | $0.71 | <30 secondes | 25%+ |
| **Economie** | **-97%** | **-99.7%** | **+212%** |

### 6.3 Budget mensuel estime (40 leads/mois)

```
SMS IA (40 leads × $0.08):          $3.20
VAPI fallback (12 leads × $2.10):   $25.20
WhatsApp templates (8 leads):        $4.00
Twilio numero mensuel:               $2.00
Cloudflare Workers (free tier):      $0.00
Claude API:                          ~$2.00
─────────────────────────────────────────
TOTAL:                               ~$36/mois

vs Henri 5h/semaine × $25/h:        $500/mois
ECONOMIE:                            $464/mois = 93%
```

---

## 7. Plan de Build — 4 Phases

### Phase 1: SMS IA Core (Jours 1-5)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 1.1 | Migration Supabase 006 | `supabase/migrations/006_ai_lead_qualifier.sql` | 1h |
| 1.2 | Cloudflare Worker SMS AI | `systemes-ia/sms-ai-qualifier/src/index.ts` | 4h |
| 1.3 | Prompt systeme Claude + tests | `systemes-ia/sms-ai-qualifier/src/prompts.ts` | 2h |
| 1.4 | Modifier meta-leads webhook | `app/api/webhooks/meta-leads/route.ts` | 2h |
| 1.5 | Modifier twilio-sms webhook | `app/api/webhooks/twilio-sms/route.ts` | 2h |
| 1.6 | Tests E2E: FB lead → SMS → reponse | Script bash / Playwright | 2h |
| 1.7 | Facebook Lead Form: ajouter checkbox CASL | Meta Business Suite | 30min |
| | **Sous-total Phase 1** | | **~13h** |

### Phase 2: Cascade + VAPI (Jours 6-8)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 2.1 | Cron cascade escalation | `app/api/cron/cascade-escalation/route.ts` | 2h |
| 2.2 | VAPI outbound endpoint | `app/api/acquisitions/outbound/call/route.ts` | 2h |
| 2.3 | VAPI webhook handler update | `app/api/webhooks/vapi/route.ts` | 1h |
| 2.4 | Sophie qualifier prompt | VAPI Dashboard | 1h |
| 2.5 | Tests: SMS timeout → appel VAPI | Script | 1h |
| | **Sous-total Phase 2** | | **~7h** |

### Phase 3: WhatsApp + Email (Jours 9-11)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 3.1 | WhatsApp Business API setup | Meta Business Suite | 2h |
| 3.2 | Templates WhatsApp (soumission) | Meta Business Suite | 1h |
| 3.3 | WhatsApp webhook handler | `app/api/webhooks/whatsapp/route.ts` | 3h |
| 3.4 | Email nurture sequence (5 emails) | `lib/email-nurture.ts` | 2h |
| 3.5 | Cron email drip | `app/api/cron/email-nurture/route.ts` | 1h |
| | **Sous-total Phase 3** | | **~9h** |

### Phase 4: Dashboard + CAPI (Jours 12-14)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 4.1 | Dashboard leads live (Realtime) | `app/dashboard/leads/page.tsx` | 4h |
| 4.2 | Pipeline Kanban (drag & drop) | `app/dashboard/components/LeadPipeline.tsx` | 3h |
| 4.3 | Stats temps reel (CPQL, conversion) | `app/dashboard/components/LeadStats.tsx` | 2h |
| 4.4 | CAPI feedback loop Meta | `lib/meta-capi.ts` | 2h |
| 4.5 | Alerte SMS Henri: lead chaud (score 9+) | Trigger Supabase | 1h |
| | **Sous-total Phase 4** | | **~12h** |

### Total: ~41 heures de build

---

## 8. Secrets & Configuration

### Infisical (deja en place)

```
HAIELITE_META_APP_ID          = 1845382706193611
HAIELITE_META_APP_SECRET      = d23d0013ce22acc34e0e8414cc48fd36
HAIELITE_META_PAGE_ID         = 114640741561166
HAIELITE_META_PAGE_ACCESS_TOKEN = EAAaOXaStZAMs...
```

### A ajouter dans Infisical

```
ANTHROPIC_API_KEY              = (cle Haiku existante ou nouvelle)
TWILIO_ACCOUNT_SID             = (existant)
TWILIO_AUTH_TOKEN              = (existant)
TWILIO_PHONE_NUMBER            = (existant, format +1XXXXXXXXXX)
VAPI_API_KEY                   = (existant)
VAPI_SOPHIE_ASSISTANT_ID       = (ID assistant Sophie qualifier)
META_VERIFY_TOKEN              = (token verification webhook)
META_WHATSAPP_TOKEN            = (token WhatsApp Cloud API)
META_WHATSAPP_PHONE_NUMBER_ID  = (ID numero WhatsApp Business)
RESEND_API_KEY                 = (si Resend pour emails)
```

### Cloudflare Worker Secrets

```bash
cd systemes-ia/sms-ai-qualifier
echo "sk-ant-..." | npx wrangler secret put ANTHROPIC_API_KEY
echo "AC..." | npx wrangler secret put TWILIO_ACCOUNT_SID
echo "..." | npx wrangler secret put TWILIO_AUTH_TOKEN
echo "+1..." | npx wrangler secret put TWILIO_PHONE_NUMBER
echo "https://..." | npx wrangler secret put SUPABASE_URL
echo "eyJ..." | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

---

## 9. Metriques & KPIs

### Dashboard temps reel

| Metrique | Cible Mois 1 | Cible Mois 3 |
|----------|--------------|--------------|
| Speed-to-lead (1er SMS) | < 30 secondes | < 15 secondes |
| Taux de reponse SMS | > 60% | > 70% |
| Score moyen qualification | > 5/10 | > 6/10 |
| Leads qualifies/mois | 15+ | 25+ |
| Conversion lead→RDV | > 20% | > 30% |
| Conversion RDV→client | > 50% | > 60% |
| CPQL (Cost Per Qualified Lead) | < $5 | < $3 |
| Cascade Tier 1 resolution | > 40% | > 55% |
| Cascade Tier 2 resolution | > 20% | > 25% |
| Opt-out rate | < 5% | < 3% |

### Alertes automatiques

1. **Lead chaud (score 9-10):** SMS immediat a Henri + notification dashboard
2. **Pas de reponse Tier 1 + 2:** Alerte "lead froid" apres 6h
3. **Taux opt-out > 10%:** Revoir le premier SMS (compliance)
4. **API Claude down:** Fallback sur reponses statiques pre-ecrites
5. **Twilio erreur:** Log + retry 3x + alerte si persistant

---

## 10. Tests de Validation

### Test 1: Flow complet SMS IA (Phase 1)

```bash
# Simuler un webhook Meta Lead
curl -X POST https://haie-lite-app.vercel.app/api/webhooks/meta-leads \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "leadgen_id": "test-001",
          "form_id": "form-001",
          "field_data": [
            {"name": "first_name", "values": ["Jean"]},
            {"name": "last_name", "values": ["Tremblay"]},
            {"name": "phone_number", "values": ["+15145551234"]},
            {"name": "city", "values": ["Laval"]},
            {"name": "hedge_sides", "values": ["4"]}
          ]
        }
      }]
    }]
  }'

# Verifier:
# 1. Lead cree dans Supabase
# 2. sms_conversations cree (state: greeting)
# 3. cascade_tracking cree (tier: 1)
# 4. SMS envoye via Twilio dans < 30s
# 5. ServiceM8 company + job crees
```

### Test 2: Conversation multi-tour

```bash
# Simuler reponse SMS du prospect (webhook Twilio)
curl -X POST https://sms-ai-qualifier.haielite.workers.dev/sms \
  -d "From=+15145551234&Body=Oui je suis proprietaire&MessageSid=SM001"

# Attendre reponse IA
# Verifier: question suivante posee, score mis a jour
```

### Test 3: Escalade cascade

```bash
# Verifier que le cron escalade correctement
curl https://haie-lite-app.vercel.app/api/cron/cascade-escalation \
  -H "Authorization: Bearer $CRON_SECRET"

# Verifier: leads sans reponse 2h+ passes a tier 2
```

---

## 11. Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Claude API down | Lead sans reponse | Fallback reponses statiques (5 templates) |
| Twilio rate limit | SMS retardes | Queue + retry + numero supplementaire |
| CASL violation | Amende $10M max | Checkbox obligatoire, STOP auto, audit mensuel |
| Prospect confusion IA | Mauvaise UX | "Tapez HUMAIN pour parler a quelqu'un" |
| Faux positifs score | RDV non-qualifies | Henri valide tout RDV > score 7 |
| Cost overrun Claude | Budget depasse | Max 8 tours/conversation + hard limit $50/mois |
| WhatsApp template rejete | Tier 3 bloque | Soumettre 3+ templates, avoir backup SMS |

---

## 12. Fichiers a Creer / Modifier

### Nouveaux fichiers

```
systemes-ia/sms-ai-qualifier/
├── wrangler.toml
├── package.json
├── src/
│   ├── index.ts          (Worker principal)
│   ├── prompts.ts        (System prompts Claude)
│   ├── state-machine.ts  (Gestion etats conversation)
│   ├── twilio.ts         (Envoi SMS via Twilio API)
│   ├── supabase.ts       (Client Supabase pour Worker)
│   └── types.ts          (Interfaces TypeScript)

haie-lite-app/
├── supabase/migrations/006_ai_lead_qualifier.sql
├── app/api/cron/cascade-escalation/route.ts
├── app/api/acquisitions/outbound/call/route.ts
├── app/api/webhooks/whatsapp/route.ts
├── app/api/cron/email-nurture/route.ts
├── app/dashboard/leads/page.tsx
├── app/dashboard/components/LeadPipeline.tsx
├── app/dashboard/components/LeadStats.tsx
├── lib/meta-capi.ts
├── lib/email-nurture.ts
├── lib/whatsapp.ts
└── types/lead-qualifier.ts
```

### Fichiers a modifier

```
app/api/webhooks/meta-leads/route.ts    (+ signature validation, + SMS IA trigger)
app/api/webhooks/twilio-sms/route.ts    (+ routing vers AI conversation)
app/api/webhooks/vapi/route.ts          (+ call_results storage)
lib/sms-templates.ts                    (+ templates CASL-compliant)
```

---

*Plan genere le 31 mars 2026 — base sur 22 recherches paralleles (Facebook Ads, Claude API, VAPI, Twilio, CASL, Cloudflare Workers, WhatsApp Business, Supabase Realtime)*

*Prochaine etape: BUILDER. Commencer par Phase 1 (SMS IA Core).*
