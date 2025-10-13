# Stroke dasharray / dashoffset

Summary
- Add support for `stroke-dasharray` and `stroke-dashoffset` so dashed strokes render similarly to SVG (lines and shape outlines).

Difficulty: Easy → Moderate
- Three.js already supports dashed lines via `LineDashedMaterial` and `computeLineDistances()` for line primitives. For shape outlines (filled ShapeGeometry) it requires either generating a stroked path as `Line` geometry or using a dashed stroke texture mapped along the stroke.

Implementation steps
1. Parse `stroke-dasharray` and `stroke-dashoffset` in `svgparser.ts` (extend `parseStyle` to map attributes to style keys).  
2. When creating stroke geometry for `line`, `polyline`, and `path` outline strokes, use `LineDashedMaterial` and call `computeLineDistances()` on the stroke geometry.  
3. For filled shapes (rect, circle, ellipse, polygon), provide an option to generate outline `Line` geometry from the `ShapePathEx` and apply dashed material.  
4. Add a fallback: if `stroke-dasharray` contains multiple values, translate them into `dashSize`/`gapSize` heuristics or a dashed texture.

Files to modify
- `projects/three-svg-js/src/lib/svgparser.ts` — ensure style parsed and forwarded.  
- Stroke creation files: `lineshape.ts`, `pathshape.ts`, and shape classes that produce stroke geometry (likely `baseshape.ts`/`shapepathex.ts`).

Acceptance criteria
- `stroke-dasharray="5,3"` on a `line` produces visible dashed lines in the demo.  
- `stroke-dashoffset` shifts the dash pattern along the stroke.  
- Fallback behavior documented when full fidelity isn't possible for complex filled shapes.

Edge cases & notes
- Very small shapes where dash/gap exceed segment lengths.  
- Complex path joins must preserve dash continuity across subpaths.  
- Performance: avoid generating high-poly geometry just for dash appearance.

Estimated effort: 1–2 days
