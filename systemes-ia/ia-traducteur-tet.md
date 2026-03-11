# IA Traducteur Espagnol-Français pour TET

> Résoudre la barrière linguistique TET ↔ Clients

---

## LE PROBLÈME

```
Client francophone          TET mexicain
      │                          │
      │  "Les haies du côté      │
      │   nord sont trop         │
      │   hautes, coupez         │
      │   30 cm de plus"         │
      │                          │
      └──────────?───────────────┘

        Communication impossible
        = Erreurs, frustration, mauvaises reviews
```

**Impacts actuels :**
- Erreurs de compréhension → retouches gratuites
- Client frustré → mauvaise review
- TET stressé → moins productif
- Chef doit être présent → pas scalable

---

## LA SOLUTION : AGENT IA TRADUCTEUR

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VAPI AGENT                            │
│                                                          │
│   ┌─────────┐    ┌──────────┐    ┌─────────────┐        │
│   │ Whisper │ →  │ GPT-4    │ →  │ ElevenLabs  │        │
│   │ (STT)   │    │ Traduct. │    │ (TTS)       │        │
│   └─────────┘    └──────────┘    └─────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
         ↑                                    ↓
    Voix entrée                          Voix sortie
    (ES ou FR)                           (FR ou ES)

┌──────────┐                           ┌──────────┐
│  Client  │  ←─── Téléphone ───→      │   TET    │
│  (FR)    │       ou App              │   (ES)   │
└──────────┘                           └──────────┘
```

### Modes d'Utilisation

#### Mode 1 : Appel 3-Way (Téléphone)

```
1. TET appelle numéro Haie Lite
2. Agent IA répond : "Traducteur Haie Lite, passez-moi au client"
3. TET passe téléphone au client
4. Client parle français → Agent traduit en espagnol (speaker)
5. TET répond espagnol → Agent traduit en français
6. Conversation fluide en temps réel
```

**Numéro dédié** : 1-800-HAIE-TRA (via Twilio)

#### Mode 2 : App Mobile (Push-to-Talk)

```
┌─────────────────────────────────┐
│      HAIE LITE TRANSLATOR       │
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    🎤 PARLER            │   │
│   │                         │   │
│   │   Appuyez et parlez     │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│   Mode: Español → Français      │
│   [Inverser]                    │
│                                 │
│   ─────────────────────────     │
│   Dernière traduction:          │
│   "Le client demande de         │
│    couper 30 cm de plus         │
│    sur le côté nord"            │
│                                 │
└─────────────────────────────────┘
```

#### Mode 3 : Traduction Texto (Async)

```
TET envoie texto en espagnol au numéro
→ Agent traduit
→ Renvoie texto en français au client
→ Client répond en français
→ Agent traduit en espagnol pour TET
```

---

## PROMPTS SYSTÈME

### Agent Traducteur Principal

```
Tu es un traducteur professionnel pour une entreprise de taillage de haies au Québec.

CONTEXTE :
- Tu traduis entre espagnol mexicain et français québécois
- Les conversations concernent le taillage de haies, l'entretien paysager
- Côté espagnol : travailleurs mexicains (TET)
- Côté français : clients résidentiels québécois

RÈGLES :
1. Traduis fidèlement sans ajouter d'information
2. Utilise le vouvoiement en français avec les clients
3. Utilise le tutoiement en espagnol avec les TET
4. Adapte les expressions idiomatiques (pas de traduction littérale)
5. Si tu ne comprends pas, demande de répéter
6. Garde un ton professionnel et amical

VOCABULAIRE TECHNIQUE :
- Haie de cèdres = seto de cedros
- Taille-haie = cortasetos
- Échelle = escalera
- Branche = rama
- Hauteur = altura
- Largeur = ancho
- Côté nord/sud/est/ouest = lado norte/sur/este/oeste
- Ramasser les déchets = recoger los desechos
- Souffleuse = sopladora

DÉBUT DE CONVERSATION :
"Bonjour, je suis le traducteur Haie Lite. Je vais vous aider à communiquer avec notre équipe. Parlez normalement, je traduirai."

"Hola, soy el traductor de Haie Lite. Voy a ayudarte a comunicarte con el cliente. Habla normal, yo traduzco."
```

### Détection Automatique de Langue

```javascript
// Dans le flow VAPI
const detectLanguage = (transcript) => {
  const spanishIndicators = ['hola', 'sí', 'no entiendo', 'cómo', 'qué'];
  const frenchIndicators = ['bonjour', 'oui', 'comment', 'merci', "s'il vous plaît"];

  const text = transcript.toLowerCase();
  const spanishScore = spanishIndicators.filter(w => text.includes(w)).length;
  const frenchScore = frenchIndicators.filter(w => text.includes(w)).length;

  return spanishScore > frenchScore ? 'es' : 'fr';
};
```

---

## PHRASES PRÉ-ENREGISTRÉES (Quick Actions)

### Pour les TET (Boutons App)

| Bouton | Espagnol | Français (joué au client) |
|--------|----------|---------------------------|
| 🏠 Arrivée | — | "Bonjour! L'équipe Haie Lite est arrivée." |
| ✅ Terminé | — | "Le travail est terminé. Voulez-vous vérifier?" |
| ❓ Question | — | "Notre équipe a une question pour vous." |
| 💧 Eau | — | "Serait-il possible d'avoir de l'eau?" |
| 🚽 Toilette | — | "Pourrions-nous utiliser vos toilettes?" |
| ⚠️ Problème | — | "Nous avons trouvé un problème, pouvez-vous venir voir?" |
| 📸 Photo | — | "Nous vous envoyons une photo pour confirmation." |

### Scénarios Fréquents

```
SCÉNARIO : Client veut modification
─────────────────────────────────────
Client (FR) : "Pouvez-vous couper un peu plus court?"
Agent → TET (ES) : "El cliente quiere que cortes un poco más corto."
TET (ES) : "¿Cuántos centímetros más?"
Agent → Client (FR) : "Combien de centimètres de plus?"
Client (FR) : "Environ 20 centimètres"
Agent → TET (ES) : "Aproximadamente 20 centímetros."
TET (ES) : "Okay, lo hago."
Agent → Client (FR) : "D'accord, nous le faisons."
```

---

## IMPLÉMENTATION TECHNIQUE

### Stack

```
VAPI (orchestration voix)
├── Whisper (Speech-to-Text)
├── GPT-4 Turbo (traduction contextualisée)
└── ElevenLabs (Text-to-Speech naturel)

Twilio (téléphonie)
├── Numéro dédié traduction
└── SMS bidirectionnel

Supabase
├── Logs conversations
├── Phrases fréquentes
└── Feedback qualité
```

### Coûts Estimés

| Composant | Coût/minute | Usage estimé | Coût/mois |
|-----------|-------------|--------------|-----------|
| VAPI | $0.05 | 500 min | $25 |
| Whisper | $0.006 | 500 min | $3 |
| GPT-4 | $0.01 | 500 min | $5 |
| ElevenLabs | $0.03 | 500 min | $15 |
| Twilio | $0.02 | 500 min | $10 |
| **TOTAL** | | | **~$60/mois** |

**ROI** : 1 erreur évitée = 1 retouche gratuite évitée = $100+ économisé

---

## API ENDPOINTS

### /api/translator/call

```javascript
// Initier appel traduction
export default async function handler(req, res) {
  const { tetPhone, clientPhone, jobId } = req.body;

  // Créer conférence Twilio avec agent VAPI
  const conference = await twilio.conferences.create({
    friendlyName: `translation-${jobId}`,
    statusCallback: '/api/webhooks/translation-status'
  });

  // Ajouter TET
  await twilio.conferences(conference.sid).participants.create({
    from: process.env.TWILIO_NUMBER,
    to: tetPhone,
    label: 'tet'
  });

  // Ajouter agent VAPI comme traducteur
  await addVapiTranslator(conference.sid);

  // Appeler client
  await twilio.conferences(conference.sid).participants.create({
    from: process.env.TWILIO_NUMBER,
    to: clientPhone,
    label: 'client'
  });

  return res.json({ conferenceId: conference.sid });
}
```

### /api/translator/text

```javascript
// Traduction texto async
export default async function handler(req, res) {
  const { from, text, targetLang } = req.body;

  const translation = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `Traduis ce message de ${from === 'es' ? 'espagnol mexicain' : 'français québécois'}
                  vers ${targetLang === 'es' ? 'espagnol mexicain' : 'français québécois'}.
                  Contexte: communication sur chantier de taillage de haies.
                  Garde le même ton et niveau de formalité.`
      },
      { role: 'user', content: text }
    ]
  });

  return res.json({
    original: text,
    translated: translation.choices[0].message.content
  });
}
```

---

## APP MOBILE SIMPLIFIÉE

### Écran Principal TET

```
┌─────────────────────────────────────┐
│  HAIE LITE - TRADUCTEUR    [ES/FR] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      🎤                     │    │
│  │                             │    │
│  │   MAINTENIR POUR PARLER    │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ═══════════════════════════════    │
│                                     │
│  RACCOURCIS :                       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ 🏠  │ │ ✅  │ │ ❓  │ │ ⚠️  │   │
│  │Arrivé│ │ Fini│ │Quest│ │Probl│   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│  📞 APPELER TRADUCTEUR LIVE         │
│                                     │
│  ─────────────────────────────────  │
│  Dernier message traduit:           │
│  "Le client est satisfait, vous     │
│   pouvez partir. Merci!"            │
│                                     │
└─────────────────────────────────────┘
```

### Features

1. **Push-to-Talk** : Enregistre, traduit, joue audio
2. **Raccourcis** : Phrases pré-enregistrées (1 tap)
3. **Appel Live** : Connecte avec agent traducteur temps réel
4. **Historique** : Dernières traductions (référence)
5. **Mode Hors-ligne** : Phrases essentielles cached

---

## FORMATION TET

### Guide Rapide (1 page, ES)

```
GUÍA RÁPIDA - TRADUCTOR HAIE LITE

1. LLEGADA AL TRABAJO
   → Presiona botón 🏠 (el cliente escucha en francés)

2. SI EL CLIENTE HABLA
   → Presiona y mantén el botón 🎤
   → El cliente habla, tú escuchas en español

3. PARA RESPONDER
   → Mantén 🎤 y habla en español
   → El cliente escucha en francés

4. SI HAY PROBLEMA
   → Presiona 📞 para traductor en vivo
   → Espera, alguien te ayuda

5. AL TERMINAR
   → Presiona ✅ (cliente sabe que terminaste)

¡IMPORTANTE!
- Habla claro y despacio
- Una idea a la vez
- Si no entiendes, di "No entendí, repite por favor"
```

---

## MÉTRIQUES & MONITORING

### Dashboard Traduction

```
📊 TRADUCTION - Cette Semaine

Appels traduction    : 45
Durée moyenne        : 2.3 min
Textos traduits      : 128
Phrases raccourcis   : 234

Satisfaction (post-call) :
Client : 4.6/5
TET    : 4.8/5

Top phrases utilisées :
1. "Arrivée sur place" (89x)
2. "Travail terminé" (76x)
3. "Question pour vous" (34x)

Erreurs détectées : 2
- "No entendí" x 12 (normal)
- Échec traduction x 2 (réseau)
```

### Alertes

```javascript
// Si trop de "no entendí" → qualité audio?
if (noEntiendiCount > 5) {
  await notify(HENRI, `⚠️ TET ${tetName} a des difficultés de communication. Vérifier.`);
}

// Si appel > 5 min → escalade
if (callDuration > 300) {
  await notify(CHEF_EQUIPE, `📞 Appel traduction long. Job #${jobId}. Intervenir?`);
}
```

---

## VALEUR AJOUTÉE

### Pour les TET
- Moins de stress communication
- Plus d'autonomie
- Meilleure relation client
- Fierté professionnelle

### Pour les Clients
- Communication claire
- Confiance dans l'équipe
- Moins de frustration
- Meilleure expérience

### Pour Haie Lite
- Scalabilité (pas besoin chef bilingue partout)
- Moins d'erreurs → moins de retouches
- Meilleures reviews
- Différenciateur compétitif unique

### ROI Estimé

```
SANS traducteur :
- Erreurs communication : ~5%
- Retouches gratuites : 5% × 20 jobs/jour × $500 = $500/jour perdu
- Mauvaises reviews : impact LTV clients

AVEC traducteur :
- Coût : $60/mois
- Erreurs réduites à ~1%
- Économies : ~$400/jour × 130 jours = $52,000/saison
- Meilleures reviews = plus de clients

ROI : 850x le coût
```
