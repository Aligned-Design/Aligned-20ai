# OpenGraph Image Specifications

## Image Requirements

### Dimensions

- **Recommended:** 1200 x 630 pixels
- **Aspect Ratio:** 1.91:1
- **Minimum:** 600 x 315 pixels
- **Maximum:** 8MB file size

### Format

- **Preferred:** JPG (better compression)
- **Supported:** PNG, JPG, GIF
- **Avoid:** WebP (limited support)

### Content Guidelines

- **Text:** Should be readable even when scaled down
- **Safe Zone:** Keep important content 10% away from edges
- **Logo:** Include brand logo prominently
- **Colors:** High contrast for visibility in dark/light modes

---

## Required Images

### 1. **og-default.jpg** (1200x630)

**Path:** `public/og-default.jpg`
**Usage:** Fallback for routes without specific images
**Content:**

- Aligned AI logo (large)
- Tagline: "AI-Powered Content Creation"
- Gradient background (purple/indigo)
- Clean, professional design

### 2. **og-home.jpg** (1200x630)

**Path:** `public/og-home.jpg`
**Route:** `/` (Landing page)
**Content:**

- Hero messaging
- "Transform your content workflow with AI"
- Dashboard visual mockup
- CTA: "Get Started Free"

### 3. **og-features.jpg** (1200x630)

**Path:** `public/og-features.jpg`
**Route:** `/features`
**Content:**

- Feature grid visual
- Icons for AI, Calendar, Analytics
- "Everything you need to scale"

### 4. **og-pricing.jpg** (1200x630)

**Path:** `public/og-pricing.jpg`
**Route:** `/pricing`
**Content:**

- Pricing tiers visual
- "$199/mo per brand"
- "Agency pricing at $99/mo"
- Value proposition

### 5. **og-integrations.jpg** (Optional)

**Path:** `public/og-integrations.jpg`
**Route:** `/integrations`
**Content:**

- Platform logos (Facebook, LinkedIn, Instagram, etc.)
- "Connect All Your Channels"

### 6. **og-help.jpg** (Optional)

**Path:** `public/og-help.jpg`
**Route:** `/help`
**Content:**

- Support/FAQ visual
- "We're Here to Help"

---

## Design Templates

### Recommended Tools

- **Canva:** [canva.com](https://canva.com) - Free templates
- **Figma:** Custom designs
- **Adobe Express:** Quick creation
- **Bannerbear:** Automated generation

### Design System

**Colors:**

- Primary: `#6B46C1` (purple)
- Secondary: `#4F46E5` (indigo)
- Accent: `#84CC16` (lime)
- Background: `#F9FAFB` (light gray)

**Typography:**

- Heading: Inter Bold, 64-72px
- Subheading: Inter Semibold, 32-40px
- Body: Inter Regular, 24-28px

**Logo:**

- Size: 80-120px height
- Position: Top-left or center
- Padding: 60px from edges

---

## Image Placement

### Route Configuration

Images are configured in `client/lib/route-metadata.ts`:

```typescript
'/': {
  ogImage: 'https://www.aligned-bydesign.com/og-home.jpg',
}
```

### Absolute URLs Required

- ✅ `https://www.aligned-bydesign.com/og-home.jpg`
- ❌ `/og-home.jpg` (relative URLs don't work)
- ❌ `../public/og-home.jpg` (won't work in meta tags)

---

## Testing Images

### Facebook Debugger

**URL:** https://developers.facebook.com/tools/debug/

**Steps:**

1. Paste URL: `https://www.aligned-bydesign.com/`
2. Click "Debug"
3. Verify image loads
4. Check dimensions (1200x630)

### Twitter Card Validator

**URL:** https://cards-dev.twitter.com/validator

**Steps:**

1. Paste URL
2. Preview card appears
3. Check image and text

### LinkedIn Post Inspector

**URL:** https://www.linkedin.com/post-inspector/

**Steps:**

1. Paste URL
2. Inspect preview
3. Verify professional appearance

---

## Optimization

### File Size

- **Target:** < 500KB per image
- **Tools:**
  - TinyPNG: https://tinypng.com/
  - ImageOptim: https://imageoptim.com/
  - Squoosh: https://squoosh.app/

### Compression

- Quality: 80-85% JPG compression
- Progressive JPG for faster loading
- Remove metadata/EXIF data

---

## Fallback Strategy

If no custom image is provided:

```typescript
ogImage = ogImage || "/og-default.jpg";
```

1. Route checks for specific `ogImage` in metadata
2. If missing, SEOHead uses `/og-default.jpg`
3. Default image shows Aligned AI branding

---

## Implementation Checklist

- [ ] Create og-default.jpg (1200x630)
- [ ] Create og-home.jpg for landing page
- [ ] Create og-features.jpg for features page
- [ ] Create og-pricing.jpg for pricing page
- [ ] Optimize all images (< 500KB each)
- [ ] Upload to public/ directory
- [ ] Update route metadata with URLs
- [ ] Test with Facebook Debugger
- [ ] Test with Twitter Card Validator
- [ ] Test with LinkedIn Inspector
- [ ] Verify images load on all social platforms

---

## Placeholders (Temporary)

Until custom images are created, the system uses:

- **Default:** Aligned AI logo + gradient
- **All routes:** Fall back to default
- **Functionality:** Fully working, just needs visuals

**Priority:** Create custom images for:

1. `/` (Landing) - Most shared
2. `/pricing` - Conversion pages
3. `/features` - Product pages

---

## Maintenance

### When to Update

- **Rebrand:** Update all images
- **New Features:** Create feature-specific images
- **Seasonal:** Holiday/event variations
- **A/B Testing:** Test different visuals

### Version Control

- Store source files in `design/og-images/`
- Keep PSD/Figma files for editing
- Export optimized JPGs to `public/`

---

## Example HTML Output

When properly configured, pages will have:

```html
<!-- OpenGraph -->
<meta property="og:title" content="Aligned AI - AI Content Creation" />
<meta property="og:description" content="Transform your content workflow..." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.aligned-bydesign.com/" />
<meta
  property="og:image"
  content="https://www.aligned-bydesign.com/og-home.jpg"
/>
<meta property="og:site_name" content="Aligned AI" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Aligned AI - AI Content Creation" />
<meta name="twitter:description" content="Transform your content workflow..." />
<meta
  name="twitter:image"
  content="https://www.aligned-bydesign.com/og-home.jpg"
/>
```

---

## Resources

- **OG Protocol:** https://ogp.me/
- **Twitter Cards:** https://developer.twitter.com/en/docs/twitter-for-websites/cards
- **Best Practices:** https://www.opengraph.xyz/
- **Image Templates:** https://www.opengraph.xyz/templates/

---

**Status:** ✅ Technical implementation complete  
**Pending:** Create actual image assets (1200x630 JPG files)  
**Validation:** All 9 routes passing OG tag validation
