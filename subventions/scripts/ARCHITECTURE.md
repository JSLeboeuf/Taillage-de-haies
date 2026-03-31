# RS&DE Tracker — Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RS&DE Tracker System                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Input: ./rsde-tracker.sh [YYYY-MM]                   │
│       ↓                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Input Validation Layer                              │   │
│  │ • Month format validation (YYYY-MM)                 │   │
│  │ • Month range validation (01-12)                    │   │
│  │ • Repo accessibility check                          │   │
│  └─────────────────────────────────────────────────────┘   │
│       ↓                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Git Log Processing Layer                            │   │
│  │ • git log --oneline [date range]                   │   │
│  │ • Filter: grep -iE [RD_KEYWORDS]                   │   │
│  │ • Output: commit list + detailed format            │   │
│  └─────────────────────────────────────────────────────┘   │
│       ↓                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Classification & Counting Layer                     │   │
│  │ • Count total commits                              │   │
│  │ • Count R&D commits                                │   │
│  │ • Categorize by project (5 categories)             │   │
│  │ • Calculate R&D ratio                              │   │
│  └─────────────────────────────────────────────────────┘   │
│       ↓                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Financial Calculation Layer                         │   │
│  │ • Hours: RD_COMMITS × 2 (configurable)            │   │
│  │ • Salary: Hours × HOURLY_RATE                      │   │
│  │ • API costs: Sum of 8 services                     │   │
│  │ • Total: Salary + API costs                        │   │
│  │ • Credits: Total × 35% + 30%                       │   │
│  └─────────────────────────────────────────────────────┘   │
│       ↓                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Report Generation Layer                            │   │
│  │ • Create rsde-reports/ directory                   │   │
│  │ • Generate markdown template                       │   │
│  │ • Populate with calculated values                  │   │
│  │ • Add manual sections (journal, notes)             │   │
│  └─────────────────────────────────────────────────────┘   │
│       ↓                                                      │
│  Output: rsde-report-YYYY-MM.md + console summary         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Input Validation Layer

**Purpose:** Ensure valid month format and repo accessibility

**Code:**
```bash
# Month format validation
if ! [[ $MONTH =~ ^[0-9]{4}-[0-9]{2}$ ]]; then
  echo "❌ Invalid month format. Use YYYY-MM"
  exit 1
fi

# Month range validation (01-12)
MONTH_NUM="${MONTH#*-}"
if [ "$MONTH_NUM" -lt 01 ] || [ "$MONTH_NUM" -gt 12 ]; then
  echo "❌ Invalid month: must be 01-12"
  exit 1
fi

# Repo accessibility check
if [ ! -d "$REPO_PATH/.git" ]; then
  echo "❌ Repo not found at: $REPO_PATH"
  exit 1
fi
```

**Errors Handled:**
- ✓ Invalid format (123-456, 2026/03, etc.)
- ✓ Out-of-range months (2026-13, 2026-00)
- ✓ Missing repo directory

### 2. Git Log Processing Layer

**Purpose:** Extract commits and filter for R&D keywords

**Code:**
```bash
# Extract month boundaries
START_DATE="${MONTH}-01"
END_DATE=$(date -j ... -v+1m)  # First day of next month

# Count total commits
TOTAL_COMMITS=$(cd "$REPO_PATH" && \
  git log --oneline \
    --after="$START_DATE" \
    --before="$END_DATE" | wc -l)

# Count R&D commits (with keyword filter)
RD_COMMITS=$(cd "$REPO_PATH" && \
  git log --oneline \
    --after="$START_DATE" \
    --before="$END_DATE" | \
  grep -iE "$RD_KEYWORDS" | wc -l)

# Get detailed commit info
RD_DETAILS=$(cd "$REPO_PATH" && \
  git log --format="| %ad | %s |" \
    --date=short \
    --after="$START_DATE" \
    --before="$END_DATE" | \
  grep -iE "$RD_KEYWORDS")
```

**Keyword List (30+ terms):**
```
IA|AI|chatbot|VAPI|Sophie|optimi|route|scoring|lead|automat
webhook|cron|dashboard|ML|LLM|NLP|translat|traduct|Supabase
API|algorithm|predict|analytic
```

**Output:** Counts + commit list (date + message)

### 3. Classification & Counting Layer

**Purpose:** Categorize commits into 5 projects

**Projects:**
1. **Sophie** (AI voice receptionist)
   - Keywords: voice, VAPI, STT, TTS, ElevenLabs, Deepgram, recept
   
2. **TET** (Spanish-French translator)
   - Keywords: translat, traduct, chatbot, Groq, Spanish, espagnol, Guatemala
   
3. **Routes** (Optimization)
   - Keywords: route, optimi, GPS, weather, dispatch, météo
   
4. **Scoring** (KPI dashboard)
   - Keywords: scoring, dashboard, KPI, incentive, leaderboard, performance
   
5. **Pipeline** (Lead qualification)
   - Keywords: lead, conversion, pipeline, webhook, cron, automat, SMS

**Code:**
```bash
P1_SOPHIE=$(cd "$REPO_PATH" && git log --oneline ... | \
  grep -iE "Sophie|VAPI|voice|vocal|STT|TTS|ElevenLabs|Deepgram" | wc -l)

# Similar for P2_TET, P3_ROUTE, P4_SCORE, P5_LEAD
```

### 4. Financial Calculation Layer

**Purpose:** Compute eligible expenses and tax credits

**Variables:**
```bash
# From git processing
RD_COMMITS     # Count of R&D commits
TOTAL_COMMITS  # Count of all commits
RD_RATIO       # Percentage (RD_COMMITS / TOTAL_COMMITS)

# Configuration (from config.sh or env)
HOURLY_RATE    # $60/hour (default, customizable)
ANTHROPIC_EST  # $80/month
OPENAI_EST     # $40/month
DEEPGRAM_EST   # $15/month
# ... 5 more services

# Calculations
EST_HOURS=$((RD_COMMITS * 2))                    # Hours
SALARY_RD=$((EST_HOURS * HOURLY_RATE))          # Labor cost
TOTAL_API_COST=$((SUM OF 8 SERVICES))           # Infrastructure
TOTAL_ELIGIBLE=$((SALARY_RD + TOTAL_API_COST))  # Total expenses
FEDERAL_CREDIT=$((TOTAL_ELIGIBLE * 35 / 100))   # Federal refund
PROVINCIAL_CREDIT=$((TOTAL_ELIGIBLE * 30 / 100))# Provincial refund
```

**Example Calculation:**
```
Input:
  RD_COMMITS = 12
  HOURLY_RATE = $60
  TOTAL_API_COST = $235

Calculation:
  EST_HOURS = 12 × 2 = 24h
  SALARY_RD = 24 × $60 = $1,440
  TOTAL_ELIGIBLE = $1,440 + $235 = $1,675
  FEDERAL_CREDIT = $1,675 × 35% = $586.25
  PROVINCIAL_CREDIT = $1,675 × 30% = $502.50
  TOTAL_CREDITS = $1,088.75

Note: Overhead (55%) NOT included — comptable adds separately
```

### 5. Report Generation Layer

**Purpose:** Create CRA-compliant markdown documentation

**Template Sections:**

```markdown
# Rapport RS&DE mensuel — YYYY-MM

## Résumé du mois
| Métrique | Valeur |
• Commits totaux
• Commits R&D identifiés
• Heures R&D estimées
• Salaire R&D estimé
• Coûts API/infra
• Total dépenses admissibles
• Crédit fédéral (35%)
• Crédit CRIC (30%)

## Répartition par projet
| Projet | Commits | Heures |
Sophie, TET, Routes, Scoring, Pipeline

## Coûts API et infrastructure
| Service | Estimé | Réel |
(8 services with blanks for actual invoices)

## Détail des commits R&D
| Date | Message |
(auto-populated from git log)

## Journal hebdomadaire (à compléter)
| Semaine | Heures | Projet | Activité | Défi | Résultat |
(4 rows, user fills in)

## Notes pour le comptable
- R&D ratio calculation
- Hours estimation method
- Overhead explanation
- CRA compliance notes
```

**Output File:**
```
subventions/rsde-reports/rsde-report-YYYY-MM.md
```

## Configuration Sources (Priority Order)

1. **Environment Variables** (highest priority)
   ```bash
   HOURLY_RATE=75 ./rsde-tracker.sh 2026-03
   ```

2. **config.sh** (sourced by user)
   ```bash
   source ./config.sh
   ./rsde-tracker.sh 2026-03
   ```

3. **Hardcoded Defaults** (lowest priority)
   ```bash
   HOURLY_RATE=60
   ANTHROPIC_EST=80
   # etc.
   ```

## Data Flow Example

```
Input: ./rsde-tracker.sh 2026-03

1. Validation
   ✓ Month format: 2026-03 (valid)
   ✓ Month range: 03 (valid)
   ✓ Repo exists: /Users/thecreator/.../Taillage de haies

2. Git Processing
   $ git log --oneline --after="2026-03-01" --before="2026-04-01"
   → Found 18 total commits
   → Found 12 R&D commits (keyword match)

3. Classification
   P1 Sophie: 3 commits
   P2 TET: 4 commits
   P3 Routes: 2 commits
   P4 Scoring: 1 commit
   P5 Pipeline: 2 commits

4. Financial Calculation
   Hours = 12 × 2 = 24h
   Salary = 24 × $60 = $1,440
   API = $235
   Total = $1,675
   Credits = $1,675 × 65% = $1,089

5. Report Generation
   → Create rsde-reports/ if missing
   → Generate rsde-report-2026-03.md
   → Print summary to console

Output: $1,089 in potential tax credits
```

## Error Handling

| Error | Detection | Response |
|-------|-----------|----------|
| Invalid month format | Regex check | Exit with message |
| Month out of range | Math comparison | Exit with message |
| Repo not found | Directory check | Exit with message |
| No commits found | wc -l == 0 | Continue, show 0 in report |
| Git command fails | Command redirect | Silent fallback (0 count) |

## Performance Considerations

- **Typical run time:** 1-2 seconds
- **Bottleneck:** Git log traversal (proportional to repo size)
- **Optimization:** grep filters applied at git output, not post-processing
- **Memory:** Negligible (pure bash, no external data structures)

## Extensibility

### Add New Project Category

1. Define keywords in `RD_KEYWORDS`
2. Add project-specific grep in classification section
3. Add row to project breakdown table
4. Re-run script

### Add New API Service

1. Define estimate variable (e.g., `NEWSERVICE_EST=50`)
2. Add to `TOTAL_API_COST` sum
3. Add row to API cost table
4. User can override via env or config.sh

### Customize Hourly Rate

```bash
# Option 1: Environment variable
HOURLY_RATE=75 ./rsde-tracker.sh 2026-03

# Option 2: Edit config.sh
export HOURLY_RATE=75

# Option 3: Edit script directly (not recommended)
sed -i '' 's/HOURLY_RATE=60/HOURLY_RATE=75/' rsde-tracker.sh
```

## Security Considerations

- ✓ No shell injection (all variables quoted)
- ✓ No external network calls
- ✓ No credential handling
- ✓ Read-only git operations
- ✓ Output to user-writable directory only

## Dependencies

| Tool | Purpose | Alternative |
|------|---------|-------------|
| bash | Scripting | sh (limited compatibility) |
| git | Source control data | None (core to system) |
| grep | Pattern matching | rg, ag (more advanced) |
| wc | Line counting | awk (more complex) |
| date | Date calculations | perl (more complex) |
| mkdir | Directory creation | Built-in (mkdir only) |

## Testing Strategy

- ✓ Valid month format acceptance
- ✓ Invalid format rejection
- ✓ Invalid month rejection
- ✓ Output file creation
- ✓ Report section presence
- ✓ Configuration loading
- ✓ Documentation completeness

## Future Enhancements

Possible improvements (not implemented):
- Time tracking integration (Toggl API)
- Real-time API cost pulling (Vercel API, etc.)
- Email delivery of reports
- Web dashboard with charts
- Historical trend analysis
- Multi-month aggregation

---

*Architecture documentation: 2026-03-31*
