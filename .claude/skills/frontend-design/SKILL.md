---
name: frontend-design
description: Build production-grade frontend interfaces for Next.js + Vercel projects using shadcn/ui components and tweakcn themes. Use this skill whenever Thomas asks to build a UI, page, component, dashboard, landing page, form, navigation, or any visual element — even if the request doesn't say "design" or "frontend". Handles shadcn/ui setup automatically via CLI (Thomas approves commands), applies tweakcn themes, and produces distinctive interfaces that avoid generic AI aesthetics. Trigger on any request to create or improve something visual in a Next.js project.
---

Thomas vibe-codes by prompting — he approves Bash commands but doesn't run them himself. The target stack is Next.js (App Router) + Tailwind CSS + shadcn/ui + Vercel. This skill handles all setup automatically and produces interfaces that feel genuinely designed.

## Step 1: Direction Proposals

Before writing any code, read the request and propose **2–3 named aesthetic directions** for Thomas to choose from. Present them like a designer presenting options to a client — concrete, specific, opinionated. Each option should feel distinctly different.

For each direction, include:
- **Name** — a short evocative label (e.g. "Obsidian Edge", "Warm Editorial", "Signal & Noise")
- **Character** — one sentence on the personality and who it's for
- **Colors** — dominant + accent (be specific: `#0d0d0d` + amber, slate + electric indigo, warm parchment + ink brown)
- **Fonts** — display font + body font pairing
- **Feel** — light or dark, dense or airy, sharp or soft

Then ask: *"Which direction feels right? Or describe what you're after and I'll adjust."*

If Thomas has already given enough direction to be unambiguous, skip the proposals and state your chosen interpretation explicitly before building. If he provides a tweakcn theme block, use it as the theme for whichever direction he picks.

**Example proposal format:**

---
**Option A — Obsidian Edge** *(bold, masculine, tool-like)*
Dark near-black `#0d0d0f` · electric indigo accent · DM Sans + Geist Mono for numbers · sharp borders (radius 0) · dense, no wasted space

**Option B — Warm Editorial** *(refined, inviting, content-first)*
Warm parchment `#faf6f1` · deep ink brown · Cormorant Garamond display + DM Sans body · generous whitespace · soft radius `0.75rem`

**Option C — Signal** *(minimal, focused, quiet authority)*
Pure white `#ffffff` · single amber accent used sparingly · Instrument Serif display + Inter (yes, Inter works here — the restraint is the point) · asymmetric layout · almost nothing on screen

---

Adapt the axes to the project context — a SaaS dashboard warrants different poles than a personal portfolio or an e-commerce site. The options should be genuinely different from each other, not variations on the same theme.

Useful aesthetic axes to draw from when composing directions:
- **Masculine / Feminine** — angular, dark, dense vs. soft, light, fluid
- **Bold / Refined** — loud presence vs. quiet authority
- **Industrial / Organic** — raw, structural, utilitarian vs. natural, textured, warm
- **Editorial / Functional** — content and typography as the art vs. pure task efficiency
- **Playful / Serious** — expressive, surprising vs. measured, trustworthy
- **Dense / Airy** — information-rich, tight vs. generous whitespace, breathing room

Pick axes that are genuinely relevant to what's being built and who uses it.

**On vague words**: "Modern", "clean", "cool", "professional" are valid signals — translate them into specific choices rather than asking for clarification. "Modern" might become Option A above. "Clean" might become Option C. State the translation so Thomas can redirect if your read is wrong.

## Step 2: Check and Set Up shadcn/ui

Before writing any UI code, check for `components/ui/` or `components.json` in the project root.

If shadcn is not initialized, run:
```bash
npx shadcn@latest init
```
Choose: **New York** style, **neutral** base color, **yes** to CSS variables. One-time setup per project.

Then add the components the build actually needs:
```bash
npx shadcn@latest add button card
npx shadcn@latest add form input label textarea select  # for forms
npx shadcn@latest add navigation-menu sheet             # for nav/drawers
npx shadcn@latest add dialog badge avatar separator     # as needed
```

shadcn components handle accessibility, keyboard navigation, focus states, and consistent behavior correctly. Use them as the structural foundation — they are the floor quality level, not the ceiling. The aesthetic vision goes on top.

## Step 3: Apply a Theme

Three paths depending on what Thomas provides:

**Path A — Thomas provides a theme reference (any of these work):**

- **tweakcn URL** — `https://tweakcn.com/themes/{id}` pages are fully public. Fetch it, extract all CSS variables (light, dark, fonts, radius, shadows), apply to `app/globals.css`.
- **Raw CSS block** — paste directly into `app/globals.css`. Done.
- **Screenshot** — Thomas shares a screenshot of a theme or UI he likes. Read the image: extract the color palette, typography feel, spacing density, border radius, and overall character. Then either match it to the closest tweakcn built-in theme (fetch that) or craft a custom CSS variable block that replicates it. State what you observed and what choices you made before building.

**Path B — Thomas names a theme or aesthetic that matches one**
Fetch it live from tweakcn's public API — no auth required:

```
GET https://tweakcn.com/r/themes/{name}.json
```

The response contains `cssVars.light`, `cssVars.dark`, and `cssVars.theme` (fonts, radius, tracking). Convert to CSS and write into `app/globals.css`:

```css
@layer base {
  :root {
    --background: /* cssVars.light.background */;
    --foreground: /* cssVars.light.foreground */;
    /* ...all light vars */
  }
  .dark {
    --background: /* cssVars.dark.background */;
    /* ...all dark vars */
  }
}
```

Colors are in `oklch()` format — use them as-is, they work natively in all modern browsers.

**Available themes** (fetch `https://tweakcn.com/r/registry.json` for the live list):

| Slug | Character |
|---|---|
| `modern-minimal` | Clean, restrained, neutral |
| `claude` | Warm cream and terracotta |
| `t3-chat` | Dark, developer-focused |
| `twitter` | Familiar blue/white |
| `mocha-mousse` | Warm brown, cosy |
| `bubblegum` | Playful pink |
| `amethyst-haze` | Soft purple mist |
| `notebook` | Paper-like, editorial |
| `doom-64` | Dark retro gaming |
| `catppuccin` | Pastel developer favourite |
| `graphite` | Dark neutral, minimal |
| `perpetuity` | Dark, rich |
| `kodama-grove` | Earthy green, organic |
| `cosmic-night` | Deep space dark |
| `tangerine` | Warm orange accent |
| `quantum-rose` | Rose/pink, refined |
| `nature` | Fresh greens |
| `bold-tech` | High contrast, industrial |
| `elegant-luxury` | Dark gold, premium |
| `amber-minimal` | Warm amber on white |
| `supabase` | Dark green, developer |
| `neo-brutalism` | Raw, thick borders |
| `solar-dusk` | Warm sunset tones |
| `claymorphism` | Soft 3D clay feel |
| `cyberpunk` | Neon on dark |
| `pastel-dreams` | Soft, feminine pastels |
| `clean-slate` | Pure minimal white |
| `caffeine` | Dark espresso tones |
| `ocean-breeze` | Cool blue/teal |
| `retro-arcade` | Pixel/retro gaming |
| `midnight-bloom` | Dark floral |
| `candyland` | Bright, playful |
| `northern-lights` | Aurora greens/purples |
| `vintage-paper` | Aged paper, sepia |
| `sunset-horizon` | Warm gradient sunset |
| `starry-night` | Dark indigo/blue |

Match the theme to the agreed aesthetic direction from Step 1. When uncertain, fetch `registry.json` to read descriptions and pick the closest match.

**Path C — No theme provided and no clear match**
Craft a custom theme using the same CSS variable structure. A strong theme has:
- One dominant color with a single sharp accent
- Clear foreground/background contrast
- Border radius calibrated to mood: `0` sharp, `0.75rem` balanced, `1.5rem+` soft
- Neutral tones that recede and let content lead

## Step 4: Build the Interface

Build with the aesthetic direction driving every decision. The shadcn components are your structural layer — typography, color, motion, and spatial composition are where the design actually happens.

**Typography**: Import fonts via `next/font/google`. Pair a display font (headings, hero text) with a complementary body font. Font choice is one of the highest-leverage design decisions — a distinctive pairing immediately separates the output from generic AI work. Configure in `tailwind.config` and apply via CSS variables or utility classes.

**Color**: Work from the CSS variable theme. Use the dominant/accent contrast deliberately — accent should appear sparingly so it retains meaning. Numbers, data, and code get monospace fonts (`font-feature-settings: "tnum"` for tabular alignment in data contexts).

**Layout**: Consider where to break the default grid. Asymmetry, overlap, staggered columns, and unexpected spacing create visual tension. Generous whitespace OR controlled density — commit to one.

**Motion**: One coordinated animation per major section beats scattered micro-interactions. Staggered `animation-delay` on page load, a single well-designed hover state, or a count-up on scroll entry. For React use Framer Motion when available; CSS-only otherwise. Keep it purposeful — motion should reinforce the content, not distract from it.

**Depth**: Gradient backgrounds, layered shadows, subtle textures, and transparencies create atmosphere. A flat solid background is a valid choice for minimal designs — but it should be an intentional choice, not a default.

## Step 5: Next.js App Router Notes

- Components with `useState`, `useEffect`, or event handlers need `"use client"` at the top
- Server components are the default — use them for data fetching, pass data as props to client components
- Font setup goes in `app/layout.tsx` via `next/font/google`
- CSS variable overrides and global styles go in `app/globals.css`
- Place feature components in `components/`, shadcn primitives live in `components/ui/` (CLI-managed, don't edit manually)

## What Produces Generic Output

These patterns are immediately recognizable as AI-generated and undermine the work:
- Default card-grid layouts with no spatial variation
- Equal-weight color palettes where every color competes equally
- Hero → Features → CTA section structure with no personality
- Placeholder-quality copy ("Welcome to our platform", "Boost productivity by 10x")
- Animations on every element rather than one focused, memorable moment

The antidote is commitment: pick a specific direction and execute it fully. A brutally minimal build and a maximalist one can both be excellent — what fails is timidity, where every decision hedges toward the average.
