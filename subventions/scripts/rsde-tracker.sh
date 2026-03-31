#!/bin/bash

# RS&DE Monthly Tracker — Haie Lite Inc.
# Auto-generates monthly Scientific Research & Experimental Development reports for tax credits
# Usage: ./rsde-tracker.sh [YYYY-MM]
# If no month specified, uses previous month

set -e

# Configuration
MONTH="${1:-$(date -v-1m +%Y-%m 2>/dev/null || date -d "-1 month" +%Y-%m)}"
REPO_PATH="/Users/thecreator/Library/Mobile Documents/com~apple~CloudDocs/Archives-Stockage/GitHub-Archive/Taillage de haies"
OUTPUT_DIR="$REPO_PATH/subventions/rsde-reports"
OUTPUT_FILE="$OUTPUT_DIR/rsde-report-$MONTH.md"

# Validate month format (YYYY-MM)
if ! [[ $MONTH =~ ^[0-9]{4}-[0-9]{2}$ ]]; then
  echo "❌ Invalid month format. Use YYYY-MM (e.g., 2026-03)"
  exit 1
fi

# Validate month is between 01 and 12
MONTH_NUM="${MONTH#*-}"
if [ "$MONTH_NUM" -lt 01 ] || [ "$MONTH_NUM" -gt 12 ]; then
  echo "❌ Invalid month: $MONTH_NUM. Must be between 01 and 12"
  exit 1
fi

# Check repo accessibility
if [ ! -d "$REPO_PATH/.git" ]; then
  echo "❌ Repo not found at: $REPO_PATH"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# R&D keywords to match in commit messages
RD_KEYWORDS="IA|AI|chatbot|VAPI|Sophie|optimi|route|scoring|lead|automat|webhook|cron|dashboard|ML|LLM|NLP|translat|traduct|Supabase|API|algorithm|predict|analytic"

# Parse month boundaries
START_DATE="${MONTH}-01"
# Calculate end of month (last day)
END_DATE=$(date -j -f "%Y-%m-%d" "${MONTH}-01" "+%Y-%m-%d" -v+1m 2>/dev/null || echo "${MONTH}-31")

echo "📊 Scanning repo for R&D commits..."
echo "   Period: $START_DATE to $END_DATE"

# Count total commits and R&D commits
TOTAL_COMMITS=$(cd "$REPO_PATH" && git log --oneline --after="$START_DATE" --before="$END_DATE" 2>/dev/null | wc -l | tr -d ' ')
RD_COMMITS=$(cd "$REPO_PATH" && git log --oneline --after="$START_DATE" --before="$END_DATE" 2>/dev/null | grep -iE "$RD_KEYWORDS" | wc -l | tr -d ' ')

# Get R&D commit details (format: date | message)
RD_DETAILS=$(cd "$REPO_PATH" && git log --format="| %ad | %s |" --date=short --after="$START_DATE" --before="$END_DATE" 2>/dev/null | grep -iE "$RD_KEYWORDS" || echo "| | No R&D commits found |")

# Estimate hours (2h per R&D commit average)
EST_HOURS=$((RD_COMMITS * 2))

# API cost estimates (monthly placeholders)
# Update these with actual invoices from: Infisical, Vercel, Supabase, etc.
ANTHROPIC_EST=80
OPENAI_EST=40
DEEPGRAM_EST=15
ELEVENLABS_EST=20
VERCEL_EST=20
SUPABASE_EST=25
CLOUDFLARE_EST=5
TWILIO_EST=30
TOTAL_API_COST=$((ANTHROPIC_EST + OPENAI_EST + DEEPGRAM_EST + ELEVENLABS_EST + VERCEL_EST + SUPABASE_EST + CLOUDFLARE_EST + TWILIO_EST))

# Salary estimate (JS hourly rate: $60/h, adjust as needed)
HOURLY_RATE=60
SALARY_RD=$((EST_HOURS * HOURLY_RATE))

# Total eligible expenses
TOTAL_ELIGIBLE=$((SALARY_RD + TOTAL_API_COST))

# Tax credits (CRA rates: Federal 35%, CRIC provincial 30%)
FEDERAL_CREDIT=$((TOTAL_ELIGIBLE * 35 / 100))
PROVINCIAL_CREDIT=$((TOTAL_ELIGIBLE * 30 / 100))

# Categorize commits by project
P1_SOPHIE=$(cd "$REPO_PATH" && git log --oneline --after="$START_DATE" --before="$END_DATE" 2>/dev/null | grep -iE "Sophie|VAPI|voice|vocal|recept|STT|TTS|ElevenLabs|Deepgram" | wc -l | tr -d ' ')
P2_TET=$(cd "$REPO_PATH" && git log --oneline --after="$START_DATE" --before="$END_DATE" 2>/dev/null | grep -iE "translat|traduct|TET|Guatemala|espagnol|spanish|Groq|chatbot" | wc -l | tr -d ' ')
P3_ROUTE=$(cd "$REPO_PATH" && git log --oneline --after="$START_DATE" --before="$END_DATE" 2>/dev/null | grep -iE "route|optimi|GPS|weather|météo|dispatch" | wc -l | tr -d ' ')
P4_SCORE=$(cd "$REPO_PATH" && git log --oneline --after="$START_DATE" --before="$END_DATE" 2>/dev/null | grep -iE "score|performance|KPI|dashboard|incentive|leaderboard" | wc -l | tr -d ' ')
P5_LEAD=$(cd "$REPO_PATH" && git log --oneline --after="$START_DATE" --before="$END_DATE" 2>/dev/null | grep -iE "lead|conversion|pipeline|webhook|cron|automat|SMS|follow" | wc -l | tr -d ' ')

# Calculate R&D ratio
RD_RATIO=0
if [ $TOTAL_COMMITS -gt 0 ]; then
  RD_RATIO=$((RD_COMMITS * 100 / TOTAL_COMMITS))
fi

# Generate markdown report
cat > "$OUTPUT_FILE" << REPORT
# Rapport RS&DE mensuel — $MONTH
## Taillage Haie Lite Inc.

**Généré le :** $(date +%Y-%m-%d)
**Période :** $MONTH
**Préparé par :** Script automatisé (rsde-tracker.sh)

---

## Résumé du mois

| Métrique | Valeur |
|----------|--------|
| Commits totaux | $TOTAL_COMMITS |
| Commits R&D identifiés | $RD_COMMITS |
| Ratio R&D | ${RD_RATIO}% |
| Heures R&D estimées | ${EST_HOURS}h |
| Salaire R&D estimé | \$${SALARY_RD} |
| Coûts API/infra | \$${TOTAL_API_COST} |
| **Total dépenses admissibles** | **\$${TOTAL_ELIGIBLE}** |
| Crédit fédéral (35%) | \$${FEDERAL_CREDIT} |
| Crédit CRIC (30%) | \$${PROVINCIAL_CREDIT} |
| **Total crédits potentiels** | **\$$(( FEDERAL_CREDIT + PROVINCIAL_CREDIT ))** |

---

## Répartition par projet

| # | Projet | Commits | Heures est. |
|---|--------|---------|-------------|
| 1 | Sophie — Réceptionniste IA vocale | $P1_SOPHIE | $((P1_SOPHIE * 2))h |
| 2 | Traducteur TET espagnol↔français | $P2_TET | $((P2_TET * 2))h |
| 3 | Optimisation routes prédictive | $P3_ROUTE | $((P3_ROUTE * 2))h |
| 4 | Scoring performance employés | $P4_SCORE | $((P4_SCORE * 2))h |
| 5 | Pipeline qualification leads IA | $P5_LEAD | $((P5_LEAD * 2))h |

---

## Coûts API et infrastructure

| Service | Coût estimé | Facture réelle |
|---------|-------------|----------------|
| Anthropic (Claude) | \$${ANTHROPIC_EST} | ___ \$ |
| OpenAI (GPT-4) | \$${OPENAI_EST} | ___ \$ |
| Deepgram (STT) | \$${DEEPGRAM_EST} | ___ \$ |
| ElevenLabs (TTS) | \$${ELEVENLABS_EST} | ___ \$ |
| Vercel (hosting) | \$${VERCEL_EST} | ___ \$ |
| Supabase (DB) | \$${SUPABASE_EST} | ___ \$ |
| Cloudflare Workers | \$${CLOUDFLARE_EST} | ___ \$ |
| Twilio (SMS/voice) | \$${TWILIO_EST} | ___ \$ |
| **Total** | **\$${TOTAL_API_COST}** | **___ \$** |

> **ACTION REQUISE :** Remplacer les estimés par les montants réels des factures mensuelles.

---

## Détail des commits R&D

| Date | Message du commit |
|------|-------------------|
$RD_DETAILS

---

## Journal hebdomadaire (à compléter manuellement)

| Semaine | Heures | Projet | Activité | Défi technique | Résultat |
|---------|--------|--------|----------|----------------|----------|
| S1 | | | | | |
| S2 | | | | | |
| S3 | | | | | |
| S4 | | | | | |

---

## Notes pour le comptable RS&DE

- **Ratio R&D ce mois :** ${RD_RATIO}% des commits identifiés comme R&D
- **Méthode d'estimation horaire :** 2h/commit (estimation conservative)
  - Ajuster avec time-tracking réel via Toggl ou équivalent
- **Salaire estimé :** \$${HOURLY_RATE}/h (à adapter au taux réel de JS)
- **Overhead 55% :** Non inclus ci-dessus — le comptable ajoute lors de la réclamation
- **Preuve documentaire :** Commits Git + factures API (Infisical, Vercel logs)
- **Repo GitHub :** \`JSLeboeuf/Taillage-de-haies\`

### Méthodologie de classification

Commits classifiés comme R&D si message contient :
- **Sophie (IA vocale) :** VAPI, voice, STT, TTS, ElevenLabs, Deepgram
- **TET (Traduction) :** Groq, chatbot, espagnol, Spanish, traduction
- **Routes (Optimisation) :** GPS, weather, dispatch, optimization
- **Scoring (KPI) :** Dashboard, incentive, leaderboard, performance
- **Pipeline (Lead qualification) :** Webhook, cron, SMS, automation, conversion

---

*Rapport généré automatiquement par rsde-tracker.sh*
*📌 Réviser et compléter les champs manuels (factures réelles, journal hebdomadaire) avant soumission au comptable*

REPORT

# Summary output
TOTAL_CREDITS=$((FEDERAL_CREDIT + PROVINCIAL_CREDIT))

echo ""
echo "✅ Rapport RS&DE généré avec succès"
echo ""
echo "📄 Fichier : $OUTPUT_FILE"
echo ""
echo "📊 Résumé :"
echo "   • Commits R&D : $RD_COMMITS / $TOTAL_COMMITS ($RD_RATIO%)"
echo "   • Heures R&D estimées : ${EST_HOURS}h"
echo "   • Salaire R&D : \$${SALARY_RD}"
echo "   • Coûts API/infra : \$${TOTAL_API_COST}"
echo "   • Dépenses admissibles : \$${TOTAL_ELIGIBLE}"
echo "   • Crédits potentiels : \$${TOTAL_CREDITS}"
echo ""
echo "🎯 Par projet :"
echo "   1. Sophie (vocale) : $P1_SOPHIE commits"
echo "   2. TET (traduction) : $P2_TET commits"
echo "   3. Routes (optim) : $P3_ROUTE commits"
echo "   4. Scoring (KPI) : $P4_SCORE commits"
echo "   5. Pipeline (leads) : $P5_LEAD commits"
echo ""
echo "⚠️  Action requise : Remplacer les estimés API par les factures réelles"
echo ""
