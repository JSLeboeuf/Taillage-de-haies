#!/bin/bash
# Expense Logger for Subsidy Claims — Haie Lite Inc.
# Usage:
#   ./expense-logger.sh add <amount> <category> <program> <description>
#   ./expense-logger.sh report [program]
#   ./expense-logger.sh summary
#
# Categories: salary, api, cloud, equipment, training, consultant, travel, material
# Programs: rsde, mfor, essor, c3i, pamt, all
#
# Examples:
#   ./expense-logger.sh add 80.00 api rsde "Anthropic Claude API - mars 2026"
#   ./expense-logger.sh add 3500.00 training mfor "Formation sécurité CNESST - Module 1"
#   ./expense-logger.sh add 1200.00 equipment c3i "2x taille-haies Stihl HS 82"
#   ./expense-logger.sh report rsde
#   ./expense-logger.sh summary

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../expenses"
mkdir -p "$DATA_DIR"
CSV_FILE="$DATA_DIR/expenses-2026.csv"

# macOS-compatible multiplication using awk (no bc dependency)
multiply() {
    local num="$1"
    local factor="$2"
    awk "BEGIN {printf \"%.2f\", $num * $factor}"
}

# Validate amount format (integer or decimal with 1-2 decimals)
validate_amount() {
    if ! [[ "$1" =~ ^[0-9]+(\.[0-9]{1,2})?$ ]]; then
        echo "❌ Error: Invalid amount format. Use: 100 or 100.00"
        return 1
    fi
    return 0
}

# Validate category
validate_category() {
    case "$1" in
        salary|api|cloud|equipment|training|consultant|travel|material) return 0 ;;
        *) echo "❌ Error: Unknown category '$1'"; return 1 ;;
    esac
}

# Validate program
validate_program() {
    case "$1" in
        rsde|mfor|essor|c3i|pamt|all) return 0 ;;
        *) echo "❌ Error: Unknown program '$1'"; return 1 ;;
    esac
}

# Initialize CSV if doesn't exist
init_csv() {
    if [ ! -f "$CSV_FILE" ]; then
        echo "date,amount,category,program,description,receipt" > "$CSV_FILE"
    fi
}

# Add expense entry
cmd_add() {
    local AMOUNT="$1"
    local CATEGORY="$2"
    local PROGRAM="$3"
    shift 3
    local DESC="$@"

    if [ -z "$AMOUNT" ] || [ -z "$CATEGORY" ] || [ -z "$PROGRAM" ] || [ -z "$DESC" ]; then
        echo "Usage: $0 add <amount> <category> <program> <description>"
        echo ""
        echo "Categories: salary, api, cloud, equipment, training, consultant, travel, material"
        echo "Programs: rsde, mfor, essor, c3i, pamt, all"
        return 1
    fi

    validate_amount "$AMOUNT" || return 1
    validate_category "$CATEGORY" || return 1
    validate_program "$PROGRAM" || return 1

    init_csv

    local DATE=$(date +%Y-%m-%d)
    echo "$DATE,$AMOUNT,$CATEGORY,$PROGRAM,\"$DESC\",pending" >> "$CSV_FILE"
    echo "✅ Logged: $DATE | \$$AMOUNT | $CATEGORY | $PROGRAM | $DESC"

    # Show running total for this program
    local PROG_TOTAL
    PROG_TOTAL=$(awk -F',' -v prog="$PROGRAM" 'NR>1 && ($4==prog || $4=="all") {sum+=$2} END {printf "%.2f", sum}' "$CSV_FILE")

    if [ -z "$PROG_TOTAL" ] || [ "$PROG_TOTAL" = "0" ]; then
        echo "   Total $PROGRAM: \$0.00"
    else
        echo "   Total $PROGRAM: \$$PROG_TOTAL"
    fi
}

# Generate report
cmd_report() {
    local PROGRAM="${1:-all}"

    validate_program "$PROGRAM" || return 1
    init_csv

    # Check if CSV has data
    local LINE_COUNT
    LINE_COUNT=$(wc -l < "$CSV_FILE" | awk '{print $1}')
    if [ "$LINE_COUNT" -le 1 ]; then
        echo ""
        echo "No expense entries yet. Use: $0 add <amount> <category> <program> <description>"
        echo ""
        return 0
    fi

    local PROG_UPPER
    PROG_UPPER=$(echo "$PROGRAM" | tr '[:lower:]' '[:upper:]')

    echo ""
    echo "══════════════════════════════════════════════════════"
    echo "  RAPPORT DÉPENSES — $PROG_UPPER"
    echo "  $(date +%Y-%m-%d)"
    echo "══════════════════════════════════════════════════════"
    echo ""

    local FILTER
    if [ "$PROGRAM" = "all" ]; then
        FILTER='NR>1'
    else
        FILTER="NR>1 && (\$4==\"$PROGRAM\" || \$4==\"all\")"
    fi

    echo "  Date       │ Montant    │ Catégorie   │ Programme │ Description"
    echo "─────────────┼────────────┼─────────────┼───────────┼──────────────────────"

    awk -F',' "$FILTER"' {printf "  %-10s │ %8s $ │ %-11s │ %-9s │ %s\n", $1, $2, $3, $4, $5}' "$CSV_FILE"

    echo ""
    echo "── Totaux par catégorie ──"
    awk -F',' "$FILTER"' {cat[$3]+=$2} END {if (NR==1) {print "  (aucune)"; exit}; for (c in cat) printf "  %-12s: %10.2f $\n", c, cat[c]}' "$CSV_FILE"

    local TOTAL
    TOTAL=$(awk -F',' "$FILTER"' {sum+=$2} END {printf "%.2f", sum}' "$CSV_FILE")

    if [ -z "$TOTAL" ] || [ "$TOTAL" = "0" ]; then
        TOTAL="0.00"
    fi

    echo "  ─────────────────────────"
    echo "  TOTAL       : \$$TOTAL"

    # Show credit estimates for RS&DE
    if [ "$PROGRAM" = "rsde" ] || [ "$PROGRAM" = "all" ]; then
        local RSDE_TOTAL
        RSDE_TOTAL=$(awk -F',' 'NR>1 && ($4=="rsde" || $4=="all") {sum+=$2} END {printf "%.2f", sum}' "$CSV_FILE")

        if [ -n "$RSDE_TOTAL" ] && [ "$RSDE_TOTAL" != "0" ] && [ "$RSDE_TOTAL" != "0.00" ]; then
            local FED CRIC TCRED
            FED=$(multiply "$RSDE_TOTAL" "0.35")
            CRIC=$(multiply "$RSDE_TOTAL" "0.30")
            TCRED=$(multiply "$RSDE_TOTAL" "0.65")
            echo ""
            echo "── Crédits RS&DE estimés ──"
            echo "  Fédéral (35%): \$$FED"
            echo "  CRIC    (30%): \$$CRIC"
            echo "  Total crédits: \$$TCRED"
        fi
    fi

    echo ""
}

# Generate summary
cmd_summary() {
    init_csv

    # Check if CSV has data
    local LINE_COUNT
    LINE_COUNT=$(wc -l < "$CSV_FILE" | awk '{print $1}')
    if [ "$LINE_COUNT" -le 1 ]; then
        echo ""
        echo "No expense entries yet. Use: $0 add <amount> <category> <program> <description>"
        echo ""
        return 0
    fi

    echo ""
    echo "══════════════════════════════════════════════"
    echo "  SOMMAIRE DÉPENSES — Haie Lite 2026"
    echo "══════════════════════════════════════════════"
    echo ""
    echo "  Programme         │ Total dépenses │ Crédit/Sub estimé"
    echo "────────────────────┼────────────────┼──────────────────"

    for prog in rsde mfor essor c3i pamt; do
        local PROG_TOTAL
        PROG_TOTAL=$(awk -F',' -v p="$prog" 'NR>1 && ($4==p || $4=="all") {sum+=$2} END {printf "%.0f", sum}' "$CSV_FILE")

        # Handle zero values
        if [ -z "$PROG_TOTAL" ]; then
            PROG_TOTAL="0"
        fi

        local CREDIT
        local NAME
        local FACTOR

        case "$prog" in
            rsde) FACTOR="0.65"; NAME="RS&DE + CRIC" ;;
            mfor) FACTOR="0.75"; NAME="MFOR (75%)" ;;
            essor) FACTOR="0.50"; NAME="ESSOR 1C (50%)" ;;
            c3i) FACTOR="0.20"; NAME="C3i (20%)" ;;
            pamt) FACTOR="1.00"; NAME="PAMT (variable)" ;;
        esac

        if [ "$PROG_TOTAL" != "0" ]; then
            CREDIT="\$$(multiply "$PROG_TOTAL" "$FACTOR")"
        else
            CREDIT="\$0.00"
        fi

        printf "  %-18s │ %12s $ │ %14s\n" "$NAME" "$PROG_TOTAL" "$CREDIT"
    done

    local GRAND
    GRAND=$(awk -F',' 'NR>1 {sum+=$2} END {printf "%.0f", sum}' "$CSV_FILE")

    if [ -z "$GRAND" ]; then
        GRAND="0"
    fi

    echo "────────────────────┼────────────────┼──────────────────"
    printf "  %-18s │ %12s $\n" "GRAND TOTAL" "$GRAND"
    echo ""
    echo "  Entrées: $(( $(wc -l < "$CSV_FILE" | awk '{print $1}') - 1 ))"
    echo "  Fichier: $CSV_FILE"
    echo ""
}

# Main dispatch
case "${1:-help}" in
    add)
        shift
        cmd_add "$@"
        ;;
    report)
        shift
        cmd_report "$@"
        ;;
    summary)
        cmd_summary
        ;;
    *)
        echo "Expense Logger — Haie Lite Inc."
        echo ""
        echo "Usage:"
        echo "  \$0 add <amount> <category> <program> <description>"
        echo "  \$0 report [program]     # program: rsde, mfor, essor, c3i, pamt, all"
        echo "  \$0 summary"
        echo ""
        echo "Categories: salary, api, cloud, equipment, training, consultant, travel, material"
        echo "Programs: rsde, mfor, essor, c3i, pamt, all"
        echo ""
        echo "Examples:"
        echo "  \$0 add 80.00 api rsde \"Anthropic Claude API - mars 2026\""
        echo "  \$0 add 3500.00 training mfor \"Formation sécurité CNESST\""
        echo "  \$0 add 1200.00 equipment c3i \"2x taille-haies Stihl HS 82\""
        echo "  \$0 report rsde"
        echo "  \$0 summary"
        echo ""
        ;;
esac
