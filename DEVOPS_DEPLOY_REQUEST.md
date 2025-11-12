# URGENT: Staging Deployment Request - V1 Demo Mode Fix

**To:** DevOps Team  
**From:** Development Team  
**Priority:** HIGH  
**Date:** 2025-11-12  
**Subject:** Please deploy V1 staging fix (ACL-blocked from Fly CLI)

---

## 🚨 Situation

I've pushed the server fix for demo mode with robust guards (9 commits to `pulse-nest` branch). The code is ready to deploy, but I'm ACL-blocked from running Fly CLI commands in my environment.

**Current Status:**
- ✅ Code pushed to remote: `pulse-nest` branch
- ✅ `/dashboard` and `/analytics` routes working
- ❌ `/client-portal` returning 500 error (needs server fix deployment)
- ⏳ Awaiting deployment with correct environment variables

---

## 📋 Deployment Commands (Please Run)

**Staging Environment:**

```bash
# Step 1: Set environment secrets
fly secrets set VITE_DEMO_MODE=true SERVER_DEMO_MODE=true VITE_FEATURE_UNIFIED_DASH=true

# Step 2: Deploy with cache bust (forces rebuild with new env vars)
fly deploy --build-arg NO_CACHE=$(date +%s)

# Step 3: Verify server logs
fly logs --since 5m | grep "DEMO MODE"
```

---

## ✅ Expected Output (Good Deployment)

**After Step 3, you should see:**

```
[DEMO MODE] Server bypassing Supabase - using stub client
🚀 Fusion Starter server running on port 8080
📱 Frontend: http://localhost:8080
🔧 API: http://localhost:8080/api
```

**Health check:**
```bash
curl -sI https://d3613ea4155540d8a091d17b8a1bcf45-579f8f2444f54e2382a8c6ca2.fly.dev/health
# Expected: HTTP/2 200
```

---

## 🚩 Red Flags (Report If You See These)

```
❌ Error: Missing SUPABASE_URL
❌ TypeError: Failed to fetch
❌ Invalid API key
❌ Stack trace with Supabase initialization
```

If you see any of these, please share the full log output and we'll troubleshoot immediately.

---

## 🎯 What Happens After Deployment

Once you reply **"deployed"**, I will immediately:

1. ✅ Verify all 4 routes load successfully:
   - `/dashboard`
   - `/analytics`
   - `/admin/billing`
   - `/client-portal`

2. ✅ Confirm zero Supabase network traffic in demo mode

3. ✅ Capture proof artifacts:
   - 8 screenshots (desktop/mobile, light/dark)
   - 4 Loom videos (≤2 min each)
   - Performance metrics (Lighthouse)
   - Accessibility audit (axe DevTools)
   - Telemetry verification
   - Build logs

4. ✅ Post the **`✅ V1 STAGING LIVE`** GO note with all proof attached

---

## ⏱️ Estimated Time

- **Deployment:** ~3-5 minutes
- **Verification (my side):** ~30-40 minutes after your "deployed" confirmation
- **Total to V1 GO note:** ~45 minutes from now

---

## 🔧 Why These Secrets Are Required

| Secret | Purpose | Impact if Missing |
|--------|---------|-------------------|
| `VITE_DEMO_MODE=true` | Client bypasses Supabase (compile-time) | Client will try to connect to real Supabase, fail with 401 errors |
| `SERVER_DEMO_MODE=true` | Server uses stub client (runtime, checked first) | Server crashes on startup with "Missing SUPABASE_URL" |
| `VITE_FEATURE_UNIFIED_DASH=true` | Enables unified dashboard UI | Uses legacy dashboard instead (acceptable, but need to test both) |

**Note:** `VITE_*` variables are build-time, so the cache bust (`NO_CACHE`) is critical to force a rebuild with new values.

---

## 📞 Contact

If you encounter any issues during deployment:

1. **Share full logs:** `fly logs --since 15m > deployment-logs.txt`
2. **Tag me in Slack/chat** with the error message
3. **ETA for response:** < 5 minutes

---

## ✅ Quick Checklist for You

- [ ] Run Step 1: Set secrets
- [ ] Run Step 2: Deploy with cache bust
- [ ] Run Step 3: Verify logs show `[DEMO MODE]`
- [ ] Run health check: `curl` command
- [ ] Reply **"deployed"** when complete

---

**Thank you for the urgent assist! This unblocks V1 staging validation.**

---

**Prepared By:** Development Team  
**Branch:** `pulse-nest`  
**Commits:** 9 (including robust server demo guard)  
**Next:** Awaiting deployment confirmation
