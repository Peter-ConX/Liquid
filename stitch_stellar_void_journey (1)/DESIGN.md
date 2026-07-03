---
name: Federal Modern
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#44474e'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#000a1e'
  on-primary: '#ffffff'
  primary-container: '#002147'
  on-primary-container: '#708ab5'
  inverse-primary: '#aec7f6'
  secondary: '#bb0024'
  on-secondary: '#ffffff'
  secondary-container: '#e41d35'
  on-secondary-container: '#fffbff'
  tertiary: '#180500'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d1500'
  on-tertiary-container: '#b97958'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f6'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#93001a'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#6c391d'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  background-canvas: '#FFFFFF'
  surface-subtle: '#F5F5F5'
  border-standard: '#EBEBEB'
  link-active: '#166DFC'
typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
spacing:
  margin-desktop: 64px
  margin-mobile: 20px
  gutter: 24px
  column-count: '12'
  unit: 4px
---

## Brand & Style

The design system is engineered for a high-stakes media environment where credibility and immediacy are paramount. It targets an informed audience looking for authoritative reporting delivered through a clean, efficient digital interface. 

The aesthetic is **Corporate / Modern** with a focus on editorial precision. It leverages a structured, high-contrast framework that replaces the "cosmic" dark themes of common tech apps with a "paper-first" digital philosophy. The visual language evokes the reliability of traditional broadsheets while utilizing modern interface density and fluid transitions. Every design decision prioritizes legibility and the clear hierarchy of information, ensuring that the news remains the primary focus.

## Colors

The palette is anchored by a high-contrast foundation of pure white and deep neutral blacks to ensure maximum readability. The primary color, a deep navy (#002147), is used for global navigation, structural headers, and primary iconography to establish a sense of institutional permanence. 

Bright red (#E01933) is reserved strictly for high-urgency elements: breaking news alerts, live indicators, and critical "Opinion" or "Exclusive" tags. This dual-accent system creates a patriotic but sophisticated tone suitable for USA-centric news. Neutral grays are utilized for borders and secondary metadata to prevent visual clutter, maintaining a sharp, professional edge against the crisp white background.

## Typography

This design system employs a multi-family typographic strategy to balance impact with long-form comfort. **Montserrat** is used for headlines to provide a bold, geometric authority that feels contemporary and "newsroom-ready." 

For the reading experience, **Source Serif 4** is utilized for body text. This provides a classical editorial feel that reduces eye strain and signals journalistic depth. **Inter** serves as the functional utility font, handling labels, navigation, and metadata with systematic precision. High contrast in weight (Bold headlines vs. Regular body) is used to guide the user's eye through complex information architectures.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (centered 1280px container) to maintain the structural integrity of a traditional newspaper column, while transitioning to a fluid model on mobile devices. 

A strict 4px baseline grid ensures vertical rhythm across diverse content types. Spacing is intentionally generous (using "large" increments for section padding) to provide "breathing room" and differentiate this professional news environment from high-density social media feeds. Sections are separated by thin 1px horizontal rules rather than large gaps to maintain a sense of connectivity between related stories.

## Elevation & Depth

To maintain a credible, "flat" editorial aesthetic, this design system avoids heavy shadows and skeuomorphism. Instead, it utilizes **Tonal Layers** and **Low-Contrast Outlines**.

Depth is communicated through:
- **Surface Layering:** Most content sits on the base white (#FFFFFF) level. Secondary information or sidebars may sit on a subtle gray (#F5F5F5) background.
- **Rules & Borders:** 1px solid lines (#EBEBEB) define the grid. 
- **Active States:** Subtle 2px "Navy" bottom borders indicate active navigation tabs.
- **Zero Elevation:** Cards do not use shadows; they are defined by spacing or very fine hairlines, reinforcing a printed-page digital metaphor.

## Shapes

The shape language is **Sharp (0)**. To project authority and architectural stability, UI elements like buttons, input fields, and image containers use 90-degree corners. This uncompromising geometric approach differentiates the system from consumer-facing "soft" apps and aligns with the visual heritage of established news institutions. Only specific decorative elements, like notification badges, may use a circular form to stand out as "interactable" anomalies.

## Components

### Buttons
Primary buttons are solid Navy (#002147) with white text, utilizing sharp corners and uppercase labels. Secondary buttons use a Navy 1px outline. The "Breaking News" button is a solid Red (#E01933).

### Cards
News cards are strictly structured. Headlines are always on top, followed by a brief serif summary, then a sans-serif timestamp/author line. Images are never rounded and always maintain a 16:9 or 4:3 aspect ratio.

### Input Fields
Inputs use a 1px bottom border by default (minimalist style), becoming a full box only upon focus. Labels sit strictly above the field in Inter (Label-MD).

### Chips/Tags
Category tags (e.g., "POLITICS", "TECH") are presented in Inter (Label-LG), all-caps, with a high-contrast navy text on a light gray background, or a red vertical accent bar to the left.

### Lists
News feeds use "The Feed" pattern: a vertical list of stories separated by 1px horizontal rules, with consistent padding to ensure clear hit areas on mobile.

### Navigation
A top-tier "Master Header" contains the Navy branding, while a secondary "Topic Bar" allows for rapid filtering across news categories using bold, sans-serif typography.