# RS&DE Tracker — Installation & Setup

## Overview

The RS&DE Tracker is a bash script that auto-generates monthly CRA-compliant Scientific Research & Experimental Development (RS&DE) tax credit reports from your git commit history.

**Location:** `/subventions/scripts/`

## What Was Installed

```
subventions/scripts/
├── rsde-tracker.sh          # Main executable (the magic happens here)
├── config.sh               # Configuration template (customize costs/rates)
├── README.md               # Full technical documentation
├── RSDE-QUICK-START.md     # Step-by-step user guide
├── INSTALLATION.md         # This file
└── (other subsidy scripts)
```

## System Requirements

- **Bash 4.0+** (macOS typically has 3.x, but script is compatible)
- **Git** (access to repo `.git` directory)
- **Unix utilities:** grep, wc, date, mkdir
- **Read access** to: `/Users/thecreator/Library/Mobile Documents/...`

## Setup Instructions

### 1. Verify Script is Executable

```bash
ls -la subventions/scripts/rsde-tracker.sh
```

Should show: `-rwxr-xr-x` (executable flag present)

If not:
```bash
chmod +x subventions/scripts/rsde-tracker.sh
```

### 2. Create Output Directory (Auto-created by script)

The script automatically creates `subventions/rsde-reports/` on first run. No manual setup needed.

### 3. Test the Script

```bash
cd "/Users/thecreator/Library/Mobile Documents/com~apple~CloudDocs/Archives-Stockage/GitHub-Archive/Taillage de haies"

# Generate report for March 2026
./subventions/scripts/rsde-tracker.sh 2026-03
```

Expected output:
```
📊 Scanning repo for R&D commits...
   Period: 2026-03-01 to 2026-04-01

✅ Rapport RS&DE généré avec succès

📄 Fichier : /.../subventions/rsde-reports/rsde-report-2026-03.md

📊 Résumé :
   • Commits R&D : X / Y (Z%)
   • Heures R&D estimées : Xh
   • Salaire R&D : $X
   • Coûts API/infra : $X
   • Dépenses admissibles : $X
   • Crédits potentiels : $X
```

### 4. Customize Configuration (Optional)

Edit `subventions/scripts/config.sh` to set:
- **HOURLY_RATE** — Developer hourly rate (default: $60)
- **API cost estimates** — Match your actual monthly spending

```bash
nano subventions/scripts/config.sh
```

Then use:
```bash
source subventions/scripts/config.sh
./subventions/scripts/rsde-tracker.sh 2026-03
```

## First Run Checklist

- [ ] Script is executable (`chmod +x rsde-tracker.sh`)
- [ ] You can read the git repo (no `fatal: not a git repository` error)
- [ ] First report generated successfully
- [ ] Report file contains all sections (summary, projects, costs, commits, journal, notes)
- [ ] Output directory created: `subventions/rsde-reports/`

## Common Issues & Fixes

### "fatal: not a git repository"

**Problem:** The Taillage-de-haies repo is in iCloud and git can't access `.git/`

**Solution:** Use the workaround documented in MEMORY.md:
```bash
# Clone to /tmp
/opt/homebrew/bin/gh repo clone JSLeboeuf/Taillage-de-haies /tmp/taillage-fresh

# Copy your script there
cp subventions/scripts/rsde-tracker.sh /tmp/taillage-fresh/subventions/scripts/

# Run from /tmp
cd /tmp/taillage-fresh
bash subventions/scripts/rsde-tracker.sh 2026-03
```

### "Invalid month format"

**Problem:** Incorrect month argument

**Solution:** Use YYYY-MM format (e.g., 2026-03)
```bash
./rsde-tracker.sh 2026-03      # Correct
./rsde-tracker.sh 2026-3       # Wrong (will fail)
./rsde-tracker.sh 2026-03-15   # Wrong (too detailed)
```

### Script not executable

**Problem:** `./rsde-tracker.sh` gives "Permission denied"

**Solution:**
```bash
chmod +x subventions/scripts/rsde-tracker.sh
```

### No commits found

**Problem:** Report shows 0 R&D commits, but you've been developing

**Solution:** Check your commit messages contain R&D keywords:
```bash
# See all commits this month
git log --oneline --after="2026-03-01" --before="2026-04-01"

# See which are flagged as R&D
git log --oneline --after="2026-03-01" --before="2026-04-01" \
  | grep -iE "IA|AI|chatbot|VAPI|Sophie|optimi|route|scoring|lead|automat|webhook|cron|dashboard|ML|LLM|NLP|translat|traduct"

# If none show up, your commits don't contain keywords
# Add keywords to future commits!
git commit -m "Sophie: Implement call transcription with Deepgram"
```

## How to Use (Quick Reference)

### Generate Monthly Report

```bash
cd "/Users/thecreator/Library/Mobile Documents/com~apple~CloudDocs/Archives-Stockage/GitHub-Archive/Taillage de haies"

# For specific month
./subventions/scripts/rsde-tracker.sh 2026-03

# For previous month (default)
./subventions/scripts/rsde-tracker.sh
```

### Generate with Custom Settings

```bash
# Custom hourly rate
HOURLY_RATE=75 ./subventions/scripts/rsde-tracker.sh 2026-03

# Custom API costs
ANTHROPIC_EST=95 OPENAI_EST=48 ./subventions/scripts/rsde-tracker.sh 2026-03

# Or source the config file first
source ./subventions/scripts/config.sh
./subventions/scripts/rsde-tracker.sh 2026-03
```

### After Script Runs

1. Open the generated report:
   ```bash
   open subventions/rsde-reports/rsde-report-2026-03.md
   ```

2. Complete the manual sections:
   - Replace estimated API costs with actual invoices
   - Fill in the weekly journal (hours, activities, challenges)
   - Update hourly rate if different

3. Send to comptable with supporting invoices

## File Locations

| File | Purpose |
|------|---------|
| `./rsde-tracker.sh` | Main executable script |
| `./config.sh` | Configuration template |
| `./README.md` | Full documentation |
| `./RSDE-QUICK-START.md` | User guide + examples |
| `./INSTALLATION.md` | This file |
| `../rsde-reports/` | Output directory (generated reports) |
| `../rsde-reports/rsde-report-YYYY-MM.md` | Individual monthly reports |

## Script Behavior

### Input Validation
- ✓ Accepts month as YYYY-MM (e.g., 2026-03)
- ✓ Rejects invalid format
- ✓ Rejects invalid month numbers (13+)
- ✓ Defaults to previous month if no argument

### Processing
1. Scans git log for commits in specified month
2. Filters commits with R&D keywords
3. Categorizes by project (Sophie, TET, Routes, Scoring, Pipeline)
4. Calculates hours (2h per commit, configurable)
5. Estimates API costs
6. Calculates federal (35%) and provincial (30%) tax credits

### Output
- Creates `rsde-reports/` directory if missing
- Generates `rsde-report-YYYY-MM.md` markdown file
- Prints summary to console
- Shows file location and key metrics

## Monthly Workflow

```
Week 1-4 of month:
  → Write commits with R&D keywords
  → Track API costs as you go

Day 1 of next month:
  → Run: ./rsde-tracker.sh [previous-month]
  → Open generated report
  → Fill in actual API costs from invoices
  → Complete weekly journal

Week 1 of next month:
  → Review report for accuracy
  → Send to comptable with invoices
  → Comptable files CRA form T661
```

## Support & Troubleshooting

- **Full docs:** `README.md`
- **User guide:** `RSDE-QUICK-START.md`
- **Config template:** `config.sh`
- **CRA form:** Form T661 (Scientific Research & Experimental Development Expenditures Claim)

## Advanced: Customizing Keywords

To add or change R&D keywords, edit `rsde-tracker.sh`:

```bash
# Find this line:
RD_KEYWORDS="IA|AI|chatbot|VAPI|Sophie|optimi|route|scoring|lead|automat|webhook|cron|dashboard|ML|LLM|NLP|translat|traduct|Supabase|API|algorithm|predict|analytic"

# Add your keywords with |
RD_KEYWORDS="IA|AI|chatbot|VAPI|Sophie|optimi|route|scoring|lead|automat|webhook|cron|dashboard|ML|LLM|NLP|translat|traduct|Supabase|API|algorithm|predict|analytic|mynewtopic"
```

## Next Steps

1. Run the script once: `./rsde-tracker.sh 2026-03`
2. Read the RSDE-QUICK-START guide
3. Complete your first manual report
4. Send to comptable

---

**Installation complete!**

*Last updated: 2026-03-31*
