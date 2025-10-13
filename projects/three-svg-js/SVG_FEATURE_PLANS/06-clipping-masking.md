# Clipping and masking (clipPath & mask)

Summary
- Support for `clipPath` and `mask` elements so shapes can be clipped or masked by other geometry or alpha masks.

Difficulty: Moderate → Hard

Implementation steps
1. Parse `clipPath` and `mask` elements in `svgparser.ts` and reference them from shapes with `clip-path`/`mask` attributes.  
2. For `clipPath` composed of vector shapes, use Three.js groups with `Material.clipIntersection` or stencil buffer techniques to clip rendering (requires custom shader or render order using stencil).  
3. For `mask`, rasterize mask content to a texture (alpha) and use it as an alphaMap on materials.  
4. Handle `clipPathUnits` and `maskUnits` options (userSpaceOnUse vs objectBoundingBox).

Files to modify
- `svgparser.ts`, `svgshape.ts`, new helpers `cliputils.ts`/`maskutils.ts`, and possibly custom shader materials.

Acceptance criteria
- Simple clipPaths clip underlying shapes correctly.  
- Masked shapes display with alpha masks matching SVG source for basic cases.

Edge cases
- Complex nested clip/mask that references gradients or images.  
- Performance and depth-ordering issues with stencil approaches.

Estimated effort: 3–10 days
