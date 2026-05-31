# Version Management Guide

This is your day-to-day operational reference for managing the French Match app across
`develop`, `staging`, and `main` (production). Keep this open while working.

---

## Table of Contents

1. [The Three-Branch Model](#1-the-three-branch-model)
2. [Inspecting Differences Between Branches](#2-inspecting-differences-between-branches)
3. [Pushing Work to Staging](#3-pushing-work-to-staging)
4. [Pushing Staging to Production](#4-pushing-staging-to-production)
5. [Checking What Vercel Has Deployed](#5-checking-what-vercel-has-deployed)
6. [Is GitHub in Sync with Vercel?](#6-is-github-in-sync-with-vercel)
7. [Emergency Rollback](#7-emergency-rollback)
8. [Undoing a Mistake](#8-undoing-a-mistake)
9. [Quick-Reference Command Card](#9-quick-reference-command-card)

---

## 1. The Three-Branch Model

```
develop  ──► staging  ──► main
  │             │            │
  │             │            └─ Live app (Vercel production)
  │             └─ Pre-release testing (Vercel staging preview)
  └─ Active development (Vercel develop preview)
```

| Branch    | Purpose                          | Who deploys it | Vercel environment |
|-----------|----------------------------------|----------------|--------------------|
| `develop` | Daily work, new features         | You, every push | Preview URL        |
| `staging` | Release candidate, final testing | Deliberate merge from develop | Preview URL |
| `main`    | Live app, public-facing          | Deliberate merge from staging | Production URL |

**Rule of thumb:** code travels in one direction only — `develop → staging → main`.
Never push directly to `staging` or `main`.

---

## 2. Inspecting Differences Between Branches

### What is in develop but not yet in staging?
```bash
git log staging..develop --oneline
```
Each line is a commit that exists in `develop` but has not reached `staging` yet.
Empty output = staging is up to date with develop.

### What is in staging but not yet in production?
```bash
git log main..staging --oneline
```

### What is in develop but not yet in production?
```bash
git log main..develop --oneline
```

### See which files changed between two branches
```bash
# Just file names
git diff staging..develop --name-only

# Full diff (all changes line by line)
git diff staging..develop

# Summary — files changed + lines added/removed
git diff staging..develop --stat
```

### Visual map of all branches
```bash
git log --all --oneline --graph --decorate
```
This draws an ASCII tree showing every branch and where they diverge.

### See the latest commit on each branch
```bash
git branch -v
```
Output looks like:
```
* develop  05a2334 feat: three-way content type toggle
  main     2c49f62 docs: update guide with actual GitHub repo details
  staging  2c49f62 docs: update guide with actual GitHub repo details
```
The hash on each line is the latest commit on that branch.
If `staging` and `main` show the same hash → they are identical.

---

## 3. Pushing Work to Staging

Do this when your feature is complete and tested locally.

### Option A — GitHub Pull Request (recommended, creates an audit trail)

1. Go to https://github.com/Aimpact-Development/french-vocab-app
2. Click **Pull requests** → **New pull request**
3. Set **base:** `staging` · **compare:** `develop`
4. Give it a meaningful title, e.g. `Release: CEFR filter + phrases toggle`
5. Click **Create pull request** → review the diff → **Merge pull request**

Vercel picks up the push to `staging` automatically and starts building.
Check build progress at: Vercel dashboard → **Deployments** tab → filter by `staging`.

### Option B — Terminal (faster, no PR record)

```bash
git checkout staging
git merge develop
git push origin staging
git checkout develop      # always return to develop after
```

### How long does Vercel take?
Typically **30–60 seconds**. The Deployments tab shows a spinner while building
and a green "Ready" badge when live.

---

## 4. Pushing Staging to Production

Only do this after you have tested staging and are confident it is correct.

### Step 1 — Verify staging looks good
Open the staging preview URL in your browser and test the key flows:
- Selection screen loads with all filters
- Game plays correctly
- Favicon and title appear correctly

### Step 2 — Merge staging → main

**GitHub PR (recommended):**
1. https://github.com/Aimpact-Development/french-vocab-app → **Pull requests** → **New pull request**
2. **base:** `main` · **compare:** `staging`
3. Title: `Release vX.X to production`
4. Merge

**Terminal:**
```bash
git checkout main
git merge staging
git push origin main
git checkout develop
```

### Step 3 — Keep develop in sync
After a production release, pull `main` back into `develop` so all branches share
the same base:
```bash
git checkout develop
git pull origin main
git push origin develop
```

### Step 4 — Verify production
Open your production Vercel URL and confirm the release is live.

---

## 5. Checking What Vercel Has Deployed

### On the Vercel dashboard
1. Go to https://vercel.com → your project (`french-vocab-learnxx`)
2. Click **Deployments** tab
3. Each row shows:
   - Branch name
   - Commit message
   - Git commit hash (first 7 characters)
   - Status: 🟡 Building · ✅ Ready · ❌ Error
   - Timestamp
   - Live URL

Filter by branch using the dropdown to see only `main`, `staging`, or `develop`.

### From the terminal
```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# List recent deployments
vercel ls french-vocab-learnxx
```

### Match a Vercel deployment to a GitHub commit
The 7-character hash shown in Vercel (e.g. `05a2334`) matches your git log:
```bash
git log --oneline | head -10
```
Find the same hash → that is exactly what Vercel is running.

---

## 6. Is GitHub in Sync with Vercel?

Vercel deploys **automatically on every `git push`**. If your push succeeded,
Vercel is either currently building or already deployed.

### Quick health check

| Question | Where to look |
|---|---|
| Did my push reach GitHub? | `git log origin/develop --oneline -3` |
| Is Vercel building it? | Vercel → Deployments → latest entry for that branch |
| Is the commit hash the same? | Compare `git log --oneline -1` with the hash shown in Vercel |
| Did the build fail? | Vercel → Deployments → click the red entry → **View Build Logs** |

### Check the remote branch state
```bash
# Fetch latest remote state without merging
git fetch origin

# Compare local develop with what GitHub has
git diff develop origin/develop

# See if your local is ahead, behind, or in sync
git status
```
`Your branch is up to date with 'origin/develop'` = fully in sync.
`Your branch is ahead by N commits` = you have local commits not yet pushed.
`Your branch is behind by N commits` = someone else pushed, you need to pull.

---

## 7. Emergency Rollback

### Rollback production in Vercel (fastest — no code change needed)
1. Vercel → your project → **Deployments** tab
2. Filter by `main`
3. Find the last good deployment (before the broken one)
4. Click the **⋯** menu on that row → **Promote to Production**

This is instant — Vercel switches traffic to the old build in about 5 seconds.
No git commands needed.

### Rollback via git (if you want git history to reflect the revert)
```bash
# Find the commit hash you want to revert to
git log main --oneline

# Create a revert commit (safe — does not delete history)
git checkout main
git revert HEAD          # reverts the latest commit
git push origin main
git checkout develop
```
Vercel sees the push and redeploys automatically.

---

## 8. Undoing a Mistake

### I committed to the wrong branch
```bash
# Move the last commit from develop to a new branch
git checkout -b fix/my-feature        # create new branch from current state
git checkout develop
git reset HEAD~1 --soft               # undo the commit on develop, keep changes staged
git stash                              # stash the changes
git checkout fix/my-feature
git stash pop                          # apply them here
git commit -m "fix: correct branch"
```

### I pushed something broken to develop
```bash
# Revert the last commit on develop
git checkout develop
git revert HEAD
git push origin develop
```
This creates a new commit that undoes the bad one.
Vercel redeploys develop automatically.

### I accidentally merged to staging too early
```bash
# Revert the merge commit on staging
git checkout staging
git revert -m 1 HEAD      # -m 1 tells git which parent to keep for a merge commit
git push origin staging
git checkout develop
```

### I need to see what a file looked like in a previous commit
```bash
# Show the file as it was 3 commits ago
git show HEAD~3:src/FrenchMatchGame.jsx

# Restore a file to how it was in the last commit (discards unsaved changes)
git checkout -- src/FrenchMatchGame.jsx
```

---

## 9. Quick-Reference Command Card

```
━━━ DAILY WORK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Start fresh:
  git checkout develop && git pull origin develop

Save your work:
  git add .
  git commit -m "feat: description"
  git push origin develop

━━━ INSPECT DIFFERENCES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
develop vs staging:    git log staging..develop --oneline
staging vs main:       git log main..staging --oneline
develop vs main:       git log main..develop --oneline
Files changed:         git diff staging..develop --name-only
Visual branch map:     git log --all --oneline --graph --decorate
Branch status:         git branch -v

━━━ DEPLOY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Push to staging:
  git checkout staging && git merge develop && git push origin staging
  git checkout develop

Push to production:
  git checkout main && git merge staging && git push origin main
  git checkout develop
  git pull origin main && git push origin develop   ← keep develop in sync

━━━ VERCEL CHECKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
List deployments:      vercel ls french-vocab-learnxx
Check remote sync:     git fetch origin && git status

━━━ EMERGENCY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instant rollback:      Vercel → Deployments → find good build → Promote
Revert last commit:    git revert HEAD && git push origin <branch>
```
