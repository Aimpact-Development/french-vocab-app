# French Vocab App — Setup & Maintenance Guide

This document covers everything you need to go from a local codebase to a fully deployed application with a proper development workflow. Follow the sections in order the first time; afterwards use this as a reference.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Local Development](#2-local-development)
3. [GitHub Setup](#3-github-setup)
4. [Branching Strategy](#4-branching-strategy)
5. [Vercel Setup (Hosting)](#5-vercel-setup-hosting)
6. [Day-to-Day Workflow](#6-day-to-day-workflow)
7. [Making a Release (Staging → Production)](#7-making-a-release-staging--production)
8. [Custom Domain on Vercel](#8-custom-domain-on-vercel)
9. [Maintenance Reference](#9-maintenance-reference)

---

## 1. Project Overview

| Item | Detail |
|------|--------|
| Framework | React 19 + Vite |
| Language | JavaScript (JSX) |
| Package manager | npm |
| Hosting | Vercel (free tier) |
| Source control | GitHub — `Aimpact-Development/french-vocab-app` |
| GitHub URL | https://github.com/Aimpact-Development/french-vocab-app |
| Published on | Aimpact / welcome-to-lux website (social contribution) |

**Why Vercel instead of Hostinger?**
Hostinger is designed for PHP/WordPress sites. Every time you change the code you would need to manually build the project and upload files via FTP. Vercel is purpose-built for React apps: it detects your GitHub repository, builds automatically on every push, and gives each branch its own live preview URL. It is free for projects like this one.

---

## 2. Local Development

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- [Git](https://git-scm.com)
- A code editor (VS Code recommended)

### Running the app locally

```bash
# Install dependencies (only needed once, or after pulling new changes)
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser. The page reloads automatically when you save a file.

### Other useful commands

```bash
npm run build      # Create a production build in the dist/ folder
npm run preview    # Preview the production build locally
npm run lint       # Check for code style issues
```

---

## 3. GitHub Setup

### 3.1 Repository location

The repository has already been created and all three branches pushed. No action needed here — this section is for reference only.

| Item | Value |
|------|-------|
| GitHub org | `Aimpact-Development` |
| Repository | `french-vocab-app` (Private) |
| URL | https://github.com/Aimpact-Development/french-vocab-app |
| Remote name | `origin` |

Branches on GitHub:
- `main` — production
- `staging` — pre-production
- `develop` — active development

### 3.2 Cloning the repository on a new machine

If you ever need to set up the project on a new computer:

```bash
git clone https://github.com/Aimpact-Development/french-vocab-app.git
cd french-vocab-app
npm install
git checkout develop   # switch to the working branch
```

### 3.3 Pushing future changes

Your local branches already track their GitHub counterparts, so from now on a simple `git push` is enough — no flags needed.

### 3.4 Set branch protection rules (important)

This prevents accidentally pushing directly to `main` or `staging` without a review.

1. Go to https://github.com/Aimpact-Development/french-vocab-app → **Settings** → **Branches**.
2. Click **Add branch ruleset** (or "Add rule" depending on your GitHub version).
3. For `main`:
   - Branch name pattern: `main`
   - Tick **Require a pull request before merging**
   - Tick **Require approvals** → set to 1 (even if you are the only developer, this forces a deliberate review step)
   - Click **Create**.
4. Repeat for `staging` with the same settings.

---

## 4. Branching Strategy

### The three permanent branches

```
main      →  Production    Live app at yourdomain.com
staging   →  Pre-release   Testing before going live
develop   →  Development   Where daily work accumulates
```

### Feature branches (temporary)

For every new feature or bug fix, create a short-lived branch off `develop`:

```bash
git checkout develop
git checkout -b feature/add-audio-pronunciation
# ... do your work ...
git push origin feature/add-audio-pronunciation
# Then open a Pull Request on GitHub: feature/... → develop
```

Name your branches clearly:
- `feature/` — new functionality
- `fix/` — bug fixes
- `chore/` — dependency updates, config changes

### The full flow

```
feature/xxx  ──PR──►  develop  ──PR──►  staging  ──PR──►  main
                      (daily)           (test here)        (live)
```

- **develop** gets updated constantly as you work.
- **staging** is promoted from develop when you want to test a release candidate.
- **main** only changes when you are confident and ready to go live.

---

## 5. Vercel Setup (Hosting)

### 5.1 Create a Vercel account

1. Go to [vercel.com](https://vercel.com).
2. Click **Sign Up**.
3. Choose **Continue with GitHub** — this is important, it links the two accounts automatically.
4. Authorise Vercel to access your GitHub account.

### 5.2 Import your project

1. On the Vercel dashboard, click **Add New…** → **Project**.
2. You will see a list of your GitHub repositories. Find `french-vocab-app` and click **Import**.
3. Vercel will detect that it is a Vite project automatically. You do not need to change any build settings.
4. Leave everything as default and click **Deploy**.

Vercel will build and deploy the app. After about 60 seconds it gives you a live URL like `https://french-vocab-app-xxxx.vercel.app`. This is your production URL (connected to `main`).

### 5.3 Configure branch deployments

By default Vercel already deploys every branch. Let's verify and name them properly.

1. In Vercel, go to your project → **Settings** → **Git**.
2. Under **Production Branch**, confirm it is set to `main`.
3. That's it — `staging` and `develop` will automatically get their own preview URLs every time you push to them. The URLs look like:
   - `https://french-vocab-app-git-staging-YOUR-USERNAME.vercel.app`
   - `https://french-vocab-app-git-develop-YOUR-USERNAME.vercel.app`

You can find these URLs by going to Vercel → your project → **Deployments** tab, then filtering by branch.

### 5.4 Assign a dedicated staging URL (optional but recommended)

1. Go to your project → **Settings** → **Domains**.
2. Add a domain like `staging.yourdomain.com`.
3. Set the **Git Branch** for that domain to `staging`.

This gives you a stable, memorable URL for your staging environment instead of the auto-generated one.

---

## 6. Day-to-Day Workflow

### Starting a new feature

```bash
# Always start from an up-to-date develop branch
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/my-new-feature
```

### Saving your work

```bash
git add .
git commit -m "feat: short description of what you did"
git push origin feature/my-new-feature
```

**Commit message prefixes to use:**
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — housekeeping (deps, config)
- `docs:` — documentation only

### Opening a Pull Request

1. Go to your GitHub repository.
2. GitHub usually shows a yellow banner: **"feature/my-new-feature had recent pushes — Compare & pull request"**. Click it.
3. Set the base branch to `develop` (not `main`).
4. Write a short description of what changed and why.
5. Click **Create pull request**.
6. Review the diff, then click **Merge pull request**.

Once merged to `develop`, Vercel automatically builds and deploys the `develop` branch. You can check it at the develop preview URL.

---

## 7. Making a Release (Staging → Production)

Do this when `develop` is stable and you want to test before going live.

### Step 1 — Promote develop to staging

1. On GitHub, go to **Pull requests** → **New pull request**.
2. Set:
   - **base:** `staging`
   - **compare:** `develop`
3. Title it something like `Release: v1.1 — add pronunciation feature`.
4. Click **Create pull request** → **Merge pull request**.

Vercel now builds and deploys staging. Test thoroughly at the staging URL.

### Step 2 — Promote staging to production

Only do this once staging looks correct.

1. On GitHub, go to **Pull requests** → **New pull request**.
2. Set:
   - **base:** `main`
   - **compare:** `staging`
3. Title it `Release: v1.1 to production`.
4. Merge it.

Vercel automatically deploys to your production URL. Done.

### Step 3 — Keep develop in sync

After a release, bring `main` back into `develop` to keep branches aligned:

```bash
git checkout develop
git pull origin main
git push origin develop
```

---

## 8. Custom Domain on Vercel

If you have a domain registered on Hostinger (or anywhere else), you can point it to Vercel.

### 8.1 Add the domain in Vercel

1. Vercel → your project → **Settings** → **Domains**.
2. Type your domain (e.g. `frenchvocab.com`) and click **Add**.
3. Vercel will show you one of two DNS record types to add:
   - An **A record** pointing to `76.76.21.21` (for apex domains like `frenchvocab.com`)
   - A **CNAME record** pointing to `cname.vercel-dns.com` (for subdomains like `www.frenchvocab.com`)

### 8.2 Update DNS in Hostinger (or your registrar)

1. Log in to Hostinger → **Domains** → click your domain → **DNS / Nameservers**.
2. Find the existing A record for `@` (the apex) and edit its value to `76.76.21.21`.
3. Add a CNAME record: name = `www`, value = `cname.vercel-dns.com`.
4. Save. DNS changes take 10–60 minutes to propagate.

Once propagated, Vercel detects the records and automatically provisions an HTTPS certificate. Your app is live on your custom domain with HTTPS, no configuration needed on your part.

---

## 9. Maintenance Reference

### Updating dependencies

```bash
# See which packages are outdated
npm outdated

# Update a specific package
npm install package-name@latest

# Commit the result
git add package.json package-lock.json
git commit -m "chore: update dependencies"
```

Always do this on `develop`, test locally, then follow the normal PR → staging → main flow.

### Viewing deployment history

Vercel → your project → **Deployments** tab. Every push creates a deployment entry with a timestamp, branch name, commit message, and build logs. You can click any past deployment to see its logs or to **Promote** it back to production (instant rollback).

### Rolling back a bad release

1. Vercel → your project → **Deployments**.
2. Find the last good deployment (the one before the broken release).
3. Click the three-dot menu → **Promote to Production**.

This takes about 5 seconds and requires no code changes.

### Checking build errors

If Vercel fails to deploy, the Deployments tab shows a red "Error" badge. Click it → **View Build Logs** to see exactly what went wrong. Most common causes:
- A syntax error introduced in the latest commit
- A missing environment variable
- A dependency that failed to install

Fix the issue on your branch, push again, and Vercel will retry automatically.

### Environment variables (when needed)

If the app ever needs secret values (API keys, etc.):

1. Vercel → your project → **Settings** → **Environment Variables**.
2. Add the variable with a name (e.g. `VITE_API_KEY`) and value.
3. Select which environments it applies to (Production, Preview, Development).
4. Redeploy for the change to take effect.

In your code, access it as `import.meta.env.VITE_API_KEY`. Never put secrets directly in source files.

---

## Quick Reference Card

```
DAILY WORK
  git checkout develop && git pull origin develop
  git checkout -b feature/my-feature
  ... edit files ...
  git add . && git commit -m "feat: description"
  git push origin feature/my-feature
  → Open PR on GitHub: feature/... → develop

STAGING RELEASE
  GitHub PR: develop → staging
  Test at staging URL

PRODUCTION RELEASE
  GitHub PR: staging → main
  Vercel deploys automatically

EMERGENCY ROLLBACK
  Vercel → Deployments → find last good build → Promote to Production
```
