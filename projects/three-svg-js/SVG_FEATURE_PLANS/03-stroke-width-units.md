# Stroke width units & scaling

Summary
- Improve handling of `stroke-width` units (px, em, %) and scaling behavior across viewBox and transforms so stroke thickness matches SVG expectations.

Difficulty: Easy → Moderate

Implementation steps
1. Parse `stroke-width` (already parsed in `parseStyle`). Add unit parsing in `SVGShapeUtils.parseFloatWithUnits` if needed.  
2. When creating stroke materials/geometries, scale stroke width according to `viewBox` and current transforms.  
3. Offer an option to render strokes in screen-space (constant pixel width) vs. vector-space (scaled with transforms).

Files to modify
- `svgparser.ts`, `shapeutils.ts`, stroke geometry code in `lineshape.ts`, `pathshape.ts`, and `svgshape.ts` where materials are created.

Acceptance criteria
- `stroke-width="2px"` produces a consistent 2-pixel wide stroke when screen-space option is enabled.  
- Scaling with viewBox behaves similarly to SVG when vector-space rendering chosen.

Edge cases
- Non-uniform scaling transforms.  
- Extremely thin strokes that underflow device pixel size.

Estimated effort: 1 day
