# ⚡ QUICK DEPLOY REFERENCE

**3 commands to deploy, 5 minutes to validate**

---

## 🚀 Deploy Now

```bash
# 1. Set secrets (run once)
fly secrets set VITE_DEMO_MODE=true SERVER_DEMO_MODE=true VITE_FEATURE_UNIFIED_DASH=true

# 2. Deploy with cache bust
fly deploy --build-arg NO_CACHE=$(date +%s)

# 3. Verify logs (expected: [DEMO MODE] Server bypassing Supabase...)
fly logs --since 5m | grep "DEMO MODE"
```

---

## ✅ Quick Validation

```bash
# Health check (expected: HTTP/2 200)
curl -sI https://YOUR_APP.fly.dev/health

# Open in browser
open https://YOUR_APP.fly.dev/dashboard
```

**Browser checks:**
- Console: `[DEMO MODE] Using mock auth user` ✅
- Network: `0 requests to supabase.co` ✅
- Routes: `/dashboard`, `/analytics`, `/admin/billing`, `/client-portal` all load ✅

---

## 📸 Capture Artifacts

**Screenshots (8):**
- Desktop: `/dashboard` light/dark, `/analytics` light/dark
- Mobile: `/dashboard` light/dark, `/client-portal` light/dark

**Looms (4, ≤2 min each):**
1. Agency flow
2. Client flow
3. Filter sync
4. Dark mode + mobile

**Metrics:**
- Lighthouse: `/dashboard`, `/analytics`
- axe: All 4 routes
- Telemetry: Console screenshot

---

## 📝 Post GO Note

```
✅ V1 STAGING LIVE

Staging URL: https://YOUR_APP.fly.dev
Flags: ✅ VITE_DEMO_MODE, SERVER_DEMO_MODE, VITE_FEATURE_UNIFIED_DASH
Server: ✅ [DEMO MODE] log present
Client: ✅ Mock data loading
Network: ✅ 0 Supabase requests
Routes: ✅ All 4 load
Artifacts: 📸 8 screenshots, 🎬 4 Looms, ⚡ Metrics attached
```

---

## 🚨 If 500 Error

```bash
# Pull stack trace
fly logs --since 15m | tail -n +1

# Check for missing env vars
fly secrets list

# Rollback if needed
fly releases rollback
```

**Common fixes:**
- Missing `SERVER_DEMO_MODE` → Set secret, redeploy
- Supabase errors in logs → Verify demo mode flag set
- Client errors → Hard refresh browser (Cmd+Shift+R)

**Detailed help:** See `TRIAGE_500_ERRORS.md`

---

## 📚 Full Documentation

- **`FINAL_DEPLOYMENT_SUMMARY.md`** - Complete guide
- **`DEPLOY_V1_STAGING.sh`** - Interactive deployment script
- **`TRIAGE_500_ERRORS.md`** - Troubleshooting guide
- **`EDGE_POLISH_CHECKLIST.md`** - Quality checks
- **`V1_STAGING_GO_NOTE_TEMPLATE.md`** - GO note template

---

**Ready to deploy? Run the 3 commands above. ↑**
