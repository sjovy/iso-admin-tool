---
name: scroll-motion
description: Add scroll-based effects, parallax layers, and advanced motion to Next.js projects. Use this skill when Thomas wants elements that move at different speeds on scroll, sections that pin or reveal as the user scrolls, smooth scroll behaviour, or cinematic page transitions. Covers Framer Motion useScroll, GSAP ScrollTrigger, and Lenis smooth scroll. Trigger whenever the request involves scroll choreography, parallax, scroll-driven animation, or making a page feel dynamic and layered as opposed to static.
---

This skill handles scroll-based motion — the technique behind pages that feel alive as you scroll through them. Layers moving at different speeds, sections that pin and animate, text that reveals word by word, elements that transform as they enter and leave the viewport. It pairs with `frontend-design` which handles the surrounding design system.

## Choose Your Tool

Three tools cover the full range of scroll motion. Pick based on complexity:

| Need | Tool |
|---|---|
| Standard parallax, scroll-linked transforms | **Framer Motion** `useScroll` |
| Complex multi-element choreography, pinned scenes | **GSAP ScrollTrigger** |
| Silky smooth scroll feel across the whole page | **Lenis** (combine with either above) |

---

## Framer Motion — Standard Scroll Effects

Best for: parallax backgrounds, fade/slide on scroll entry, scroll-linked transformations. Integrates cleanly with the Next.js + React stack.

```bash
npm install framer-motion
```

### Parallax — Elements Moving at Different Speeds

The core technique: map scroll position to a transform value. Elements with smaller output ranges move slower; larger ranges move faster.

```tsx
'use client'
import { useScroll, useTransform, motion } from 'framer-motion'
import { useRef } from 'react'

export function ParallaxSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'] // track when section enters/leaves viewport
  })

  // Background moves at 30% of scroll speed (slow = depth illusion)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  // Foreground text moves at 60% (faster = closer layer)
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])

  return (
    <section ref={ref} className="relative h-[70vh] overflow-hidden">
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 scale-110" // scale-110 prevents edge gaps during movement
      >
        <Image src="/bg.jpg" alt="" fill className="object-cover" />
      </motion.div>
      <motion.div style={{ y: textY }} className="relative z-10 flex items-center justify-center h-full">
        <h2 className="text-6xl font-display text-white">Your headline</h2>
      </motion.div>
    </section>
  )
}
```

The `scale-110` on the background image is important — without it, the edges of the image become visible as it shifts.

### Reveal on Scroll Entry

Elements that animate in as they enter the viewport:

```tsx
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Usage — stagger children by passing delay
<RevealOnScroll delay={0}>   <h2>Title</h2>      </RevealOnScroll>
<RevealOnScroll delay={0.1}> <p>Subtitle</p>     </RevealOnScroll>
<RevealOnScroll delay={0.2}> <Button>CTA</Button> </RevealOnScroll>
```

The easing `[0.22, 1, 0.36, 1]` is an ease-out-expo — fast start, smooth settle. More natural than the default linear ease.

### Scroll-Linked Progress Bar

```tsx
const { scrollYProgress } = useScroll()
<motion.div
  style={{ scaleX: scrollYProgress }}
  className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
/>
```

---

## GSAP ScrollTrigger — Complex Choreography

Best for: pinned sections where multiple elements animate in sequence, horizontal scroll sections, text that reveals character by character, scenes with precise timing control. More powerful than Framer Motion for orchestrated sequences.

```bash
npm install gsap
```

GSAP requires `'use client'` and setup in `useEffect` — it manipulates the DOM directly.

### Pinned Section with Sequential Animations

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function PinnedScene() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%',  // pin for 2x the viewport height of scroll
          scrub: 1,       // smooth scrubbing — value = seconds of lag
          pin: true,      // pin the section while animating
        }
      })

      // Elements animate in sequence as user scrolls through
      tl.from('.scene-title', { opacity: 0, y: 60, duration: 0.3 })
        .from('.scene-image', { opacity: 0, scale: 0.8, duration: 0.4 }, '-=0.1')
        .from('.scene-text', { opacity: 0, x: -40, duration: 0.3 }, '-=0.1')
        .to('.scene-title', { opacity: 0, y: -40, duration: 0.2 }, '+=0.3')
    }, containerRef)

    return () => ctx.revert() // cleanup on unmount — important
  }, [])

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden bg-background">
      <h1 className="scene-title">...</h1>
      <div className="scene-image">...</div>
      <p className="scene-text">...</p>
    </div>
  )
}
```

`scrub: 1` makes the animation follow the scrollbar with a 1-second lag — feels cinematic. `scrub: true` follows instantly, which can feel mechanical.

### Text Reveal Word by Word

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // Split text into spans (manual or use gsap SplitText plugin)
    const words = containerRef.current.querySelectorAll('.word')
    gsap.from(words, {
      opacity: 0,
      y: 20,
      stagger: 0.05,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
      }
    })
  }, containerRef)
  return () => ctx.revert()
}, [])
```

---

## Lenis — Smooth Scroll

Lenis replaces the native browser scroll with a physics-based smooth version — the scroll inertia that makes high-end sites feel premium. Use it with either Framer Motion or GSAP.

```bash
npm install lenis
```

### Setup in Next.js App Router

```tsx
// app/providers.tsx
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,        // scroll duration multiplier
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return <>{children}</>
}

// app/layout.tsx — wrap children
<SmoothScrollProvider>{children}</SmoothScrollProvider>
```

### Lenis + GSAP Integration

Tell ScrollTrigger to use Lenis's scroll position:

```tsx
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

---

## Choosing Complexity

Don't reach for GSAP + Lenis for a simple marketing page — Framer Motion's `useScroll` handles 80% of what you'll need. A rough guide:

- **Fade/slide in on scroll** → Framer Motion `useInView`
- **Parallax background** → Framer Motion `useScroll` + `useTransform`
- **Scroll progress indicator** → Framer Motion `scrollYProgress`
- **Pinned storytelling section** → GSAP ScrollTrigger
- **Full cinematic page feel** → GSAP + Lenis
- **Premium scroll feel everywhere** → Lenis alone (easy win, high impact)

Lenis alone with no other scroll animation is still a meaningful upgrade — the smoothness alone changes how a site feels.

---

## Pairing with frontend-design

When using alongside `frontend-design`:
- Establish the design system and theme first, then layer motion on top
- Motion should reinforce the aesthetic direction — a minimal refined design gets subtle reveals, a bold maximalist design can handle more dramatic scroll choreography
- Never animate everything — pick the 2-3 moments that matter most and make those exceptional
