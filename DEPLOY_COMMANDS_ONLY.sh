#!/bin/bash
# ⚡ V1 STAGING - DEPLOY COMMANDS ONLY
# Copy/paste these commands in order

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 V1 STAGING DEPLOYMENT - COMMAND SEQUENCE"
echo "═══════════════════════════════════════════════════════════��═══"
echo ""

# ────────────────────────────────────────────────────────────────
# STEP 1: Push code
# ────────────────────────────────────────────────────────────────
echo "1️⃣ PUSH CODE"
git push origin pulse-nest
echo ""

# ────────────────────────────────────────────────────────────────
# STEP 2: Set secrets
# ────────────────────────────────────────────────────────────────
echo "2️⃣ SET SECRETS"
fly secrets set VITE_DEMO_MODE=true SERVER_DEMO_MODE=true VITE_FEATURE_UNIFIED_DASH=true
echo ""

# ────────────────────────────────────────────────────────────────
# STEP 3: Verify secrets
# ────────────────────────────────────────────────────────────────
echo "3️⃣ VERIFY SECRETS"
fly secrets list
echo ""

# ──��─────────────────────────────────────────────────────────────
# STEP 4: Deploy with cache bust
# ────────────────────────────────────────────────────────────────
echo "4️⃣ DEPLOY"
fly deploy --build-arg NO_CACHE=$(date +%s)
echo ""

# ────────────────────────────────────────────────────────────────
# STEP 5: Check logs
# ────────────────────────────────────────────────────────────────
echo "5️⃣ CHECK LOGS"
echo "Expected: [DEMO MODE] Server bypassing Supabase - using stub client"
fly logs --since 5m | grep -E "DEMO MODE|Supabase|error"
echo ""

# ────────────────────────────────────────────────────────────────
# STEP 6: Health check
# ──────────���─────────────────────────────────────────────────────
echo "6️⃣ HEALTH CHECK"
curl -sI https://d3613ea4155540d8a091d17b8a1bcf45-579f8f2444f54e2382a8c6ca2.fly.dev/health
echo ""

# ────────────────────────────────────────────────────────────────
# STEP 7: Open dashboard
# ────────────────────────────────────────────────────────────────
echo "7️⃣ OPEN DASHBOARD IN BROWSER"
echo "URL: https://d3613ea4155540d8a091d17b8a1bcf45-579f8f2444f54e2382a8c6ca2.fly.dev/dashboard"
echo ""
echo "VALIDATE:"
echo "  Console: [DEMO MODE] Using mock auth user ✅"
echo "  Console: [DEMO MODE] Using mock brands ✅"
echo "  Network: 0 requests to supabase.co ✅"
echo ""

# ────────────────────────────────────────────────────────────────
# STEP 8: Capture artifacts
# ────────────────��───────────────────────────────────────────────
echo "8️⃣ CAPTURE PROOF ARTIFACTS"
echo "  📸 8 Screenshots (desktop/mobile, light/dark)"
echo "  🎬 4 Looms (≤2 min each)"
echo "  ⚡ Lighthouse (LCP, INP, CLS)"
echo "  ♿ axe DevTools (0 critical/serious)"
echo "  📊 Telemetry (console screenshot)"
echo "  📝 Build logs"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ DONE - POST GO NOTE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Reply with: ✅ V1 STAGING LIVE"
echo ""
