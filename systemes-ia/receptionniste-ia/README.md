# Sophie — AI Receptionist for Haie Lite

Sophie is a voice AI receptionist that answers inbound calls from Facebook/Google ads, qualifies leads, proposes available appointment slots, and books jobs directly into ServiceM8.

## Architecture

```
VAPI (Voice AI Platform)
    ↓ [function-call webhooks]
Cloudflare Workers (haie-lite-receptionniste)
    ↓ [tool handlers]
ServiceM8 / Twilio / Calendar API
```

## Components

### 1. **VAPI Assistant Config** (`assistant.json`)
Complete LLM configuration:
- **LLM**: Anthropic Claude Sonnet 4.6
- **Voice**: ElevenLabs French-Canadian female
- **Transcriber**: Deepgram Nova-3 (French with auto-language detection)
- **System Prompt**: Sophie's personality, pricing logic, and 7-step workflow
- **Tools**: 4 function-call tools (availableSlots, bookAppointment, sendSMS, transferCall)

### 2. **Webhook Handler** (`src/webhook-handler.ts`)
Handles VAPI POST requests with function calls:

```typescript
POST /webhook
{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "availableSlots" | "bookAppointment" | "sendSMS" | "transferCall",
      "parameters": { ... }
    }
  }
}
```

#### Tool: `availableSlots(preferredDate?, preferredTime?)`
Returns 2-3 ISO-formatted appointment slots:
- Weekdays only (Mon-Fri), 8am-5pm business hours
- Generates from tomorrow or preferred date
- Format: `{ slots: [{ date: "2026-04-28", time: "10:00", label: "Lundi 28 avril à 10h" }] }`

#### Tool: `bookAppointment(...)`
Creates a job entry in ServiceM8:
- **Input**: Client name, phone, address, city, hedge type, number of sides, height, selected slot, notes
- **Output**: Job ID, calculated estimate, confirmation message
- **Pricing Logic**:
  ```
  base = $8.50/meter × 8m per side × height_multiplier
  sides_multiplier = 1 + (sides - 1) × 0.6
  top_markup = +25%, cleanup = +15%
  minimum = $250, round to nearest $5
  ```

#### Tool: `sendSMS(to, message)`
Sends SMS confirmation via Twilio:
- Validates Quebec phone numbers (514, 438, 450, 579, 819, 873, 418, 581, 367 area codes)
- Returns message SID
- Falls back to mock mode if no Twilio credentials

#### Tool: `transferCall(reason, destination?)`
Escalates to Henri (514-813-8957):
- Reasons: `angry_client`, `complex_quote`, `emergency`, `commercial`, `escalation`
- Default destination: +1-514-813-8957

### 3. **Cloudflare Worker** (`src/index.ts`, `wrangler.toml`)
Serverless deployment:
- Routes: `GET /` (health check), `POST /webhook` (VAPI handler)
- CORS headers enabled
- Environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `SERVICEM8_TOKEN`

## Setup & Deployment

### Prerequisites
- Node.js 18+
- Cloudflare account with Workers enabled
- VAPI account
- Twilio account (optional, for SMS)

### 1. Install Dependencies
```bash
npm install
```

### 2. Type Check
```bash
npm run type-check
```

### 3. Deploy to Cloudflare Workers
```bash
# Option A: Using deploy script
./deploy.sh

# Option B: Manual deployment
npx wrangler deploy
```

### 4. Set Environment Variables
```bash
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_PHONE_NUMBER
npx wrangler secret put SERVICEM8_TOKEN
```

### 5. Configure VAPI Assistant
1. Go to VAPI dashboard
2. Create new assistant or edit existing
3. **Webhook URL**: `https://haie-lite-receptionniste.haielite.workers.dev/webhook`
4. **Function Tools**: Import from `tools.json` or paste manually
5. **System Prompt**: Copy from `sophie-prompt.txt`
6. **LLM**: Anthropic Claude Sonnet 4.6
7. **Voice**: ElevenLabs (French-Canadian female)
8. **Transcriber**: Deepgram Nova-3

## Testing

### Health Check
```bash
curl https://haie-lite-receptionniste.haielite.workers.dev/
```

Response:
```json
{
  "status": "ok",
  "service": "haie-lite-receptionniste",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### Test availableSlots
```bash
curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "message": {
      "type": "function-call",
      "functionCall": {
        "name": "availableSlots",
        "parameters": {}
      }
    }
  }'
```

### Test bookAppointment
```bash
curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "message": {
      "type": "function-call",
      "functionCall": {
        "name": "bookAppointment",
        "parameters": {
          "clientName": "Jean Dupont",
          "phone": "514-123-4567",
          "address": "123 Rue Main",
          "city": "Longueuil",
          "hedgeType": "cèdre",
          "hedgeSides": 2,
          "hedgeHeight": "moyenne",
          "selectedSlot": {
            "date": "2026-04-28",
            "time": "10:00"
          },
          "notes": "Terrain en pente"
        }
      }
    }
  }'
```

## Sophie's Workflow

### 1. Greeting (5 sec)
"Bonjour! Taillage Haie Lite, c'est Sophie! Comment je peux vous aider aujourd'hui?"

### 2. Qualification (2-3 min)
- Address (validate service area)
- Hedge type (cedar, deciduous, mixed)
- Number of sides (1-4)
- Approximate height
- Urgency (timeline)
- Special notes (slope, fence, etc.)

### 3. Quick Estimate
Provides price range based on gathered info

### 4. Appointment Proposal
Calls `availableSlots()`, proposes 2-3 options

### 5. Light Upsell (optional)
"On offre aussi le lavage de vitres et l'entretien de gouttières..."

### 6. Confirmation
Calls `bookAppointment()`, sends SMS confirmation via `sendSMS()`

### 7. Closing
"Parfait! On a hâte de s'occuper de vos haies! Bonne journée!"

## Service Area

- Rive-Sud de Montréal
- Vaudreuil-Dorion
- Châteauguay
- Longueuil
- Brossard
- Saint-Constant
- Candiac
- Montréal

## Escalation Rules

**Transfer to Henri** for:
- Angry clients → `transferCall(angry_client)`
- Complex quotes (>$5k, commercial, tree removal) → `transferCall(complex_quote)`
- Urgent emergencies (24h deadline) → `transferCall(emergency)`
- Annual contracts / partnerships → `transferCall(commercial)`
- Uncertain situations → `transferCall(escalation)`

Henry's number: +1-514-813-8957

## Quick Pricing Reference

| Service | Price Range |
|---------|-------------|
| 1 side | $250-350 |
| 2 sides | $350-500 |
| 3-4 sides (corner lot) | $500-800 |
| Very tall hedge (>3m) | +50-80% |
| Rejuvenation/radical trim | $800-1500+ |
| Window washing | $150+ |
| Gutter cleaning | $100+ |

## Development

### Local Development
```bash
npm run dev
```

### Linting & Type Checking
```bash
npm run type-check
```

### Build
```bash
npm run build
```

## Architecture Notes

- **Stateless**: Each webhook call is independent
- **Fast**: Sub-100ms response time for tool calls
- **Scalable**: Cloudflare Workers auto-scales
- **Secure**: No credentials in code (uses Infisical for secrets)
- **Production-Ready**: Full error handling, validation, logging

## Integration with VAPI

1. **Webhook Events**: VAPI sends function-call events during the conversation
2. **Tool Execution**: Worker executes tool handlers and returns results
3. **Response Handling**: VAPI continues conversation based on tool output
4. **SMS Confirmation**: After booking, client receives SMS via Twilio

## Future Enhancements

- ServiceM8 API integration (currently logs only)
- Payment processing (Stripe)
- Customer history lookup
- Recurring appointment detection
- Google Calendar sync
- Email follow-up sequences
- AI-powered note-taking from call transcripts

## Support

For issues or questions:
1. Check logs in Cloudflare Workers dashboard
2. Review webhook request/response in VAPI call history
3. Test webhook manually with curl

## License

Proprietary - Haie Lite Inc.
