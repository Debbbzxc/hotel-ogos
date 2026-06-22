# Hotel Ogos - UI/UX Style Guide

This document serves as the official design system and style guide for all user interfaces of **Hotel Ogos**. Fulfill these constraints and design choices during all future UI development to maintain brand cohesion and a premium, unified user experience.

---

## 1. Brand Identity & Visual Assets

Hotel Ogos combines a clean modern layout with a bold red, white, and gold color scheme inspired by Japanese hospitality aesthetics.

*   **Primary Logo**: The circular black-and-white Geisha line-art image mask.
    *   **Framing**: Always wrap the logo in a circular container (`border-radius: 50%`) with a white (`#ffffff`) background, a **4px gold border** (`#FFD700`), and a subtle box shadow.
*   **Typography Name**: `HOTEL OGOS` (all-caps, Poppins font, bold, white on dark backgrounds, brand-red on light backgrounds).
*   **Tagline**: `"So Cozy... So Comfy!"` (italicized or clean normal style, Poppins font).
*   **Branch Location Badge**: `BAYOMBONG, NUEVA VIZCAYA` (always in all-caps, tracking-wide `1.5px` Poppins font, gold text, semi-transparent black pill backing).

---

## 2. Color Palette Tokens

Avoid generic colors. Always use the specified Hex / HSL tokens below:

| Token Name | Hex Value | RGB / HSL | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Red (Primary)** | `#D31027` | `rgb(211, 16, 39)` | Highlights, hover states, primary badges |
| **Dark Red (Secondary)** | `#990000` | `rgb(153, 0, 0)` | Buttons (static state), focused input borders, title texts |
| **Brand Gold (Accent)** | `#FFD700` | `rgb(255, 215, 0)` | Branch text, logo frame border, divider accents |
| **Charcoal Black** | `#1A1A1A` | `rgb(26, 26, 26)` | Default dark text, borders, dark panel backing |
| **Neutral White** | `#FFFFFF` | `rgb(255, 255, 255)` | Page panels, card backgrounds, logo backings |
| **Soft Grey** | `#E5E4E7` | `rgb(229, 228, 231)` | Inactive input borders, separators, subtle shadows |

---

## 3. Typography Rules

The entire application standardizes on **Poppins** from Google Fonts. 

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght=0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
```

*   **Font Family**: `'Poppins', sans-serif`
*   **Brand Header**: `48px`, font weight `700` (Bold), letter-spacing `1px`.
*   **Page Title (Login/Register)**: `32px`, font weight `700` (Bold), color `#990000`.
*   **Tagline Text**: `20px`, font weight `400` (Regular), letter-spacing `0.5px`.
*   **Body & Form Labels**: `14.5px` to `15px`, font weight `400` (Regular) or `500` (Medium).
*   **Branch Badge**: `13.5px`, font weight `600` (Semi-bold), letter-spacing `1.5px`.
*   **Text Links**: `14px`, font weight `600` (Semi-bold), color `#990000`, underlined on hover.

---

## 4. Layout & Grid Principles

### Full-Screen Split Layout
All authentication, configuration, or introductory pages use a **50/50 vertical split layout**:

*   **Left Half (Branding Panel)**:
    *   Background: Radial gradient `#e60000` at center fading out to `#990000`.
    *   Content: Centered vertically and horizontally. Contains the circular logo badge, brand title, tagline, and branch location badge.
*   **Right Half (Form/Action Panel)**:
    *   Background: Solid white `#ffffff`.
    *   Content: Center-aligned, boxed to a maximum width of `380px` to maintain compact alignment.

### Responsive Breakpoint (868px)
*   For screens smaller than `868px`, the split columns collapse to a vertical stack.
    *   Left panel height: `35%` to `40%`.
    *   Right panel height: `60%` to `65%`.
    *   Apply a `4px solid #FFD700` horizontal border to separate the panels.

---

## 5. Input Component Guidelines

All input fields (e.g. `Username`, `Password`, `Email`) must adhere to this unified styling:

*   **Prefix Badge**: Every input must feature a left-aligned, square icon badge.
    *   Background: `#990000`.
    *   Color: `#ffffff`.
    *   Width: `46px`.
    *   Icon: Standard Material Icons (`Person`, `Lock`, `Email`, etc.) sized to `small` or `medium`.
*   **Input Body**:
    *   Background: `#ffffff` with a border radius of `6px`.
    *   Default Border: `1px solid #e5e4e7`.
    *   Hover Border: `1px solid #b2b2b2`.
    *   Focus Border: `1.5px solid #990000` (does not expand input height).
*   **Interactive Adornments**: Password fields must feature a right-aligned visibility toggle button (eye/eye-off icon) with a color of `#888888`.

---

## 6. Button Component Guidelines

Primary actions (e.g., `Login`, `Register`, `Submit`) must be styled with active micro-animations:

*   **Default State**:
    *   Background: `#990000` with white `#ffffff` text.
    *   Border radius: `6px`.
    *   Shadow: `0 4px 12px rgba(153, 0, 0, 0.2)`.
*   **Hover State**:
    *   Background: `#D31027` (vibrant brand red).
    *   Shadow: `0 6px 16px rgba(211, 16, 39, 0.3)`.
    *   Transform: `translateY(-1px)` (smooth transition `0.25s cubic-bezier(0.4, 0, 0.2, 1)`).
*   **Active/Pressed State**:
    *   Transform: `translateY(1px)`.
    *   Shadow: Reduced.

---

## 7. Guidelines for Future UI Additions

When creating dashboards, lists, or booking flows:
1.  **Dashboard Shells**: Use a clean white content area with a dark sidebar or header containing a miniature version of the gold-bordered Geisha logo.
2.  **Alerts & Statuses**: Use the brand colors. Successes can use a subtle gold accent, while errors use `#D31027` red.
3.  **Buttons & Text Inputs**: Always inherit the styles defined in sections 5 and 6. Do not introduce raw buttons or standard browser borders.
