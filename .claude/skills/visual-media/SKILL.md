---
name: visual-media
description: Handle photos, illustrations, charts, and diagrams in Next.js projects. Use this skill when Thomas wants to add images, photos, data visualizations, artistic charts, or diagrams to a build. Covers next/image optimization, photo composition techniques (overlays, masking, gradients), sourcing guidance, Recharts/Chart.js for styled data charts, and Mermaid/React Flow for diagrams. Trigger whenever the build involves visual media beyond basic UI components.
---

This skill covers everything visual that isn't a UI component — photos, charts, diagrams, and how to use them as design elements rather than just content drops. It pairs with `frontend-design` which handles the surrounding UI and theme.

## Photos

### Sourcing

Thomas provides photos or sources them externally. Good free sources:
- **Unsplash** (unsplash.com) — high quality, free, no attribution required for most uses
- **Pexels** (pexels.com) — similar quality and license
- **Pixabay** (pixabay.com) — broader range including illustrations and vectors
- **AI generators** — Midjourney, DALL-E, Ideogram, Flux for custom/stylized imagery
- **Unsplash API** — for dynamic photo loading in Next.js (`@unsplash/js` package)

Always use `next/image` — never a raw `<img>` tag. It handles lazy loading, WebP conversion, responsive sizing, and Core Web Vitals automatically.

### Size and Resolution Guide

Source images at the right size — too small looks soft, too large wastes bandwidth. next/image handles resizing and format conversion automatically, but it can only work with what you give it.

| Use case | Source dimensions | Notes |
|---|---|---|
| Hero / full-bleed background | 2400 × 1600px minimum | Viewed edge-to-edge on large screens |
| Section background (half-width) | 1600 × 1200px | |
| Card image | 800 × 600px | Displayed small, doesn't need to be huge |
| Avatar / profile photo | 400 × 400px | Square crop, always small |
| Open Graph / social preview | 1200 × 630px exactly | Required for link previews on Twitter/LinkedIn |
| Favicon | 32 × 32px + 180 × 180px (Apple) | Two sizes cover all platforms |

**Resolution**: 72 DPI for web — print DPI (300) is irrelevant and adds file size with zero visual benefit. If downloading from Unsplash/Pexels, pick the "large" size option, not "original" (which is often 20MP+ and overkill).

**File format guidance**:
- **JPG** — photos with lots of color variation (landscapes, people, products)
- **PNG** — images with transparency, logos, screenshots
- **WebP** — next/image converts to WebP automatically for browsers that support it, so you don't need to convert manually
- **SVG** — icons, illustrations, logos — always prefer SVG over raster for these; scales infinitely and stays sharp at any size
- **AVIF** — next/image also serves AVIF to supported browsers (better compression than WebP) — again, automatic

**File size targets before uploading**:
- Hero image: under 500KB (aim for 200–300KB)
- Card images: under 100KB each
- Compress with [Squoosh](https://squoosh.app) (free, browser-based) or [TinyPNG](https://tinypng.com) before dropping into `public/`

**The `sizes` prop** — critical for responsive performance. Tells the browser what size the image renders at each breakpoint so it downloads the right variant:

```tsx
// Full-width hero
<Image src="/hero.jpg" alt="" fill sizes="100vw" className="object-cover" />

// Half-width on desktop, full on mobile
<Image src="/photo.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" />

// Fixed card image in a 3-column grid
<Image src="/card.jpg" alt="" width={400} height={300} sizes="(max-width: 768px) 100vw, 33vw" />
```

Without `sizes`, next/image assumes 100vw and downloads unnecessarily large variants for small elements.

### next/image Essentials

```tsx
import Image from 'next/image'

// Fixed dimensions (UI elements, avatars, cards)
<Image src="/photo.jpg" alt="description" width={800} height={600} />

// Fill parent container (hero backgrounds, full-bleed sections)
<div className="relative h-[600px]">
  <Image src="/hero.jpg" alt="hero" fill className="object-cover" />
</div>

// External sources — add domain to next.config.js
// images: { remotePatterns: [{ hostname: 'images.unsplash.com' }] }
```

For above-the-fold images add `priority` to prevent layout shift. For decorative images use `alt=""`.

### Photos as Design Elements

A photo dropped into a layout is content. A photo used as a design element creates atmosphere. The difference is in how it's treated:

**Gradient overlay** — blends photo into the surrounding background, lets text sit on top cleanly:
```tsx
<div className="relative">
  <Image src="/photo.jpg" alt="" fill className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
  <div className="relative z-10">{/* content over photo */}</div>
</div>
```

**Color tint** — applies a brand color wash over a photo, unifies mismatched stock photos:
```tsx
<div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
```

**Masked shape** — clips a photo into a non-rectangular shape using CSS clip-path or mask:
```tsx
className="[clip-path:polygon(0_0,100%_0,85%_100%,0_100%)]"
```

**Blur placeholder** — prevents layout shift while image loads:
```tsx
<Image src="/photo.jpg" alt="" fill placeholder="blur" blurDataURL="data:image/jpeg;base64,..." />
// Generate blurDataURL with: npx plaiceholder /path/to/image
```

---

## Charts and Data Visualizations

For styled, production-quality charts in React use **Recharts** — it's composable, fully customizable, and works well with Tailwind/CSS variables.

```bash
npm install recharts
```

### Making Charts Look Good

Default Recharts output looks like a dashboard from 2015. The aesthetic lives entirely in the customization:

```tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis
      dataKey="date"
      axisLine={false}
      tickLine={false}
      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
    />
    <YAxis hide />
    <Tooltip
      contentStyle={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        fontSize: '13px'
      }}
    />
    <Area
      type="monotone"
      dataKey="value"
      stroke="hsl(var(--primary))"
      strokeWidth={2}
      fill="url(#colorGradient)"
    />
  </AreaChart>
</ResponsiveContainer>
```

Key rules for beautiful charts:
- Remove `axisLine` and `tickLine` — the axes become invisible guides rather than boxes
- Use CSS variables for all colors so they respect the theme
- Hide the Y axis when the tooltip carries the value
- Use `fill` gradients on area charts — flat fills look heavy
- Custom `Tooltip` component always — the default is ugly
- `ResponsiveContainer` always — never hardcode pixel widths

### Chart Types and When to Use Them

- **Area/Line** — trends over time, revenue, growth
- **Bar** — comparisons between categories
- **Radial/Pie** — proportions (use sparingly, humans are bad at reading angles)
- **Scatter** — correlation between two variables

For more complex or animated charts consider **Victory** (`victory-native`) or raw **D3** for full control.

---

## Diagrams and Flow Diagrams

### Mermaid — Quick Text-to-Diagram

For flowcharts, sequence diagrams, org charts — write the diagram as text, render it as SVG:

```bash
npm install @mermaid-js/mermaid-react
# or: npx shadcn@latest add -- (check for community mermaid component)
```

```tsx
import Mermaid from '@mermaid-js/mermaid-react'

<Mermaid
  chart={`
    flowchart LR
      A[User signs up] --> B{Email verified?}
      B -- Yes --> C[Onboarding flow]
      B -- No --> D[Send verification email]
  `}
/>
```

Style Mermaid output with the `theme` config — `dark` or `neutral` work well with most palettes.

### React Flow — Interactive Node Diagrams

For interactive diagrams where users can drag, connect, and explore:

```bash
npm install @xyflow/react
```

React Flow gives full control over node appearance — each node is a React component, so it inherits your design system completely. Good for architecture diagrams, process maps, relationship visualizations.

---

## Pairing with frontend-design

When using this skill alongside `frontend-design`:
- The theme's CSS variables apply to chart colors — use `hsl(var(--primary))`, `hsl(var(--muted))` etc. throughout
- Photos should use the same color treatment as the overall aesthetic (warm tint for warm themes, desaturated/cool for dark themes)
- Charts should feel like part of the page, not widgets dropped in — match border radius, background, and typography to the surrounding design
