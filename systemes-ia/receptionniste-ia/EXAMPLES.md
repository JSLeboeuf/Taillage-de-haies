# Sophie Webhook Examples

## Health Check

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

## Get Available Slots

```bash
curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \
  -H 'Content-Type: application/json' \
  -d '{
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
  }'
```

Response:
```json
{
  "result": {
    "slots": [
      {
        "date": "2026-04-28",
        "time": "10:00",
        "label": "mar 28 avr à 10:00"
      },
      {
        "date": "2026-04-28",
        "time": "13:00",
        "label": "mar 28 avr à 13:00"
      },
      {
        "date": "2026-04-28",
        "time": "15:00",
        "label": "mar 28 avr à 15:00"
      }
    ]
  }
}
```

## Book Appointment

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
          "notes": "Terrain en pente légère"
        }
      }
    }
  }'
```

Response:
```json
{
  "result": {
    "success": true,
    "jobId": "JOB-1709290000000-ABC123DEF",
    "estimatedAmount": 405,
    "confirmationMessage": "Confirmation de RDV:\n- Nom: Jean Dupont\n- Adresse: 123 Rue Main, Longueuil\n- Date: 2026-04-28 à 10:00\n- Type de haie: cèdre\n- Côtés: 2\n- Estimation: $405\n- Notes: Terrain en pente légère"
  }
}
```

## Send SMS Confirmation

```bash
curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "message": {
      "type": "function-call",
      "functionCall": {
        "name": "sendSMS",
        "parameters": {
          "to": "514-123-4567",
          "message": "Sophie de Haie Lite confirme ton RDV: mardi 28 avril à 10h au 123 rue Main. À bientôt! 🌿"
        }
      }
    }
  }'
```

Response:
```json
{
  "result": {
    "sent": true,
    "sid": "SM-1709290000000-ABC123"
  }
}
```

## Transfer Call to Henry

```bash
curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "message": {
      "type": "function-call",
      "functionCall": {
        "name": "transferCall",
        "parameters": {
          "reason": "complex_quote",
          "destination": "+1-514-813-8957"
        }
      }
    }
  }'
```

Response:
```json
{
  "result": {
    "transfer": true,
    "destination": "+1-514-813-8957",
    "message": "Transferring to Henri for complex_quote"
  }
}
```

## Testing Locally with wrangler

```bash
# Start local development server
npm run dev

# In another terminal, test the webhook
curl -X POST http://localhost:8787/webhook \
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

## Complete Call Flow Example

This shows a typical call sequence:

```json
// 1. VAPI calls availableSlots when client is interested
{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "availableSlots",
      "parameters": {
        "preferredDate": null,
        "preferredTime": null
      }
    }
  }
}

// Sophie: "J'ai une disponibilité lundi à 10h, ou mercredi à 13h. Lequel te convient?"

// 2. Client chooses a slot
// Sophie confirms: "Super! Et c'est pour quel nom?"
// Client: "Jean Dupont, 514-123-4567"

// 3. VAPI calls bookAppointment with confirmed details
{
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
        }
      }
    }
  }
}

// Sophie: "Voilà, c'est confirmé! Je t'envoie la confirmation par texto."

// 4. VAPI calls sendSMS to send confirmation
{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "sendSMS",
      "parameters": {
        "to": "514-123-4567",
        "message": "Sophie de Haie Lite confirme ton RDV: lundi 28 avril à 10h au 123 rue Main. À bientôt!"
      }
    }
  }
}

// Sophie: "Parfait! On a hâte de s'occuper de ta haie! Bonne journée!"
```

## Error Cases

### Invalid Phone Number
```bash
curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "message": {
      "type": "function-call",
      "functionCall": {
        "name": "sendSMS",
        "parameters": {
          "to": "999-123-4567",
          "message": "Invalid area code"
        }
      }
    }
  }'
```

Response:
```json
{
  "error": "Invalid Quebec phone number: 999-123-4567"
}
```

### Unknown Function
```bash
curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "message": {
      "type": "function-call",
      "functionCall": {
        "name": "unknownTool",
        "parameters": {}
      }
    }
  }'
```

Response:
```json
{
  "error": "Unknown function: unknownTool"
}
```

## Valid Quebec Phone Area Codes

- 514 (Montreal)
- 438 (Montreal)
- 450 (Rive-Sud, Rive-Nord)
- 579 (Mauricie, Center)
- 819 (Outaouais, Abitibi)
- 873 (Outaouais)
- 418 (Quebec City)
- 581 (Quebec City)
- 367 (Montreal, mobile)

## Price Estimation Examples

### Example 1: 1-side standard hedge
```
Base: 8.5 * 8m * 1.3 (moyenne) * 1.0 (1 side) = 88.4
With markup (25% + 15%) = 88.4 * 1.40625 = 124.2
Minimum = $250 → $250
```

### Example 2: 2-side standard hedge
```
Base: 8.5 * 8m * 1.3 (moyenne) * (1 + 1*0.6) = 141.44
With markup = 141.44 * 1.40625 = 199
Minimum = $250 → $250
```

### Example 3: 2-side tall hedge (>3m)
```
Base: 8.5 * 8m * 1.6 (haute) * 1.6 (2 sides) = 173.44
With markup = 173.44 * 1.40625 = 244
Minimum = $250 → $250
Round to $5 → $250
```

### Example 4: 4-side medium hedge
```
Base: 8.5 * 8m * 1.3 * (1 + 3*0.6) = 332.96
With markup = 332.96 * 1.40625 = 468.4
Round to $5 → $470
```

### Example 5: 3-side tall hedge
```
Base: 8.5 * 8m * 1.6 * (1 + 2*0.6) = 281.6
With markup = 281.6 * 1.40625 = 396
Round to $5 → $395
```
