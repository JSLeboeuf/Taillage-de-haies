================================================================================
Sophie - Haie Lite VAPI Production Configuration v1.0
Adapted from Milette Portes et Fenêtres VAPI Assistant v18.14
Last Updated: 31 March 2026
================================================================================

PRODUCTION FILES CREATED/UPDATED:

1. vapi-assistant-config.json (11 KB)
   → Complete VAPI configuration in JSON format
   → Ready to import directly into VAPI dashboard
   → Contains: model, voice, transcriber, hooks, analysis plan

2. sophie-prompt-v1.txt (8.2 KB)
   → Production XML-structured prompt (v1.0-haie-lite)
   → Sections: prononciation, identite, langue, style, prix, heures, outils,
     memoire, routage, qualification, upsell, zone_service, cloture
   → One question per response (CRITICAL rule)
   → Max 12 words per sentence, max 2 sentences per response

3. assistant.json (11 KB) — UPDATED
   → Same config as vapi-assistant-config.json
   → Native VAPI format
   → Replaces previous version (was using Sonnet, now uses Haiku 4.5)

4. tools.json (3.8 KB) — UPDATED
   → 4 VAPI tools: availableSlots, bookAppointment, sendSMS, transferCall
   → All webhook to: https://haie-lite-receptionniste.haielite.workers.dev/webhook
   → Replaces previous version (improved parameter definitions)

5. SETUP-VAPI.md (8.2 KB)
   → Step-by-step deployment guide (French)
   → 8-step deployment procedure
   → Hook configuration details
   → Tool setup instructions
   → Maintenance & monitoring guide

6. CONFIG-CHANGES.md (6.9 KB)
   → Summary of architecture changes vs previous version
   → What was preserved from Milette
   → What was adapted for Haie Lite
   → Backward compatibility notes

7. VAPI-PRODUCTION-v1.0.md (8.9 KB)
   → Quick reference guide
   → Architecture at a glance
   → Prompt style rules summary
   → Qualification flow, pricing, tools, escalation
   → Deployment checklist, troubleshooting

8. README-PRODUCTION-v1.txt (this file)
   → Overview and critical checklist

================================================================================
KEY ARCHITECTURE (PRESERVED FROM MILETTE v18.14)
================================================================================

MODEL:
  Provider: Anthropic
  Model: claude-haiku-4-5-20251001
  Max Tokens: 150 (CRITICAL — latency must be <200ms)
  Temperature: 0.2 (deterministic)

VOICE:
  Provider: Cartesia
  Model: Sonic-3
  Language: French
  Speed: slow
  Emotion: positivity:high
  Filler injection: disabled

TRANSCRIBER:
  Provider: Speechmatics
  Language: French (Quebec optimized)
  Custom vocabulary: Haie Lite, haie, cèdre, taillage, élagage, etc.

ENDPOINTING (speech detection):
  Punctuation: 0.5 sec
  No punctuation: 0.6 sec
  Numbers (phone): 2.0 sec
  Smart endpointing: enabled

SILENCE HANDLING:
  Check-in: 30 seconds (2 tries with variations)
  Farewell: 110 seconds (endCall triggered)
  Global timeout: 130 seconds

CALL DURATION:
  Max: 1200 seconds (20 minutes)

HOOKS:
  - 30s silence check-in: "T'es toujours là?" / "Je suis encore là..."
  - 110s farewell: "Je vais raccrocher. N'hésite pas à rappeler! Bonne journée!" → endCall

ANALYSIS:
  - Summary plan: enabled
  - Structured data plan: enabled
  - Success evaluation plan: enabled

================================================================================
CRITICAL PROMPT RULES FOR VOICE
================================================================================

1. ONE QUESTION PER RESPONSE (absolutely non-negotiable)
   ✗ "Combien de côtés et quelle hauteur?"
   ✓ "Combien de côtés?"

2. MAX 12 WORDS PER SENTENCE
   ✗ "Parfait, je vais vérifier la disponibilité dans notre système"
   ✓ "Parfait! Laisse-moi vérifier les disponibilités."

3. MAX 2 SENTENCES PER RESPONSE
   ✗ "Excellent! Pour deux côtés standard c'est autour de quatre cents dollars. Tu aimerais ça quand? On a des créneaux demain ou jeudi."
   ✓ "Excellent! C'est autour de quatre cents dollars. Quand tu aimerais ça?"

4. PERSONALIZE WITH FIRST NAMES
   "Merci Jean", "Parfait Marie", "D'accord François"

5. NEVER LIST
   ✗ "On peut faire 1. cèdre, 2. feuillue, 3. mixte"
   ✓ "C'est du cèdre ou un autre type de haie?"

6. VARY ACKNOWLEDGMENTS
   Rotate between: "Parfait", "D'accord", "Super", "D'accord!"
   ✗ "Oui."
   ✓ "Parfait!" (then ask next Q)

7. NO FORBIDDEN WORDS
   Never use: "frustrant", "désagrément", "n'hésitez pas", "absolument"

8. TUTOYEMENT BY DEFAULT
   "C'est dans quel coin?" (not "Pouvez-vous me dire...")
   (Adapt if client vouvoies)

================================================================================
QUALIFICATION FLOW (5 STEPS MAX)
================================================================================

1. SERVICE CONFIRMATION
   Q: "C'est pour du taillage de haies?"
   Wait for response

2. LOCATION
   Q: "C'est dans quel coin?"
   Validate: In service area? (Rive-Sud, Vaudreuil, MTL west, Rive-Nord)
   
3. SIDES
   Q: "Combien de côtés de haie?"
   Accept: 1, 2, 3, 4+

4. NAME
   Q: "Ton nom?"
   Confirm spelling once if ambiguous

5. PHONE
   Q: "Ton numéro de téléphone?"
   Validate: 10 digits (no dashes spoken)

→ Once all 5 + any spontaneous info (height, type, address) collected:

ESTIMATION: "Pour [X] côtés de [type], tu regardes autour de [price]$ avant taxes."

availableSlots → Present 2-3 options

bookAppointment → Client confirms slot

sendSMS → Confirmation text

UPSELL (optional): "En passant, on offre aussi lavage de vitres et gouttières?"

CLOSURE: "Merci d'avoir appelé chez Haie Lite! Bonne journée!" → endCall

================================================================================
PRICING ESTIMATES (Sophie can provide)
================================================================================

1 côté standard:        250-350$
2 côtés:               350-500$
3-4 côtés (corner):    500-800$
Very high (>3m):       +50-80%
Rejuvenation:          800-1500$+
Window wash:           150$+
Gutters:               100$+

Template: "Pour deux côtés standard, tu regardes autour de quatre cents dollars avant taxes."
Always add: "C'est une estimation. Le prix final dépend de la hauteur et de l'accès."
Taxes: "TPS 5% plus TVQ 10%, ça ajoute environ 15% au total."

================================================================================
TOOLS
================================================================================

1. availableSlots(preferredDate?, preferredTime?)
   → Returns 2-3 available appointment slots
   → Called after Sophie mentions booking interest
   → Presents options naturally: "J'ai demain à 10h, ou jeudi matin à 9h. Lequel?"

2. bookAppointment(clientName, phone, address?, city, hedgeType?, hedgeSides, hedgeHeight?, selectedSlot, notes?)
   → Creates appointment in system
   → Called once client confirms slot
   → Required: name, phone, city, sides, selectedSlot
   → Optional: address, hedgeType, hedgeHeight, notes

3. sendSMS(to, message)
   → Sends confirmation text
   → Called immediately after bookAppointment success
   → Message template: "Sophie de Haie Lite confirme ton RDV: [date] [time] au [address]. À bientôt!"

4. transferCall(reason, destination?)
   → Escalates to Henri (default: 514-813-8957)
   → Reasons:
     * angry_client — Customer upset
     * complex_quote — Quote >5000$, tree removal
     * emergency — Urgent (branch fell)
     * commercial — Bulk order, municipal, strata
     * escalation — General "put me with a human"

All tools call: https://haie-lite-receptionniste.haielite.workers.dev/webhook

================================================================================
ESCALATION TRIGGERS
================================================================================

Angry client → "Je te transfère tout de suite." → transferCall(angry_client)
Complex quote → "Pour ça, je te mets avec quelqu'un d'expérience." → transferCall(complex_quote)
Emergency → "Je te transfère tout de suite." → transferCall(emergency)
Commercial → "Je te transfère à notre directeur." → transferCall(commercial)
Human request → "Bien sûr, je te transfère." → transferCall(escalation)

Internal directory (NEVER read numbers to client):
- Henri Joannette (terrain, ops) — 514-813-8957
- Jean-Samuel Leboeuf (director) — 450-280-3222
- Jean-Michel (marketing)

================================================================================
SERVICE AREAS
================================================================================

RIVE-SUD:
  Longueuil, Brossard, Saint-Constant, Candiac, Châteauguay,
  La Prairie, Saint-Hubert, Greenfield Park

VAUDREUIL AREA:
  Vaudreuil, Dorion, Île-Perrot, Pincourt, Saint-Lazare, Hudson

MONTREAL WEST:
  Lachine, Dorval, Pointe-Claire, Kirkland

RIVE-NORD (May 2026):
  Laval, Blainville, Rosemère

OUT OF ZONE:
  "On ne couvre pas encore ce secteur. Je peux prendre tes coordonnées au cas où on s'étend."

================================================================================
OPERATING HOURS
================================================================================

SEASON: April – November
OFFICE: Mon–Fri, 8am–5pm
FIELD: Mon–Fri, 7am–5pm

OFF-SEASON (Dec–Mar):
  "On te rappelle dès le début de la saison."

OFF-HOURS:
  "On est fermés pour aujourd'hui. Ton nom et numéro? On te rappelle demain matin."
  → Take info → bookAppointment → endCall

================================================================================
DEPLOYMENT CHECKLIST
================================================================================

VAPI SETUP:
  □ Create new assistant on https://vapi.ai
  □ Import vapi-assistant-config.json (or paste as JSON)
  □ Verify Cartesia Sonic-3 voice ID exists
  □ Verify Speechmatics transcriber with French vocabulary
  □ Add 4 tools from tools.json
  □ Configure silence hooks (30s check-in + 110s farewell)
  □ Assign phone number (514 or 438 area code preferred)
  □ Verify webhook URL: https://haie-lite-receptionniste.haielite.workers.dev/webhook

TESTING (first 5 calls):
  □ Sophie introduces: "Taillage Haie Lite, bonjour! C'est Sophie..."
  □ Asks one question at a time
  □ Provides correct pricing estimate
  □ availableSlots returns 2-3 crenel options
  □ bookAppointment confirms RDV
  □ sendSMS delivers confirmation text
  □ Silence check-in triggers at ~30 sec
  □ Farewell triggers at ~110 sec
  □ Call ends cleanly (no blank silence)
  □ Analysis shows: name, phone, hedgeType, sides, slot, success

MONITORING:
  □ Call duration (target: 3-7 min for successful RDV)
  □ SMS delivery rate (target: 100%)
  □ Appointment booking rate (target: >90%)
  □ Escalation rate (target: <10%)
  □ Transcription accuracy (WER <5%)

================================================================================
WEBHOOK INTEGRATION
================================================================================

The webhook receives VAPI tool calls:

Request format:
{
  "messageId": "msg_...",
  "toolUse": {
    "toolName": "availableSlots|bookAppointment|sendSMS|transferCall",
    "toolUseId": "...",
    "input": { /* parameters */ }
  },
  "conversation": [ /* chat history */ ]
}

Response format:
{
  "result": "string response to Sophie",
  "error": null,
  "data": { /* optional structured response */ }
}

Implementation: src/webhook-handler.ts (unchanged)

================================================================================
MAINTENANCE & MONITORING
================================================================================

UPDATING PROMPT:
  1. Edit sophie-prompt-v1.txt
  2. Copy new content to VAPI Dashboard → System Prompt
  3. Save → Auto-version applied
  4. Next calls use updated prompt

VERSIONING:
  Current: v1.0-haie-lite (31 March 2026)
  Baseline: Milette v18.14
  Max tokens: 150 (non-negotiable)
  Release cycle: Bi-weekly updates

POST-CALL ANALYSIS:
  VAPI provides automatically after endCall:
  - Summary: Text recap
  - Structured data: Name, phone, services, success
  - Success evaluation: Did we book? Did SMS send?

LOGS:
  Access via VAPI Dashboard:
  - Call duration
  - Transcription accuracy (WER)
  - Tool response times
  - Errors/failures
  - Analysis results

================================================================================
TROUBLESHOOTING
================================================================================

"Sophie repeats the same question"
→ Prompt not loaded. Check VAPI Dashboard System Prompt. Ensure XML tags.

"Phone numbers aren't recognized"
→ Add to Speechmatics custom vocabulary: "\d{3}[-.]?\d{3}[-.]?\d{4}"

"Tools not being called"
→ Check temp=0.2, maxTokens=150. Verify prompt XML syntax. Check hook syntax.

"Webhook timeout"
→ Check Cloudflare deployment: wrangler deploy
→ Verify URL endpoint responding: curl https://haie-lite-receptionniste.haielite.workers.dev/webhook

"Sophie takes too long to respond"
→ Token limit exceeded. Ensure maxTokens = 150 (not higher). Check voice latency.

"Silence detection missing"
→ Verify hooks in assistant config. Check endpointingPlan settings.

================================================================================
DOCUMENTATION REFERENCES
================================================================================

DEPLOYMENT:
  → See SETUP-VAPI.md (detailed 8-step guide)

QUICK REFERENCE:
  → See VAPI-PRODUCTION-v1.0.md (checklists, troubleshooting)

CHANGES SUMMARY:
  → See CONFIG-CHANGES.md (vs previous version)

PROMPT CONTENT:
  → See sophie-prompt-v1.txt (full XML structure)

CONFIG SPECS:
  → See vapi-assistant-config.json (full JSON)
  → See assistant.json (alternate format)

TOOLS:
  → See tools.json (all 4 tool definitions)

================================================================================
COMPANY INFO
================================================================================

Name: Taillage Haie Lite inc.
Phone: 450-280-3222
Website: taillagehaielite.com
Google Rating: 5 stars
Founded: 2023
Expansion: Rive-Nord (May 2026)

Internal Contacts:
- Henri Joannette (Terrain/Ops): 514-813-8957
- Jean-Samuel Leboeuf (Director): 450-280-3222
- Jean-Michel (Marketing)

================================================================================
SUPPORT
================================================================================

VAPI Documentation: https://docs.vapi.ai
Cartesia Voice: https://cartesia.ai/
Speechmatics: https://speechmatics.com/
Claude Haiku: https://anthropic.com/news/claude-haiku
Milette Reference: Same architecture (v18.14)

Internal: Check /tmp/taillage-fresh/systemes-ia/receptionniste-ia/ for all configs

================================================================================
SUMMARY
================================================================================

Sophie v1.0 is PRODUCTION-READY.

All files created in: /tmp/taillage-fresh/systemes-ia/receptionniste-ia/

To deploy:
1. Open https://vapi.ai
2. Import vapi-assistant-config.json
3. Assign phone number
4. Test with live call
5. Monitor analysis reports

Start date: 31 March 2026
Version: 1.0-haie-lite
Status: Ready for production

================================================================================
