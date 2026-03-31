# Setup VAPI — Sophie Haie Lite

Configuration production-grade adaptée de Milette Portes et Fenêtres v18.14.

## Fichiers requis

- **vapi-assistant-config.json** — Config VAPI complète (Claude Haiku 4.5, Cartesia Sonic-3, Speechmatics)
- **sophie-prompt-v1.txt** — Prompt XML production (UNE seule question par réponse, max 12 mots/phrase)
- **assistant.json** — Config native VAPI (déjà remplie)
- **tools.json** — Définitions des 4 outils (availableSlots, bookAppointment, sendSMS, transferCall)
- **SETUP-VAPI.md** — Ce guide

## Architecture préservée de Milette

### Modèle LLM
- **Provider:** Anthropic
- **Modèle:** claude-haiku-4-5-20251001
- **Tokens max:** 150
- **Température:** 0.2 (très déterministe)

Haiku 4.5 est 5x plus rapide que Sonnet avec latence <200ms. Idéal pour la voix.

### Voice
- **Provider:** Cartesia
- **Modèle:** Sonic-3
- **Langue:** Français
- **Vitesse:** slow
- **Émotion:** positivity:high
- **Filler injection:** désactivé

Cartesia Sonic-3 = voix naturelle, low latency, excellent French.

### Transcripteur
- **Provider:** Speechmatics
- **Langue:** Français
- **Custom vocabulary:** "Haie Lite", "cèdre", "taillage", "Vaudreuil", "Henri", "ServiceM8", etc.

Speechmatics maîtrise mieux le français québécois que Deepgram.

### Endpointing
- **Ponctuation:** 0.5 sec
- **Sans ponctuation:** 0.6 sec
- **Nombre:** 2.0 sec (numéros de téléphone)
- **Smart endpointing:** activé

### Hooks (silence & farewell)
- **30s silence check-in:** 2 essais
- **110s farewell:** "Je vais raccrocher..."
- **Silence timeout global:** 130s
- **Durée max appel:** 1200s (20 min)

### Stop speaking plan
- **numWords:** 0 (Sophie arrête immédiatement)
- **voiceSeconds:** 0.2 (délai minimal)
- **backoffSeconds:** 1.0

## Étapes de déploiement

### 1. Créer l'assistant sur VAPI

Aller à [https://vapi.ai](https://vapi.ai)

1. Dashboard → "Create New Assistant"
2. Copier **vapi-assistant-config.json** → coller en JSON brut
3. Sauvegarder

**Ou manuellement:**

- **Name:** Sophie - Haie Lite
- **Provider:** Anthropic
- **Model:** claude-haiku-4-5-20251001
- **Max tokens:** 150
- **Temperature:** 0.2

### 2. Configurer la voix

- **Provider:** Cartesia
- **Model:** Sonic-3
- **Language:** French (fr)
- **Voice ID:** Chercher une voix féminine française dans la liste Cartesia
- **Speed:** slow
- **Emotions:** positivity: high

### 3. Configurer le transcripteur

- **Provider:** Speechmatics
- **Language:** French (fr)
- **Custom vocabulary:**
  ```
  Haie Lite
  haie
  cèdre
  taillage
  élagage
  rabattage
  Vaudreuil
  Longueuil
  Brossard
  Candiac
  Châteauguay
  gouttières
  Henri
  ServiceM8
  Rive-Sud
  ```

### 4. Coller le prompt système

Copier le contenu de **sophie-prompt-v1.txt** dans le champ **System Prompt**.

Ou coller la section système de **assistant.json** (après `"content":`).

**CRITIQUE:** Garder les balises XML (`<prononciation>`, `<identite>`, etc.) pour la structure.

### 5. Ajouter les outils

Dashboard → Assistant → Tools

Importer les 4 outils de **tools.json:**

1. **availableSlots**
   - Description: Retourne 2-3 créneaux disponibles
   - Webhook: https://haie-lite-receptionniste.haielite.workers.dev/webhook
   - Parameters:
     - preferredDate (string, optional)
     - preferredTime (string, optional)

2. **bookAppointment**
   - Description: Crée un rendez-vous
   - Webhook: https://haie-lite-receptionniste.haielite.workers.dev/webhook
   - Parameters:
     - clientName (string, required)
     - phone (string, required)
     - address (string, optional)
     - city (string, required)
     - hedgeType (enum, optional)
     - hedgeSides (number, required)
     - hedgeHeight (enum, optional)
     - selectedSlot (object, required)
     - notes (string, optional)

3. **sendSMS**
   - Description: Envoie un SMS de confirmation
   - Webhook: https://haie-lite-receptionniste.haielite.workers.dev/webhook
   - Parameters:
     - to (string, required)
     - message (string, required)

4. **transferCall**
   - Description: Transfère l'appel à Henri
   - Webhook: https://haie-lite-receptionniste.haielite.workers.dev/webhook
   - Parameters:
     - reason (enum, required)
     - destination (string, optional)

### 6. Configurer les hooks

**Silence 30s (2 essais):**
```json
{
  "on": "customer.speech.timeout",
  "options": {
    "timeoutSeconds": 30,
    "triggerMaxCount": 2,
    "triggerResetMode": "onUserSpeech"
  },
  "do": [
    {
      "type": "say",
      "exact": ["T'es toujours là?", "Je suis encore là si t'as des questions."]
    }
  ]
}
```

**Farewell 110s:**
```json
{
  "on": "customer.speech.timeout",
  "options": {
    "timeoutSeconds": 110,
    "triggerMaxCount": 1,
    "triggerResetMode": "never"
  },
  "do": [
    {
      "type": "say",
      "exact": ["Je vais raccrocher. N'hésite pas à rappeler! Bonne journée!"]
    },
    {
      "type": "tool",
      "tool": {"type": "endCall"}
    }
  ]
}
```

### 7. Assigner un numéro de téléphone VAPI

1. Dashboard → Assistants → Sophie
2. "Phone Numbers" → "Add Phone Number"
3. Chercher un numéro local Montréal (514, 438)
4. Copier le numéro → noter dans `.env`

### 8. Tester

```bash
# Appeler le numéro VAPI assigné
# Exemple: +1-514-XXX-XXXX
```

**Checklist de test:**
- Sophie se présente clairement
- Questions une à la fois
- Estimation de prix correcte
- availableSlots retourne 2-3 créneaux
- bookAppointment crée le RDV
- sendSMS envoie la confirmation
- Silence check-in à 30s
- Farewell à 110s
- Silence timeout à 130s

## Configuration du webhook

L'URL webhook pointant à:
```
https://haie-lite-receptionniste.haielite.workers.dev/webhook
```

Le webhook handler (src/webhook-handler.ts) reçoit les appels d'outils et:
1. Valide les paramètres
2. Exécute la logique métier (créer RDV, envoyer SMS, etc.)
3. Retourne la réponse au format VAPI

**Voir `src/webhook-handler.ts` pour les détails d'implémentation.**

## Analyse post-appel

VAPI exécute automatiquement après endCall:
- **summaryPlan:** Résumé textuel de l'appel
- **structuredDataPlan:** Données structurées (nom, téléphone, type haie, etc.)
- **successEvaluationPlan:** Succès/échec (RDV booké? SMS envoyé?)

Les résultats sont envoyés au webhook ou à une URL configurée.

## Maintenance

### Version du prompt
- **Actuelle:** v1.0-haie-lite (adapté Milette v18.14)
- **Format:** XML (balises structurées pour clarity)
- **Max 150 tokens:** Réponses ultra-concises

### Mise à jour du prompt
1. Modifier `sophie-prompt-v1.txt`
2. Copier le nouveau contenu dans VAPI Dashboard
3. Sauvegarder → change de version silencieusement
4. Les appels suivants utilisent le nouveau prompt

### Logs & monitoring
VAPI fournit:
- Durée de l'appel
- Qualité de la transcription (WER)
- Temps de réponse du webhook
- Erreurs des outils
- Analyse de succès

### Support Milette
- **Documentation Milette:** https://docs.vapi.ai (même architecture)
- **Modèle Haiku 4.5:** https://anthropic.com/news/claude-haiku
- **Cartesia Sonic-3:** https://cartesia.ai/voice

## Notes spécifiques à Haie Lite

### Tarification
Voir `<prix>` dans le prompt:
- 1 côté: 250-350$
- 2 côtés: 350-500$
- 3-4 côtés: 500-800$
- Très haute: +50-80%

### Zones
Rive-Sud, Vaudreuil, Montréal ouest, Rive-Nord (mai).

### Heures
Saison: avril-novembre. Bureaux: lun-ven 8h-17h. Terrain: 7h-17h.

### Escalade
- Angry: transferCall angry_client
- Complex: transferCall complex_quote
- Emergency: transferCall emergency
- Commercial (>20 haies, municipal): transferCall commercial

### Upsell
Après booking, proposer lavage vitres + gouttières. UNE seule fois, pas insistant.

## Résumé des changements vs version initiale

| Paramètre | Ancien | Nouveau |
|-----------|--------|---------|
| Modèle | Sonnet 4 | Haiku 4.5 |
| Tokens max | 500 | 150 |
| Température | 0.7 | 0.2 |
| Voice provider | ElevenLabs | Cartesia |
| Voice model | 21m00Tcm | Sonic-3 |
| Transcriber | Deepgram nova-3 | Speechmatics |
| Pricing | Non | Oui (Sophie peut estimer) |
| Endpointing | Basic | Smart + custom rules |
| Hooks | Aucun | 30s check-in + 110s farewell |
| Prompt format | Libre | XML structuré |

---

**Dernière mise à jour:** 31 mars 2026
**Version:** 1.0-haie-lite (inspirée Milette v18.14)
**Mainteneur:** Taillage Haie Lite inc.
