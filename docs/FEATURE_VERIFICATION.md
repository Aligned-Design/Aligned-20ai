# Aligned-20AI — Feature Verification Test Plan
## Smoke + Functional Testing Checklist

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Test Environment:** Production / Staging  
**Tester Name:** ________________  
**Test Date:** ________________  

---

## 📋 PRE-REQUISITES (SETUP)

Before beginning any test module, ensure all prerequisites are in place:

- [ ] **User Account**
  - [ ] Logged-in test user with **Admin role**
  - [ ] Test account has valid email (for magic link tests)
  - Observed Result: ________________

- [ ] **Brand Connection**
  - [ ] At least **1 Brand** created and connected
  - [ ] Brand has name, primary color, secondary color
  - [ ] Brand visible in Brand Selector / Workspace Switcher
  - Observed Result: ________________

- [ ] **Social OAuth Connection**
  - [ ] At least **1 social platform** connected (LinkedIn, Instagram, Facebook, Twitter, TikTok, YouTube)
  - [ ] OAuth tokens valid (not expired)
  - [ ] Verified in /linked-accounts page
  - Observed Result: ________________

- [ ] **Test Data**
  - [ ] **2 Draft Posts** (status: draft)
  - [ ] **1 Pending Approval Post** (status: reviewing, awaiting approval)
  - [ ] **1 Scheduled Post** (status: scheduled, with future date)
  - [ ] **1 Published Post** (status: published, with past date)
  - [ ] All test posts visible in /content-queue
  - Observed Result: ________________

---

## MODULE 1: Signup & Onboarding
### Route: `/onboarding` (7-screen flow)

**Goal:** Onboarding flow works end-to-end; state persists across refresh; final redirect to dashboard authenticated.

### Steps

#### Step 1: Entry Point
- [ ] **1.1** Visit `/` (logged out)
- [ ] **1.2** Click "Sign Up" button
- [ ] **1.3** Receive magic link or OAuth option (confirm email)
- Observed Result: ________________

#### Step 2: Screen 1 - Email / Auth
- [ ] **2.1** Enter valid email address
- [ ] **2.2** Submit and check for inline validation errors (empty field, invalid format)
- [ ] **2.3** If using magic link, receive email with link
- [ ] **2.4** Click link and proceed to next screen
- Observed Result: ________________

#### Step 3: Screen 2 - Role Selection
- [ ] **3.1** Select role (Creator / Approver / Admin)
- [ ] **3.2** Validate selection is saved on next screen
- [ ] **3.3** If refresh mid-screen, state persists
- Observed Result: ________________

#### Step 4: Screen 3 - Brand Intake (Basics)
- [ ] **4.1** Enter Brand Name
- [ ] **4.2** Enter Brand Description
- [ ] **4.3** Validate inline errors (required fields)
- [ ] **4.4** Refresh page → values still present
- Observed Result: ________________

#### Step 5: Screen 3 (continued) - Voice & Visual
- [ ] **5.1** Select tone/voice keywords
- [ ] **5.2** Pick primary and secondary colors
- [ ] **5.3** Upload or skip logo
- [ ] **5.4** Refresh → all fields persist
- Observed Result: ________________

#### Step 6: Screen 4 - Connect Accounts
- [ ] **6.1** See list of social platforms (LinkedIn, Instagram, etc.)
- [ ] **6.2** Click "Connect" on at least 1 platform
- [ ] **6.3** Redirected to OAuth provider
- [ ] **6.4** Complete OAuth flow and return
- [ ] **6.5** Platform shows "Connected" badge
- Observed Result: ________________

#### Step 7: Screen 5 - Goals Setup
- [ ] **7.1** Set monthly posting frequency
- [ ] **7.2** Set engagement target (optional)
- [ ] **7.3** Values save on proceed
- Observed Result: ________________

#### Step 8: Screen 6 - Guided Tour (Optional)
- [ ] **8.1** Tour overlay visible with tips
- [ ] **8.2** Can skip tour ("Skip") or complete it ("Next")
- Observed Result: ________________

#### Step 9: Screen 7 - Completion / Dashboard Redirect
- [ ] **9.1** Final confirm screen shows brand name + platforms
- [ ] **9.2** Click "Go to Dashboard"
- [ ] **9.3** Redirected to `/dashboard`
- [ ] **9.4** User is authenticated (Bearer token set)
- [ ] **9.5** Dashboard KPIs and brand selector visible
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] Each step validates inputs (shows inline errors for invalid data)
- [ ] Refreshing mid-flow resumes at the correct step with data intact
- [ ] After final step, user lands on `/dashboard` with valid auth token
- [ ] No console errors or unhandled exceptions
- [ ] Mobile responsive (tested on 320px width)
- [ ] Keyboard navigation works (Tab, Enter, Esc)

❌ **FAIL** if ANY of the following occur:
- [ ] Data loss on page refresh
- [ ] Validation errors unclear or unhelpful
- [ ] Redirect to dashboard fails or shows 403/401
- [ ] OAuth connection times out or fails silently
- [ ] Console errors present

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 2: Brand Intake Questionnaire
### Route: `/onboarding` (Step 3 - 6 sections)

**Goal:** 6 sections of brand intake save as draft; final submit writes to database; review screen shows exact inputs.

### Steps

#### Section 1: Brand Basics
- [ ] **1.1** Enter Brand Name
- [ ] **1.2** Enter Brand Description
- [ ] **1.3** Enter Industry/Category
- [ ] **1.4** Click "Next" → advance to Section 2
- [ ] **1.5** Refresh page → values persist
- Observed Result: ________________

#### Section 2: Voice & Tone
- [ ] **2.1** Select tone keywords (e.g., Professional, Casual, Empowering)
- [ ] **2.2** Write brand voice example (150 chars)
- [ ] **2.3** Click "Next" → advance
- [ ] **2.4** Refresh → keywords and text still there
- Observed Result: ________________

#### Section 3: Visual Identity
- [ ] **3.1** Pick primary color (color picker or hex)
- [ ] **3.2** Pick secondary color
- [ ] **3.3** Pick accent color (optional)
- [ ] **3.4** Upload or skip logo image
- [ ] **3.5** Click "Next" → advance
- [ ] **3.6** Refresh → colors and logo path persist
- Observed Result: ________________

#### Section 4: Brand Preferences
- [ ] **4.1** Select content types (Blog, Video, Infographic, etc.)
- [ ] **4.2** Set posting frequency preference
- [ ] **4.3** Select target audience
- [ ] **4.4** Click "Next" → advance
- [ ] **4.5** Refresh → selections persist
- Observed Result: ________________

#### Section 5: Compliance & Guidelines
- [ ] **5.1** Add any brand guidelines text (optional)
- [ ] **5.2** Set content approval requirement (On/Off)
- [ ] **5.3** Click "Next" → advance to review
- [ ] **5.4** Refresh → settings persist
- Observed Result: ________________

#### Section 6: Review & Submit
- [ ] **6.1** Review screen shows all inputs from Sections 1-5
- [ ] **6.2** Verify exact matching (names, colors, tone keywords)
- [ ] **6.3** Click "Edit" to go back and modify any section
- [ ] **6.4** Return to review → changes reflected
- [ ] **6.5** Click "Submit" → brand profile saved
- Observed Result: ________________

#### Post-Submit Verification
- [ ] **6.6** Modal or toast confirms "Brand Created Successfully"
- [ ] **6.7** Redirected to `/brands` or brand detail page
- [ ] **6.8** New brand visible in brand list with correct data
- [ ] **6.9** Brand appears in Workspace Switcher
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] Draft data persists between sections and across page refresh
- [ ] Final submit writes brand profile to database
- [ ] Brand appears in `/brands` page with correct details
- [ ] Review screen shows exact inputs (no truncation/modification)
- [ ] Edit and re-submit works without losing data
- [ ] No console errors

❌ **FAIL** if ANY of the following occur:
- [ ] Data lost after refresh in any section
- [ ] Submit fails with 500 error
- [ ] Brand created but missing fields in database
- [ ] Review screen doesn't match submitted data
- [ ] Brand not visible in brand list

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 3: Content Creation
### Route: `/creative-studio`

**Goal:** 5-step AI content generation works (topic → copy → design → brand check → publish/queue).

### Steps

#### Step 1: Topic & Setup
- [ ] **1.1** Navigate to `/creative-studio`
- [ ] **1.2** Enter content topic (e.g., "New Product Launch")
- [ ] **1.3** Select target platform (Instagram / LinkedIn / Twitter / TikTok)
- [ ] **1.4** Select content type (Post / Carousel / Story)
- [ ] **1.5** Click "Generate Copy"
- Observed Result: ________________

#### Step 2: Copy Generation
- [ ] **2.1** Receive 3 copy variations from AI (within 10 seconds)
- [ ] **2.2** Each variation includes title, description, hashtags/mentions
- [ ] **2.3** Can toggle between 3 variations
- [ ] **2.4** Select preferred copy option → highlighted/saved
- [ ] **2.5** Click "Next" → advance to design
- Observed Result: ________________

#### Step 3: Design Template Selection
- [ ] **3.1** System calls Design Agent with selected copy
- [ ] **3.2** Receive 3 template design options (within 10 seconds)
- [ ] **3.3** Each template shows thumbnail preview
- [ ] **3.4** Can toggle between 3 templates
- [ ] **3.5** Select preferred template → design rendered
- [ ] **3.6** Click "Next" → advance to brand check
- Observed Result: ________________

#### Step 4: Brand Fidelity Check
- [ ] **4.1** System runs Brand Intelligence check on copy + design
- [ ] **4.2** Displays fidelity score (0-100)
- [ ] **4.3** Shows alignment feedback (e.g., "✓ Matches brand voice" or "⚠️ Consider more professional tone")
- [ ] **4.4** Full preview of final post shown
- [ ] **4.5** Can edit copy or design (returns to prev steps) or proceed
- Observed Result: ________________

#### Step 5: Publish or Queue
- [ ] **5.1** Two options shown: "Add to Queue" and "Publish Now"
- [ ] **5.2** Click "Add to Queue"
  - [ ] **5.2a** Post created in draft status
  - [ ] **5.2b** Visible in `/content-queue` under Drafts
  - [ ] **5.2c** Toast confirms "Post added to queue"
- [ ] **5.3** OR click "Publish Now"
  - [ ] **5.3a** Shows scheduling options (Immediate / Scheduled for...)
  - [ ] **5.3b** Confirms publish to selected platforms
  - [ ] **5.3c** Post immediately enqueued
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] 3 copy variations return within acceptable latency (~10s, no timeout)
- [ ] 3 design templates return within acceptable latency
- [ ] Selected copy + design combo renders accurately in preview
- [ ] Brand fidelity score calculated and displayed
- [ ] "Add to Queue" creates item visible in `/content-queue`
- [ ] "Publish Now" enqueues post for multi-platform publishing
- [ ] No console errors; all API calls successful

❌ **FAIL** if ANY of the following occur:
- [ ] API timeouts on copy or design generation
- [ ] Only 1-2 options returned instead of 3
- [ ] Preview doesn't match selected copy/design
- [ ] Queue add fails with error
- [ ] Post not visible in `/content-queue` after creation

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 4: Approval Workflow
### Route: `/approvals`

**Goal:** Request approval → review → approve/reject → escalation for delayed items.

### Steps

#### Step 1: Request Approval
- [ ] **1.1** Navigate to `/content-queue`
- [ ] **1.2** Open a draft post (use test data: "Draft Post #1")
- [ ] **1.3** Click "Request Approval" button
- [ ] **1.4** Modal opens with comment field
- [ ] **1.5** Enter approval comment (e.g., "Please review this post for launch campaign")
- [ ] **1.6** Click "Request" → post status changes to "reviewing" (pending_approval)
- [ ] **1.7** Toast confirms "Approval requested"
- Observed Result: ________________

#### Step 2: Approval Queue View
- [ ] **2.1** Navigate to `/approvals`
- [ ] **2.2** See "Pending Approvals" section with your requested post
- [ ] **2.3** Post card shows:
  - [ ] **2.3a** Title and preview image
  - [ ] **2.3b** Requester name and timestamp
  - [ ] **2.3c** Comment thread icon with count
  - [ ] **2.3d** Approve and Reject buttons
- [ ] **2.4** Click on post card → expand detail view
- Observed Result: ________________

#### Step 3: Approval Actions - Approve Path
- [ ] **3.1** Click "Approve" button on a pending post
- [ ] **3.2** Confirmation dialog appears (optional)
- [ ] **3.3** Click "Confirm Approve"
- [ ] **3.4** Post status changes to "scheduled"
- [ ] **3.5** Post moves to `/content-queue` "Scheduled" section
- [ ] **3.6** Toast confirms "Post approved"
- [ ] **3.7** Comment thread shows "Approved by [Admin Name]" message
- Observed Result: ________________

#### Step 4: Approval Actions - Reject Path
- [ ] **4.1** Request approval on second draft post
- [ ] **4.2** In `/approvals`, click "Reject" button
- [ ] **4.3** Modal opens for rejection reason
- [ ] **4.4** Enter reason (e.g., "Brand tone doesn't match; please revise")
- [ ] **4.5** Click "Reject"
- [ ] **4.6** Post status reverts to "draft"
- [ ] **4.7** Post returns to `/content-queue` Drafts section
- [ ] **4.8** Comment thread shows rejection reason and requester can edit
- Observed Result: ________________

#### Step 5: Comments & Real-Time Updates
- [ ] **5.1** Open approval post detail
- [ ] **5.2** See comment thread (initial request comment)
- [ ] **5.3** Add new comment (e.g., "Updated version ready")
- [ ] **5.4** Comment appears in thread in real-time (or within 5 seconds)
- [ ] **5.5** On mobile/other browser, comment visible without refresh
- Observed Result: ________________

#### Step 6: Escalation (Optional - Delayed Item)
- [ ] **6.1** Create a pending approval item
- [ ] **6.2** Set system clock forward to >24h later (or force escalation test)
- [ ] **6.3** Return to `/approvals`
- [ ] **6.4** Verify escalation badge visible (red "Urgent" or clock icon)
- [ ] **6.5** Escalation notification sent (check email/in-app)
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] Request Approval changes status to "reviewing" and saves comment
- [ ] Pending items visible in `/approvals` with all expected fields
- [ ] Approve action moves item to "scheduled" and updates database
- [ ] Reject action returns item to "draft" with reason stored
- [ ] Comments display in real-time (or within 5s polling)
- [ ] Escalation badge shows for items >24h pending
- [ ] No console errors; all state changes logged

❌ **FAIL** if ANY of the following occur:
- [ ] Status change fails or doesn't persist
- [ ] Comments not visible on reload
- [ ] Approve/Reject actions show error toast
- [ ] Escalation not triggered after 24h
- [ ] Approval post not visible in queue after approval

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 5: Publishing
### Route: `/content-queue` → Backend Publishing Queue

**Goal:** Multi-platform publish enqueued; status tracked; reschedule works; published posts visible.

### Steps

#### Step 1: Publish Now Action
- [ ] **1.1** Navigate to `/content-queue`
- [ ] **1.2** Use test post "Scheduled Post" (status: scheduled)
- [ ] **1.3** Click "Publish Now" button on card
- [ ] **1.4** Confirmation modal shows platforms (LinkedIn, Instagram, etc.)
- [ ] **1.5** Click "Confirm Publish"
- [ ] **1.6** Toast appears: "Publishing to 3 platforms..."
- Observed Result: ________________

#### Step 2: Job Enqueuing & Status
- [ ] **2.1** Post status immediately changes to "publishing"
- [ ] **2.2** Job ID assigned (visible in post card or detail)
- [ ] **2.3** Navigate to `/content-queue` detail view
- [ ] **2.4** Status shows "Publishing" with progress spinner
- [ ] **2.5** Within 30 seconds, status updates to "published"
- [ ] **2.6** Post now in "Published" section of queue
- Observed Result: ________________

#### Step 3: Published Post Details
- [ ] **3.1** Open published post detail
- [ ] **3.2** Verify fields:
  - [ ] **3.2a** Status: "Published"
  - [ ] **3.2b** Published date/time
  - [ ] **3.2c** Platform links (LinkedIn profile, Instagram post URL, etc.)
  - [ ] **3.2d** Optional: engagement metrics (if available from API)
- [ ] **3.3** Click platform link → opens in new tab (verify correct URL)
- Observed Result: ________________

#### Step 4: Reschedule (Drag-Drop)
- [ ] **4.1** Return to `/calendar`
- [ ] **4.2** Find "Scheduled Post" in calendar grid (original date)
- [ ] **4.3** Drag post tile to a different date (e.g., 3 days later)
- [ ] **4.4** Optimistic UI shows post moved immediately
- [ ] **4.5** Confirm reschedule (click "Save" or auto-confirm)
- [ ] **4.6** Backend updates scheduled_at timestamp
- [ ] **4.7** Refresh calendar → post shows on new date
- Observed Result: ________________

#### Step 5: Publishing Logs (Optional)
- [ ] **5.1** In post detail, view "Publishing Logs" tab
- [ ] **5.2** See entry per platform with status (success/failed)
- [ ] **5.3** If any platform failed, see error message and retry option
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] Publish Now enqueues job and returns job ID
- [ ] Post status updates from "scheduled" → "publishing" → "published"
- [ ] Published post visible in `/content-queue` Published section
- [ ] Platform links are correct and clickable
- [ ] Drag-drop reschedule updates scheduled_at and persists
- [ ] No orphaned jobs or hung statuses
- [ ] All API calls return 200/success

❌ **FAIL** if ANY of the following occur:
- [ ] Publish fails with 500 error
- [ ] Status never updates to "published"
- [ ] Platform links are broken or incorrect
- [ ] Reschedule doesn't persist after refresh
- [ ] Publishing logs missing or show false errors

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 6: Analytics Insights
### Route: `/analytics`

**Goal:** Metrics render with filters; insights generate; goals persist.

### Steps

#### Step 1: Platform Tab Switching
- [ ] **1.1** Navigate to `/analytics`
- [ ] **1.2** See platform tabs: Instagram / TikTok / LinkedIn / Twitter / Facebook / YouTube
- [ ] **1.3** Default tab shows (e.g., Instagram)
- [ ] **1.4** KPI cards visible: Reach, Engagement Rate, Followers, etc.
- [ ] **1.5** Line chart shows trend over time
- Observed Result: ________________

#### Step 2: Platform Filter
- [ ] **2.1** Click TikTok tab
- [ ] **2.2** KPI values change for TikTok metrics
- [ ] **2.3** Chart data updates (x-axis dates, y-axis values)
- [ ] **2.4** No console errors; all API calls succeed
- Observed Result: ________________

#### Step 3: Date Range Filter
- [ ] **3.1** See date range buttons: "7d" / "30d" / "90d" / "Custom"
- [ ] **3.2** Click "30d" → metrics update (larger date range)
- [ ] **3.3** Click "Custom" → date picker opens
- [ ] **3.4** Select start/end dates (e.g., last 2 weeks)
- [ ] **3.5** Apply filter → chart and KPIs update
- [ ] **3.6** URL query params reflect selected range (?startDate=...&endDate=...)
- Observed Result: ________________

#### Step 4: AI Insights
- [ ] **4.1** Scroll to "Get AI Insights" button
- [ ] **4.2** Click button
- [ ] **4.3** Loading spinner appears ("Analyzing data...")
- [ ] **4.4** Within 10 seconds, insights panel populates with:
  - [ ] **4.4a** Key findings (e.g., "Engagement up 15% vs. last period")
  - [ ] **4.4b** Recommendations (e.g., "Post on Tuesday-Thursday for max reach")
  - [ ] **4.4c** Insights formatted as bullet points or cards
- [ ] **4.5** Can close insights panel
- Observed Result: ________________

#### Step 5: Goals Setup
- [ ] **5.1** See "Goals" section (card or widget)
- [ ] **5.2** Click "Set Goal" or "+" button
- [ ] **5.3** Modal opens: enter goal (e.g., "1000 followers by end of month")
- [ ] **5.4** Select goal type: Followers / Engagement / Reach / etc.
- [ ] **5.5** Enter target number and deadline
- [ ] **5.6** Click "Save Goal"
- [ ] **5.7** Goal persists (refresh page → goal still visible)
- [ ] **5.8** Goal card shows progress bar (current vs. target)
- Observed Result: ________________

#### Step 6: Top Posts & Engagement Table
- [ ] **6.1** Scroll to "Top Posts" section
- [ ] **6.2** Table shows: Post title / Platform / Likes / Comments / Shares / Engagement %
- [ ] **6.3** Posts sorted by engagement (highest first)
- [ ] **6.4** Can click post row → open post detail or modal
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] Platform tabs load metrics for each platform
- [ ] Date range filters update KPIs and chart correctly
- [ ] Custom date range picker works and updates query params
- [ ] "Get AI Insights" returns recommendations within 10 seconds
- [ ] Goals persist after page refresh
- [ ] Top posts table displays with correct data
- [ ] No console errors; all API calls return 200

❌ **FAIL** if ANY of the following occur:
- [ ] Metrics don't update when switching platforms
- [ ] Date range filter shows stale data
- [ ] Insights return error or timeout
- [ ] Goals lost after refresh
- [ ] KPI values clearly incorrect or nonsensical
- [ ] Chart fails to render

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 7: Client Portal
### Route: `/client-portal/:token`

**Goal:** External approval works via token; access gated; decisions sync back.

### Steps

#### Step 1: Generate Client Portal Link
- [ ] **1.1** In `/approvals`, find a pending post from a client project
- [ ] **1.2** Click "Share for Feedback" or "Send to Client" button
- [ ] **1.3** Generate secure token link: `client-portal/abc123xyz`
- [ ] **1.4** Copy link (to clipboard or display)
- Observed Result: ________________

#### Step 2: Access Portal (Unauthenticated)
- [ ] **2.1** Logout from main app (clear auth token)
- [ ] **2.2** Open generated client portal link in incognito/new browser
- [ ] **2.3** Page loads with client branding (if white-label enabled)
- [ ] **2.4** See approval card(s) assigned to this token
- [ ] **2.5** No login required; token grants access
- Observed Result: ________________

#### Step 3: Token-Scoped Access
- [ ] **3.1** Only posts in this client's scope visible
- [ ] **3.2** Cannot access other clients' content
- [ ] **3.3** Try to access invalid token → 403/404 error shown
- [ ] **3.4** Token expires after time limit (if set) → access denied
- Observed Result: ________________

#### Step 4: Approve Decision
- [ ] **4.1** On portal, see pending post card
- [ ] **4.2** Click "Approve" button
- [ ] **4.3** Optional: add comment (e.g., "Looks great! Please post")
- [ ] **4.4** Click "Confirm Approve"
- [ ] **4.5** Portal shows "Approved" status with timestamp
- [ ] **4.6** Toast confirms "Feedback sent"
- Observed Result: ________________

#### Step 5: Reject Decision
- [ ] **5.1** On portal, see another pending post
- [ ] **5.2** Click "Request Changes" or "Reject" button
- [ ] **5.3** Modal opens for feedback comment
- [ ] **5.4** Enter feedback (e.g., "Please adjust headline tone")
- [ ] **5.5** Click "Send Feedback"
- [ ] **5.6** Portal shows "Changes Requested" status
- Observed Result: ________________

#### Step 6: Sync to Internal Approvals
- [ ] **6.1** Login to main app as admin
- [ ] **6.2** Navigate to `/approvals`
- [ ] **6.3** Find client-approved post → status shows "Approved by Client"
- [ ] **6.4** Find client rejection → status shows "Changes Requested" with feedback
- [ ] **6.5** Approved post moved to "Scheduled"; rejected post back to "Draft"
- Observed Result: ________________

#### Step 7: Comments Visibility
- [ ] **7.1** On client portal, add comment to post
- [ ] **7.2** Comment appears in thread on portal
- [ ] **7.3** Switch to internal app `/approvals` → same comment visible
- [ ] **7.4** Internal user adds reply comment
- [ ] **7.5** Back on client portal → reply visible (auto-refresh or reload)
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] Token generates securely and is shareable
- [ ] Portal loads without authentication
- [ ] Only scoped posts visible (no cross-client data leak)
- [ ] Approve/Reject actions persist and sync back to `/approvals`
- [ ] Comments visible on both sides (portal & internal)
- [ ] Invalid/expired tokens blocked with proper error
- [ ] No console errors or auth leaks

❌ **FAIL** if ANY of the following occur:
- [ ] Portal requires login
- [ ] Can access posts from other clients via URL manipulation
- [ ] Approval decision doesn't sync to internal app
- [ ] Comments not visible to internal users
- [ ] Token never expires (security risk)
- [ ] 401/403 errors for valid tokens

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 8: Payment & Billing
### Route: `/billing`

**Goal:** Plan selection → Stripe Checkout → Subscription management.

### Section A: Readiness Test (UI, non-functional for now)

- [ ] **A.1** Navigate to `/billing`
- [ ] **A.2** See plan cards displayed (Starter / Pro / Enterprise)
- [ ] **A.3** Each card shows:
  - [ ] **A.3a** Plan name and price
  - [ ] **A.3b** Feature list (e.g., "Up to 5 brands", "Custom analytics")
  - [ ] **A.3c** "Choose Plan" or "Upgrade" button
  - [ ] **A.3d** Currently active plan highlighted
- [ ] **A.4** "Start Checkout" button visible (OK if non-functional in dev)
- [ ] **A.5** "Manage Subscription" CTA visible for logged-in users
- Observed Result: ________________

**Readiness Result:** ☐ PASS | ☐ FAIL

### Section B: Functional Test (Post-Payment Integration)

#### Step 1: Checkout Initiation
- [ ] **B.1** Click "Choose Plan" or "Upgrade" button
- [ ] **B.2** Stripe Checkout modal or page opens
- [ ] **B.3** Shows plan selected and price
- [ ] **B.4** Pre-populated with logged-in user email
- Observed Result: ________________

#### Step 2: Payment Entry
- [ ] **B.2** Enter test card: `4242 4242 4242 4242`
- [ ] **B.3** Enter expiry: 12/25
- [ ] **B.4** Enter CVC: 123
- [ ] **B.5** Enter zip: 12345
- [ ] **B.6** Click "Pay" or "Subscribe"
- Observed Result: ________________

#### Step 3: Webhook & Subscription Update
- [ ] **B.7** Checkout completes; Stripe webhook called
- [ ] **B.8** Subscription created in database
- [ ] **B.9** User's plan updated (verify in `/settings` or account page)
- [ ] **B.10** Email confirmation sent
- Observed Result: ________________

#### Step 4: Manage Subscription
- [ ] **B.11** On `/billing`, click "Manage Subscription"
- [ ] **B.12** Redirects to Stripe Customer Portal
- [ ] **B.13** Can view subscription, payment methods, invoices
- [ ] **B.14** Can downgrade or cancel subscription
- [ ] **B.15** Changes in Stripe Portal sync back to app
- Observed Result: ________________

**Functional Result:** ☐ PASS | ☐ FAIL (Note: Skip if Stripe not integrated yet)

### Pass/Fail Criteria (Readiness)

✅ **PASS** if:
- [ ] Plan cards render with all details
- [ ] Currently active plan visually distinct
- [ ] Checkout button present and clickable
- [ ] Manage Subscription CTA visible

❌ **FAIL** if:
- [ ] Plans missing or incorrectly displayed
- [ ] Pricing not shown
- [ ] Buttons non-functional or hidden

**Final Result (Readiness):** ☐ PASS | ☐ FAIL  
**Final Result (Functional):** ☐ PASS | ☐ FAIL | ☐ NOT TESTED  
**Notes:** ________________

---

## MODULE 9: Live Data & Real-Time Updates
### Global (affects `/dashboard`, `/content-queue`, `/approvals`)

**Goal:** KPIs auto-refresh; queue/approvals update via WebSocket or polling; offline handling.

### Steps

#### Step 1: Dashboard KPI Auto-Refresh
- [ ] **1.1** Navigate to `/dashboard`
- [ ] **1.2** Note KPI values (e.g., "Reach: 1,234")
- [ ] **1.3** Wait 60 seconds (default refresh interval)
- [ ] **1.4** KPI values update (should change slightly or with new data)
- [ ] **1.5** Open browser DevTools → Network tab
- [ ] **1.6** Confirm API call to `/api/analytics/metrics` every 60 seconds
- Observed Result: ________________

#### Step 2: Queue/Approvals Real-Time (WebSocket)
- [ ] **2.1** Open `/content-queue` in one tab
- [ ] **2.2** In another tab/window, publish a post
- [ ] **2.3** Back in first tab, watch for status change
- [ ] **2.4** Post status updates within 5 seconds (WebSocket push)
- [ ] **2.5** Alternatively, status updates within 10 seconds (polling fallback)
- Observed Result: ________________

#### Step 3: Approvals Real-Time Update
- [ ] **3.1** Open `/approvals` in one browser
- [ ] **3.2** In another browser (logged in as different user), approve a post
- [ ] **3.3** Back in first browser, post disappears or status changes
- [ ] **3.4** Update within 10 seconds via WebSocket or polling
- Observed Result: ________________

#### Step 4: Offline Handling
- [ ] **4.1** Open `/content-queue`
- [ ] **4.2** Open DevTools → Network tab
- [ ] **4.3** Set to "Offline" mode
- [ ] **4.4** Try to create or edit a post
- [ ] **4.5** Offline banner appears (e.g., "You're offline. Changes will sync when back online")
- [ ] **4.6** Post data saved to local IndexedDB/localStorage
- [ ] **4.7** Go back online
- [ ] **4.8** Banner disappears; changes auto-sync to server
- [ ] **4.9** Server confirmation received and UI updates
- Observed Result: ________________

#### Step 5: Polling Fallback (WebSocket Down)
- [ ] **5.1** Open `/approvals`
- [ ] **5.2** In DevTools, disable WebSocket (or block port)
- [ ] **5.3** Trigger a status change (approve post from another window)
- [ ] **5.4** Verify status updates via HTTP polling (within 10 seconds)
- [ ] **5.5** No console errors; graceful fallback to polling
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] Dashboard KPIs auto-refresh every 60 seconds
- [ ] Queue/Approvals updates within 10 seconds of action
- [ ] WebSocket OR polling confirmed working
- [ ] Offline banner shows when disconnected
- [ ] Changes queue locally and sync when back online
- [ ] No data loss on offline → online transition
- [ ] Graceful fallback if WebSocket unavailable

❌ **FAIL** if ANY of the following occur:
- [ ] KPIs never update
- [ ] Queue status not reflected for >30 seconds
- [ ] Offline mode not handled; errors shown
- [ ] WebSocket down causes app to hang (no polling fallback)
- [ ] Data lost when going offline

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 10: Design Tokens & Accessibility
### Global (all routes)

**Goal:** Token-based styling enforced; light/dark modes consistent; keyboard navigation; WCAG AA compliance.

### Steps

#### Step 1: Token Enforcement (No Raw Hex Codes)
- [ ] **1.1** Open `/dashboard`
- [ ] **1.2** Open DevTools → Inspector
- [ ] **1.3** Inspect a button → Computed Styles
- [ ] **1.4** Verify background color uses CSS variable (e.g., `var(--color-primary)`)
- [ ] **1.5** Check a badge → border color uses token (e.g., `var(--color-border)`)
- [ ] **1.6** Inspect input field → padding uses token (e.g., `var(--spacing-md)`)
- [ ] **1.7** No raw hex codes (#XXXXXX) found in computed styles
- Observed Result: ________________

#### Step 2: Light Mode
- [ ] **2.1** Ensure system theme set to "Light"
- [ ] **2.2** All text readable on white/light backgrounds (contrast OK)
- [ ] **2.3** Buttons have distinct colors (primary blue, danger red, etc.)
- [ ] **2.4** Cards have visible borders and shadows
- [ ] **2.5** Check KPI cards: text contrast >4.5:1 (WCAG AA)
- Observed Result: ________________

#### Step 3: Dark Mode
- [ ] **3.1** Switch system theme to "Dark" (or toggle in settings)
- [ ] **3.2** All text readable on dark backgrounds
- [ ] **3.3** Buttons have adequate contrast in dark theme
- [ ] **3.4** Cards visible with proper borders (not blending into dark bg)
- [ ] **3.5** No bright white text on bright backgrounds (hard to read)
- [ ] **3.6** Compare /dashboard light vs. dark → consistent branding
- Observed Result: ________________

#### Step 4: Keyboard Navigation
- [ ] **4.1** Navigate to `/dashboard`
- [ ] **4.2** Press Tab → focus moves to first interactive element (button, link)
- [ ] **4.3** Continue Tab → focus moves through all buttons, inputs, links in logical order
- [ ] **4.4** Verify focus ring visible (2px outline, typically blue)
- [ ] **4.5** Press Enter on focused button → action triggered
- [ ] **4.6** Press Space on focused button → action triggered
- [ ] **4.7** Press Escape on open modal → modal closes
- Observed Result: ________________

#### Step 5: Focus Management in Modals
- [ ] **5.1** Open any modal (approval, scheduling, etc.)
- [ ] **5.2** Focus starts inside modal (not on background)
- [ ] **5.3** Tab through modal fields → logical order
- [ ] **5.4** Tab at end of modal → focus wraps to first field (not background)
- [ ] **5.5** Press Escape → modal closes, focus returns to trigger button
- Observed Result: ________________

#### Step 6: Screen Reader Testing (Optional)
- [ ] **6.1** Enable screen reader (NVDA, JAWS, VoiceOver)
- [ ] **6.2** Navigate to `/content-queue`
- [ ] **6.3** Screen reader announces button labels correctly (e.g., "Approve, button")
- [ ] **6.4** Form labels announced with inputs (e.g., "Email input")
- [ ] **6.5** Images have alt text or aria-label
- [ ] **6.6** Headings announced correctly (h1, h2, h3 hierarchy)
- Observed Result: ________________

#### Step 7: Color Contrast Check
- [ ] **7.1** Use browser extension (WAVE, Axe) or manual check
- [ ] **7.2** Inspect "New Content" button (primary color) → contrast ratio >4.5:1
- [ ] **7.3** Inspect disabled button → contrast check (lower is OK for disabled)
- [ ] **7.4** Check "Draft" badge → background + text contrast >4.5:1
- [ ] **7.5** Check small text (captions, helper text) → contrast >3:1
- [ ] **7.6** No red-green-only status indicators (colorblind-friendly)
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if ALL of the following are true:
- [ ] No raw hex codes in computed styles (all use CSS variables/tokens)
- [ ] Light and dark modes visually consistent and readable
- [ ] Keyboard Tab order logical and complete
- [ ] Focus ring visible on all interactive elements
- [ ] Enter/Space/Escape keys work as expected
- [ ] Modal focus trap works (Tab doesn't escape)
- [ ] WCAG AA contrast ratio met on KPIs, badges, buttons (4.5:1 for normal text, 3:1 for large)
- [ ] No color-only status indicators (use icons/text too)

❌ **FAIL** if ANY of the following occur:
- [ ] Raw hex codes visible in inspected styles
- [ ] Dark mode unreadable or inconsistent
- [ ] Keyboard navigation skips elements or non-logical
- [ ] Focus ring missing or hard to see
- [ ] Modal doesn't trap focus
- [ ] Contrast ratios <4.5:1 on critical text
- [ ] Screen reader unable to announce content

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## MODULE 11: Quick API Sanity Check (Optional)
### Base URL: `https://alignedai20.vercel.app/api`

**Goal:** Key endpoints return expected responses; auth/CORS working.

### Steps

#### Setup
- [ ] **0.1** Get valid Bearer token (from localStorage after login, or issue test JWT)
- [ ] **0.2** Open terminal or Postman
- [ ] **0.3** Set environment variable: `TOKEN="<your-jwt-token>"`

#### Step 1: Publishing Queue
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://alignedai20.vercel.app/api/publishing/queue
```
- [ ] **1.1** Status: 200 OK
- [ ] **1.2** Response contains:
  - [ ] `data: [...]` (array of posts)
  - [ ] Each post has: `id`, `title`, `platform`, `status`, `createdDate`
  - [ ] `count` or `total` indicating queue size
- [ ] **1.3** No CORS errors
- [ ] **1.4** No 401/403 auth errors
- Observed Result: ________________

#### Step 2: Approvals Queue
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://alignedai20.vercel.app/api/approvals?status=pending
```
- [ ] **2.1** Status: 200 OK
- [ ] **2.2** Response contains:
  - [ ] `data: [...]` (array of pending approvals)
  - [ ] Each item has: `id`, `postId`, `title`, `requestedBy`, `requestedAt`, `status`
  - [ ] `count` indicating pending items
- [ ] **2.3** Query param `?status=pending` filters correctly
- Observed Result: ________________

#### Step 3: Analytics Metrics
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://alignedai20.vercel.app/api/analytics/metrics?platform=instagram&days=7"
```
- [ ] **3.1** Status: 200 OK
- [ ] **3.2** Response contains:
  - [ ] `reach`, `engagement`, `followers`, etc.
  - [ ] `data: [...]` with daily breakdowns
  - [ ] Timestamps in ISO 8601 format
- [ ] **3.3** Query params work: `?platform=instagram&days=7`
- [ ] **3.4** Supports multiple platforms (test with `?platform=tiktok`)
- Observed Result: ________________

#### Step 4: Auth Error Handling
- [ ] **4.1** Test without Bearer token:
```bash
curl https://alignedai20.vercel.app/api/publishing/queue
```
- [ ] **4.2** Returns 401 Unauthorized
- [ ] **4.3** Error message: `{ error: "Missing or invalid authorization token" }`
- Observed Result: ________________

#### Step 5: CORS Verification
- [ ] **5.1** Call from different origin (e.g., https://example.com)
- [ ] **5.2** Request succeeds (CORS headers allow it)
- [ ] **5.3** Response includes `Access-Control-Allow-Origin: *` or specific origin
- Observed Result: ________________

### Pass/Fail Criteria

✅ **PASS** if:
- [ ] All endpoints return 200 with expected data structure
- [ ] 401 returned for unauthenticated requests
- [ ] Query params filter correctly
- [ ] CORS headers present and correct
- [ ] No server errors (5xx) in response

❌ **FAIL** if:
- [ ] 500 errors from API
- [ ] Unexpected JSON structure
- [ ] Auth not checked (401 not returned)
- [ ] CORS errors visible

**Final Result:** ☐ PASS | ☐ FAIL  
**Notes:** ________________

---

## 🎯 SIGN-OFF CHECKLIST (Per Module)

For each module tested, verify:

| Module | Functional Parity | Error Handling | Mobile Responsive | Keyboard Accessible | Final Status |
|--------|-------------------|---|---|---|---|
| 1. Signup & Onboarding | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 2. Brand Intake | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 3. Content Creation | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 4. Approval Workflow | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 5. Publishing | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 6. Analytics Insights | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 7. Client Portal | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 8. Billing | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 9. Live Data & Real-Time | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 10. Design Tokens & A11y | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |
| 11. API Sanity Check | ☐ | ☐ | ☐ | ☐ | ☐ PASS / ☐ FAIL |

---

## 📝 OVERALL TEST SUMMARY

**Total Modules Tested:** ___ / 11  
**Modules Passed:** ___ / 11  
**Modules Failed:** ___ / 11  
**Pass Rate:** ____%

**Critical Issues Found:**
1. _________________________________________
2. _________________________________________
3. _________________________________________

**Blockers for Production:**
☐ None — Ready to deploy  
☐ Minor issues — Can deploy with known issues noted above  
☐ Major blockers — DO NOT DEPLOY

**Tester Sign-Off:**

Tester Name: ____________________  
Date: ____________________  
Signature: ____________________

**QA Lead / Manager Review:**

Name: ____________________  
Date: ____________________  
Approval: ☐ Approved | ☐ Rejected with feedback  
Comments: _________________________________________

---

**End of Feature Verification Test Plan**
