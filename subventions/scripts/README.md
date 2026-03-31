# Subsidy Tracking Scripts

Tools for managing Haie Lite Inc.'s grant and subsidy applications.

## Scripts

### subvention-tracker.sh
Main dashboard for monitoring all 18 subsidy applications.

**Usage:**
```bash
./subvention-tracker.sh
```

**Features:**
- Real-time status dashboard with 658k$ total in eligible grants
- Deadline warnings (< 30 days shows ⚠️)
- Status tracking: TODO, SENT, MEETING, PENDING, DONE, DENIED
- Automatic file creation on first run
- Handles invalid dates and amounts gracefully

**Status Meanings:**
| Status | Symbol | Meaning |
|--------|--------|---------|
| TODO | ⬜ | Application not yet prepared |
| SENT | 📤 | Application submitted |
| MEETING | 🤝 | Having meeting with program contact |
| PENDING | ⏳ | Awaiting decision |
| DONE | ✅ | Funds received |
| DENIED | ❌ | Application rejected |

**Data File:**
`../status/applications.tsv` — Tab-separated file with columns:
- `program`: Subsidy program name
- `status`: Current application status (TODO, SENT, MEETING, PENDING, DONE, DENIED)
- `amount`: Eligible amount in CAD
- `deadline`: Deadline date (YYYY-MM-DD) or "continu" for ongoing programs
- `contact`: Program contact info
- `notes`: Internal notes

### rsde-tracker.sh
Dedicated tracker for Canada's Scientific Research & Experimental Development (RS&DE) tax credit.

**Usage:**
```bash
./rsde-tracker.sh
```

### expense-logger.sh
Log operational expenses against subsidy categories for maximization analysis.

**Usage:**
```bash
./expense-logger.sh [amount] [category] [description]
```

## Directory Structure

```
subventions/
├── scripts/
│   ├── subvention-tracker.sh    # Main dashboard
│   ├── rsde-tracker.sh          # RS&DE specific
│   ├── expense-logger.sh        # Expense tracking
│   └── README.md                # This file
├── status/
│   └── applications.tsv         # Current app status
├── rsde-reports/                # RS&DE documentation
├── expenses/                     # Recorded expenses
└── *.html                        # Dossier files (CLE, primo-adoptants, etc.)
```

## Quick Updates

To update application status without using a text editor:

```bash
# The applications.tsv file is at:
../status/applications.tsv

# Edit with your favorite editor:
# nano ../status/applications.tsv
# vim ../status/applications.tsv
# open -a "Visual Studio Code" ../status/applications.tsv
```

## Eligible Subsidies Summary

18 programs, 658,000 CAD total:

**Continuous (no deadline):**
- Sub salariale (30k) — Employee payroll credits
- PAMT (60k) — Apprenticeship funding
- HortiCompétences (25k) — Sector training
- PRIIME (52k) — Worker qualification
- MFOR (15k) — Forestry worker training
- Bornes recharge (15k) — EV charging infrastructure
- DEC (50k) — Depreciation deduction
- Productivité-Compétences (20k) — Skills grants

**Expiring 2026:**
- Primo-adoptants (75k) — Startup innovation — *Deadline July 17, 2026*
- Roulez vert (4k) — Green vehicle — *Deadline Dec 31, 2026*
- iZEV/EVAP (10k) — EV incentives — *Deadline Dec 31, 2026*

**Future deadlines:**
- ESSOR 1C (50k) — Growth acceleration — *Mar 31, 2027*
- RS&DE (35k) — R&D tax credit — *Dec 31, 2027*
- CRIC (21k) — Research credit — *Dec 31, 2027*
- Crédit formation (13k) — Training credit — *Dec 31, 2027*
- CDAEIA (25k) — Sector development — *Dec 31, 2027*
- C3i (8k) — Equipment incentive — *Dec 31, 2029*
- FLI (150k) — Strategic loan — *Dec 31, 2028*

## Exit Strategy

As per GAMEPLAN-Q2-2026, subsidy cash flow feeds into:
1. **Operational efficiency** — Payroll credits reduce labor cost per job
2. **Growth acceleration** — ESSOR 1C + FLI funds Rive-Nord expansion (May 2026)
3. **Profitability** — 658k CAD minimizes startup burn, enables reinvestment
4. **Exit readiness** — Documented compliance + recurring revenue model = attractive to acquirers (Target: 20M$ exit by 2031)

---
*Last updated: 2026-03-31*
