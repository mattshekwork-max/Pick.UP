# Pick-UP — Design Specification

This document is the **design authority** for Voxadora. Every visual decision during the build MUST follow this spec. Do not deviate from these choices — they were selected specifically for this product's domain, audience, and brand personality.

## Brand Identity

**Personality:** professional, trustworthy, modern
**Product:** AI voice receptionist for every small business

This is not a generic SaaS template. Pick-UP should look like enterprise-grade software — something you'd see in Google Cloud Console or AWS dashboard. Clean, professional, and built for business owners who want reliability over flashiness.

## Color System

All colors use oklch() format in Tailwind CSS v4.

### Dark Theme (Default)

| Role | OKLCH | Usage |
|------|-------|-------|
| **Background** | `oklch(0.13 0.02 260)` | Deep blue-black. Main app background, sidebar. |
| **Card/Surface** | `oklch(0.18 0.02 260)` | Cards, panels, elevated surfaces. Slightly lighter than background. |
| **Border** | `oklch(0.28 0.02 260)` | Subtle borders, dividers, input borders. |
| **Primary** | `oklch(0.75 0.12 200)` | Teal/cyan accent. Primary buttons, active states, links. |
| **Secondary** | `oklch(0.22 0.02 260)` | Secondary buttons, muted backgrounds, hover states. |
| **Accent** | `oklch(0.7 0.15 160)` | Green accent. Success states, positive metrics. |
| **Foreground** | `oklch(0.95 0.01 260)` | Primary text, icons. |
| **Muted Foreground** | `oklch(0.7 0.02 260)` | Secondary text, labels, placeholders. |

**Color rules:**
- Dark theme is the DEFAULT and PRIMARY theme for Pick.UP
- Background is a deep blue-black, NOT pure black — creates depth without harshness
- Cards are slightly lighter than background to create subtle elevation
- Borders are visible but subtle — they define structure without dominating
- Primary color (teal/cyan) is used sparingly for key actions and active states
- Accent (green) is reserved for success states and positive metrics only
- Text is high-contrast white/off-white for readability in low-light environments

## Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Headings** | Google Sans | 500-600 | h1-h3, section titles, card headers |
| **Body** | Roboto | 400-500 | Body text, buttons, labels, form inputs, navigation |
| **Mono/Data** | System mono stack | 400 | Code, API keys, technical data |

**Typography rules:**
- Import BOTH fonts via `@import` at the VERY TOP of `globals.css`
- Google Sans is Google's proprietary font — clean, modern, professional
- Roboto is highly readable at all sizes, perfect for dense dashboards
- Font size hierarchy: h1=2rem, h2=1.5rem, h3=1.25rem, body=0.875rem
- Use tighter line-height for headings (1.2-1.3), normal for body (1.5-1.6)
- Text color: Foreground for primary content, Muted Foreground for labels/placeholders

## Component Design Language

### Border Radius: md (8px)

Professional, clean, modern. Not too rounded (friendly) but not sharp (aggressive). Matches enterprise software like Google Cloud Console, AWS, Stripe Dashboard.

**Apply consistently:** buttons, cards, inputs, dropdowns, modals, badges. The ONLY exception is avatars (always fully rounded) and very small pills (can be fully rounded).

**Radius values:**
- `--radius: 0.5rem` (8px) base
- Buttons, cards, inputs: `rounded-md` (8px)
- Badges, pills: `rounded-full` (fully rounded)
- Avatars: `rounded-full` (fully rounded)

### Component Personality

**Professional dashboard personality** — clean, efficient, built for power users who value clarity over cuteness.

- **Buttons:** Medium weight, subtle borders. Primary buttons use teal accent. Hover states are subtle (slight brightness increase, no dramatic shadows).
- **Cards:** Subtle borders, minimal shadows. Cards are defined by borders and background color contrast, not drop shadows. Left border accents for status.
- **Navigation:** Clean sidebar or top nav. Active states use teal underline or background. Minimal ornamentation.
- **Data display:** Tables for dense data, cards for summaries. Metrics use large numbers with muted labels. Charts use the teal/green accent palette.
- **Interactions:** Fast (150ms). Hover states are subtle. Focus states are clear (teal outline). No bouncy animations.
- **Empty states:** Simple illustrations or icons with clear CTAs. Professional tone, not cutesy.
- **Modals vs drawers:** Modals for confirmations and forms. Drawers for detailed views. Keep them clean and focused.
- **shadcn components to favor:** Card, Button, Input, Label, Table, Badge, Alert, Dialog, Sheet, Tabs, Progress

### Layout Architecture

**Dashboard layout:**
- Sidebar navigation for 4+ sections (Dashboard, Calls, Appointments, Settings)
- Top tabs for 2-3 sections within a category
- Main content area: max-w-7xl with consistent horizontal padding (24-32px)
- Cards for distinct data groups, tables for list data
- Every screen needs a clear primary action (top-right button or inline CTA)

**Feature sections:**
- Use a clean grid layout (2-3 columns) for feature cards
- Large cards for main features, smaller for supporting features
- Consistent padding and spacing throughout

### Spacing & Density

- Page padding: 24-32px horizontal, 32-48px vertical sections
- Card padding: 16-24px internal
- Between cards: 16-24px gap
- Between sections: 48-64px
- Use Tailwind's spacing scale consistently: 4, 6, 8, 12, 16, 24, 32, 48, 64
- When in doubt: add more space, not less

### Shadows & Elevation

- Cards: NO shadow by default — use borders for definition
- Interactive cards: `shadow-sm` on hover ONLY
- Modals/drawers: `shadow-2xl` (high contrast against dark background)
- Buttons: NO shadow (flat, modern)
- Dropdowns/popovers: `shadow-lg`
- Elevation is created through background color contrast, NOT shadows

**Key principle:** In dark themes, shadows are less visible. Use background color contrast and borders to define hierarchy.

### Icons

- Use Lucide icons exclusively (already in the boilerplate via `lucide-react`)
- Icon size: 16px in buttons/nav, 20px in cards/features, 24px in hero elements
- Icon color: match the text color they sit next to, or use the primary color for emphasis
- Stroke width: use default (2px). Don't mix stroke widths.

## What Makes This Product Unique

The goal is NOT to be "the prettiest template." The goal is to be **recognizable**. If someone screenshots Voxadora and posts it, people should not be able to confuse it with any other product.

Uniqueness comes from the **combination** of:
1. The specific color palette (not just "it's blue")
2. The typography pairing (the heading font carries personality)
3. The radius philosophy (sharp products feel different from rounded ones)
4. The component treatment (how cards, buttons, nav FEEL)
5. The spacing and density (airy vs. compact)
6. The layout choices (sidebar vs. top nav, modals vs. drawers, bento vs. grid)

A finance dashboard with serif headings, sharp corners, and dense tables feels COMPLETELY different from a wellness app with rounded sans-serif, pill buttons, and spacious card layouts — even if both are "good design."

Commit to this spec. Don't water it down by falling back to shadcn defaults.

## Anti-Patterns (DO NOT)

- Do NOT leave shadcn components unstyled/default — every component should reflect the brand
- Do NOT use `bg-blue-600` or any hardcoded Tailwind colors — use your CSS variables
- Do NOT mix border radius values — pick the system radius and apply it everywhere
- Do NOT use more than 2 font families (heading + body, that's it)
- Do NOT center everything — left-aligned content is usually more readable for dashboards
- Do NOT use generic purple-to-blue gradients
- Do NOT use default gray-100 backgrounds for cards — use your secondary color at low opacity
- Do NOT use spinners for loading — use Skeleton components
- Do NOT leave empty states blank — every empty state needs a message and a primary action
