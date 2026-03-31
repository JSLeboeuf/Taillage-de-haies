#!/bin/bash
# Subsidy Tracker — Haie Lite Inc.
# Usage: ./subvention-tracker.sh
# Shows status of all 18 subsidy applications

set -o pipefail

TODAY=$(date +%Y-%m-%d)

DAYS_FN() {
    # Calculate days between today and target date
    # Returns: positive (days remaining), negative (expired), or "N/A" on parse error
    local target="$1"

    # Handle "continu" dates
    if [ "$target" = "continu" ]; then
        echo "N/A"
        return 0
    fi

    # Validate date format (YYYY-MM-DD)
    if ! [[ "$target" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo "ERR"
        return 1
    fi

    # Convert dates to seconds (macOS compatible using -j flag)
    local today_sec=$(date -j -f "%Y-%m-%d" "$TODAY" +%s 2>/dev/null)
    local target_sec=$(date -j -f "%Y-%m-%d" "$target" +%s 2>/dev/null)

    # Handle date parsing failures
    if [ -z "$today_sec" ] || [ -z "$target_sec" ]; then
        echo "ERR"
        return 1
    fi

    # Return days difference (positive = future, negative = past)
    echo $(( (target_sec - today_sec) / 86400 ))
}

echo "════════════════════════════════════════════════════════════"
echo "  SUBVENTIONS TRACKER — Haie Lite Inc.  $(date +%Y-%m-%d)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Status file for tracking progress
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATUS_DIR="$SCRIPT_DIR/../status"
mkdir -p "$STATUS_DIR" 2>/dev/null || {
    echo "ERROR: Cannot create $STATUS_DIR" >&2
    exit 1
}

STATUS_FILE="$STATUS_DIR/applications.tsv"

# Initialize status file if doesn't exist
if [ ! -f "$STATUS_FILE" ]; then
    cat > "$STATUS_FILE" << 'INIT'
program	status	amount	deadline	contact	notes
Sub salariale	TODO	30000	continu	CLE 1-877-767-8773	6 employés
PAMT	TODO	60000	continu	HortiComp 450-774-3456	4 apprentis
HortiCompétences	TODO	25000	continu	info@horticompetences.ca	Sub sectorielle
PRIIME	TODO	52000	continu	CLE 1-877-767-8773	Vérifier TET
MFOR	TODO	15000	continu	CLE 1-877-767-8773	Plan 13k$ prêt
ESSOR 1C	TODO	50000	2027-03-31	IQ 1-844-474-6367	App Haie Lite
FLI	TODO	150000	2028-12-31	DEV VS 450-455-3809	Prêt avantageux
Primo-adoptants	TODO	75000	2026-07-17	startups-innovation@economie.gouv.qc.ca	Fenêtre juillet
RS&DE	TODO	35000	2027-12-31	Comptable RS&DE	Documenter maintenant
CRIC	TODO	21000	2027-12-31	Revenu Québec	Même dossier RS&DE
Crédit formation	TODO	13000	2027-12-31	Revenu Québec	Tracker dépenses
C3i	TODO	8000	2029-12-31	Revenu Québec	Factures équipement
Roulez vert	TODO	4000	2026-12-31	Concessionnaire	DERNIÈRE ANNÉE
iZEV/EVAP	TODO	10000	2026-12-31	Concessionnaire	Cumulable Roulez vert
Bornes recharge	TODO	15000	continu	Écorecharge	Si véhicules EV
DEC	TODO	50000	continu	dec.canada.ca	Dossier complet
CDAEIA	TODO	25000	2027-12-31	IQ + RQ	Vérifier admissibilité
Productivité-Compétences	TODO	20000	continu	cpmt.gouv.qc.ca	Appels projets
INIT
    echo "✓ Created $STATUS_FILE" >&2
fi

# Check file is readable
if [ ! -r "$STATUS_FILE" ]; then
    echo "ERROR: Cannot read $STATUS_FILE" >&2
    exit 1
fi

# Read and display status
echo "  # │ Programme              │ Montant   │ Status      │ Deadline"
echo "────┼────────────────────────┼───────────┼─────────────┼─────────────"

TOTAL=0
DONE=0
COUNT=0
LINE_NUM=0

while IFS=$'\t' read -r program status amount deadline contact notes; do
    LINE_NUM=$((LINE_NUM + 1))

    # Skip header row
    if [ "$program" = "program" ]; then
        continue
    fi

    # Skip empty lines
    if [ -z "$program" ]; then
        continue
    fi

    COUNT=$((COUNT + 1))

    # Validate amount is numeric
    if ! [[ "$amount" =~ ^[0-9]+$ ]]; then
        amount="0"
    fi

    TOTAL=$((TOTAL + amount))

    # Status emoji and label
    case "$status" in
        DONE)    ST="✅ REÇU    "; DONE=$((DONE + amount)) ;;
        SENT)    ST="📤 ENVOYÉ  " ;;
        MEETING) ST="🤝 RDV     " ;;
        PENDING) ST="⏳ EN COURS" ;;
        TODO)    ST="⬜ À FAIRE " ;;
        DENIED)  ST="❌ REFUSÉ  " ;;
        *)       ST="❓ ???     " ;;
    esac

    # Deadline warning
    if [ "$deadline" = "continu" ]; then
        DL="continu"
    else
        DAYS=$(DAYS_FN "$deadline")
        case "$DAYS" in
            N/A)
                DL="continu"
                ;;
            ERR)
                DL="Invalid date: $deadline"
                ;;
            *)
                if [ "$DAYS" -lt 0 ]; then
                    DL="EXPIRÉ ($deadline)"
                elif [ "$DAYS" -lt 30 ]; then
                    DL="⚠️  ${DAYS}j ($deadline)"
                elif [ "$DAYS" -lt 90 ]; then
                    DL="${DAYS}j"
                else
                    DL="$deadline"
                fi
                ;;
        esac
    fi

    printf " %2d │ %-22s │ %7d $ │ %s │ %s\n" "$COUNT" "$program" "$amount" "$ST" "$DL"
done < "$STATUS_FILE"

echo "────┼────────────────────────┼───────────┼─────────────┼─────────────"
printf "    │ TOTAL                  │ %7d $ │ Reçu: %7d $\n" "$TOTAL" "$DONE"
echo ""

# Show next actions
URGENT=$(awk -F'\t' -v today="$TODAY" '
    NR > 1 && $4 != "continu" && $4 ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/ {
        cmd = "date -j -f \"%Y-%m-%d\" \"" today "\" +%s 2>/dev/null"
        cmd | getline today_sec
        close(cmd)

        cmd = "date -j -f \"%Y-%m-%d\" \"" $4 "\" +%s 2>/dev/null"
        cmd | getline target_sec
        close(cmd)

        if (target_sec != "") {
            days = (target_sec - today_sec) / 86400
            if (days >= 0 && days < 30 && $2 != "DONE" && $2 != "DENIED") {
                print $1 " — " $4
            }
        }
    }
' "$STATUS_FILE")

if [ -n "$URGENT" ]; then
    echo "  ⚠️  URGENT (< 30 jours):"
    echo "$URGENT" | sed 's/^/     • /'
    echo ""
fi

echo "  Pour mettre à jour un status:"
echo "  Éditer: $STATUS_FILE"
echo "  Status possibles: TODO, SENT, MEETING, PENDING, DONE, DENIED"
echo ""
