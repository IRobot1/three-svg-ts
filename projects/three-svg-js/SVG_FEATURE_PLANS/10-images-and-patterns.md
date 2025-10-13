# Embedded images and external images

Summary
- Support `<image>` elements referencing external raster images or embedded data-URIs and using them as fills or standalone objects.

Difficulty: Easy → Moderate

Implementation steps
1. Parse `image` elements and `href` attributes in `svgparser.ts`.  
2. Load images with `Image`/`HTMLImageElement` and create `CanvasTexture`/`Texture` objects.  
3. Map textures onto `PlaneGeometry` for standalone images or apply as `map` on materials for fills.  
4. Respect `preserveAspectRatio`, `x`, `y`, `width`, `height`, and `transform` attributes.

Files to modify
- `svgparser.ts`, `svgshape.ts` (texture caching like gradients), and a small `imageshape.ts` helper.

Acceptance criteria
- An `<image>` with an external URL or data URI renders in the scene in the correct position and size.  

Edge cases
- Cross-origin images (CORS); need to set `crossOrigin` correctly or provide warnings.  

Estimated effort: 0.5–2 days
