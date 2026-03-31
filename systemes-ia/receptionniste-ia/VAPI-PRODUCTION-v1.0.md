# Sophie — Haie Lite VAPI Production v1.0

**Adapted from Milette Portes et Fenêtres VAPI Assistant v18.14**

## Quick Start

1. Open [https://vapi.ai](https://vapi.ai) Dashboard
2. "Create New Assistant" → Import JSON from `vapi-assistant-config.json`
3. Verify Cartesia Sonic-3 voice ID in voice section
4. Add 4 tools from `tools.json`
5. Assign phone number
6. Test with live call

## Files in this Directory

| File | Size | Purpose |
|------|------|---------|
| **vapi-assistant-config.json** | 11 KB | Complete VAPI config — import this |
| **sophie-prompt-v1.txt** | 8.4 KB | XML-structured prompt (v1.0-haie-lite) |
| **assistant.json** | 11 KB | Same as above, native VAPI format |
| **tools.json** | 3.9 KB | 4 tools: availableSlots, bookAppointment, sendSMS, transferCall |
| **SETUP-VAPI.md** | 8.4 KB | Detailed deployment guide (French) |
| **CONFIG-CHANGES.md** | 9 KB | Summary of architecture & changes |
| **VAPI-PRODUCTION-v1.0.md** | This file | Index & quick reference |

## Architecture at a Glance

| Component | Provider | Setting |
|-----------|----------|---------|
| **LLM** | Anthropic | claude-haiku-4-5-20251001 |
| **Tokens** | — | 150 max (ultra-fast) |
| **Temperature** | — | 0.2 (deterministic) |
| **Voice** | Cartesia | Sonic-3, French, slow, positivity |
| **Transcriber** | Speechmatics | French (Quebec optimized) |
| **Endpointing** | Smart + custom | 0.5/0.6/2.0 sec rules |
| **Silence timeout** | — | 130 sec (with 30s check-in) |
| **Max call** | — | 1200 sec (20 min) |
| **Webhook** | VAPI → Worker | https://haie-lite-receptionniste.haielite.workers.dev/webhook |

## Prompt Style Rules

- **One question per response** (no lists, no multi-asks)
- **Max 12 words per sentence**
- **Max 2 sentences per response**
- **Personalize with first names** ("Parfait Jean", "Merci Marie")
- **Vary acknowledgments:** "Parfait", "D'accord", "Super" (never just "Oui")
- **No forbidden words:** frustrant, désagrément, n'hésitez pas, absolument
- **Avoid jargon:** say "notre équipe" not "crew"
- **Tutoyement by default** (unless client vouvoies)

## Qualification Flow (5 steps)

1. **Service:** "C'est pour du taillage de haies?"
2. **Location:** "C'est dans quel coin?"
3. **Sides:** "Combien de côtés de haie?"
4. **Name:** "Ton nom?"
5. **Phone:** "Ton numéro de téléphone?"

→ Once all 5 info collected → estimation → availableSlots → bookAppointment → sendSMS → closure

## Pricing (Sophie can estimate)

- 1 côté: 250–350$
- 2 côtés: 350–500$
- 3–4 côtés: 500–800$
- Very high (>3m): +50–80%
- Rejuvenation: 800–1500$+
- Window wash: 150$+
- Gutters: 100$+

Always say: "C'est une estimation. Le prix final dépend de la hauteur et de l'accès."

## Tools

| Tool | When | Params | Action |
|------|------|--------|--------|
| **availableSlots** | Client interested | preferredDate?, preferredTime? | Returns 2–3 slots |
| **bookAppointment** | Client confirms slot | name, phone, city, sides, slot, notes? | Creates RDV |
| **sendSMS** | After booking | to, message | Sends confirmation |
| **transferCall** | Need escalation | reason (enum), destination? | Routes to Henri |

All tools call webhook: `https://haie-lite-receptionniste.haielite.workers.dev/webhook`

## Escalation Logic

| Situation | Tool Call | Destination |
|-----------|-----------|-------------|
| Client angry | transferCall(angry_client) | Henri (514-813-8957) |
| Quote >$5000 | transferCall(complex_quote) | Henri |
| Tree removal request | transferCall(complex_quote) | Henri |
| >20 haies, municipal | transferCall(commercial) | Henri |
| Emergency (branch fell) | transferCall(emergency) | Henri |
| Human request | transferCall(escalation) | Henri |

Default destination: Henri Joannette (514-813-8957)

## Hooks

**30 second silence check-in** (2 attempts):
```
"T'es toujours là?"
"Je suis encore là si t'as des questions."
```

**110 second farewell:**
```
"Je vais raccrocher. N'hésite pas à rappeler! Bonne journée!"
→ endCall
```

## Service Areas

- **Rive-Sud:** Longueuil, Brossard, Candiac, Châteauguay, La Prairie, Saint-Constant, Saint-Hubert, Greenfield Park
- **Vaudreuil:** Vaudreuil, Dorion, Île-Perrot, Pincourt, Saint-Lazare, Hudson
- **Montréal West:** Lachine, Dorval, Pointe-Claire, Kirkland
- **Rive-Nord (May 2026):** Laval, Blainville, Rosemère

**Out of zone?** "On ne couvre pas encore ce secteur. Je peux prendre tes coordonnées au cas où on s'étend."

## Operating Hours

- **Season:** April – November
- **Office:** Mon–Fri, 8am–5pm
- **Field:** Mon–Fri, 7am–5pm
- **Off-season:** "On te rappelle dès le début de la saison."
- **Off-hours:** "On est fermés pour aujourd'hui. Ton nom et numéro? On te rappelle demain matin."

## Upsell (Optional, Post-Booking)

**Once per call, before closure:**
"En passant, on offre aussi le lavage de vitres et le nettoyage de gouttières. Tu veux que je note ça pour une soumission?"

- If yes: Add to booking notes
- If no: "Pas de souci!" → Closure
- **Never pushy.** One mention only.

## Closure

**When to trigger endCall:**
- After bookAppointment + SMS (appointment confirmed)
- Client says "c'est tout", "non merci", "bonne journée"
- FAQ complete
- Client asks to hang up

**Last message:**
"Merci d'avoir appelé chez Haie Lite! Bonne journée!"
→ endCall
→ Total silence after

**Friday afternoon variant:**
"Merci d'avoir appelé chez Haie Lite! Bonne fin de semaine!"

## Voice Settings

- **Provider:** Cartesia
- **Model:** Sonic-3
- **Language:** French (fr)
- **Tone:** Slow speed, high positivity emotion
- **Filler injection:** Disabled
- **Backchanneling:** Disabled

_(Find a female French voice ID in Cartesia voice list)_

## Transcription

- **Provider:** Speechmatics
- **Language:** French
- **Custom vocabulary:**
  ```
  Haie Lite, haie, cèdre, taillage, élagage, rabattage,
  Vaudreuil, Longueuil, Brossard, Candiac, Châteauguay,
  gouttières, Henri, ServiceM8, Rive-Sud
  ```

## Post-Call Analysis

VAPI automatically generates after endCall:
- **Summary:** Textual recap of conversation
- **Structured Data:** Name, phone, type, sides, slot booked, services added
- **Success Evaluation:** Did appointment book? SMS sent? Goal achieved?

Results sent to webhook or configured URL.

## Deployment Checklist

- [ ] Create assistant on VAPI from JSON
- [ ] Verify Cartesia Sonic-3 voice ID exists
- [ ] Add 4 tools (availableSlots, bookAppointment, sendSMS, transferCall)
- [ ] Configure silence hooks (30s, 110s)
- [ ] Add custom transcription vocabulary
- [ ] Assign phone number (514 or 438 area code)
- [ ] Test with live call:
  - [ ] One Q per response?
  - [ ] Pricing estimates correct?
  - [ ] Slots returned?
  - [ ] RDV bookable?
  - [ ] SMS confirmation sent?
  - [ ] Silence check-in at 30s?
  - [ ] Farewell at 110s?
- [ ] Monitor first 5 calls for analysis

## Maintenance

### Updating Prompt
1. Edit `sophie-prompt-v1.txt`
2. Copy new content to VAPI Dashboard
3. Save → Auto-version
4. Next calls use updated prompt

### Versioning
- **Current:** v1.0-haie-lite (31 March 2026)
- **Baseline:** Milette v18.14 (adapted)
- **Token budget:** 150 max (non-negotiable for latency)
- **Release cadence:** Bi-weekly (same as Milette)

### Monitoring
- Call duration (target: 3–7 min for RDV)
- SMS delivery rate (target: 100%)
- Appointment success rate (target: >90%)
- Escalation rate (target: <10%)
- Transcription accuracy (WER target: <5%)

## Troubleshooting

### Sophie repeats questions
**Cause:** Prompt not loaded correctly.
**Fix:** Verify prompt content in VAPI Dashboard → System Prompt. Ensure XML tags present.

### Phone numbers not recognized
**Cause:** Speechmatics without custom vocabulary.
**Fix:** Add `\d{3}[-.]?\d{3}[-.]?\d{4}` to custom vocab and endpointing rules.

### Too many/few slots returned
**Cause:** Webhook handler logic or calendar sync.
**Fix:** Check `availableSlots` implementation in `src/handlers/`. Verify date formatting ISO 8601.

### Tools not called
**Cause:** Model refusing to call (temp too high or prompt unclear).
**Fix:** Verify temperature = 0.2 and max tokens = 150. Check prompt XML syntax.

### Webhook timeout
**Cause:** Cloudflare Worker delayed or offline.
**Fix:** Check deployment status. Ensure `wrangler deploy` succeeded. Monitor logs at https://dash.cloudflare.com

## Support

- **VAPI Docs:** https://docs.vapi.ai
- **Cartesia Docs:** https://cartesia.ai/
- **Speechmatics Docs:** https://speechmatics.com/
- **Anthropic Claude:** https://docs.anthropic.com
- **Internal:** Config preserved from Milette, same architecture

## Company Info

- **Name:** Taillage Haie Lite inc.
- **Phone:** 450-280-3222
- **Website:** taillagehaielite.com
- **Google Rating:** 5 stars
- **Founded:** 2023
- **Expansion:** Rive-Nord (May 2026)

---

**Configuration Version:** 1.0-haie-lite
**Adapted from:** Milette Portes et Fenêtres VAPI v18.14
**Last Updated:** 31 March 2026
**Maintainer:** Taillage Haie Lite inc.

For detailed deployment steps, see **SETUP-VAPI.md**.
For change summary, see **CONFIG-CHANGES.md**.
