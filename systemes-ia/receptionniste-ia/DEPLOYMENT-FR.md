# Déploiement Sophie — Guide Français

Guide complet en français pour déployer Sophie sur production.

## Vue d'ensemble

Sophie est une réceptionniste IA qui :
- Répond aux appels entrants (Facebook Ads, Google Ads)
- Qualifie les clients (adresse, type de haie, urgence)
- Propose des créneaux disponibles
- Réserve des rendez-vous
- Envoie des confirmations SMS

Hébergée sur **Cloudflare Workers** (gratuit), intégrée à **VAPI** (voix IA).

## Étapes de déploiement

### 1. Préparer l'environnement local

```bash
# Cloner le repo (si pas déjà fait)
cd /tmp/taillage-fresh

# Aller au dossier Sophie
cd systemes-ia/receptionniste-ia

# Installer les dépendances
npm install
```

### 2. S'authentifier sur Cloudflare

```bash
npx wrangler login
# Ouvre navigateur → autorise l'accès → retour terminal
```

### 3. Configurer les secrets (optionnel, mais recommandé)

Si tu veux activer les SMS Twilio :

```bash
# Obtenir tes credentials Twilio depuis https://console.twilio.com/
npx wrangler secret put TWILIO_ACCOUNT_SID
# Colle ton Account SID, puis Entrée

npx wrangler secret put TWILIO_AUTH_TOKEN
# Colle ton Auth Token, puis Entrée

npx wrangler secret put TWILIO_PHONE_NUMBER
# Colle le numéro SMS (ex: +1-514-555-1234), puis Entrée
```

(Sans ces secrets, les SMS fonctionneront en mode "mock" — logged mais non envoyés)

### 4. Compiler et déployer

```bash
# Option A : Script automatisé (recommandé)
./deploy.sh

# Option B : Commandes manuelles
npm run type-check    # Vérifier TypeScript
npm run build         # Construire
npx wrangler deploy   # Déployer
```

Tu devrais voir :
```
Uploading...
✓ Success! Published your Worker to https://haie-lite-receptionniste.haielite.workers.dev/
```

### 5. Tester le webhook

```bash
curl https://haie-lite-receptionniste.haielite.workers.dev/
```

Réponse attendue :
```json
{
  "status": "ok",
  "service": "haie-lite-receptionniste",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### 6. Créer l'assistant VAPI

1. Aller sur https://dashboard.vapi.ai
2. Cliquer "Create Assistant"
3. Remplir les champs selon `INTEGRATION.md` section "Step 3"

**Points clés :**
- **Prompt** : Copier contenu de `sophie-prompt.txt`
- **LLM** : Anthropic Claude Sonnet 4.6
- **Voice** : ElevenLabs French-Canadian (ID: 21m00Tcm4TlvDq8ikWAM)
- **Transcriber** : Deepgram Nova-3, fr-CA
- **Webhook URL** : `https://haie-lite-receptionniste.haielite.workers.dev/webhook`

4. Ajouter les 4 outils (tools) depuis `tools.json`
5. Sauvegarder

### 7. Tester en mode simulateur

Dans le dashboard VAPI :
1. Cliquer le bouton "Test" de l'assistant
2. Parler : "Bonjour, j'ai besoin de tailler ma haie de cèdre"
3. Répondre aux questions de Sophie
4. Confirmer un rendez-vous
5. Vérifier SMS envoyé

### 8. Affecter un numéro de téléphone (production)

1. Dans VAPI : "Phone Numbers" → "Assign Number"
2. Configurer :
   - **Inbound** : Ton assistant Sophie
   - **Recording** : Activé
   - **Voicemail** : Activé
3. Noter le numéro (utilisé dans les annonces Facebook/Google)

### 9. Connecter aux annonces

#### Facebook Lead Ads
1. Facebook Ads Manager
2. Créer call button avec le numéro VAPI
3. Tester un appel depuis mobile

#### Google Local Services Ads
1. Google Business Profile
2. Ajouter call extension
3. Utiliser le numéro VAPI

## Configuration complète (checklist)

- [ ] Code TypeScript compilé sans erreur
- [ ] Déployé sur Cloudflare Workers
- [ ] Webhook répond sur 200 OK
- [ ] Secrets Twilio configurés (optionnel)
- [ ] Assistant VAPI créé avec prompt français
- [ ] 4 outils VAPI ajoutés
- [ ] Webhook URL configurée dans VAPI
- [ ] Test simulateur réussi
- [ ] Numéro de téléphone assigné
- [ ] Annonces Facebook/Google pointent vers ce numéro
- [ ] Test appel réel réussi

## Logs et débogage

### Voir les logs du worker

```bash
npx wrangler tail --follow
```

Cela affiche les logs en temps réel de Sophie. Tu verras :
- Appels aux outils (availableSlots, bookAppointment, etc.)
- Erreurs de validation (numéro de téléphone invalide, etc.)
- Appels SMS Twilio

### Voir l'historique des appels VAPI

1. Dashboard VAPI → "Calls"
2. Cliquer un appel
3. Voir la transcription complète + logs webhook

### Tester le webhook manuellement

```bash
# Test availableSlots
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

Voir `EXAMPLES.md` pour plus de tests.

## Coûts

| Service | Coût |
|---------|------|
| VAPI (par minute d'appel) | $0.80-1.50 |
| SMS Twilio (par SMS) | $0.0075 CAD |
| Cloudflare Workers | Gratuit (100k requêtes/jour) |
| **Estimation par réservation** | ~$2-4 |

## Dépannage

### Sophie ne parle pas français

→ Vérifier dans VAPI :
- LLM prompt est en français
- Voice language est "French"
- Transcriber language est "fr-CA"

### Webhook retourne 404

→ Vérifier :
- URL correcte : `https://haie-lite-receptionniste.haielite.workers.dev/webhook`
- Déploiement réussi : `npx wrangler deploy`
- Status de santé : `curl https://haie-lite-receptionniste.haielite.workers.dev/`

### SMS ne s'envoient pas

→ Vérifier :
- Secrets Twilio configurés : `npx wrangler secret list`
- Numéro client valide (514, 438, 450, 579, 819, 873, 418, 581, 367)
- Compte Twilio a des crédits SMS

### Sophie propose les mêmes créneaux à chaque fois

→ Comportement normal. Les créneaux sont générés dynamiquement basé sur :
- Date actuelle
- Jour de semaine uniquement (pas weekend)
- Heures de bureau (8h-17h)

Pour personnaliser, éditer `generateAvailableSlots()` dans `src/webhook-handler.ts`.

### Prix d'estimation trop bas ou trop haut

→ Modifier formule de calcul :
- Fichier : `src/webhook-handler.ts`
- Fonction : `calculateEstimate()`
- Paramètres ajustables :
  - `baseRates` — $/mètre par type
  - `heightMultipliers` — multiplicateur hauteur
  - `1.2` et `1.15` — markup top + cleanup

## Mise à jour et maintenance

### Déployer une nouvelle version

```bash
# Faire modifications au code
# Par exemple : changer prompt, pricing, etc.

# Recompiler
npm run type-check

# Redéployer
npx wrangler deploy
```

Les changements sont live instantanément !

### Consulter les analytics

1. Dashboard VAPI → "Analytics"
2. Voir :
   - Nombre d'appels par jour
   - Durée moyenne
   - Taux de conversion (réservations)
   - Problèmes courants

### Backups

```bash
# Sauvegarder config locale
cp assistant.json assistant.json.backup
cp tools.json tools.json.backup

# Git commit
git add -A
git commit -m "Sophie v1.0 - production deployment"
```

## Prochaines étapes (phase 2)

1. **Intégration ServiceM8** : Créer vraies estimations au lieu de logs
2. **Paiement** : Accepter dépôts via Stripe
3. **Suivi** : Synchroniser avec Google Calendar
4. **Suivi client** : Garder historique des clients
5. **Upsell** : Proposer auto lavage vitres, gouttières, etc.

## Support

- Docs techniques : `README.md`
- Exemples curl : `EXAMPLES.md`
- Setup VAPI : `INTEGRATION.md`
- Démarrage rapide : `QUICKSTART.md`

## Questions fréquentes

**Q: Sophie parle-t-elle vraiment français?**
R: Oui! Utilise Claude Sonnet (Anthropic) et voix ElevenLabs française. Elle parle québécois naturellement.

**Q: Les données client sont-elles sauvegardées?**
R: Actuellement, les appels sont loggés dans VAPI et Cloudflare. Intégration ServiceM8 en phase 2.

**Q: Peut-on tester sans passer par VAPI?**
R: Oui, avec `npm run dev` + curl. Voir `EXAMPLES.md`.

**Q: Combien d'appels simultanés peut gérer?**
R: Cloudflare Workers supporte ~10,000 requêtes concurrentes. Pratiquement illimité pour Haie Lite.

**Q: C'est sécurisé?**
R: Oui. Cloudflare chiffre tout. Secrets Twilio ne sont jamais visibles en production. Webhooks CORS validés.

## Déploiement réussi !

Une fois que tu arrives ici, c'est bon :

```bash
✓ npm run type-check — Pas d'erreurs TypeScript
✓ npx wrangler deploy — Worker déployé
✓ curl https://... — Status 200 OK
✓ VAPI test — Appel réussi, SMS reçu
✓ Appel réel — Reservation créée
```

Sophie est prête ! 🚀
