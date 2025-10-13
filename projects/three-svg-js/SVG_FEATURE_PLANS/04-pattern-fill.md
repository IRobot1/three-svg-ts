# Pattern fills (pattern element)

Summary
- Support `<pattern>` fills by rendering Canvas/WebGL textures and using them as fill textures on shapes.

Difficulty: Moderate

Implementation steps
1. Extend `svgparser.ts` to detect `<pattern>` elements and parse image references or nested shapes.  
2. Implement a renderer that can rasterize nested pattern content into a canvas texture (handle patternUnits and patternTransform).  
3. Apply the generated texture using Three.js `MeshBasicMaterial.map` (or other material) with UVs scaled/offset to match pattern repeat settings.

Files to modify
- `svgparser.ts`, `svgshape.ts` (texture caching methods similar to gradients), possibly a new `patternshape.ts` helper.

Acceptance criteria
- Simple patterns using an image or small SVG tile repeat correctly across a rectangle and a complex path.  
- patternUnits and patternTransform support basic cases.

Edge cases
- Patterns with nested SVG elements that rely on external fonts or filters.  
- Performance when pattern tile is very large or patterns are many.

Estimated effort: 2–3 days
