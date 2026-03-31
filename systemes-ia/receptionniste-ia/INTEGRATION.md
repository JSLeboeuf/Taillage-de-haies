# VAPI Integration Guide

## Overview

This guide walks through setting up Sophie AI receptionist in VAPI and connecting it to the webhook handler.

## Step 1: Deploy Webhook Handler

```bash
cd systemes-ia/receptionniste-ia
./deploy.sh
```

This will:
1. Build the TypeScript code
2. Deploy to Cloudflare Workers
3. Return webhook URL: `https://haie-lite-receptionniste.haielite.workers.dev/webhook`

Test the deployment:
```bash
curl https://haie-lite-receptionniste.haielite.workers.dev/
```

## Step 2: Set Environment Variables

```bash
npx wrangler secret put TWILIO_ACCOUNT_SID
# Paste your Twilio Account SID

npx wrangler secret put TWILIO_AUTH_TOKEN
# Paste your Twilio Auth Token

npx wrangler secret put TWILIO_PHONE_NUMBER
# Example: +1-514-555-1234

npx wrangler secret put SERVICEM8_TOKEN
# Paste your ServiceM8 API token (optional for now)
```

## Step 3: Create VAPI Assistant

1. Go to [VAPI Dashboard](https://dashboard.vapi.ai)
2. Click "Create Assistant"
3. Fill in the following:

### Basic Info
- **Name**: Sophie Réceptionniste Haie Lite
- **Language**: French (Quebec)
- **Prompt**: See `sophie-prompt.txt` in this directory

### LLM Settings
- **Provider**: Anthropic
- **Model**: claude-sonnet-4-20250514
- **Temperature**: 0.7
- **Max Tokens**: 500

Copy the full prompt from `sophie-prompt.txt`:

```
Tu es Sophie, réceptionniste virtuelle de Taillage Haie Lite.

[... full prompt ...]
```

### Voice Settings
- **Voice Provider**: ElevenLabs
- **Voice Model**: Multilingual v2
- **Voice ID**: 21m00Tcm4TlvDq8ikWAM (Warm professional female)
- **Language**: French (Quebec)
- **Speaking Rate**: 1.0

### Transcriber
- **Provider**: Deepgram
- **Model**: Nova-3
- **Language**: fr-CA (French - Canada)
- **Smart Formatting**: Enabled
- **Filler Words**: Disabled

### Functions / Tools

Add 4 tools from `tools.json`:

#### 1. availableSlots
```json
{
  "name": "availableSlots",
  "description": "Récupère 2-3 créneaux disponibles pour un RDV de taillage de haies.",
  "parameters": {
    "type": "object",
    "properties": {
      "preferredDate": {
        "type": "string",
        "description": "Date préférée au format YYYY-MM-DD"
      },
      "preferredTime": {
        "type": "string",
        "description": "Heure préférée au format HH:MM"
      }
    }
  }
}
```

#### 2. bookAppointment
```json
{
  "name": "bookAppointment",
  "description": "Confirme un RDV et crée une estimation dans ServiceM8.",
  "parameters": {
    "type": "object",
    "properties": {
      "clientName": { "type": "string", "description": "Nom complet du client" },
      "phone": { "type": "string", "description": "Numéro de téléphone (514-123-4567)" },
      "address": { "type": "string", "description": "Adresse de la propriété" },
      "city": { "type": "string", "description": "Ville/municipalité" },
      "hedgeType": { "type": "string", "enum": ["cèdre", "feuillue", "mixte", "cèdre-persistant", "autre"] },
      "hedgeSides": { "type": "integer", "minimum": 1, "maximum": 4 },
      "hedgeHeight": { "type": "string", "enum": ["basse", "moyenne", "haute", "très-haute"] },
      "selectedSlot": {
        "type": "object",
        "properties": {
          "date": { "type": "string", "description": "YYYY-MM-DD" },
          "time": { "type": "string", "description": "HH:MM" }
        },
        "required": ["date", "time"]
      },
      "notes": { "type": "string", "description": "Notes additionnelles" }
    },
    "required": ["clientName", "phone", "address", "city", "hedgeType", "hedgeSides", "hedgeHeight", "selectedSlot"]
  }
}
```

#### 3. sendSMS
```json
{
  "name": "sendSMS",
  "description": "Envoie une confirmation ou rappel par SMS au client",
  "parameters": {
    "type": "object",
    "properties": {
      "to": { "type": "string", "description": "Numéro de téléphone (514-123-4567)" },
      "message": { "type": "string", "description": "Contenu du SMS" }
    },
    "required": ["to", "message"]
  }
}
```

#### 4. transferCall
```json
{
  "name": "transferCall",
  "description": "Transfère l'appel à Henri (manager)",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": { "type": "string", "enum": ["angry_client", "complex_quote", "emergency", "commercial", "escalation"] },
      "destination": { "type": "string", "description": "Numéro de destination" }
    },
    "required": ["reason"]
  }
}
```

### Webhook Configuration

**Very Important:**
1. In "Webhooks" section, add:
   - **Webhook URL**: `https://haie-lite-receptionniste.haielite.workers.dev/webhook`
   - **Event Types**: `message` (function-call)
   - **Method**: POST
   - **Content-Type**: application/json

2. Test the webhook:
   - Click "Test Webhook"
   - VAPI will send a test request to your worker
   - Confirm you see a 200 response

### End Call Phrases (Optional)
- merci
- au revoir
- bonne journée
- à bientôt

### First Message Mode
- Select: "Speak" (Agent initiates conversation)

## Step 4: Test the Assistant

### Local Testing (Simulator)
1. In VAPI dashboard, click "Test" on your assistant
2. Use the web simulator to test the voice flow
3. Say: "Bonjour, j'ai besoin de faire tailler ma haie"
4. Complete a full booking conversation

### Check Webhook Logs
View logs in Cloudflare Workers:
```bash
npx wrangler tail
```

Or check VAPI call logs for webhook response details.

## Step 5: Configure Phone Number (for production)

1. In VAPI, go to "Phone Numbers"
2. Assign a phone number to your assistant
3. Configure:
   - **Inbound Route**: Your assistant
   - **Voicemail**: Enabled
   - **Recording**: Enabled

## Step 6: Connect to Ad Platforms

### Facebook Lead Ads
1. In VAPI, go to "Integrations"
2. Set up Facebook Lead Ads connector
3. Map phone numbers from lead ads to VAPI calls
4. Test with a sample lead

### Google Local Services Ads
1. Create a call extension in Google Local Services
2. Point to your VAPI phone number
3. Ensure phone number is properly formatted

## Webhook Request/Response Format

### VAPI → Worker (Request)
```json
{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "availableSlots",
      "parameters": {
        "preferredDate": "2026-04-28",
        "preferredTime": "10:00"
      }
    }
  }
}
```

### Worker → VAPI (Response)
```json
{
  "result": {
    "slots": [
      { "date": "2026-04-28", "time": "10:00", "label": "..." }
    ]
  }
}
```

## Monitoring & Debugging

### Check Cloudflare Logs
```bash
npx wrangler tail --follow
```

### Check VAPI Call History
1. Go to VAPI Dashboard
2. Click on a completed call
3. View full transcript and webhook logs
4. See exact request/response for each function call

### Common Issues

**Issue: Webhook returns 404**
- Verify URL is correct: `https://haie-lite-receptionniste.haielite.workers.dev/webhook`
- Check if Cloudflare Workers deployment succeeded

**Issue: Tool calls fail silently**
- Check webhook response in VAPI call logs
- Verify parameter types match schema
- Use `npm run dev` locally to test first

**Issue: SMS not sending**
- Verify Twilio credentials are set: `npx wrangler secret list`
- Check phone numbers are in valid Quebec format
- Check Twilio account has SMS credits

**Issue: Sophie doesn't speak French**
- Verify LLM prompt is in French
- Check Transcriber language is fr-CA
- Check Voice is set to French voice (ElevenLabs fr-CA)

## Production Checklist

- [ ] Webhook deployed and tested
- [ ] All environment variables set in Cloudflare
- [ ] VAPI assistant created with correct config
- [ ] 4 tools added and webhook configured
- [ ] Test call completed end-to-end
- [ ] Phone number assigned in VAPI
- [ ] SMS confirmation working
- [ ] Call logs are being saved
- [ ] Error alerts configured

## Next Steps

1. **ServiceM8 Integration**: Connect `bookAppointment` to ServiceM8 API
2. **Payment Processing**: Add Stripe payment for deposits
3. **Calendar Sync**: Sync booked appointments to Google Calendar
4. **Analytics**: Track conversion rates, average call duration, upsell success
5. **Customer History**: Look up previous customers and notes
6. **Email Follow-up**: Send email quote after booking
7. **Voicemail Handling**: Transcribe and route voicemails

## Support

- VAPI Docs: https://docs.vapi.ai
- Cloudflare Workers: https://developers.cloudflare.com/workers
- Webhook Test: Use `EXAMPLES.md` for curl commands

## Pricing

- **VAPI**: $0.80-1.50 per minute of voice
- **Cloudflare Workers**: Free tier includes 100K requests/day
- **Twilio SMS**: $0.0075 per SMS in Canada
- **ElevenLabs Voice**: Included in VAPI pricing

Estimated cost per booking: ~$2-4 (call + SMS)
