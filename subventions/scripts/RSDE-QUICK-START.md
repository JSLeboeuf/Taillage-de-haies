# RS&DE Tracker — Quick Start Guide

For Haie Lite Inc.'s Scientific Research & Experimental Development tax credit filing.

## What is RS&DE?

RS&DE (Scientific Research & Experimental Development) is a Canadian tax incentive that provides:
- **Federal CTRC:** 35% refund on eligible R&D expenses
- **Quebec CRIC:** 30% refund on eligible R&D expenses
- **Example:** $10k in eligible salaries + API costs = $6.5k in tax credits

Haie Lite Inc. qualifies through development of:
- Sophie: AI voice receptionist (VAPI, Deepgram, ElevenLabs)
- TET: Bilingual chatbot translator (Groq, LLM)
- Route optimization: Predictive dispatch algorithms
- Performance scoring: ML-based employee KPI dashboard
- Lead pipeline: Automated qualification system (webhooks, cron)

## Typical Monthly Workflow

### 1. Throughout the month: Write good commit messages
```bash
# GOOD: Keyword-rich, describes the R&D work
git commit -m "Sophie: Implement call transcription + sentiment analysis with Deepgram + Claude"

# ALSO GOOD: Multiple keywords help categorization
git commit -m "TET: Add grammar correction to Spanish→French translation with Groq LLM"

# NOT R&D: Avoid these for non-R&D commits
git commit -m "Fix typo in footer"
git commit -m "Update button styling"
```

### 2. Month end: Generate report (takes 1 minute)
```bash
cd ~/.../"Taillage de haies"
./subventions/scripts/rsde-tracker.sh 2026-03
```

Output:
- `subventions/rsde-reports/rsde-report-2026-03.md`
- Console shows summary:
  ```
  ✅ Rapport RS&DE généré avec succès
  📊 Résumé :
     • Commits R&D : 12 / 18 (67%)
     • Heures R&D estimées : 24h
     • Salaire R&D : $1440
     • Coûts API/infra : $235
     • Dépenses admissibles : $1675
     • Crédits potentiels : $1089
  ```

### 3. Week 1 of next month: Complete the report
Open `rsde-report-2026-03.md` and fill in:

1. **Actual API costs** (replace estimates)
   - Log into Vercel, Supabase, Anthropic, OpenAI dashboards
   - Copy actual invoice amounts into the API cost table

2. **Weekly journal** (1 entry per week)
   - Week 1: "Integrated Claude API for smart quote suggestions. Challenge: Context window limits. Result: 87% accuracy on Q estimates."
   - Week 2: "Built route optimization algorithm. Challenge: Balanced drive-time vs. weather. Result: -15% avg travel time."
   - etc.

3. **Salary rate** (if not $60/hour)
   - Update `Salaire estimé: $60/h` if JS actually makes more/less

### 4. Week 2: Send to comptable
Email to your accountant:
- File: `rsde-report-2026-03.md`
- Attachments:
  - Vercel invoice (PDF)
  - Supabase invoice (PDF)
  - Anthropic/OpenAI invoice (PDF)
  - Any other API/hosting costs

## Keywords Detected

The script auto-scans commit messages for R&D activity. Here's what gets flagged:

### AI/ML Development
```
IA, AI, ML, LLM, NLP
algorithm, predict, analytic
```

### Voice & Speech
```
VAPI, voice, vocal
STT (speech-to-text)
TTS (text-to-speech)
ElevenLabs, Deepgram
recept (receptionist)
```

### Chatbots & Translation
```
chatbot, Sophie
translat, traduct, TET
Guatemala, espagnol, spanish
Groq
```

### Automation & APIs
```
webhook, cron, automat
API
```

### Optimization
```
optimi, route, GPS, weather, dispatch, météo
```

### Performance Tracking
```
scoring, dashboard, KPI
incentive, leaderboard
performance
```

### Lead Management
```
lead, conversion, pipeline
SMS, follow-up, follow
```

### Infrastructure (if used for R&D)
```
Supabase, webhook, API
```

**Pro tip:** Use these keywords intentionally in your commit messages. It helps the script categorize your work and makes the comptable's job easier.

## Example Report

### ✅ What you'll get
A markdown file with:

1. **Monthly Summary Table**
   - Total commits | R&D commits | Hours | Costs | Credits

2. **Project Breakdown**
   - Sophie: X commits, Yh hours
   - TET: X commits, Yh hours
   - Routes: X commits, Yh hours
   - Scoring: X commits, Yh hours
   - Pipeline: X commits, Yh hours

3. **API Cost Table**
   ```
   | Service | Estimate | Actual |
   |---------|----------|--------|
   | Anthropic (Claude) | $80 | $95.42 |
   | OpenAI (GPT-4) | $40 | $38.15 |
   | Deepgram (STT) | $15 | $18.30 |
   | ElevenLabs (TTS) | $20 | $22.80 |
   ...
   ```

4. **Detailed Commit List**
   ```
   | Date | Message |
   |------|---------|
   | 2026-03-01 | Sophie: Implement call transcription with Deepgram |
   | 2026-03-05 | TET: Add grammar correction to translations |
   ...
   ```

5. **Weekly Journal Template** (you fill in)
   ```
   | Week | Hours | Project | Activity | Challenge | Result |
   |------|-------|---------|----------|-----------|--------|
   | S1 | 8 | Sophie | Built voice API integration | Rate limiting | 99.5% uptime |
   | S2 | 6 | TET | Improved Spanish→French accuracy | ... | ... |
   ```

6. **Notes for Comptable**
   - Salary estimate used
   - Hours per commit assumption
   - Overhead info
   - Proof documentation (commits + invoices)

## Customization

### Update API cost estimates
Edit `subventions/scripts/config.sh`:
```bash
# Current defaults (month)
export ANTHROPIC_EST=80
export OPENAI_EST=40
export DEEPGRAM_EST=15
export ELEVENLABS_EST=20
export VERCEL_EST=20
export SUPABASE_EST=25
export CLOUDFLARE_EST=5
export TWILIO_EST=30

# Change to match your actual costs
export ANTHROPIC_EST=120
export OPENAI_EST=55
# etc.
```

### Update hourly rate
```bash
# Default: $60/hour
export HOURLY_RATE=75

# Then run script:
./rsde-tracker.sh 2026-03
```

### Average hours per commit
Edit `rsde-tracker.sh`, change this line:
```bash
# Estimate hours (2h per R&D commit average)
EST_HOURS=$((RD_COMMITS * 2))

# To, e.g., 2.5h:
EST_HOURS=$((RD_COMMITS * 25 / 10))
```

## Troubleshooting

### Git error: "fatal: not a git repository"
The repo is in iCloud and not synced locally. Workaround:
```bash
# Clone repo to temp location
/opt/homebrew/bin/gh repo clone JSLeboeuf/Taillage-de-haies /tmp/taillage-fresh

# Run script from there
cd /tmp/taillage-fresh
bash subventions/scripts/rsde-tracker.sh 2026-03
```

### No R&D commits found (0%)
- Check that your commit messages contain R&D keywords
- Grep for keywords: `git log --oneline --grep="IA\|AI\|webhook"`
- Consider expanding the keyword list in the script

### API costs seem low
- Script uses ESTIMATES only — you MUST replace with actual invoices
- Check Vercel, Supabase, Anthropic billing pages for real amounts
- Update the generated report before sending to comptable

## CRA Compliance Notes

### Eligible activities:
- Developing new AI/ML features
- Integrating advanced APIs (LLMs, speech services)
- Building optimization algorithms
- Automating workflows with webhooks/crons
- Creating performance analytics systems

### NOT eligible:
- Routine bug fixes
- Styling/UI tweaks
- Using third-party tools without customization
- Standard CRUD operations
- Maintenance and support

### Documentation required:
1. Commit history (GitHub = proof)
2. Time tracking (weekly journal in report)
3. Cost invoices (API + hosting)
4. Technical description (what did you build + why?)

### Tax credit calculation:
```
Gross eligible labor = Hours × Hourly rate
Applied overhead (55%) = Gross × 0.55
Total labor eligible = Gross + Applied overhead

Total eligible = Labor + API costs
Federal credit (35%) = Total × 0.35
Provincial credit (30%) = Total × 0.30
```

The script calculates without overhead — your comptable adds it when filing CRA form T661.

## Files in This Directory

- `rsde-tracker.sh` — Main script (run this)
- `config.sh` — Customize rates and costs
- `README.md` — Full documentation
- `RSDE-QUICK-START.md` — This file

## Need Help?

1. **Check the README.md** for detailed usage
2. **Read the CRA T661 form** for what's eligible
3. **Email your comptable** with questions about specific activities
4. **Review commit messages** to ensure they're R&D-focused

---

**Good luck with your RS&DE filing!**

*Last updated: 2026-03-31*
