# Sophie AI Receptionist — Quick Start

Get Sophie up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- Cloudflare account (free tier OK)
- VAPI account
- Twilio account (optional, for SMS)

## 1. Clone & Install

```bash
cd systemes-ia/receptionniste-ia
npm install
```

## 2. Deploy to Cloudflare Workers

```bash
npx wrangler login
npm run build
npx wrangler deploy
```

**Note your webhook URL:** `https://haie-lite-receptionniste.haielite.workers.dev/webhook`

## 3. Set Environment Variables (Optional, for SMS)

```bash
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_PHONE_NUMBER
```

(SMS will work in mock mode if not set)

## 4. Test Webhook

```bash
curl https://haie-lite-receptionniste.haielite.workers.dev/
```

Should return:
```json
{"status":"ok","service":"haie-lite-receptionniste",...}
```

## 5. Create VAPI Assistant

1. Go to https://dashboard.vapi.ai
2. Create new assistant
3. Fill in these key settings:

| Setting | Value |
|---------|-------|
| **Name** | Sophie Réceptionniste Haie Lite |
| **LLM Model** | Anthropic Claude Sonnet 4.6 |
| **Voice** | ElevenLabs (French-Canadian) |
| **Transcriber** | Deepgram Nova-3 (fr-CA) |
| **Webhook URL** | `https://haie-lite-receptionniste.haielite.workers.dev/webhook` |

4. Copy full prompt from `sophie-prompt.txt`
5. Add 4 tools from `tools.json`
6. Save & test

## 6. Test the Full Flow

In VAPI simulator:
1. Call Sophie
2. Say: "Bonjour, j'ai besoin de tailler ma haie"
3. Answer her questions
4. Confirm an appointment
5. Check logs for webhook calls

## 7. Production: Assign Phone Number

In VAPI dashboard:
1. Go to Phone Numbers
2. Assign a number to Sophie
3. Configure as inbound
4. That's your ads phone number!

## Cost Estimate

| Service | Cost |
|---------|------|
| VAPI (per minute) | $0.80-1.50 |
| SMS (optional) | $0.0075 |
| Cloudflare Workers | Free (100k/day) |
| **Per Booking** | ~$2-4 |

## Troubleshooting

**Webhook not working?**
```bash
npx wrangler tail --follow
```

**Sophie not speaking French?**
- Check LLM prompt language
- Check voice language setting
- Test in VAPI simulator

**SMS not sending?**
- Verify Twilio credentials
- Check phone format: 514-123-4567
- Enable in `src/webhook-handler.ts`

**Getting 404 on webhook?**
- Double-check URL is correct
- Make sure deployment succeeded
- Check status: `curl https://haie-lite-receptionniste.haielite.workers.dev/`

## Next: Full Integration

See `INTEGRATION.md` for detailed setup and production checklist.

See `EXAMPLES.md` for curl webhook examples.

## Support

- Docs: See `README.md`
- Questions: Check webhook logs with `npx wrangler tail`
