# Configuration Changes — Sophie Haie Lite v1.0

## Overview

Adapted Milette Portes et Fenêtres VAPI production assistant (v18.14) for Haie Lite hedge trimming business.

All files written to `/tmp/taillage-fresh/systemes-ia/receptionniste-ia/`

## Files Created / Updated

### 1. **vapi-assistant-config.json** (11 KB)
Complete VAPI assistant configuration in JSON format. Ready to import into VAPI dashboard.

**Key settings:**
- Model: claude-haiku-4-5-20251001 (150 tokens, 0.2 temperature)
- Voice: Cartesia Sonic-3, French, slow speed, positivity emotion
- Transcriber: Speechmatics (French) with custom vocabulary
- Endpointing: 0.5/0.6/2.0 seconds (smart punctuation detection)
- Silence timeout: 130 seconds
- Max duration: 1200 seconds (20 minutes)
- Hooks: 30s check-in (2 tries) + 110s farewell
- Analysis: summary, structured data, success evaluation enabled

### 2. **sophie-prompt-v1.txt** (8.4 KB)
Production-grade prompt in XML format (same structure as Milette v18.14).

**Sections:**
- `<prononciation>` — Name pronunciation rules
- `<identite>` — Role, personality, guidelines
- `<langue>` — Tutoyement, vocabulary, English handling
- `<securite>` — Prompt injection defense
- `<style>` — Max 12 words/phrase, max 2 sentences/response, one Q per response
- `<prix>` — Pricing estimates (1-4 côtés, height multipliers, add-ons)
- `<heures>` — Season (avril-nov), business hours, off-hours handling
- `<outils>` — Tool descriptions and calling patterns
- `<memoire>` — Context awareness (no repeat questions)
- `<routage>` — Escalation logic (angry, complex, emergency, commercial)
- `<qualification>` — 5-step qualification flow
- `<upsell>` — Light upsell (vitres, gouttières) post-booking
- `<zone_service>` — Service areas (Rive-Sud, Vaudreuil, Montréal, Rive-Nord)
- `<infos_haie_lite>` — Company details
- `<cloture>` — Closure and endCall logic
- `<postes>` — Internal routing (Henri, Jean-Samuel, Jean-Michel)
- `<exemples>` — Sample conversations + anti-examples

### 3. **assistant.json** (11 KB) — UPDATED
Same as vapi-assistant-config.json but in native VAPI format. Overwrites existing version.

Changes from previous version:
- Model: claude-sonnet-4-20250514 → claude-haiku-4-5-20251001
- Max tokens: 500 → 150
- Temperature: 0.7 → 0.2
- Voice provider: elevenlabs → cartesia
- Voice model: 21m00Tcm (ElevenLabs) → sonic-3
- Transcriber: deepgram nova-3 → speechmatics
- Endpointing: basic → smart + custom rules
- Hooks: none → 30s check-in + 110s farewell
- Prompt format: free text → XML structured
- Pricing: unavailable → included in prompt

### 4. **tools.json** (3.9 KB) — UPDATED
VAPI tool definitions (availableSlots, bookAppointment, sendSMS, transferCall).

**Tools:**
1. **availableSlots** — Returns 2-3 available appointment slots
2. **bookAppointment** — Creates appointment (name, phone, address, city, hedge type/sides, slot, notes)
3. **sendSMS** — Sends confirmation SMS (to, message)
4. **transferCall** — Routes to Henri (reason: angry_client, complex_quote, emergency, commercial, escalation)

All point to: https://haie-lite-receptionniste.haielite.workers.dev/webhook

### 5. **SETUP-VAPI.md** (8.4 KB) — NEW
Step-by-step deployment guide in French.

**Contents:**
- Architecture preservation checklist
- Model, voice, transcriber, endpointing settings
- 8-step deployment procedure
- Hook configuration (silence + farewell)
- Tool setup instructions
- Webhook URL configuration
- Post-call analysis explanation
- Maintenance & versioning
- Haie Lite-specific notes (pricing, zones, hours, escalation, upsell)
- Change summary table (old vs new)

### 6. **CONFIG-CHANGES.md** (this file)
Summary of all changes and file descriptions.

## Architecture Preservation (Milette v18.14)

### Preserved Exactly
- **Model:** Claude Haiku 4.5 (same as Milette, ultra-fast)
- **Voice provider:** Cartesia Sonic-3 (same, French natural)
- **Transcriber:** Speechmatics (same, Quebec French optimized)
- **Endpointing rules:** 0.5/0.6/2.0 seconds (same)
- **Silence timeout:** 130 seconds (same)
- **Max duration:** 1200 seconds (same)
- **Hooks pattern:** 30s check-in + 110s farewell (same)
- **Stop speaking plan:** numWords 0, voiceSeconds 0.2 (same)
- **Analysis plan:** summary, structured, success (same)
- **Prompt structure:** XML-tagged sections (same)
- **Style rules:** one Q per response, max 12 words/phrase (same)

### Adapted for Haie Lite
- **Company name:** Milette → Taillage Haie Lite
- **Services:** Portes & fenêtres → Taillage de haies (+ vitres, gouttières, engrais)
- **Pricing:** Provided by Milette → Sophie estimates prices
- **Zones:** Milette region → Rive-Sud, Vaudreuil, Montréal, Rive-Nord
- **Season:** Year-round → April-November
- **Escalation contacts:** Updated (Henri, Jean-Samuel)
- **Vocabulary:** Milette-specific → haie, cèdre, taillage, élagage, rabattage, etc.

## Backward Compatibility

Existing webhook handler code remains unchanged:
- `src/index.ts` — Cloudflare Worker entry point
- `src/webhook-handler.ts` — Tool call logic
- `src/handlers/` — Specific tool implementations

The webhook expects the VAPI request format and returns standard responses. Configuration changes only affect the assistant's behavior, not the webhook interface.

## Verification Steps

After deploying to VAPI:

1. **Phone call test:**
   - Sophie introduces herself
   - Asks exactly one question at a time
   - Provides correct pricing estimate
   - availableSlots returns 2-3 slots
   - bookAppointment creates RDV
   - sendSMS delivers confirmation
   - Silence check-in at 30s
   - Farewell at 110s
   - Max call duration 20 min

2. **Prompt verification:**
   - Max 12 words per sentence
   - Max 2 sentences per response
   - Never lists (always one Q)
   - Personalization with first names
   - No forbidden words (frustrant, désagrément, n'hésitez pas, absolument)
   - Uses accented acknowledgments (Parfait, D'accord, Super)

3. **Pricing verification:**
   - 1 côté: "deux cent cinquante à trois cent cinquante dollars"
   - 2 côtés: "trois cent cinquante à cinq cents dollars"
   - 3-4 côtés: "cinq cents à huit cents dollars"
   - Taxes: "environ quinze pour cent de plus"

## Next Steps

1. Create VAPI assistant from `vapi-assistant-config.json`
2. Verify Cartesia voice ID availability
3. Assign phone number from VAPI pool
4. Test with live calls
5. Monitor analysis reports for success metrics
6. Update webhook endpoint (already configured)

## Notes

- Sophie does NOT pretend to be human beyond normal conversation
- All tool calls happen silently (parameters not spoken)
- Prompt is production-ready, tested structure from Milette
- Tokens are strictly limited (150 max) for <200ms latency
- French Quebec accent preserved throughout
- No English code comments expected (full French system prompt)

---

**Last updated:** 31 March 2026
**Version:** 1.0-haie-lite (Milette v18.14 adapted)
**Maintainer:** Taillage Haie Lite inc.
