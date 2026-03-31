# Haie Lite - VAPI webhook contracts

Use these contracts if `haie-lite-app/app/api/webhooks/vapi/route.ts` is the single VAPI tool endpoint.

## Endpoint

- Base URL: `https://REPLACE_WITH_PUBLIC_APP_URL/api/webhooks/vapi`
- Auth header: `x-vapi-secret: REPLACE_WITH_SHARED_SECRET`

## `availableSlots`

Purpose: return real availability before the assistant confirms anything.

Expected arguments:

```json
{
  "serviceType": "hedge-trimming",
  "postalCode": "J7V 0A1",
  "preferredDays": "weekday",
  "preferredTimeOfDay": "afternoon",
  "timezone": "America/Toronto"
}
```

Recommended response:

```json
{
  "success": true,
  "slots": [
    {
      "iso": "2026-03-24T13:00:00-04:00",
      "label": "mardi 24 mars a 13 h"
    },
    {
      "iso": "2026-03-24T15:30:00-04:00",
      "label": "mardi 24 mars a 15 h 30"
    },
    {
      "iso": "2026-03-25T09:00:00-04:00",
      "label": "mercredi 25 mars a 9 h"
    }
  ]
}
```

## `bookAppointment`

Purpose: create the estimate visit only after the client picks one slot.

Expected arguments:

```json
{
  "firstName": "Jean",
  "lastName": "Tremblay",
  "phone": "+14505551234",
  "address": "123 Rue Principale, Vaudreuil-Dorion, QC",
  "propertyType": "residential",
  "serviceType": "combo",
  "jobDetails": "Haie 80 pieds, bungalow, 18 fenetres, gouttieres avant et arriere",
  "selectedSlotIso": "2026-03-24T13:00:00-04:00",
  "timezone": "America/Toronto"
}
```

Recommended response:

```json
{
  "success": true,
  "bookingId": "est_12345",
  "scheduledAtIso": "2026-03-24T13:00:00-04:00",
  "spokenConfirmation": "Votre rendez-vous est confirme pour mardi 24 mars a 13 h."
}
```

## `sendSMS`

Purpose: send the SMS after booking or after a callback request is logged.

Expected arguments:

```json
{
  "phone": "+14505551234",
  "template": "booking-confirmation",
  "firstName": "Jean",
  "appointmentDateTime": "2026-03-24T13:00:00-04:00"
}
```

Recommended response:

```json
{
  "success": true,
  "messageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

## Backend behavior

- Route by VAPI tool name, not by URL path.
- Reject requests missing the shared secret.
- Validate service zone before offering firm availability.
- Never return a booked confirmation unless the calendar insert succeeded.
- Persist lead info even when no appointment is booked.
