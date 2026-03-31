# Sophie AI Receptionist — File Index

Complete file listing and description.

## Core Files

### Configuration & Setup

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies & scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `wrangler.toml` | Cloudflare Workers configuration |
| `.gitignore` | Git ignore rules |
| `deploy.sh` | Deployment script (chmod +x) |

### VAPI Integration

| File | Purpose |
|------|---------|
| `assistant.json` | Complete VAPI assistant configuration (LLM, voice, tools) |
| `tools.json` | VAPI function tools schema (availableSlots, bookAppointment, sendSMS, transferCall) |
| `sophie-prompt.txt` | Sophie's system prompt in French-Canadian (personality, workflow, rules) |

### Source Code

| File | Purpose |
|------|---------|
| `src/index.ts` | Cloudflare Worker entry point (routes, CORS, health check) |
| `src/webhook-handler.ts` | Tool handler implementation (all 4 functions) |

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Complete system architecture & reference |
| `QUICKSTART.md` | 5-minute setup guide (TL;DR) |
| `INTEGRATION.md` | Detailed VAPI integration walkthrough |
| `EXAMPLES.md` | Curl webhook request/response examples |
| `INDEX.md` | This file (file listing) |

## Generated Files (auto-created)

| Directory | Purpose |
|-----------|---------|
| `node_modules/` | npm dependencies (gitignored) |
| `dist/` | Built CloudFlare worker bundle |
| `.wrangler/` | Wrangler cache & logs |

## Deployment Artifacts

After running `npm run build` or `./deploy.sh`:
- `dist/index.js` — Compiled worker code
- `dist/index.js.map` — Source map for debugging

## Quick Reference

### File Structure
```
receptionniste-ia/
├── src/
│   ├── index.ts                  (Worker entry)
│   └── webhook-handler.ts        (Tool implementation)
├── assistant.json                (VAPI config)
├── tools.json                    (VAPI tools schema)
├── sophie-prompt.txt             (System prompt)
├── package.json                  (Dependencies)
├── tsconfig.json                 (TypeScript config)
├── wrangler.toml                 (Cloudflare config)
├── deploy.sh                     (Deploy script)
├── README.md                     (Main docs)
├── QUICKSTART.md                 (Setup guide)
├── INTEGRATION.md                (VAPI setup)
├── EXAMPLES.md                   (Webhook examples)
└── INDEX.md                      (This file)
```

### Key Functions

#### Webhook Handler (`src/webhook-handler.ts`)

**Tools:**
1. `availableSlots(preferredDate?, preferredTime?)` → Returns 2-3 appointment slots
2. `bookAppointment(clientName, phone, ...)` → Creates job estimate & returns confirmation
3. `sendSMS(to, message)` → Sends SMS via Twilio
4. `transferCall(reason, destination?)` → Escalates to Henry

**Utilities:**
- `generateAvailableSlots()` — Creates ISO-formatted slots (weekdays only, 8am-5pm)
- `calculateEstimate()` — Computes hedge trimming price based on type, sides, height
- `isValidQuebecPhone()` — Validates 514/438/450/579/819/873/418/581/367 area codes
- `formatPhoneForSMS()` — Converts to +1XXXXXXXXXX format

#### Worker Routes (`src/index.ts`)

- `GET /` → Health check (`{status: "ok", ...}`)
- `POST /webhook` → VAPI webhook handler
- `GET /unknown` → 404 with endpoint list

### Pricing Formula

```
Base rate per meter: $12.50 (cèdre) to $14.00 (feuillue)
Height multiplier:   1.0 (basse) → 2.2 (très-haute)
Sides multiplier:    1.0 (first) + 0.65 (each additional)
Markups:             +20% (top trimming) + 15% (cleanup)
Minimum:             $250
Rounding:            To nearest $5
```

Examples:
- 1 side, moyenne: $250
- 2 sides, moyenne: $320
- 2 sides, haute: $410
- 4 sides, moyenne: $570

## Scripts

```bash
npm install              # Install dependencies
npm run type-check      # TypeScript type checking
npm run build           # Build for Cloudflare
npm run dev             # Local development (wrangler dev)
npm run deploy          # Deploy to Cloudflare
./deploy.sh             # Deploy + show instructions
```

## Deployment Checklist

- [ ] `npm install` — Install dependencies
- [ ] `npm run type-check` — Verify no TypeScript errors
- [ ] `npx wrangler login` — Authenticate with Cloudflare
- [ ] `npm run build` — Build the worker
- [ ] `npx wrangler deploy` — Deploy to production
- [ ] `curl https://haie-lite-receptionniste.haielite.workers.dev/` — Verify health
- [ ] Set Twilio secrets (if using SMS)
- [ ] Create VAPI assistant with config from `assistant.json`
- [ ] Add webhook URL to VAPI assistant
- [ ] Test call in VAPI simulator
- [ ] Assign phone number to assistant
- [ ] Test with real phone call

## Environment Variables

Set via `npx wrangler secret put KEY`:
- `TWILIO_ACCOUNT_SID` — Your Twilio account ID
- `TWILIO_AUTH_TOKEN` — Your Twilio auth token
- `TWILIO_PHONE_NUMBER` — SMS sender phone (e.g., +1-514-555-1234)
- `SERVICEM8_TOKEN` — ServiceM8 API token (for future integration)

## Support Files

- `CHATBOT-ENHANCEMENTS-MARCH-2026.md` — Related chatbot project notes
- Sister project: `chatbot-guatemalteques/` — Groq-based chatbot in Cloudflare

## Integration Points

### Inputs
- VAPI webhook (function-call events)
- Client voice data (via VAPI transcriber)

### Outputs
- Appointment bookings (future: ServiceM8 API)
- SMS confirmations (Twilio)
- Call transfers (VAPI)

### Future Integrations
- ServiceM8 API — Create companies & jobs
- Google Calendar — Sync appointments
- Stripe — Payment collection
- Email API — Follow-up sequences

## Notes

- All times in ISO 8601 format (YYYY-MM-DD, HH:MM)
- All prices in CAD
- All phone numbers follow North American numbering (1-XXX-XXX-XXXX)
- Quebec phone area codes: 514, 438, 450, 579, 819, 873, 418, 581, 367
- Service area: Rive-Sud, Vaudreuil-Dorion, Longueuil, Brossard, Montréal, etc.

## Support

- Check webhook logs: `npx wrangler tail --follow`
- View VAPI call history for webhook requests/responses
- Test webhook locally: `npm run dev` then curl to `http://localhost:8787/webhook`
- Full docs: See `README.md`
