# 🚨 500 Error Triage Guide

**Use this if staging still shows 500 errors after deployment**

---

## Quick 500 Triage

### 1. Pull Full Stack Trace

```bash
fly logs --since 15m | tail -n +1
```

### 2. Look for These Common Issues

#### Missing Environment Variables

```
❌ Error: Missing SUPABASE_URL
❌ ReferenceError: process is not defined
❌ Cannot read property 'SUPABASE_URL' of undefined
```

**Fix:**

```bash
fly secrets set SERVER_DEMO_MODE=true VITE_DEMO_MODE=true
fly deploy --build-arg NO_CACHE=$(date +%s)
```

#### Import Side-Effects (Supabase Init at Top-Level)

```
❌ Error: createClient is not a function
❌ TypeError: Cannot read property 'from' of undefined
❌ Supabase client initialization failed
```

**Check logs for:**

```
[DEMO MODE] Server bypassing Supabase - using stub client
```

If missing, the guard isn't early enough. **The fix we applied should prevent this.**

**If you still see Supabase errors:**

1. Check `server/lib/supabase.ts` - guard should be at the TOP
2. No Supabase imports should execute before checking `SERVER_DEMO_MODE`
3. Verify `SERVER_DEMO_MODE=true` is set: `fly secrets list`

#### ESM/CJS Import Errors

```
❌ Error [ERR_REQUIRE_ESM]: require() of ES Module
❌ SyntaxError: Cannot use import statement outside a module
```

**Fix:** Already handled in our config. If you see this:

1. Check `package.json` has `"type": "module"`
2. Check `vite.config.server.ts` has correct format
3. Redeploy with cache bust

#### Invalid Adapter Paths

```
❌ Cannot find module './dist/server/node-build.mjs'
❌ Error: Cannot find module '@/lib/supabase'
```

**Fix:**

```bash
# Verify build artifacts exist
ls -la dist/server/

# Should show:
# node-build.mjs
# node-build.mjs.map

# If missing, rebuild:
pnpm build
fly deploy --build-arg NO_CACHE=$(date +%s)
```

### 3. Check Server Startup Sequence

**Expected logs (in order):**

```
[DEMO MODE] Server bypassing Supabase - using stub client
🚀 Fusion Starter server running on port 8080
📱 Frontend: http://localhost:8080
🔧 API: http://localhost:8080/api
```

**If you see Supabase anywhere while `SERVER_DEMO_MODE=true`:**

```
❌ Initializing Supabase client...
❌ Connecting to Supabase at https://...
```

**This means the guard isn't working. Check:**

1. `SERVER_DEMO_MODE` is set: `fly secrets list`
2. Server is reading the env var correctly
3. No import side-effects creating clients before the check

---

## Detailed Diagnostics

### Check 1: Verify Environment Variables

```bash
# List all secrets
fly secrets list

# Should show:
# SERVER_DEMO_MODE=true
# VITE_DEMO_MODE=true
# VITE_FEATURE_UNIFIED_DASH=true
```

### Check 2: Inspect Build Artifacts

```bash
# Check client bundle size
ls -lh dist/assets/

# Check server build
ls -la dist/server/

# Should show:
# node-build.mjs (~2.5 KB)
```

### Check 3: Test Health Endpoint

```bash
curl -sI https://YOUR_APP.fly.dev/health

# Expected: HTTP/2 200
# If 500, server isn't starting
```

### Check 4: Test API Ping

```bash
curl -s https://YOUR_APP.fly.dev/api/ping

# Expected: {"message":"pong"}
# If 500, routing is broken
```

### Check 5: Inspect Client Bundle for Secrets

```bash
# Search for leaked Supabase URLs (after building locally)
grep -r 'supabase' dist/ | grep -v 'demo.supabase.co'

# Expected: No matches (or only demo URL)
```

---

## Common Fix Patterns

### Pattern 1: Server Won't Start (Missing Secrets)

**Symptom:**

```
Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
```

**Fix:**

```bash
fly secrets set SERVER_DEMO_MODE=true
fly deploy --build-arg NO_CACHE=$(date +%s)
```

**Why:** Server needs `SERVER_DEMO_MODE=true` to bypass Supabase credentials check.

---

### Pattern 2: Client Shows Supabase Errors

**Symptom:**

```
Console: TypeError: Failed to fetch
Console: Invalid API key
Network: 401 from supabase.co
```

**Fix:**

```bash
# Verify client env var is set
fly secrets list | grep VITE_DEMO_MODE

# If missing:
fly secrets set VITE_DEMO_MODE=true

# Redeploy (client env vars are compile-time)
fly deploy --build-arg NO_CACHE=$(date +%s)

# Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
```

**Why:** Client env vars (`VITE_*`) are compile-time. Must redeploy after changing.

---

### Pattern 3: Routes Return 404

**Symptom:**

```
/dashboard → 404 Not Found
/analytics → 404 Not Found
```

**Fix:**
Check `server/node-build.ts` has SPA fallback route (already in place):

```typescript
// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
```

If missing, server isn't serving SPA correctly.

---

### Pattern 4: Network Tab Shows Supabase Requests

**Symptom:**

```
Network tab: Requests to supabase.co (even with VITE_DEMO_MODE=true)
Console: [DEMO MODE] logs missing
```

**Root cause:** Client isn't in demo mode.

**Fix:**

```bash
# Verify env var
fly secrets list | grep VITE_DEMO_MODE

# Redeploy with cache bust
fly deploy --build-arg NO_CACHE=$(date +%s)

# Clear browser cache
# Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)
# Or open in incognito/private window
```

---

## Emergency Rollback

If deployment is broken and you need to rollback:

```bash
# List recent releases
fly releases

# Rollback to previous version
fly releases rollback <VERSION>

# Example:
# fly releases rollback v12
```

---

## Static Fallback (Last Resort)

If SSR is completely broken, you can serve a static preview temporarily:

```bash
# Build static client only
pnpm build:client

# Deploy static files (Netlify/Vercel)
# This bypasses server issues entirely
```

**Note:** This is a temporary workaround. Fix server issues for production.

---

## Get Help

If you're stuck after 15 minutes:

1. **Capture full logs:**

   ```bash
   fly logs --since 30m > full-logs.txt
   ```

2. **Capture secrets list (redact values):**

   ```bash
   fly secrets list > secrets-list.txt
   ```

3. **Capture build output:**

   ```bash
   pnpm build > build-output.txt 2>&1
   ```

4. **Post in chat with:**
   - Full logs
   - Secrets list (redacted)
   - Build output
   - Specific error message
   - Screenshot of browser console

5. **Consider rollback:**
   ```bash
   fly releases rollback
   ```

---

## Success Indicators

**You know it's working when:**

✅ Server logs show:

```
[DEMO MODE] Server bypassing Supabase - using stub client
🚀 Fusion Starter server running on port 8080
```

✅ Client console shows:

```
[DEMO MODE] Using mock auth user
[DEMO MODE] Using mock brands
```

✅ Network tab shows:

```
0 requests to supabase.co
```

✅ All routes load:

```
/dashboard → 200
/analytics → 200
/admin/billing → 200
/client-portal → 200
```

✅ Health check passes:

```
curl https://YOUR_APP.fly.dev/health
{"status":"ok"}
```

---

**Last Updated:** 2025-11-12  
**Applies To:** V1 Staging Deployment with SERVER_DEMO_MODE
