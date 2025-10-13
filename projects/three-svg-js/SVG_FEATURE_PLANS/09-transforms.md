# Transform inheritance and complex transforms

Summary
- Improve handling of `transform` attributes, including transform inheritance, transform-origin semantics, and complex transform lists (`translate`, `scale`, `rotate`, `skewX/Y`, matrix()).

Difficulty: Moderate

Implementation steps
1. Enhance `svgparser.ts` `parseStyle` and `parseNode` to build transform matrices and attach them to group and element options.  
2. Ensure transforms are applied in correct SVG order and that group transforms compose with child transforms.  
3. Implement `transform-origin` or its SVG equivalent behavior for rotation/scaling anchors.  

Files to modify
- `svgparser.ts`, `shapeutils.ts`, shape constructors that set object transforms (e.g., `baseshape.ts`, `groupshape.ts`).

Acceptance criteria
- Complex transform lists applied to grouped elements match browser rendering for typical cases.  

Edge cases
- Non-uniform scaling + stroke width, transform with viewBox differences.

Estimated effort: 1–3 days
