#!/usr/bin/env bash
# Enregistre l'état dans le dépôt (plusieurs robots peuvent pousser en même temps : on réessaie).
set -u
git config user.name "Pixel Facts (robot)"
git config user.email "pixelfacts-robot@users.noreply.github.com"
git add -A
git diff --cached --quiet && exit 0
git commit -q -m "$1 : $(date -u +%Y-%m-%dT%H:%MZ)"
for essai in 1 2 3 4 5 6; do
  if git pull -q --rebase -X theirs origin main && git push -q origin HEAD:main; then
    exit 0
  fi
  git rebase --abort 2>/dev/null
  sleep $((essai * 7))
done
echo "Impossible d'enregistrer après 6 essais" >&2
exit 1
