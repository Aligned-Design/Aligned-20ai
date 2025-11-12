# 🚀 URGENT: Deploy Demo-Mode Fix Now

**Time:** 4:23 PM  
**Status:** ✅ CODE READY, DEPLOY PENDING  
**Build:** ✅ PASSING

---

## ✅ All Fixes Applied (Local)

### 1. Supabase Fetch Error Fixed ✅

- BrandContext: Early return with mock data
- AuthContext: Auto-login with mock user
- No Supabase calls in demo mode

### 2. Contract Parity Fixed ✅

- Added `secondary_color` and `accent_color` to mockBrands
- All mock data matches Brand/DashboardData interfaces

### 3. Telemetry Tagged ✅

- All analytics events include `demo_mode: true`
- Added dashboard events: `dash_view`, `dash_filter_applied`, `dash_export`, etc.

### 4. Flag Interplay Verified ✅

- `VITE_DEMO_MODE` and `VITE_FEATURE_UNIFIED_DASH` are **independent**
- Demo mode doesn't force unified dash on/off

### 5. Security Checked ✅

- No real Supabase keys in demo bundle
- Only demo URL/key used: `https://demo.supabase.co`, `demo-anon-key`

### 6. Build Passing ✅

```bash
✓ client built in 11.12s
✓ server built in 239ms
```

---

## 🚨 Critical: Staging Deployment Required

**Current Issue:** Staging is running **old code** without demo mode fixes.

**Error on staging:**

```
TypeError: Failed to fetch
    at fetchBrands (BrandContext.tsx:57:42)
```

**Why:** Environment variables are set, but **old code** doesn't check them.

---

## 🔧 Deployment Steps (Choose Your Platform)

### Option A: Fly.io

```bash
# 1. Set environment variables (already done)
fly secrets set VITE_DEMO_MODE=true --app your-app-name
fly secrets set VITE_FEATURE_UNIFIED_DASH=true --app your-app-name

# 2. Commit and push new code
git add .
git commit -m "fix: enable demo mode with mock data, fix Supabase fetch errors"
git push origin main

# 3. Deploy to Fly.io
fly deploy

# 4. Verify deployment
fly logs
# Look for: "[DEMO MODE] Using mock brands" and "[DEMO MODE] Using mock auth user"
```

### Option B: Vercel

```bash
# 1. Set environment variables in Vercel dashboard
# Go to: Project Settings → Environment Variables
# Add:
#   - VITE_DEMO_MODE = true
#   - VITE_FEATURE_UNIFIED_DASH = true

# 2. Commit and push
git add .
git commit -m "fix: enable demo mode with mock data, fix Supabase fetch errors"
git push origin main

# Vercel auto-deploys from Git
# Or manually:
vercel --prod
```

### Option C: Netlify

```bash
# 1. Set environment variables in Netlify UI
# Site Settings → Environment → Add variable
#   - VITE_DEMO_MODE = true
#   - VITE_FEATURE_UNIFIED_DASH = true

# 2. Commit and push
git add .
git commit -m "fix: enable demo mode with mock data, fix Supabase fetch errors"
git push origin main

# Netlify auto-deploys from Git
# Or manually:
netlify deploy --prod
```

---

## ✅ Post-Deployment Verification

### 1. Check Console (DevTools)

**Load:** `https://your-staging-url.com/dashboard`

**Expected Console Output:**

```
[DEMO MODE] Using mock auth user
[DEMO MODE] Using mock brands
[Analytics] dash_view: { dashboardId: "main", userId: "demo-user-123", demo_mode: true }
```

**Should NOT see:**

```
❌ TypeError: Failed to fetch
❌ Invalid API key
❌ Supabase auth error
```

### 2. Check Network Tab (DevTools)

**Filter:** `supabase.co`

**Expected:** **0 requests** to Supabase ✅

### 3. Test Routes

Visit each route and confirm no errors:

- ✅ `/dashboard` - Loads, shows mock KPIs
- ✅ `/analytics` - Loads, shows charts
- ✅ `/admin/billing` - Loads, shows table
- ✅ `/client-portal` - Loads, **read-only** (no edit buttons)

### 4. Test Brand Selector

1. Click brand dropdown in header
2. Should see: "Acme Corp" and "GreenLeaf Organics"
3. Switch brands → KPIs update

### 5. Test Period Picker

1. Click period selector
2. Change from "Week" to "Month"
3. Charts/KPIs update

---

## 📸 Capture Proof Artifacts

### Screenshots (4 total)

**Desktop Light Mode (1920x1080):**

```
Dashboard page, brand selector open, light theme
```

**Desktop Dark Mode (1920x1080):**

```
Dashboard page, dark theme toggled
```

**Mobile Light Mode (375x667):**

```
Dashboard page on mobile, light theme
```

**Mobile Dark Mode (375x667):**

```
Dashboard page on mobile, dark theme
```

### Loom (90 seconds)

**Script:**

1. **[0:00-0:15]** Load `/dashboard`, show console: `[DEMO MODE]` logs, no errors
2. **[0:15-0:30]** Open brand selector, switch from Acme to GreenLeaf, show KPIs update
3. **[0:30-0:45]** Change period from Week to Month, show charts update
4. **[0:45-0:60]** Visit `/analytics`, `/admin/billing`, `/client-portal` - all load cleanly
5. **[0:60-0:75]** Toggle dark mode, show contrast/typography consistent
6. **[0:75-0:90]** Open Network tab, filter "supabase", show 0 requests

**Tools:**

- Loom: https://www.loom.com/
- Chrome DevTools (Console + Network tabs visible)

---

## 🐛 Troubleshooting

### Issue: "Still seeing Supabase errors after deploy"

**Cause:** Browser cache holding old bundle

**Fix:**

```
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear site data: DevTools → Application → Clear storage
3. Verify build timestamp in Network tab (should be recent)
```

### Issue: "Demo mode logs not appearing"

**Cause:** Environment variable not set correctly

**Fix:**

```bash
# Verify env vars are set
fly secrets list  # Fly.io
vercel env ls     # Vercel
netlify env:list  # Netlify

# Should see:
# VITE_DEMO_MODE=true
# VITE_FEATURE_UNIFIED_DASH=true
```

### Issue: "Charts not updating when switching brand/period"

**Cause:** React Query cache or state not updating

**Fix:**

1. Check console for `dash_brand_switched` or `dash_period_changed` events
2. Verify `useDashboardData` hook is being called
3. Inspect React DevTools → Components → look for state updates

---

## 📊 Expected Metrics (After Deployment)

### Performance

- **LCP:** < 2.0s (Lighthouse throttled)
- **INP:** < 150ms
- **CLS:** < 0.1
- **Bundle Size:** ~283 KB gzip (acceptable)

### Console

- **Errors:** 0
- **Warnings:** 0 (related to demo mode)
- **Logs:** 2-3 `[DEMO MODE]` lines + analytics events

### Network

- **Supabase Requests:** 0
- **Failed Requests:** 0
- **Total Requests:** ~10-15 (static assets only)

---

## ✅ Final Checklist

- [ ] **Code committed and pushed to main branch**
- [ ] **Environment variables set in staging:**
  - `VITE_DEMO_MODE=true`
  - `VITE_FEATURE_UNIFIED_DASH=true`
- [ ] **Deployed to staging** (Fly.io/Vercel/Netlify)
- [ ] **Console shows:** `[DEMO MODE]` logs, no errors
- [ ] **Network tab shows:** 0 Supabase requests
- [ ] **All 4 routes load:** `/dashboard`, `/analytics`, `/admin/billing`, `/client-portal`
- [ ] **Brand selector works:** Shows 2 brands, switching updates KPIs
- [ ] **Period picker works:** Changing period updates charts
- [ ] **Dark mode works:** Toggle switches theme, typography legible
- [ ] **Screenshots captured:** 4 total (light/dark × desktop/mobile)
- [ ] **Loom recorded:** 90 seconds showing filter sync + export
- [ ] **Build logs saved:** Last 20-25 lines

---

## 💬 Reply When Complete

```
✅ DEMO MODE LIVE

Staging URL: https://your-staging-url.com
Build Timestamp: 2025-11-12 4:30 PM
Console: Clean, [DEMO MODE] logs visible
Network: 0 Supabase requests
Routes Tested: ✅ /dashboard, ✅ /analytics, ✅ /admin/billing, ✅ /client-portal
Screenshots: [4 attached]
Loom: [link]
Build Logs: [attached]

Status: Ready for final QA
```

---

**Prepared By:** Fusion AI  
**Time:** 4:23 PM  
**Status:** ✅ Code ready, awaiting deployment
