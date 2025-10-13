# SVG filters: Gaussian blur and basic filter primitives

Summary
- Add basic support for common SVG filters, starting with `feGaussianBlur`, `feOffset`, `feColorMatrix` to allow blur, drop shadows, and color transforms.

Difficulty: Hard

Implementation steps
1. Parse filter nodes in `svgparser.ts` and capture filter chain.  
2. For raster filters (blur, offset), render the target to a render target (texture), run WebGL shader passes implementing the filter primitives, then composite the result back on top of the scene.  
3. For vector-preserving effects (like feColorMatrix when applied to fills), consider shader-based material modifications.  
4. Manage filterRegions, filterUnits, and `primitiveUnits` semantics.

Files to modify
- `svgparser.ts`, `svgshape.ts`, create new `filters/` shaders and pass manager, possibly integrate with the demo renderer pipeline in `src/app/threejs-app.ts`.

Acceptance criteria
- `feGaussianBlur` with a modest stdDeviation blurs a shape as expected.  
- `feOffset` can be combined to create a simple drop shadow effect.

Edge cases
- Performance: multi-pass shaders and large filterRegions are costly.  
- Chaining and coordinate space differences between svg filter primitives.

Estimated effort: 1–3+ weeks depending on fidelity
