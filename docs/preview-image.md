# GHP Info preview image

- Asset: [ghp-info-preview-v2.png](../public/ghp-info-preview-v2.png)
- Generated with the built-in imagegen tool.
- Actual output: 1730 × 909 pixels, PNG.
- Use: English and Simplified Chinese README display, Open Graph and Twitter sharing preview.
- The interface is an illustrative design with sample data, marked `DEMO`; it is not a live screenshot. The decorative activity grid is part of the illustration.
- Background: original graphite, cobalt-blue and teal abstract glass ribbons, replacing the initial starry mountain landscape.
- Initial version: [ghp-info-preview.png](../public/ghp-info-preview.png).
- Brand reference: `public/ghp-info-logo.png`.

## Background redesign prompt

```text
Use case: precise-object-edit
Asset type: GHP Info README product preview and Open Graph sharing image.
Input image: edit target, the existing GHP Info dashboard illustration.
Primary request: redesign ONLY the background outside the rounded black dashboard window, making it clearly original and entirely different from the current starry mountain sunset.
New background: a sophisticated abstract studio composition on a smooth deep graphite base. Soft cobalt-blue diffused light at the upper left and an emerald/teal luminous haze at the lower right. A few broad flowing translucent smoked-glass ribbons and thin elegant contour arcs curve through the outer margins behind the application window; subtle depth and soft reflections, restrained and architectural. Cool tones, calm polished developer-tool aesthetic. The backdrop is dark enough that the readable dashboard remains the main subject. Gently illuminate the dashboard's external silhouette with a soft blue/teal ambient shadow. Balanced lighting and fine nearly invisible grain.
Composition: keep the original landscape aspect ratio and image size, straight-on horizontal centered application window, identical window bounds and scale, ample background margins. Ribbons may appear in the outer margins, never in front of the dashboard.
Invariants: Preserve every pixel of the application window as closely as possible. Preserve the GHP INFO logo, search bar, avatar, Everfu profile, DEMO badge, all text spelling and values, panel layout, repository rows, language bars, activity timeline and contribution grid. Do not redesign, relocate, rescale, crop, or add any UI. Preserve crisp type and flat dark interface. No new text.
Avoid: stars, galaxies, mountains, landscapes, sand dunes, orange, sunsets, horizon lines, planets, noisy particle effects, watermarks, neon cyberpunk decoration. This must not resemble the earlier reference backdrop.
```

## Initial generation prompt

```text
Use case: ui-mockup
Asset type: final website and repository preview image for GHP Info, a GitHub developer lookup application. Create a polished raster product preview, landscape, exactly 2400 x 1260 pixels (aspect ratio 40:21).
Input images: Image 1 is a STYLE AND COMPOSITION reference only: starry blue night sky, warm amber horizon, layered dark mountain silhouettes, a centered rounded black application dashboard with subtle borders, bright white typography, subdued gray secondary labels. Do not copy any domain/WHOIS data or text. Image 2 is the GHP Info BRAND LOGO, use its white G/person monogram faithfully as a small logo at the upper left of the application header.
Primary request: translate the visual atmosphere of Image 1 into a credible GHP Info GitHub developer dashboard preview. This is a product concept illustration with sample data, not live GitHub statistics.
Scene/backdrop: midnight teal starry sky across the upper background with fine sparse stars, desaturated copper sunset near the horizon, layered navy mountain silhouettes, a restrained amber dune at the bottom. Clean and sophisticated, no distracting galaxy clouds.
Composition: straight-on front view, perfectly horizontal, no perspective tilt, no device frame. A large centered black rounded application window occupying roughly 85% of the image width and 86% of its height, with generous balanced background margins. Keep entire window visible. Strong readable UI hierarchy and crisp typography. The UI is the subject, backdrop is secondary.
Dashboard: near-black canvas #030405, charcoal card surfaces #090b0e, very thin #24272c outlines, 20px panel radii, consistent 26px spacing. White Geist-like sans serif headings, gray secondary text, monospaced numbers. Small mint status accent and restrained blue/cyan language bars.
Header: small supplied brand logo followed by exact text "GHP INFO"; small "API", theme and globe line icons on the right. Under header, one full-width search field containing a magnifying glass icon, exact text "everfu", and an arrow button.
Main layout below search: two columns with left column roughly two-thirds and right column one-third.
Left top large developer profile card: small square neutral avatar showing initials "EF"; a small "GITHUB" tag; large bold exact text "Everfu"; smaller "@everfu"; bio exact text "Building useful things, one project at a time."; location "Shanghai" and "github.com/everfu"; subdued small "DEMO" badge. A divider followed by four clearly aligned statistic columns: "PUBLIC REPOS" "SOURCE REPOS" "TOTAL STARS" "TOTAL FORKS", with sample numbers "48" "36" "1,284" "216".
Below this profile card in the left column: two equal cards side-by-side. First title "Languages" with horizontal colored bars and labels "TypeScript" "Python" "JavaScript" and percentages "52%" "28%" "20%". Second title "Top repositories" with three horizontal rank rows: "GHP" with star icon and "640", "blog" with star icon and "384", "toolkit" with star icon and "260".
Bottom left full-width repository card: title "Repositories", compact small "Search repositories" search field and "Stars" sort control; two clean repository rows. Row 1 "GHP", description "Explore public GitHub developers.", blue dot and "TypeScript", star icon "640". Row 2 "blog", description "Notes on code, design, and everyday ideas.", yellow dot and "JavaScript", star icon "384". Use restrained dividers.
Right column tall panel titled "Recent activity" with a thin timeline, blue gray line icons and exactly four readable entries: "Pushed to GHP" / "2 hours ago"; "Created a release" / "GHP · v1.0.0"; "Starred a repository" / "Yesterday"; "Updated blog" / "2 days ago". Under the entries a tiny subtle square contribution-like grid in subdued green and dark gray as a decorative activity visualization. Do not add other features or menus.
Constraints: all written text must be clean, correctly spelled, and visually plausible for a real desktop web application. Optimize for readability when displayed at half size (1200 x 630). Do not cram microtext. No WHOIS/domain/registrar text. No marketing headline outside the application. No watermarks. Match the supplied project's monogram, not an invented unrelated icon. Keep enough amber background visible at bottom and navy stars visible above, like reference. Clear flat screen rendering with crisp UI, premium but restrained.
```
