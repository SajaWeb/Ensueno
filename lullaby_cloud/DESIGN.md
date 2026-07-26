---
name: Lullaby & Cloud
colors:
  surface: '#f7fafe'
  surface-dim: '#d7dade'
  surface-bright: '#f7fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f8'
  surface-container: '#ebeef2'
  surface-container-high: '#e5e8ec'
  surface-container-highest: '#e0e3e7'
  on-surface: '#181c1f'
  on-surface-variant: '#41474e'
  inverse-surface: '#2d3134'
  inverse-on-surface: '#eef1f5'
  outline: '#72787f'
  outline-variant: '#c1c7cf'
  surface-tint: '#30628a'
  primary: '#30628a'
  on-primary: '#ffffff'
  primary-container: '#a2d2ff'
  on-primary-container: '#275b82'
  inverse-primary: '#9bcbf8'
  secondary: '#80515e'
  on-secondary: '#ffffff'
  secondary-container: '#fec1d0'
  on-secondary-container: '#7b4c59'
  tertiary: '#6e5d24'
  on-tertiary: '#ffffff'
  tertiary-container: '#e3cb87'
  on-tertiary-container: '#66551d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#9bcbf8'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#104a70'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#f2b7c5'
  on-secondary-fixed: '#32101b'
  on-secondary-fixed-variant: '#653a46'
  tertiary-fixed: '#fae19b'
  tertiary-fixed-dim: '#dcc582'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#55450e'
  background: '#f7fafe'
  on-background: '#181c1f'
  surface-variant: '#e0e3e7'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter-mobile: 16px
  margin-mobile: 20px
  gutter-desktop: 24px
  margin-desktop: auto
  max-width: 1200px
---

## Brand & Style

The design system is crafted to evoke a sense of **tenderness, safety, and professional care**. It targets modern parents who seek premium, hypoallergenic solutions for their infants. The visual narrative is built around the "Dreamy Sleep" concept, utilizing soft cloud motifs and a comforting celestial theme to create a calming emotional response.

The aesthetic combines **Minimalism** with subtle **Tactile** elements. By using heavy white space and a restricted pastel palette, the UI maintains a clean, medical-grade professional feel, while "squishy" rounded corners and diffused ambient shadows provide the warmth and approachability essential for a baby care brand. The experience is mobile-first, prioritizing large touch targets and a fluid, rhythmic scroll that mimics the gentle rocking of a cradle.

## Colors

The palette is rooted in a "Cloud White" base to emphasize hygiene and purity.
- **Primary (Sky Blue):** Used for trust-building elements, primary navigation, and calm-inducing calls to action.
- **Secondary (Soft Pink):** Applied to highlight "love-focused" features, delicate care instructions, and playful accents.
- **Tertiary (Star Yellow):** Reserved for the mascot star interaction and attention-grabbing highlights like "New" badges or safety certifications.
- **Neutral (Soft Gray-Blue):** A tinted neutral used for background layering to prevent the starkness of pure white, maintaining a soft, low-contrast visual environment that is easy on the eyes during late-night browsing.

## Typography

This design system employs a dual-font strategy to balance personality with readability.
- **Plus Jakarta Sans** is the display typeface. Its soft, geometric curves reflect the "bubbly" nature of baby products. It is used for all headlines and interactive labels to inject a friendly, welcoming tone.
- **Work Sans** serves as the functional workhorse. It provides a grounded, professional contrast to the rounded headers, ensuring that ingredient lists, safety warnings, and product descriptions are crystal clear and legible at small sizes.

Hierarchy is established through weight and scale rather than color contrast to maintain the "soft" visual mood. Headlines should use "sentence case" to feel more conversational and less institutional.

## Layout & Spacing

The layout follows a **fluid grid** model optimized for thumb-driven navigation. On mobile, the system uses a 4-column grid with generous 20px outer margins to keep content centered and accessible. 

Spacing follows a strict **8px base unit** to ensure a consistent rhythmic "beat" throughout the UI. To reinforce the "Light as a Cloud" theme, vertical padding between sections is intentionally oversized (e.g., 64px or 80px) to allow the product photography and mascot elements to "breathe." Content reflows to a 12-column grid on desktop, but maintains a maximum container width of 1200px to ensure line lengths remain optimal for reading.

## Elevation & Depth

Hierarchy is conveyed through **Tonal Layering** and **Ambient Shadows**. Instead of traditional harsh shadows, this design system uses "Soft Glows"—shadows with high blur radiuses (30px+) and low opacity (5-8%) tinted with the Primary Sky Blue color. 

- **Level 0 (Background):** Cloud White or Neutral Tint.
- **Level 1 (Cards):** Pure white surfaces with a 1px soft border in a slightly darker neutral tint.
- **Level 2 (Active elements):** Elements like "Add to Cart" buttons use the "Soft Glow" to appear as if they are floating gently on a cushion of air.
- **Overlays:** Use a light backdrop blur (Glassmorphism) to keep the user grounded in the shop context while viewing details or menus.

## Shapes

The shape language is strictly **Rounded**. Sharp corners are non-existent in this design system to reflect the safety and softness of the products. 
- **Standard UI (Buttons/Inputs):** 0.5rem (8px) radius.
- **Containers (Cards/Sections):** 1.5rem (24px) radius.
- **Iconography:** Icons should feature rounded caps and joins. 
- **Mascot Integration:** The "Cloud" container shape is a signature element and should be used as a mask for lifestyle photography or as a background for featured product categories.

## Components

### Buttons
Primary buttons are "pill-shaped" in Sky Blue with white text. They should feature a subtle 2px inset shadow on hover to provide a "squishy" tactile feedback, making the interaction feel safe and satisfying.

### Cards
Product cards utilize a vertical layout with the image housed in a rounded-top container. Use Star Yellow for "New" or "Best Seller" chips, placed in the top-left corner of the image.

### Input Fields
Inputs use a "Soft Gray" background rather than a white background with a border. This reduces visual noise. The focus state transitions the background to white and adds a Sky Blue "Glow."

### Chips/Filters
Used for selecting product categories (e.g., "Fragrance-free," "Dermatological"). Chips should be Soft Pink when inactive and Sky Blue when active, using bold typography to denote the selection.

### Progress Indicators
Instead of standard bars, use a sequence of small "Stars" or "Bubbles" to show progress during checkout, reinforcing the brand's playful and caring identity.