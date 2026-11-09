# AGENTS.md — AI Agent Instructions for Remotion Video Factory

Welcome! This repository is a **Multi-Video Remotion Monorepo ("Video Factory")**. Multiple AI agents and developers collaborate in this repository to build independent, broadcast-grade programmatic videos.

---

## 1. Directory Isolation & Architecture Rules

When asked to create a new video (e.g., `ProductLaunch`, `TiktokAd`, `AnnualReport`):

1. **Create an Isolated Directory**:
   Place all components, scenes, and styles for your video inside:
   ```text
   src/videos/<YourVideoName>/
   ```
   **Never** overwrite or delete other videos inside `src/videos/`.

2. **Reuse Shared Motion Assets (`src/shared/`)**:
   - [`src/shared/motion-presets.ts`](src/shared/motion-presets.ts): Standard spring physics (`SPRING_CONFIGS`), cubic-bezier curves (`EASING_CURVES`), and curated color palettes (`PALETTES`).
   - [`src/shared/GlobalOverlay.tsx`](src/shared/GlobalOverlay.tsx): Configurable SMPTE timecode HUD and progress rail.
   - Reference [`src/videos/Showreel/`](src/videos/Showreel/) as the gold-standard reference for 60 FPS motion craft (Squash & Stretch, SVG Gooey Metaballs, Swiss Bento Grids, Isometric 3D Voxels, and Vertex Morphing).

3. **Register Your Composition in [`src/Root.tsx`](src/Root.tsx)**:
   Add your new `<Composition>` inside `<Folder name="Productions">` in `src/Root.tsx`. Keep all existing `<Composition>` entries intact.

4. **Static Assets (`public/`)**:
   Place audio/font/image assets in `public/` and reference them with `staticFile("filename.ext")`.
   If custom procedural audio/SFX is needed, see [`scripts/generate_music.py`](scripts/generate_music.py).

---

## 2. Remotion Motion Design Best Practices

- **Frame-Driven Animations Only**: Drive all animations using `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, and `spring()`. **Never** use CSS `transition` or CSS `@keyframes` animations, as they do not render deterministically in headless Chromium.
- **Always Clamp Interpolations**: Pass `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }` to `interpolate()` calls unless unbounded extrapolation is intentional.
- **Perceptual Scale**: When animating large camera zooms, pass `output: "perceptual-scale"` to `interpolate()`.
- **Verification**: Always run `npx tsc --noEmit` to verify zero TypeScript errors, and test-render a still frame with:
  ```bash
  npx remotion still <CompositionId> out/preview.png --frame=60
  ```
