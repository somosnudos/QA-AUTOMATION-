#!/usr/bin/env bash
# Trae/actualiza el skill canónico e2e-regression desde el repo central.
# Uso: bash scripts/sync-e2e-skill.sh
# Deja el método en ./.e2e-skill/ (agregalo a .gitignore).
set -euo pipefail

CENTRAL_REPO="somosnudos/QA-AUTOMATION-"
SKILL_PATH="skills/e2e-regression"
DEST=".e2e-skill"
REF="${1:-main}"

echo "▸ Sincronizando '$SKILL_PATH' desde $CENTRAL_REPO@$REF …"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Descarga solo la carpeta del skill usando la API de GitHub (requiere gh auth).
# Fallback a tarball si el sparse-checkout no está disponible.
if command -v gh >/dev/null 2>&1; then
  gh api "repos/$CENTRAL_REPO/tarball/$REF" > "$TMP/skill.tar.gz"
else
  echo "✘ Necesitás GitHub CLI (gh) autenticado. Instalá: https://cli.github.com" >&2
  exit 1
fi

tar -xzf "$TMP/skill.tar.gz" -C "$TMP"
SRC_DIR="$(find "$TMP" -type d -path "*/$SKILL_PATH" | head -1)"

if [[ -z "$SRC_DIR" ]]; then
  echo "✘ No se encontró '$SKILL_PATH' en el tarball de $CENTRAL_REPO@$REF" >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$SRC_DIR/." "$DEST/"

# Asegura que .e2e-skill esté ignorado.
if [[ -f .gitignore ]] && ! grep -qxF ".e2e-skill/" .gitignore; then
  echo ".e2e-skill/" >> .gitignore
  echo "▸ Agregado '.e2e-skill/' a .gitignore"
fi

echo "✓ Skill sincronizado en ./$DEST — seguí $DEST/SKILL.md"
