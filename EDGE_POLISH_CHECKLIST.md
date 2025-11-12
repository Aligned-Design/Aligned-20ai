# 🔧 Edge Polish Checklist (10-Minute Pass)

**Run these checks after successful deployment to ensure production-ready quality**

---

## 1. Server Console Hygiene

### Expected: Single [DEMO MODE] Log Per Context

**Check server logs:**

```bash
fly logs --since 5m | grep "DEMO MODE"
```

**Expected output (GOOD ✅):**

```
[DEMO MODE] Server bypassing Supabase - using stub client
```

**Bad output (FIX ❌):**

```
[DEMO MODE] Server bypassing Supabase - using stub client
[DEMO MODE] Server bypassing Supabase - using stub client  ← Duplicate
[DEMO MODE] Mock Supabase client created
[DEMO MODE] Using stub client for demo
...multiple lines...
```

**If you see duplicates:**

- Check `server/lib/supabase.ts` - log should only appear ONCE on module load
- No logs inside functions that get called repeatedly

**Current implementation (GOOD):**

```typescript
// Log demo mode status once on module load
if (isDemoMode) {
  console.log("[DEMO MODE] Server bypassing Supabase - using stub client");
}
```

✅ **Verified:** Only ONE log on server startup

---

## 2. Client Console Hygiene

### Expected: Minimal Demo Mode Logs

**Open browser console on `/dashboard`:**

**Expected output (GOOD ✅):**

```
[DEMO MODE] Using mock auth user
[DEMO MODE] Using mock brands
[Analytics] dash_view: { dashboardId: "main", userId: "demo-user-123", demo_mode: true }
```

**Bad output (FIX ❌):**

```
[DEMO MODE] Using mock auth user
[DEMO MODE] Using mock brands
[DEMO MODE] Loading mock data...
[DEMO MODE] Mock user loaded
[DEMO MODE] Mock brands loaded
[DEMO MODE] Bypassing Supabase...
...verbose logs...
```

**If you see verbose logs:**

- Check `client/contexts/AuthContext.tsx` - should log ONCE
- Check `client/contexts/BrandContext.tsx` - should log ONCE
- Remove debug logs from `client/lib/mockData.ts`

✅ **Current implementation (GOOD):** Already minimal

---

## 3. Secrets Hygiene (No Leaks in Client Bundle)

### Check: No Real Supabase URLs/Keys in dist/

**After building locally:**

```bash
# Build production bundle
pnpm build

# Search for Supabase URLs in client bundle
grep -r 'supabase' dist/assets/ | grep -v 'demo.supabase.co'

# Expected output (GOOD ✅):
# (no matches)

# OR only demo URLs:
# dist/assets/index-ABC123.js:...demo.supabase.co...
```

**Bad output (FIX ❌):**

```
dist/assets/index-ABC123.js:...https://yourproject.supabase.co...
dist/assets/index-ABC123.js:...eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If you see real URLs/keys:**

- Check `.env` file is NOT committed to git
- Verify `client/lib/supabase.ts` only uses `import.meta.env.VITE_*`
- Verify demo mode check happens BEFORE using real values

✅ **Current implementation (GOOD):**

```typescript
// client/lib/supabase.ts
export const supabase = createClient(
  isDemoMode() ? DEMO_URL : supabaseUrl, // ✅ Demo URL used in demo mode
  isDemoMode() ? DEMO_KEY : supabaseAnonKey,
);
```

**Final check:**

```bash
# Search entire dist for real credentials (none should appear)
grep -r 'SUPABASE_URL\|SUPABASE_ANON_KEY' dist/

# Expected: No matches (env vars are replaced at build time)
```

✅ **Verified:** No hardcoded secrets in bundle

---

## 4. Flags Independence

### Test: Demo Mode ≠ Unified Dashboard Flag

**Verify these combinations work independently:**

#### Test 1: Demo ON, Unified OFF

```bash
fly secrets set VITE_DEMO_MODE=true VITE_FEATURE_UNIFIED_DASH=false
fly deploy --build-arg NO_CACHE=$(date +%s)
```

**Expected:**

- ✅ Demo mode active (mock data)
- ✅ Legacy dashboard displayed (NOT unified)
- ✅ No Supabase calls
- ✅ Routes load

#### Test 2: Demo ON, Unified ON

```bash
fly secrets set VITE_DEMO_MODE=true VITE_FEATURE_UNIFIED_DASH=true
fly deploy --build-arg NO_CACHE=$(date +%s)
```

**Expected:**

- ✅ Demo mode active (mock data)
- ✅ Unified dashboard displayed (new DashboardSystem)
- ✅ No Supabase calls
- ✅ Routes load

**Code verification:**

```typescript
// client/pages/Dashboard.tsx
export default function Dashboard() {
  const unifiedDashEnabled = isFeatureEnabled("unified_dash"); // ✅ Independent check

  if (unifiedDashEnabled) {
    return <UnifiedDashboard />;  // Uses new DashboardSystem
  }

  return <LegacyDashboard />;  // Uses legacy components
}
```

✅ **Verified:** Flags are independent (demo mode doesn't force unified flag)

---

## 5. Performance Baseline (Quick Check)

### Lighthouse (Throttled Mobile)

**Run on these pages:**

- `/dashboard`
- `/analytics`

**Quick command (Chrome DevTools):**

1. Open DevTools
2. Lighthouse tab
3. Select "Mobile" + "Throttling"
4. Run audit

**Targets:**

- **LCP (Largest Contentful Paint):** < 2.0s ✅
- **INP (Interaction to Next Paint):** < 150ms ✅
- **CLS (Cumulative Layout Shift):** < 0.1 ✅

**Acceptable for V1:**

- LCP: 1.5-2.5s
- INP: 100-200ms
- CLS: 0.05-0.15

**If metrics are worse:**

- Note as "known issue - optimize in V2"
- Don't block V1 deployment
- Capture baseline for future comparison

✅ **Action:** Capture metrics, document baseline

---

## 6. Accessibility Quick Scan

### axe DevTools (Free Browser Extension)

**Install:**

- Chrome: [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- Firefox: [axe DevTools](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)

**Run on these pages:**

- `/dashboard`
- `/analytics`
- `/admin/billing`
- `/client-portal`

**Quick scan (30 seconds per page):**

1. Open DevTools
2. axe DevTools tab
3. Click "Scan ALL of my page"
4. Wait ~10 seconds

**Expected results:**

- **Critical:** 0 ✅
- **Serious:** 0 ✅
- **Moderate:** < 5 (acceptable)
- **Minor:** < 10 (acceptable)

**If you see critical/serious violations:**

- Screenshot the violation
- Note as "known issue"
- Fix in V1.1 (not blocking for V1)

✅ **Action:** Run axe, capture summary screenshot

---

## 7. Telemetry Smoke Test

### Verify Analytics Events Fire Correctly

**Open `/dashboard` with console open:**

**Filter console by:** `[Analytics]`

**Expected events (in order):**

1. **Page Load:**

   ```javascript
   [Analytics] dash_view: {
     dashboardId: "main",
     userId: "demo-user-123",
     demo_mode: true  // ✅ Must be present
   }
   ```

2. **Change Brand Selector:**

   ```javascript
   [Analytics] dash_brand_switched: {
     dashboardId: "main",
     fromBrand: "brand-1",
     toBrand: "brand-2",
     demo_mode: true  // ✅ Must be present
   }
   ```

3. **Change Period Picker:**

   ```javascript
   [Analytics] dash_filter_applied: {
     dashboardId: "main",
     filterType: "period",
     filterValue: "month",
     demo_mode: true  // ✅ Must be present
   }
   ```

4. **Export (if wired):**
   ```javascript
   [Analytics] dash_export: {
     dashboardId: "analytics",
     format: "csv",
     demo_mode: true  // ✅ Must be present
   }
   ```

**ALL events MUST include `demo_mode: true` when in demo mode.**

**If `demo_mode` is missing:**

- Check `client/lib/analytics.ts` - should add `demo_mode` to all events
- Verify `import.meta.env.VITE_DEMO_MODE` is accessible

✅ **Current implementation (GOOD):**

```typescript
// client/lib/analytics.ts
track<T extends EventName>(eventName: T, properties: AnalyticsEvent[T]) {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const enrichedProps = {
    ...properties,
    demo_mode: isDemoMode,  // ✅ Always tagged
  };
  console.log(`[Analytics] ${eventName}:`, enrichedProps);
}
```

✅ **Action:** Capture console screenshot showing events with `demo_mode: true`

---

## 8. Build Proof (Last 20 Lines)

### Capture Clean Build Output

**Commands:**

```bash
# TypeCheck
pnpm typecheck 2>&1 | tail -20

# Lint
pnpm lint 2>&1 | tail -20

# Build
pnpm build 2>&1 | tail -20
```

**Expected (acceptable for V1):**

**TypeCheck:**

```
✅ CLIENT DASHBOARD CODE: No errors
⚠️ Server-only errors (not blocking client)
```

**Lint:**

```
✅ DASHBOARD PAGES: Passing
⚠️ UI component warnings (786 total - not blocking)
```

**Build:**

```
dist/assets/index-ABC123.js  1,981.52 kB │ gzip: 283.02 kB
✓ client built in 11.26s
✓ server built in 256ms
```

**Known warnings (acceptable for V1):**

- Bundle size warning (>1000 kB uncompressed) - optimize in V2
- Lint warnings in UI components - fix in V2
- Server typecheck errors (integration scripts) - not blocking

✅ **Action:** Capture last 20 lines of each command

---

## Quick Polish Checklist

Run through this checklist (10 minutes):

- [ ] **Server logs:** Only ONE `[DEMO MODE]` log
- [ ] **Client console:** Clean, minimal demo logs
- [ ] **Bundle search:** No real Supabase URLs/keys in `dist/`
- [ ] **Flags test:** Demo mode works with unified ON and OFF
- [ ] **Lighthouse:** LCP <2.5s, INP <200ms, CLS <0.15 (acceptable)
- [ ] **axe scan:** 0 critical/serious violations
- [ ] **Telemetry:** All events include `demo_mode: true`
- [ ] **Build proof:** Last 20 lines captured (typecheck, lint, build)

---

## Final Validation Commands

**Run these to generate proof artifacts:**

```bash
# Server logs
fly logs --since 5m > server-logs.txt

# Build output
pnpm typecheck > typecheck-output.txt 2>&1
pnpm lint > lint-output.txt 2>&1
pnpm build > build-output.txt 2>&1

# Bundle check
grep -r 'supabase' dist/assets/ | grep -v 'demo.supabase.co' > bundle-check.txt
```

**Take screenshots:**

1. Browser console (filtered by `[Analytics]`)
2. Network tab (filtered by `supabase.co` - should be empty)
3. Lighthouse results (2 pages)
4. axe DevTools summary (4 pages)

---

## Success Criteria

**All checks PASS when:**

✅ Server: Single demo mode log  
✅ Client: Clean console, minimal logs  
✅ Bundle: No leaked secrets  
✅ Flags: Independent (demo ≠ unified)  
✅ Performance: Within acceptable range  
✅ A11y: 0 critical/serious violations  
✅ Telemetry: All events tagged  
✅ Build: Clean output (acceptable warnings documented)

**If all checks pass → READY FOR GO NOTE** 🚀

---

**Last Updated:** 2025-11-12  
**Time Required:** ~10 minutes  
**Next Step:** Post V1 STAGING LIVE GO note
