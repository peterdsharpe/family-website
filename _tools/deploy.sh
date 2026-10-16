#!/usr/bin/env bash
# Build the site and commit _site/ to the gh-pages branch, which GitHub Pages
# serves at petem.art. It does not push; `git push origin gh-pages` publishes.
#
#   _tools/deploy.sh
#
# The commit is made with a scratch index, so nothing is checked out and the
# working tree is left alone. DEPLOY_BRANCH=name builds onto another branch,
# for trying the script out.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
branch=${DEPLOY_BRANCH:-gh-pages}

if [ -n "$(git status --porcelain)" ]; then
  echo "deploy: commit or stash your changes first, so the build matches a commit" >&2
  exit 1
fi

source=$(git rev-parse --short HEAD)
quarto render

# Quarto writes an empty page in place of each draft post. Drop those, so a
# draft's address is a plain 404 instead of a blank page.
find _site/posts -name index.html -size -200c -print -delete

git_dir=$(git rev-parse --absolute-git-dir)
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
export GIT_INDEX_FILE=$scratch/index

(cd _site && GIT_DIR=$git_dir GIT_WORK_TREE=. git add --all --force .)
tree=$(git write-tree)
parent=$(git rev-parse --verify --quiet "refs/heads/$branch" || true)
commit=$(git commit-tree "$tree" ${parent:+-p "$parent"} -m "Deploy from $source")
git update-ref "refs/heads/$branch" "$commit"

echo "$branch is now $(git rev-parse --short "$commit"), built from $source."
echo "Publish it with: git push origin $branch"
