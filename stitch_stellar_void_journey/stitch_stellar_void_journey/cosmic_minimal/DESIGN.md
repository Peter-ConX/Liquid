---
name: Cosmic Minimal
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c5c6cb'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8e9195'
  outline-variant: '#44474a'
  surface-tint: '#c1c7cf'
  primary: '#ffffff'
  on-primary: '#2b3137'
  primary-container: '#dde3eb'
  on-primary-container: '#5f656c'
  inverse-primary: '#595f66'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffffff'
  on-tertiary: '#2a3043'
  tertiary-container: '#dce1fb'
  on-tertiary-container: '#5e6479'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dde3eb'
  primary-fixed-dim: '#c1c7cf'
  on-primary-fixed: '#161c22'
  on-primary-fixed-variant: '#41474e'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#dce1fb'
  tertiary-fixed-dim: '#c0c6de'
  on-tertiary-fixed: '#151b2d'
  on-tertiary-fixed-variant: '#40465a'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.1em
  display-xl-mobile:
    fontFamily: Montserrat
    fontSize: 42px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.15em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.8'
    letterSpacing: 0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.3em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  void-xs: 4px
  void-sm: 12px
  void-md: 24px
  void-lg: 48px
  void-xl: 96px
  void-huge: 160px
---

## Brand & Style
The design system is built for high-fidelity scrollytelling, where the UI serves as a delicate lattice over expansive cosmic imagery. The brand personality is awe-inspiring, silent, and sophisticated, targeting an audience that appreciates cinematic depth and technical precision.

The design style is a hybrid of **Minimalism** and **Glassmorphism**, utilized to create an "almost invisible" interface. It relies on extreme whitespace (negative space), thin architectural lines, and translucent layers that allow background visuals to bleed through, ensuring the content remains the primary protagonist.

## Colors
The palette is rooted in the void of deep space. The primary background is a strict **Pure Black (#000000)** to ensure seamless blending with OLED screens and astronomical photography, with **Deep Space Navy (#020617)** used for subtle section transitions or container depth.

Accents are used with extreme restraint. **Liquid Silver (#E2E8F0)** acts as the primary functional color for borders and iconography, providing a metallic, high-tech feel. **Electric Blue (#3B82F6)** is reserved exclusively for critical interactive cues or data highlights, cutting through the darkness like a distant star. All text is rendered in **White (#FFFFFF)** with varying opacities to establish hierarchy.

## Typography
Typography in this design system is treated as a rhythmic reveal. **Montserrat** is used for impactful headlines, utilizing high letter-spacing to evoke a sense of vastness and technical engineering. **Inter** provides a utilitarian contrast for body text, prioritized for legibility against dynamic backgrounds.

Key typographic principles:
- **Tracking:** Headings and labels must use expanded letter-spacing (0.1em to 0.3em).
- **Weight:** Use Thin (100) or Light (300) weights for body copy to maintain a delicate aesthetic.
- **Alignment:** Center-alignment is the default for scrollytelling reveals to maintain focus.

## Layout & Spacing
The layout philosophy is "The Void." It uses a **no-grid** approach for the main storytelling flow, relying on massive vertical margins to pace the narrative. Functional UI elements (dashboards, overlays) follow a **12-column fluid grid** with generous 48px gutters to prevent visual clutter.

- **Desktop:** Centralized content column maxes out at 800px for readability; interactive elements are pinned to corners.
- **Mobile:** Margins shrink to 24px, with all interactive elements shifted to the bottom "thumb zone" to keep the center of the screen clear for imagery.
- **Pacing:** Use `void-huge` (160px) between text blocks to force a slow, deliberate scrolling speed.

## Elevation & Depth
Depth is created through **Glassmorphism** and optical layers rather than traditional shadows.
- **The Veil:** Navigation bars and menus use a `backdrop-blur-md` (approx. 12px blur) with a 10% white background opacity. This creates a "frosted glass" effect that hints at the stars behind it.
- **The Ghost Border:** Instead of shadows, surfaces are defined by 1px solid strokes in `White/10` or `Liquid Silver`.
- **Z-Axis Hierarchy:**
  - Level 0: Background (Celestial imagery).
  - Level 1: Content (Text and primary buttons).
  - Level 2: Navigation & Overlays (Glassmorphic layers).

## Shapes
The shape language is architectural and precise. Corners are kept **Soft (0.25rem)** or entirely **Sharp (0)** to maintain a technical, engineered feel. Large radii are avoided as they appear too friendly and "bubbly" for the cosmic aesthetic. 

Thin lines (0.5pt to 1pt) are used to connect UI elements, mimicking star charts or blueprints.

## Components
- **Navigation:** A fixed top bar with a 1px `White/10` bottom border and high backdrop blur. Links use `label-caps` typography.
- **Buttons:**
  - *Primary:* Transparent background, 1px `Liquid Silver` border, `White` text. On hover, the border glows with a subtle `Electric Blue` outer bloom.
  - *Ghost:* Text-only with high letter-spacing.
- **Progress Indicator:** A vertical 1px line on the right edge of the screen, with a small silver dot representing the scroll position.
- **Cards/Sections:** No filled backgrounds. Use a 1px border on the top or left side only to suggest a container without boxing in the imagery.
- **Interaction Cues:** Subtle pulsing animations on icons (Electric Blue) to indicate clickability without disrupting the visual silence.
- **Input Fields:** Bottom-border only, 1px thickness, using Inter Light for placeholder text.