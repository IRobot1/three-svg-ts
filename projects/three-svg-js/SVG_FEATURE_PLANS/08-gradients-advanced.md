# Advanced gradient features (gradientUnits, gradientTransform, spreadMethod)

Summary
- Extend linear and radial gradient handling to support `gradientUnits` (`userSpaceOnUse`), `gradientTransform`, and `spreadMethod` (pad/repeat/reflect).

Difficulty: Moderate → Hard

Implementation steps
1. Update `SVGOptions.linearGradient` and `radialGradient` to honor `gradientUnits` by computing coordinates in user space vs object bounding box.  
2. Implement `gradientTransform` by applying a transform matrix to gradient coordinates before rasterization.  
3. Support `spreadMethod` by implementing repeat/reflect in the canvas shader (by wrapping or mirrored draws) or by using WebGL repeat textures with an appropriately generated tile.  

Files to modify
- `svgparser.ts` (to store attributes), `svgshape.ts` gradient methods, `shapeutils.ts` for transform math.

Acceptance criteria
- SVGs using `userSpaceOnUse` gradients render similarly to browsers for simple cases.  
- `gradientTransform` rotates/scales the gradient as expected.

Edge cases
- Large coordinate ranges causing precision issues.  
- SpreadMethod interactions with non-square gradient canvas tiles.

Estimated effort: 2–5 days
