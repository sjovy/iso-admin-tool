---
name: ux-patterns
description: Apply UX patterns that make Next.js apps feel polished and intentional. Use this skill when Thomas asks about user flows, feedback states (loading/error/success/empty), form behavior, navigation patterns, accessibility, or microcopy. Also trigger when something feels confusing, incomplete, or when users might get stuck — even if the request doesn't use the word "UX". Complements frontend-design (which handles visual aesthetics) by ensuring the app behaves correctly and feels considered from the user's perspective.
---

UI is what an app looks like. UX is how it feels to use. This skill covers the behavioral layer — the patterns that separate apps that feel finished from ones that feel like prototypes. It pairs with `frontend-design` (aesthetics), `visual-media` (photos/charts), and `scroll-motion` (motion).

---

## The Four States — The Most Important Pattern

Every interactive element in an app has four states. Most vibe-coded apps only implement one. This single gap is the most common reason an app feels unfinished.

| State | What it means | What to show |
|---|---|---|
| **Default** | Idle, waiting for input | Normal UI |
| **Loading** | Action in progress | Spinner, skeleton, disabled button with indicator |
| **Success** | Action completed | Confirmation, updated UI, toast/inline message |
| **Error** | Something went wrong | Specific message, recovery path, never just "Error" |

Plus one more that's frequently forgotten:

| **Empty** | No data exists yet | Illustration or icon + explanation + a call to action |

Before shipping any feature, check every interactive element against this list. If any state is missing, the feature is incomplete.

### Implementation Patterns

**Button loading state** — disable immediately on click to prevent double-submit:
```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton({ onSubmit, label }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await onSubmit()
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {done ? 'Saved' : label}
    </Button>
  )
}
```

**Skeleton loading** — better than spinners for content areas because it prevents layout shift:
```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Match the shape of the real content
function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
```

**Empty state** — never show a blank page:
```tsx
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}

// Usage
<EmptyState
  icon={FileText}
  title="No projects yet"
  description="Create your first project to get started. It only takes a minute."
  action={<Button>Create project</Button>}
/>
```

---

## Form UX

Forms are where most UX falls apart. These patterns cover the common failure points.

### Validation Timing

Never validate on every keystroke — it punishes users before they've finished typing. Validate on blur (when the field loses focus), then update in real-time once an error is already showing.

```tsx
// With react-hook-form (pairs with shadcn Form)
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur',      // validate when field loses focus
  reValidateMode: 'onChange'  // re-validate in real-time after first error
})
```

### Error Messages That Help

Bad: *"Invalid input"* — tells the user nothing
Bad: *"Email is required"* — they can see it's empty
Good: *"Enter a valid email address, like name@example.com"*
Good: *"Password must be at least 8 characters — yours is 5"*

Error messages should tell the user what to do, not what they did wrong. Place them directly below the field they relate to, never at the top of the form.

### Field Order

Order fields by how easy they are to answer — start with the least friction:
1. Name (easy, everyone knows it)
2. Email (easy)
3. Password (requires thought)
4. Confirmation / details (harder)

Never start a form with the hardest question.

### Progressive Disclosure

Don't show all fields upfront for complex flows. Show the minimum needed for each step:

```tsx
// Multi-step form — only render the current step
const steps = [<AccountStep />, <ProfileStep />, <BillingStep />]
return (
  <div>
    <ProgressIndicator current={step} total={steps.length} />
    {steps[step]}
    <div className="flex justify-between mt-6">
      {step > 0 && <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>}
      <Button onClick={() => setStep(s => s + 1)}>
        {step === steps.length - 1 ? 'Complete' : 'Continue'}
      </Button>
    </div>
  </div>
)
```

---

## Navigation Patterns

### Active State

Always make it clear where the user is. The active nav item should be visually distinct — not just slightly bolder, actually distinct:

```tsx
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function NavItem({ href, label, icon: Icon }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
```

### Breadcrumbs

Use breadcrumbs whenever the user is more than one level deep:

```tsx
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbLink href="/projects">Projects</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>Vault Redesign</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Destructive Actions

Any action that deletes or can't be undone needs a confirmation step — never trigger it directly from a button click:

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete project</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this project?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete Vault Redesign and all its files.
        This cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
        Yes, delete it
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Accessibility Essentials

Accessibility is not a separate concern — it's part of correctness. shadcn components handle most of it automatically. These are the gaps to fill manually.

### Color Contrast

Text must meet WCAG AA contrast ratios:
- Normal text: **4.5:1** minimum against its background
- Large text (18px+ or 14px+ bold): **3:1** minimum
- Check with [Colour Contrast Checker](https://colourcontrast.cc) or the browser's DevTools accessibility panel

The shadcn `muted-foreground` color on `muted` background often fails — check this combination in your theme.

### Focus Indicators

Never remove focus rings with `outline: none` without replacing them. Keyboard users need to see where they are:

```css
/* In globals.css — a visible, on-brand focus ring */
:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

### Interactive Element Size

Touch targets should be at least **44 × 44px** — the minimum comfortable tap area on mobile. Small icon buttons are the most common failure:

```tsx
// Too small
<button><X className="h-3 w-3" /></button>

// Correct — padding makes the tap target large even if the icon is small
<button className="p-2"><X className="h-4 w-4" /></button>
```

### Images and Icons

Decorative images: `alt=""` — screen readers skip them
Informative images: `alt="descriptive text"`
Icon-only buttons: always add `aria-label`:

```tsx
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

---

## Microcopy

The words in the UI are part of the design. Bad microcopy frustrates users even when the visual design is excellent.

### Button Labels

Buttons should describe the action, not the outcome:

| Instead of | Use |
|---|---|
| Submit | Save changes / Create project / Send message |
| OK | Got it / Done / Continue |
| Cancel | Discard changes / Keep editing |
| Delete | Delete project (be specific) |
| Yes / No | Confirm the action in the label: "Yes, delete it" |

### Error Messages

Follow this formula: **what happened + why + what to do**:
- "Couldn't save your changes — you're offline. Check your connection and try again."
- "That email is already registered. Sign in instead, or reset your password."
- "File too large (max 5MB). Try compressing it first."

### Empty States

Three parts: icon/illustration + what's missing + what to do about it. Never just "No results found."

### Toast Notifications

- Success toasts: brief, specific, no action needed ("Project saved")
- Error toasts: include a path forward ("Failed to save — try again" with a retry button)
- Duration: success = 3 seconds, errors = stay until dismissed

---

## Pairing with frontend-design

When using alongside `frontend-design`:
- UX patterns first, then aesthetics on top — a beautiful form that validates on every keystroke is still a bad form
- The four states (loading/success/error/empty) should be designed into the visual system from the start, not retrofitted
- Microcopy is part of the design — placeholder text, button labels, and error messages should match the tone established by the aesthetic direction
