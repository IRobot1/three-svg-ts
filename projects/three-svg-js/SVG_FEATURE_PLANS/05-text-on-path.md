# Text on path (textPath)

Summary
- Implement rendering of `<textPath>` where text follows a path's curvature.

Difficulty: Moderate → Hard

Implementation steps
1. Ensure `svgparser.ts` already captures `textPath` (it sets `textPath` attr).  
2. Implement a layout engine that measures glyph widths (via canvas `measureText` or font metrics) and positions glyphs along a `ShapePathEx` path, applying rotation to match path tangents.  
3. For crisp results, render glyphs into a texture atlas or use signed-distance-field (SDF) text rendering.  
4. Provide fallback: render static canvas text, then place that canvas texture on a thin `PlaneGeometry` following the path.

Files to modify
- `textshape.ts`, `shapepathex.ts`, possibly introduce `textpathshape.ts` or extend `textshape`.

Acceptance criteria
- `textPath` content follows a simple bezier or line path with readable placement.  
- Support for `startOffset` and `method` = `align`/`stretch` basics.

Edge cases
- Complex fonts, kerning, ligatures, and vertical text support.  
- Performance for long text with many glyphs.

Estimated effort: 3–7 days
