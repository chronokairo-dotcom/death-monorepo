#!/usr/bin/env bash
# swarm-run.sh — Fase 1 do swarm coding no death-monorepo
#
# Uso:
#   scripts/swarm-run.sh <spec-file>
#
# Spec format (YAML-ish leve, parser bash):
#   epic: <nome curto>
#   integrator_dir: <pasta destino do merge final>
#   ---
#   worker: <id>
#   tool: opencode|gemini
#   dir: <pasta isolada>
#   prompt: |
#     <prompt multilinha até próximo "---" ou EOF>
#   ---
#
# Workers rodam em paralelo. Cada um grava WORKER_LOG.md no seu dir.
# Exit code != 0 marca worker como failed mas não aborta os outros.

set -uo pipefail

SPEC="${1:-}"
if [[ -z "$SPEC" || ! -f "$SPEC" ]]; then
  echo "usage: $0 <spec-file>" >&2
  exit 2
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

EPIC="$(grep -m1 '^epic:' "$SPEC" | sed 's/^epic:[[:space:]]*//')"
EPIC="${EPIC:-unnamed-epic}"
SLUG="$(echo "$EPIC" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')"
TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
RUN_DIR="reports/swarm/${TS}-${SLUG}"
mkdir -p "$RUN_DIR"

echo "[swarm] epic=$EPIC run_dir=$RUN_DIR" | tee "$RUN_DIR/swarm.log"

# Parse workers (very small bash YAML-ish parser)
declare -a WORKER_IDS WORKER_TOOLS WORKER_DIRS WORKER_PROMPT_FILES
mkdir -p "$RUN_DIR/prompts"

awk -v out="$RUN_DIR/prompts" '
  BEGIN { w=0; in_prompt=0 }
  /^---/ {
    if (in_prompt) { close(pf); in_prompt=0 }
    next
  }
  /^worker:/ {
    sub(/^worker:[[:space:]]*/, "")
    w++; id=$0
    pf = out "/" w "-" id ".prompt.txt"
    print w "\t" id "\tWORKER_ID"
    next
  }
  /^tool:/ {
    sub(/^tool:[[:space:]]*/, "")
    print w "\t" $0 "\tWORKER_TOOL"
    next
  }
  /^dir:/ {
    sub(/^dir:[[:space:]]*/, "")
    print w "\t" $0 "\tWORKER_DIR"
    next
  }
  /^prompt:/ {
    sub(/^prompt:[[:space:]]*\|?[[:space:]]*/, "")
    in_prompt=1
    if (length($0) > 0) print $0 > pf
    print w "\t" pf "\tWORKER_PROMPT_FILE"
    next
  }
  in_prompt==1 {
    # strip leading 2 spaces if present (YAML block style)
    sub(/^  /, "")
    print $0 >> pf
  }
' "$SPEC" > "$RUN_DIR/parsed.tsv"

# Hydrate arrays
while IFS=$'\t' read -r idx val kind; do
  case "$kind" in
    WORKER_ID)          WORKER_IDS[$idx]="$val" ;;
    WORKER_TOOL)        WORKER_TOOLS[$idx]="$val" ;;
    WORKER_DIR)         WORKER_DIRS[$idx]="$val" ;;
    WORKER_PROMPT_FILE) WORKER_PROMPT_FILES[$idx]="$val" ;;
  esac
done < "$RUN_DIR/parsed.tsv"

run_worker() {
  local idx="$1"
  local id="${WORKER_IDS[$idx]}"
  local tool="${WORKER_TOOLS[$idx]}"
  local dir="${WORKER_DIRS[$idx]}"
  local prompt_file="${WORKER_PROMPT_FILES[$idx]}"
  local log="$RUN_DIR/${idx}-${id}.log"

  mkdir -p "$dir"
  local prompt
  prompt="$(cat "$prompt_file")"

  echo "[worker:$id] tool=$tool dir=$dir starting" | tee -a "$log"
  local started_at
  started_at="$(date -u +%s)"
  local rc=0

  case "$tool" in
    opencode)
      timeout 900 opencode run --dir "$dir" --dangerously-skip-permissions "$prompt" \
        >> "$log" 2>&1 || rc=$?
      ;;
    gemini)
      ( cd "$dir" && timeout 900 gemini -p "$prompt" --approval-mode yolo ) \
        >> "$log" 2>&1 || rc=$?
      ;;
    *)
      echo "[worker:$id] unknown tool: $tool" >> "$log"
      rc=99
      ;;
  esac

  local ended_at
  ended_at="$(date -u +%s)"
  local dur=$(( ended_at - started_at ))

  cat > "$dir/WORKER_LOG.md" <<EOF
# Worker $id

- tool: $tool
- exit: $rc
- duration_s: $dur
- prompt_file: ../../$prompt_file
- log: ../../$log
EOF

  echo "[worker:$id] done rc=$rc dur=${dur}s" | tee -a "$log"
  echo "$idx $id $tool $dir $rc $dur" >> "$RUN_DIR/results.tsv"
  return 0
}

echo "[swarm] launching ${#WORKER_IDS[@]} workers in parallel" | tee -a "$RUN_DIR/swarm.log"
: > "$RUN_DIR/results.tsv"

PIDS=()
for idx in "${!WORKER_IDS[@]}"; do
  run_worker "$idx" &
  PIDS+=($!)
done

for pid in "${PIDS[@]}"; do wait "$pid"; done

echo "[swarm] all workers finished" | tee -a "$RUN_DIR/swarm.log"

# Build summary
{
  echo "# Swarm run — $EPIC"
  echo
  echo "- timestamp: $TS"
  echo "- spec: $(basename "$SPEC")"
  echo "- workers: ${#WORKER_IDS[@]}"
  echo
  echo "| idx | id | tool | dir | exit | seconds |"
  echo "|---|---|---|---|---|---|"
  while read -r idx id tool dir rc dur; do
    echo "| $idx | $id | $tool | $dir | $rc | $dur |"
  done < "$RUN_DIR/results.tsv"
  echo
  echo "## Logs"
  for f in "$RUN_DIR"/*.log; do
    [[ "$f" == *"swarm.log" ]] && continue
    echo
    echo "### $(basename "$f")"
    echo
    echo '```'
    tail -40 "$f"
    echo '```'
  done
} > "$RUN_DIR/SUMMARY.md"

echo "[swarm] summary: $RUN_DIR/SUMMARY.md"
echo "[swarm] done."
