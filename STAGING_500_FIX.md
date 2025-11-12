# 🚨 Staging 500 Error - FIX APPLIED

**Date:** 2025-11-12  
**Status:** ✅ CODE FIXED - READY FOR DEPLOYMENT  
**Issue:** Server crashing on startup due to missing Supabase credentials in demo mode

---

## 🔍 Root Cause

The server was trying to initialize Supabase on startup with **required** environment variables:

```typescript
// server/lib/supabase.ts (OLD - BROKEN)
const supabaseUrl = process.env.SUPABASE_URL!; // ❌ Required, crashes if missing
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ❌ Required, crashes if missing
```

When `VITE_DEMO_MODE=true` but server credentials weren't set, the server would **crash on startup** with a 500 error.

---

## ✅ Fix Applied

Updated `server/lib/supabase.ts` to respect demo mode:

```typescript
// server/lib/supabase.ts (NEW - FIXED)
const isDemoMode = process.env.VITE_DEMO_MODE === "true";
const DEMO_URL = "https://demo.supabase.co";
const DEMO_KEY = "demo-service-role-key";

const supabaseUrl = isDemoMode ? DEMO_URL : process.env.SUPABASE_URL!;
const supabaseServiceKey = isDemoMode
  ? DEMO_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Warn if not in demo mode and credentials are missing
if (!isDemoMode && (!supabaseUrl || !supabaseServiceKey)) {
  console.error(
    "⚠️ Missing Supabase credentials. Set VITE_DEMO_MODE=true to bypass.",
  );
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Log demo mode status (once on server startup)
if (isDemoMode) {
  console.log("[DEMO MODE] Server using mock Supabase credentials");
}
```

**Key Changes:**

1. ✅ Server checks `VITE_DEMO_MODE` environment variable
2. ✅ Uses demo/placeholder credentials when `VITE_DEMO_MODE=true`
3. ✅ Logs `[DEMO MODE]` on server startup for visibility
4. ✅ Only throws error when NOT in demo mode and credentials are missing

---

## 🚀 Deployment Steps (MANUAL - Fly Commands Blocked)

Since I cannot execute `fly` commands directly, **you** must perform these steps:

### Step 1: Verify Environment Variables

```bash
fly secrets list --app your-app-name
```

**Required for demo mode:**

- `VITE_DEMO_MODE=true`
- `VITE_FEATURE_UNIFIED_DASH=true`

**Set if missing:**

```bash
fly secrets set VITE_DEMO_MODE=true --app your-app-name
fly secrets set VITE_FEATURE_UNIFIED_DASH=true --app your-app-name
```

### Step 2: Deploy with Cache Bust

```bash
fly deploy --build-arg NO_CACHE=$(date +%s)
```

**Expected output:**

```
✓ client built in ~10s
✓ server built in ~0.3s
...
==> Monitoring deployment
...
v## is being deployed
...
✅ Successfully deployed
```

### Step 3: Verify Server Logs

```bash
fly logs --since 5m
```

**Expected logs (GOOD SIGNS):**

```
[DEMO MODE] Server using mock Supabase credentials
🚀 Fusion Starter server running on port 8080
📱 Frontend: http://localhost:8080
🔧 API: http://localhost:8080/api
```

**Red flags (REPORT IF YOU SEE THESE):**

```
❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
❌ Error: Invalid API key
❌ TypeError: Failed to fetch
❌ 500 Internal Server Error
```

### Step 4: Test Staging URL

**URL:** `https://your-app-name.fly.dev/dashboard`

**Browser DevTools Checklist:**

1. **Console Tab:**
   - ✅ Should see: `[DEMO MODE] Using mock auth user`
   - ✅ Should see: `[DEMO MODE] Using mock brands`
   - ✅ Should see: `[Analytics] dash_view: { ..., demo_mode: true }`
   - ❌ Should NOT see: Supabase errors, failed fetch errors

2. **Network Tab:**
   - Filter by "supabase.co"
   - ✅ Should see: **0 requests** to Supabase
   - ✅ All API calls to `/api/*` should return 200 (or expected status)

3. **Elements Tab:**
   - ✅ Dashboard should render KPI cards
   - ✅ Charts should display (not error states)
   - ✅ No red error boundaries

### Step 5: Test Core Routes

Visit these routes and confirm they load without 500 errors:

1. `/dashboard` - Main dashboard with KPIs
2. `/analytics` - Analytics charts
3. `/admin/billing` - Admin billing page
4. `/client-portal` - Read-only client view

**For each route:**

- ✅ Page loads (no 500 error)
- ✅ Console shows demo mode logs
- ✅ Network tab shows 0 Supabase requests
- ✅ Page renders content (not blank/error state)

---

## 📊 Validation Checklist

After deployment, verify these conditions:

- [ ] **Server starts successfully** (no crash on startup)
- [ ] **Logs show `[DEMO MODE] Server using mock Supabase credentials`**
- [ ] **Client console shows `[DEMO MODE] Using mock auth user` and `mock brands`**
- [ ] **Network tab shows 0 requests to `supabase.co`**
- [ ] **All 4 core routes load without 500 errors**
- [ ] **Client Portal is read-only** (no edit/delete buttons)
- [ ] **Analytics events include `demo_mode: true`**
- [ ] **Build logs show no critical errors**

---

## 🎯 Expected Server Startup Logs

```bash
[DEMO MODE] Server using mock Supabase credentials
🚀 Fusion Starter server running on port 8080
📱 Frontend: http://localhost:8080
🔧 API: http://localhost:8080/api
```

## 🎯 Expected Client Console Logs

```bash
[DEMO MODE] Using mock auth user
[DEMO MODE] Using mock brands
[Analytics] dash_view: { dashboardId: "main", userId: "demo-user-123", demo_mode: true }
```

---

## 🧪 Proof Artifacts (Capture After Deployment)

### 1. Screenshots (8 total)

**Desktop (1920x1080):**

- Light mode: `/dashboard`
- Dark mode: `/dashboard`
- Light mode: `/analytics`
- Dark mode: `/analytics`

**Mobile (375x667):**

- Light mode: `/dashboard`
- Dark mode: `/dashboard`
- Light mode: `/client-portal`
- Dark mode: `/client-portal`

### 2. Looms (4 total, ≤2 min each)

1. **Agency Flow (2 min):**
   - Load `/dashboard` - show KPIs
   - Navigate to `/analytics` - show charts
   - Visit `/content-queue` - show content
   - Visit `/approvals` - show pending items
   - Click export - CSV downloads

2. **Client Flow (2 min):**
   - Load `/client-portal`
   - Verify no edit/delete buttons
   - Export data - CSV downloads
   - Show console (clean, demo mode logs only)

3. **Filter Sync Demo (90 sec):**
   - Change brand selector: Acme Corp → GreenLeaf Organics
   - All KPIs update simultaneously
   - Change period: Week → Month
   - All charts update simultaneously
   - Show console analytics events

4. **Dark Mode + Mobile (90 sec):**
   - Toggle dark mode on desktop
   - Verify colors/contrast
   - Switch to mobile viewport (375px)
   - Navigate through routes
   - Show responsive behavior

### 3. Performance Metrics (Lighthouse)

Run Lighthouse on these pages (throttled, mobile):

| Page         | LCP Target | INP Target | CLS Target |
| ------------ | ---------- | ---------- | ---------- |
| `/dashboard` | <2.0s      | <150ms     | <0.1       |
| `/analytics` | <2.0s      | <150ms     | <0.1       |

### 4. A11y Audit (axe DevTools)

Run axe on all 4 core routes:

- `/dashboard`
- `/analytics`
- `/admin/billing`
- `/client-portal`

**Target:** 0 serious/critical violations

### 5. Telemetry Events (Console Screenshot)

Filter console by `[Analytics]` and capture:

- `dash_view`
- `dash_filter_applied`
- `dash_brand_switched`
- `dash_export` (if wired)

**Verify:** All events include `demo_mode: true`

### 6. Build Logs

Capture last 30 lines of:

```bash
fly logs --since 5m
```

**Expected:**

- `[DEMO MODE]` log
- No errors/warnings
- Server running on port 8080

---

## 📋 Post-Deployment Report Format

Once all validation steps pass, post this in chat:

```
✅ V1 STAGING LIVE

**Staging URL:** https://your-app-name.fly.dev
**Build Time:** ~11s (client) + ~0.3s (server)
**Demo Mode:** ✅ Active
**Supabase Calls:** 0 (bypassed)

**Routes Verified:**
✅ /dashboard - Loads, KPIs render
✅ /analytics - Charts display
✅ /admin/billing - Table loads
✅ /client-portal - Read-only enforced

**Console Logs:**
✅ [DEMO MODE] Server using mock Supabase credentials
✅ [DEMO MODE] Using mock auth user
✅ [DEMO MODE] Using mock brands
✅ [Analytics] events tagged with demo_mode: true

**Network Tab:**
✅ 0 requests to supabase.co

**Known Issues:**
- None blocking V1

**Artifacts:**
- Screenshots: [Link to 8 screenshots]
- Looms: [Link to 4 Looms]
- Perf metrics: [Lighthouse results]
- A11y audit: [axe results]
- Telemetry: [Console screenshot]
- Build logs: [Fly logs]

**Next Steps:**
- Review proof artifacts
- Get stakeholder approval
- Plan production rollout (canary)
```

---

## 🚨 Troubleshooting

### Issue: Server still crashes with 500 error

**Check:**

```bash
fly logs --since 10m | grep -i error
```

**Look for:**

- `Missing SUPABASE_URL` - Env var not set correctly
- `Invalid API key` - Not in demo mode, but credentials invalid
- `TypeError: Failed to fetch` - Client trying to call Supabase

**Fix:**

1. Verify `VITE_DEMO_MODE=true` is set: `fly secrets list`
2. Re-deploy with cache bust: `fly deploy --build-arg NO_CACHE=$(date +%s)`
3. Check server logs: `fly logs --since 5m`

### Issue: Client shows Supabase errors

**Check browser console:**

- Look for `[DEMO MODE]` logs
- If missing, demo mode not active

**Fix:**

1. Verify build-time env vars: Check build logs for `VITE_DEMO_MODE`
2. Client env vars are compile-time, must redeploy after changing
3. Clear browser cache: Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Issue: Routes return 404

**Check:**

- Server routing config
- SPA fallback serving index.html

**Fix:**

- Ensure `server/node-build.ts` has catch-all route for React Router

---

## 📚 Related Documentation

- `V1_STAGING_GO_NOTE.md` - Full deployment checklist
- `DEMO_MODE_VALIDATION_CHECKLIST.md` - Demo mode testing guide
- `FIX_USEAUTH_CONFLICT.md` - useAuth hook resolution
- `URGENT_FIX_SUPABASE_FETCH_ERROR.md` - Client-side Supabase fix

---

**Fix Applied By:** Fusion AI  
**Date:** 2025-11-12  
**Status:** ✅ READY FOR DEPLOYMENT  
**Next Action:** Deploy to staging and verify (steps above)
