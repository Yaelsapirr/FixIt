# FixIt — Design System

## Brand
- **App name:** FixIt
- **Tagline:** תיקונים ביתיים בקלות
- **Target:** Mobile-first, 430px max-width, Hebrew (RTL)

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1d6a58` | Buttons, active states, links |
| `--color-on-primary` | `#ffffff` | Text on primary bg |
| `--color-primary-container` | `#b2fce4` | Savings card, stat cards |
| `--color-on-primary-container` | `#2d7764` | Text on primary container |
| `--color-surface` | `#fcfdfa` | Page background |
| `--color-on-surface` | `#191c1b` | Body text |
| `--color-surface-container` | `#edeeef` | Cards, inputs |
| `--color-outline-variant` | `#bec9c4` | Borders, dividers |
| `--color-error` | `#ba1a1a` | Error text, logout button |
| `--color-error-light` | `#fff0f0` | Error button hover bg |

### Semantic Status Colors

| Token | Usage |
|---|---|
| `--color-warning-bg/border/text` | Safety alerts |
| `--color-success-bg/text` | "קל" badge, "זמין עכשיו" tag |
| `--color-caution-bg/text` | "בינוני" badge |
| `--color-danger-bg/text` | "מתקדם" badge |

### Brand Colors

| Token | Value | Usage |
|---|---|---|
| `--color-whatsapp` | `#25d366` | WhatsApp contact button |
| `--color-waze` | `#00bcd4` | Waze navigation button |
| `--color-white` | `#ffffff` | Text on brand-color buttons |

## Typography

- **Font:** Hanken Grotesk (Google Fonts), weights 400 / 600 / 700
- `--font-size-display`: 1.875rem — hero headings
- `--font-size-title`: 1.25rem — page/section titles
- `--font-size-body-large`: 1rem — body text, button labels
- `--font-size-body-medium`: 0.875rem — meta, badges, secondary text

## Spacing

| Token | Value |
|---|---|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 24px |
| `--spacing-xl` | 32px |
| `--margin-mobile` | 16px (horizontal page padding) |

## Layout

- `--border-radius`: 12px (cards, buttons)
- `--border-radius-sm`: 8px (badges, inputs, inner elements)
- `--navbar-height`: 64px (fixed bottom nav clearance)
- `--shadow-sm`: subtle card elevation
- `.page-container`: `max-width: 430px`, `margin: 0 auto`, `padding-bottom: var(--navbar-height)`

## Pages & Routes

| Route | Page | Navbar |
|---|---|---|
| `/login` | LoginPage | ✗ |
| `/` | HomePage | ✓ |
| `/search` | SearchResultsPage | ✓ |
| `/guide/:id` | RepairGuidePage | ✓ |
| `/success` | SuccessPage | ✓ |
| `/technicians` | TechniciansPage | ✓ |
| `/stores` | StoresPage | ✓ |
| `/profile` | ProfilePage | ✓ |

## Components

- **AppHeader** — sticky top bar; accepts `title` (string) and `showBack` (bool)
- **Navbar** — fixed bottom nav; 4 items: בית / טכנאים / חנויות / פרופיל
- **CategoryCard** — emoji + label grid cell (HomePage)
- **ResultCard** — repair guide search result with difficulty badge
- **DifficultyBadge** — pill: קל (green) / בינוני (amber) / מתקדם (red)
- **InstructionStep** — numbered step with custom checkbox; checked = faded + strikethrough
- **ProCard** — technician card with avatar, rating, availability, contact buttons
- **StoreCard** — store listing with distance and Waze navigation link

## Conventions

- No `<form>` tags — all inputs use `div` + `onClick`/`onChange` handlers
- All user-facing text is Hebrew
- All CSS uses variables — no hardcoded hex values in component CSS files
- RTL layout throughout; `dir="ltr"` only on email/password inputs and dates
