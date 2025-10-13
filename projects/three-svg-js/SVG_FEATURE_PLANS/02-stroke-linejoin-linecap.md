# Stroke linejoin & linecap (miter, bevel, round, butt)

Summary
- Implement better handling of `stroke-linejoin` and `stroke-linecap` attributes to match SVG rendering for outlines.

Difficulty: Easy
- Most stroke linejoin/linecap options map directly to Three.js material or geometry settings when drawing strokes as `Line` primitives. For filled shapes rendered via `ShapeGeometry`, outline generation must support chosen joins/caps.

Implementation steps
1. Ensure `parseStyle` already maps `stroke-linejoin` and `stroke-linecap` (it currently does).  
2. When building stroke `Line` geometry, pass appropriate settings or use geometry generation code that respects joins/caps.  
3. For stroked ShapeGeometry, when extruding outline into geometry, adjust vertices to simulate miter/round/bevel joins.

Files to modify
- `lineshape.ts`, `baseshape.ts`, `shapepathex.ts`, and any stroke geometry helpers.

Acceptance criteria
- Changing `stroke-linejoin` to `round` results in rounded joins on shape outlines.  
- `stroke-linecap` modifies line ends for open subpaths.

Edge cases
- Extremely sharp miters that exceed `stroke-miterlimit` should fall back to bevel joins.

Estimated effort: 0.5–1 day
