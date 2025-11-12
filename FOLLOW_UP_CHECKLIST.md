# 📋 Follow-Up Checklist - V1 Staging Deployment

**Date:** 2025-11-12  
**Status:** Awaiting deployment confirmation

---

## ✅ Communication Tasks (Do Now)

- [ ] **Send DevOps Request**
  - File: `DEVOPS_DEPLOY_REQUEST.md`
  - Channel: #ops or direct to DevOps team
  - Priority: HIGH
  - Include: All 3 deployment commands

- [ ] **Post Dev Channel Update**
  - File: `DEV_CHANNEL_UPDATE.md`
  - Channel: #dev or #builders
  - Purpose: Keep team informed of status

- [ ] **Share Stakeholder Note**
  - File: `STAKEHOLDER_STATUS_NOTE.md`
  - Audience: Non-technical stakeholders
  - Format: Email or Slack post

---

## ⏳ Waiting For (Monitor)

- [ ] **DevOps Reply: "deployed"**
  - Expected: Within 5-10 minutes
  - Watch: #ops channel or email
  - Next: Immediately begin validation

- [ ] **Deployment Logs Confirmation**
  - Expected log: `[DEMO MODE] Server bypassing Supabase - using stub client`
  - Red flags: Any errors with Supabase, missing env vars
  - Action: If errors, refer to `TRIAGE_500_ERRORS.md`

---

## 🚀 When You Get "deployed" (Execute Immediately)

### Phase 1: Quick Smoke Test (5 min)

- [ ] **Health Check**
  ```bash
  curl -sI https://d3613ea4155540d8a091d17b8a1bcf45-579f8f2444f54e2382a8c6ca2.fly.dev/health
  # Expected: HTTP/2 200
  ```

- [ ] **Route Verification**
  - [ ] `/dashboard` - Loads, no 500
  - [ ] `/analytics` - Charts display
  - [ ] `/admin/billing` - Verify exists or 404 (document)
  - [ ] `/client-portal` - **NO 500 error** (was failing before)

- [ ] **Browser Console Check**
  - [ ] See: `[DEMO MODE] Using mock auth user`
  - [ ] See: `[DEMO MODE] Using mock brands`
  - [ ] No Supabase errors

- [ ] **Network Tab Check**
  - [ ] Filter by `supabase.co`
  - [ ] Expected: **0 requests**

### Phase 2: Capture Proof Artifacts (30 min)

#### Screenshots (8 total) - 10 min

- [ ] **Desktop (1920x1080) - Light Mode**
  - [ ] `/dashboard`
  - [ ] `/analytics`

- [ ] **Desktop (1920x1080) - Dark Mode**
  - [ ] `/dashboard`
  - [ ] `/analytics`

- [ ] **Mobile (375x667) - Light Mode**
  - [ ] `/dashboard`
  - [ ] `/client-portal`

- [ ] **Mobile (375x667) - Dark Mode**
  - [ ] `/dashboard`
  - [ ] `/client-portal`

#### Loom Videos (4 total, ≤2 min each) - 10 min

- [ ] **Loom 1: Agency Flow (2 min)**
  - [ ] Load `/dashboard`
  - [ ] Navigate to `/analytics`
  - [ ] Show KPIs updating
  - [ ] Click export (if wired)

- [ ] **Loom 2: Client Flow (2 min)**
  - [ ] Load `/client-portal`
  - [ ] Point out: **NO edit/delete buttons**
  - [ ] Export data
  - [ ] Show console (clean, demo mode only)

- [ ] **Loom 3: Filter Sync (90 sec)**
  - [ ] Change brand: Acme → GreenLeaf
  - [ ] All cards update simultaneously
  - [ ] Change period: Week → Month
  - [ ] All charts update
  - [ ] Show console events

- [ ] **Loom 4: Dark Mode + Mobile (90 sec)**
  - [ ] Toggle dark mode
  - [ ] Verify contrast/colors
  - [ ] Mobile viewport (375px)
  - [ ] Navigate routes
  - [ ] Show responsive behavior

#### Performance Metrics (10 min)

- [ ] **Lighthouse - Desktop**
  - [ ] `/dashboard` - Capture LCP, INP, CLS
  - [ ] `/analytics` - Capture LCP, INP, CLS

- [ ] **Lighthouse - Mobile (Throttled)**
  - [ ] `/dashboard` - Capture LCP, INP, CLS
  - [ ] `/analytics` - Capture LCP, INP, CLS

- [ ] **Document Results**
  - [ ] LCP < 2.5s? (target <2.0s)
  - [ ] INP < 200ms? (target <150ms)
  - [ ] CLS < 0.15? (target <0.1)

#### Accessibility Audit (5 min)

- [ ] **axe DevTools - All Routes**
  - [ ] `/dashboard` - Run scan
  - [ ] `/analytics` - Run scan
  - [ ] `/admin/billing` - Run scan (if exists)
  - [ ] `/client-portal` - Run scan

- [ ] **Verify Results**
  - [ ] Critical violations: 0
  - [ ] Serious violations: 0
  - [ ] Moderate: < 5 (acceptable)

- [ ] **Screenshot Summary**

#### Telemetry Verification (5 min)

- [ ] **Console Screenshot**
  - [ ] Filter by `[Analytics]`
  - [ ] Show `dash_view` event
  - [ ] Show `dash_brand_switched` event
  - [ ] Show `dash_filter_applied` event
  - [ ] Verify: All include `demo_mode: true`

#### Build Logs (5 min)

- [ ] **Capture Last 20 Lines**
  ```bash
  pnpm typecheck 2>&1 | tail -20 > typecheck-output.txt
  pnpm lint 2>&1 | tail -20 > lint-output.txt
  pnpm build 2>&1 | tail -20 > build-output.txt
  ```

- [ ] **Request Server Logs from DevOps**
  ```bash
  fly logs --since 5m > staging-build-logs.txt
  ```

### Phase 3: Edge Polish (5 min)

- [ ] **Secrets Hygiene**
  ```bash
  grep -r 'supabase' dist/assets/ | grep -v 'demo.supabase.co'
  # Expected: No matches
  ```

- [ ] **Server Console Hygiene**
  - [ ] Verify: Only ONE `[DEMO MODE]` log on startup
  - [ ] No duplicate/verbose logs

- [ ] **Flags Independence**
  - [ ] Tested: Demo mode works with unified ON
  - [ ] Tested: Demo mode works with unified OFF
  - [ ] Demo mode doesn't force unified flag

### Phase 4: Post GO Note (5 min)

- [ ] **Fill Out Template**
  - File: `V1_STAGING_GO_NOTE_TEMPLATE.md`
  - Fill in: Timestamps, URLs, metrics
  - Attach: All proof artifacts

- [ ] **Post to Chat**
  - Format: `✅ V1 STAGING LIVE`
  - Include: Staging URL, flags set, proof artifacts
  - Mention: Known issues (if any)

- [ ] **Update PR**
  - Add comment with GO note
  - Link to proof artifacts
  - Request stakeholder review

---

## 🚨 If Something Goes Wrong

### Issue: Routes Still 500'ing

- [ ] Check server logs for errors
- [ ] Verify secrets are set correctly
- [ ] Try cache-busted redeploy
- [ ] Refer to `TRIAGE_500_ERRORS.md`

### Issue: Demo Mode Not Active

- [ ] Check console for `[DEMO MODE]` logs
- [ ] Verify `VITE_DEMO_MODE=true` in secrets
- [ ] Redeploy with cache bust
- [ ] Hard refresh browser

### Issue: Network Shows Supabase Calls

- [ ] Verify `VITE_DEMO_MODE=true` is set
- [ ] Check client code guards
- [ ] Redeploy with cache bust
- [ ] Clear browser cache

### Issue: Deployment Failed

- [ ] Get full error logs from DevOps
- [ ] Check build errors
- [ ] Verify no syntax errors in code
- [ ] Consider rollback if needed

---

## 📊 Success Criteria

**You know it's ready when:**

✅ All routes load without 500 errors  
✅ Console shows demo mode logs  
✅ Network tab shows 0 Supabase requests  
✅ All proof artifacts captured  
✅ GO note posted with all attachments  
✅ No blocking issues remain

---

## 📞 Escalation Path

**If stuck >15 minutes:**

1. Post status update in #dev channel
2. Share specific error/blocker
3. Tag relevant team members
4. Consider rollback if deployment is broken

**If critical blocker:**

1. Rollback deployment: `fly releases rollback`
2. Document issue in detail
3. Schedule debug session
4. Post status update to stakeholders

---

## ✨ Final Deliverable

**Post this message when complete:**

```
✅ V1 STAGING LIVE — all proof artifacts attached.

Staging URL: https://d3613ea4155540d8a091d17b8a1bcf45-579f8f2444f54e2382a8c6ca2.fly.dev
Flags: ✅ VITE_DEMO_MODE, SERVER_DEMO_MODE, VITE_FEATURE_UNIFIED_DASH
Routes: ✅ All load successfully
Network: ✅ 0 Supabase requests
Proof: 📸 8 screenshots, 🎬 4 Looms, ⚡ Metrics, ♿ A11y, 📊 Telemetry

Ready for stakeholder review → production canary planning.
```

---

**Last Updated:** 2025-11-12  
**Status:** Awaiting "deployed" confirmation  
**Next:** Execute Phase 1-4 when deployment completes
