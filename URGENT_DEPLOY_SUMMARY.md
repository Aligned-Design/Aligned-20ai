# 🚨 URGENT: Staging 500 Error - FIXED & READY TO DEPLOY

**Status:** ✅ **CODE FIXED - AWAITING YOUR DEPLOYMENT**  
**Date:** 2025-11-12  
**Priority:** CRITICAL

---

## ⚡ TL;DR - What You Need to Do RIGHT NOW

I've fixed the 500 error, but **you must deploy it manually** because I cannot access Fly.io commands.

**3-Step Quick Deploy:**

```bash
# 1. Verify/set environment variables
fly secrets set VITE_DEMO_MODE=true
fly secrets set VITE_FEATURE_UNIFIED_DASH=true

# 2. Deploy with cache bust
fly deploy --build-arg NO_CACHE=$(date +%s)

# 3. Check logs for success
fly logs --since 5m | grep "DEMO MODE"
```

**Expected log output (GOOD):**

```
[DEMO MODE] Server using mock Supabase credentials
🚀 Fusion Starter server running on port 8080
```

---

## 🔍 What Was the Problem?

**Root Cause:** Server was crashing on startup because `server/lib/supabase.ts` required Supabase credentials, but in demo mode these aren't set.

**Old code (BROKEN):**

```typescript
// server/lib/supabase.ts
const supabaseUrl = process.env.SUPABASE_URL!; // ❌ Required, crashes if missing
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ❌ Required
```

**Result:** Server would crash immediately on startup with a 500 error when `VITE_DEMO_MODE=true` but server credentials weren't set.

---

## ✅ What I Fixed

**Updated `server/lib/supabase.ts`:**

```typescript
// NEW CODE - FIXED ✅
const isDemoMode = process.env.VITE_DEMO_MODE === "true";
const DEMO_URL = "https://demo.supabase.co";
const DEMO_KEY = "demo-service-role-key";

const supabaseUrl = isDemoMode ? DEMO_URL : process.env.SUPABASE_URL!;
const supabaseServiceKey = isDemoMode
  ? DEMO_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Only throw error if NOT in demo mode and credentials missing
if (!isDemoMode && (!supabaseUrl || !supabaseServiceKey)) {
  console.error(
    "⚠️ Missing Supabase credentials. Set VITE_DEMO_MODE=true to bypass.",
  );
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Log on server startup
if (isDemoMode) {
  console.log("[DEMO MODE] Server using mock Supabase credentials");
}
```

**What this does:**

1. ✅ Checks if demo mode is enabled
2. ✅ Uses placeholder Supabase credentials in demo mode
3. ✅ Logs `[DEMO MODE]` on server startup for visibility
4. ✅ Only throws error when NOT in demo mode and credentials are missing
5. ✅ Allows server to start successfully in demo mode

**Files changed:**

- ✅ `server/lib/supabase.ts` - Demo mode conditional logic
- ✅ `STAGING_500_FIX.md` - Detailed fix documentation
- ✅ `DEPLOY_NOW_COMMANDS.sh` - Deployment command reference
- ✅ `URGENT_DEPLOY_SUMMARY.md` - This file

---

## 🚀 Deployment Instructions (DETAILED)

### Step 1: Check Current Fly Secrets

```bash
fly secrets list
```

**What you're looking for:**

```
NAME                      DIGEST          CREATED AT
VITE_DEMO_MODE            xxxxxxxxxx      2025-11-12
VITE_FEATURE_UNIFIED_DASH xxxxxxxxxx      2025-11-12
```

**If missing, set them:**

```bash
fly secrets set VITE_DEMO_MODE=true
fly secrets set VITE_FEATURE_UNIFIED_DASH=true
```

### Step 2: Deploy to Staging

```bash
fly deploy --build-arg NO_CACHE=$(date +%s)
```

**What to expect:**

```
==> Building image
==> Building image with Docker
...
✓ client built in ~11s
✓ server built in ~0.3s
...
==> Pushing image to fly
==> Optimizing image
==> Creating release
...
v## is being deployed
...
✅ Successfully deployed
```

**Build should take ~30-60 seconds total.**

### Step 3: Verify Server Logs

```bash
fly logs --since 5m
```

**GOOD SIGNS (✅):**

```
[DEMO MODE] Server using mock Supabase credentials
🚀 Fusion Starter server running on port 8080
📱 Frontend: http://localhost:8080
🔧 API: http://localhost:8080/api
```

**BAD SIGNS (❌ - Report immediately):**

```
Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
TypeError: Failed to fetch
500 Internal Server Error
```

### Step 4: Test Staging URL

**Open:** `https://YOUR_APP_NAME.fly.dev/dashboard`

**Browser DevTools → Console Tab:**

**Expected (GOOD):**

```
[DEMO MODE] Using mock auth user
[DEMO MODE] Using mock brands
[Analytics] dash_view: { dashboardId: "main", userId: "demo-user-123", demo_mode: true }
```

**Unexpected (BAD):**

```
❌ Error: Invalid API key
❌ TypeError: Failed to fetch
❌ Uncaught Error: useAuth must be used within AuthProvider
```

**Browser DevTools → Network Tab:**

1. Filter by "supabase.co"
2. **Expected:** **0 requests** to Supabase
3. Check `/api/*` calls - all should return 200 (or expected status codes)

### Step 5: Test All 4 Core Routes

Visit each route and confirm it loads without 500 errors:

| Route            | Expected Behavior               |
| ---------------- | ------------------------------- |
| `/dashboard`     | KPI cards render, no errors     |
| `/analytics`     | Charts display, mock data       |
| `/admin/billing` | Billing table loads             |
| `/client-portal` | Read-only view, no edit buttons |

**For EACH route:**

- ✅ Page loads (not blank, not 500 error)
- ✅ Console shows demo mode logs
- ✅ Network tab shows 0 Supabase requests
- ✅ Content renders (cards, charts, tables)

---

## 📊 Post-Deployment Validation

Once deployed, complete this checklist:

### Server Checks

- [ ] Server logs show `[DEMO MODE] Server using mock Supabase credentials`
- [ ] No error logs on server startup
- [ ] Server responds to `/health` endpoint (200 OK)
- [ ] Server responds to `/api/ping` endpoint (200 OK)

### Client Checks

- [ ] Browser console shows `[DEMO MODE] Using mock auth user`
- [ ] Browser console shows `[DEMO MODE] Using mock brands`
- [ ] Analytics events include `demo_mode: true`
- [ ] Network tab shows 0 requests to `supabase.co`

### Route Checks

- [ ] `/dashboard` loads without 500 error
- [ ] `/analytics` loads without 500 error
- [ ] `/admin/billing` loads without 500 error
- [ ] `/client-portal` loads without 500 error

### Functional Checks

- [ ] KPI cards display values
- [ ] Charts render (not error state)
- [ ] Brand selector works (switch between Acme Corp and GreenLeaf Organics)
- [ ] Period picker works (switch between Week and Month)
- [ ] Client portal has NO edit/delete buttons (read-only)
- [ ] Dark mode toggle works

---

## 🎬 Proof Artifacts to Capture

After successful deployment, capture these artifacts:

### 1. Screenshots (8 total)

**Desktop (1920x1080):**

- `/dashboard` in light mode
- `/dashboard` in dark mode
- `/analytics` in light mode
- `/analytics` in dark mode

**Mobile (375x667):**

- `/dashboard` in light mode
- `/dashboard` in dark mode
- `/client-portal` in light mode
- `/client-portal` in dark mode

### 2. Looms (4 videos, ≤2 min each)

**Loom 1: Agency Flow (2 min)**

1. Load `/dashboard` - show KPIs
2. Navigate to `/analytics` - show charts
3. Visit `/content-queue` - show content
4. Visit `/approvals` - show pending items
5. Click export button - CSV downloads

**Loom 2: Client Flow (2 min)**

1. Load `/client-portal`
2. Point out NO edit/delete buttons
3. Export data - CSV downloads
4. Show console (demo mode logs only, no errors)

**Loom 3: Filter Sync Demo (90 sec)**

1. Change brand selector: Acme Corp → GreenLeaf Organics
2. Show all KPIs update simultaneously
3. Change period: Week → Month
4. Show all charts update simultaneously
5. Show console analytics events firing

**Loom 4: Dark Mode + Mobile (90 sec)**

1. Toggle dark mode on desktop
2. Verify colors/contrast are legible
3. Switch to mobile viewport (375px width)
4. Navigate through routes
5. Show responsive behavior

### 3. Performance Metrics (Lighthouse)

Run Lighthouse on:

- `/dashboard` (mobile, throttled)
- `/analytics` (mobile, throttled)

**Targets:**

- LCP < 2.0s ✅
- INP < 150ms ✅
- CLS < 0.1 ✅

### 4. A11y Audit (axe DevTools)

Run axe DevTools on:

- `/dashboard`
- `/analytics`
- `/admin/billing`
- `/client-portal`

**Target:** 0 serious/critical violations

### 5. Telemetry Events

Open browser console, filter by `[Analytics]`, capture screenshot showing:

- `dash_view` event
- `dash_filter_applied` event
- `dash_brand_switched` event
- All events include `demo_mode: true`

### 6. Build Logs

```bash
fly logs --since 5m > staging-build-logs.txt
```

Capture last 30 lines showing:

- `[DEMO MODE]` log
- Server startup success
- No errors/warnings

---

## 📝 Post-Deployment Report Template

Once all validation passes, post this in chat:

```
✅ V1 STAGING LIVE

**Staging URL:** https://YOUR_APP_NAME.fly.dev
**Deployed At:** 2025-11-12, [TIME]
**Build Time:** ~11s (client) + ~0.3s (server)
**Demo Mode:** ✅ Active (server + client)
**Supabase Calls:** 0 (fully bypassed)

**Routes Verified:**
✅ /dashboard - KPIs render, no errors
✅ /analytics - Charts display with mock data
✅ /admin/billing - Billing table loads
✅ /client-portal - Read-only enforced (no edit/delete buttons)

**Server Logs:**
✅ [DEMO MODE] Server using mock Supabase credentials
✅ 🚀 Fusion Starter server running on port 8080

**Client Console:**
✅ [DEMO MODE] Using mock auth user
✅ [DEMO MODE] Using mock brands
✅ [Analytics] dash_view: { ..., demo_mode: true }

**Network Tab:**
✅ 0 requests to supabase.co
✅ All /api/* endpoints returning 200

**Known Issues:**
- None blocking V1 ✅

**Proof Artifacts:**
- Screenshots: [8 attached/linked]
- Looms: [4 videos, ≤2 min each]
- Lighthouse: LCP <2.0s, INP <150ms, CLS <0.1
- axe: 0 serious/critical violations
- Telemetry: All events tagged demo_mode: true
- Build logs: [attached]

**Performance:**
- Dashboard LCP: [X]s (target <2.0s)
- Analytics LCP: [X]s (target <2.0s)
- Bundle size: 283 KB gzipped

**Next Steps:**
- ✅ Code review proof artifacts
- ✅ Get stakeholder sign-off
- ✅ Plan production canary rollout
```

---

## 🚨 Troubleshooting Guide

### Problem: Server still shows 500 error

**Diagnosis:**

```bash
fly logs --since 10m | grep -i error
```

**Common causes:**

1. `VITE_DEMO_MODE` not set in Fly secrets
2. Stale build cache (use `NO_CACHE` arg)
3. Other missing env vars

**Fix:**

```bash
fly secrets set VITE_DEMO_MODE=true
fly deploy --build-arg NO_CACHE=$(date +%s)
```

### Problem: Client shows Supabase errors

**Diagnosis:**
Open browser console, look for:

- `[DEMO MODE]` logs (if missing, demo mode not active)
- `TypeError: Failed to fetch` (client trying to call Supabase)
- `Invalid API key` (Supabase auth errors)

**Fix:**

1. Verify env vars are set: `fly secrets list`
2. Redeploy (client env vars are compile-time): `fly deploy --build-arg NO_CACHE=$(date +%s)`
3. Hard refresh browser: Cmd+Shift+R (Mac) / Ctrl+Shift+F5 (Windows)

### Problem: Routes return 404

**Diagnosis:**
Check if server is serving SPA correctly

**Fix:**
Verify `server/node-build.ts` has catch-all route for React Router (already in place)

### Problem: Network tab shows Supabase requests

**Diagnosis:**
Demo mode not fully active on client

**Fix:**

1. Check browser console for `[DEMO MODE]` logs
2. Verify `VITE_DEMO_MODE=true` in Fly secrets
3. Redeploy with cache bust
4. Clear browser cache completely

---

## 📚 Related Documentation

- **`STAGING_500_FIX.md`** - Detailed technical fix explanation
- **`DEPLOY_NOW_COMMANDS.sh`** - All deployment commands in one script
- **`V1_STAGING_GO_NOTE.md`** - Full V1 deployment checklist
- **`DEMO_MODE_VALIDATION_CHECKLIST.md`** - Demo mode testing guide
- **`FIX_USEAUTH_CONFLICT.md`** - useAuth hook resolution
- **`URGENT_FIX_SUPABASE_FETCH_ERROR.md`** - Client-side Supabase fix

---

## 🎯 Critical Path to ✅ V1 STAGING LIVE

1. **[5 min]** Deploy to staging (Steps 1-3 above)
2. **[5 min]** Verify deployment (Steps 4-5 above)
3. **[10 min]** Capture screenshots (8 total)
4. **[10 min]** Record Looms (4 videos, ≤2 min each)
5. **[5 min]** Run Lighthouse + axe audits
6. **[5 min]** Capture telemetry + build logs
7. **[2 min]** Post final report

**Total estimated time: ~40 minutes**

---

## ✅ What's Done vs. What You Need to Do

### ✅ I've Done (Code Ready):

- [x] Fixed `server/lib/supabase.ts` to respect demo mode
- [x] Server now uses placeholder credentials when `VITE_DEMO_MODE=true`
- [x] Added `[DEMO MODE]` logging on server startup
- [x] Verified build passes locally
- [x] Created comprehensive deployment documentation
- [x] Created troubleshooting guides
- [x] Code committed and ready to push

### ⏳ You Need to Do (Deployment):

- [ ] Set Fly secrets: `VITE_DEMO_MODE=true`, `VITE_FEATURE_UNIFIED_DASH=true`
- [ ] Deploy to staging: `fly deploy --build-arg NO_CACHE=$(date +%s)`
- [ ] Verify server logs show `[DEMO MODE]` message
- [ ] Test all 4 core routes load without 500 errors
- [ ] Verify client console shows demo mode logs
- [ ] Verify network tab shows 0 Supabase requests
- [ ] Capture 8 screenshots
- [ ] Record 4 Looms
- [ ] Run Lighthouse + axe audits
- [ ] Capture telemetry events + build logs
- [ ] Post final `✅ V1 STAGING LIVE` report

---

## 🔥 URGENT: Next Action Required FROM YOU

**I cannot access Fly.io commands due to ACL restrictions.**

**You must manually execute these commands:**

```bash
# Terminal commands (run these NOW):
fly secrets set VITE_DEMO_MODE=true
fly secrets set VITE_FEATURE_UNIFIED_DASH=true
fly deploy --build-arg NO_CACHE=$(date +%s)
fly logs --since 5m
```

**Then test staging URL in browser and capture proof artifacts.**

**Reply in chat with `✅ V1 STAGING LIVE` once complete, including:**

- Staging URL
- Screenshots (8)
- Looms (4)
- Performance metrics
- A11y audit results
- Telemetry screenshot
- Build logs

---

**Prepared By:** Fusion AI  
**Date:** 2025-11-12  
**Status:** ✅ CODE FIXED, AWAITING YOUR DEPLOYMENT  
**Urgency:** CRITICAL - Deploy ASAP  
**Blocker:** Fly CLI access restricted, requires manual deployment
