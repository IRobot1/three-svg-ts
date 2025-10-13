# Copilot Instructions for three-svg-ts

## Project Overview
- **three-svg-ts** is an Angular workspace containing a demo app and the `three-svg-js` library for rendering/manipulating SVGs in Three.js scenes.
- The main library is in `projects/three-svg-js/`, with source code in `projects/three-svg-js/src/lib/`.
- The Angular app in `src/` is for demonstration only; the library itself is framework-agnostic.

## Key Components & Data Flow
- **SVGShape**: Central class for building, parsing, and rendering SVG as Three.js geometry. Extends `Mesh` for direct scene integration.
- **SVGParser**: Converts SVG XML to a JSON schema for programmatic manipulation and storage.
- **Shape Classes**: Each SVG element type (rect, circle, path, etc.) has a corresponding class (e.g., `RectShape`, `CircleShape`).
- **Schema/Data Model**: See `schema.ts` for the JSON structure used to represent SVG documents and elements.
- **Live Demo**: The demo app uses Monaco Editor for live SVG editing and preview, and can export to `.glft` and `.json` formats.

## Developer Workflows
- **Install dependencies**: `npm install`
- **Run demo app**: `npm start` or `ng serve` (serves Angular demo at localhost)
- **Build library**: `npm run build` (Angular build system)
- **Publish library**: `npm run publish` (see `package.json` for details)
- **Test**: `npm test` (runs Karma/Jasmine tests for both app and library)

## Project-Specific Patterns
- **SVG Manipulation**: Use `SVGShape` methods to build shapes programmatically (see README and `svgshape.ts`).
- **Parsing/Serialization**: Use `SVGParser` for SVG→JSON, and `SVGShape.save()` for JSON→SVG.
- **Gradients & Strokes**: Custom support for SVG gradients and strokes via undocumented Three.js APIs.
- **Extensibility**: Add new SVG element support by creating a new shape class in `lib/` and updating schema/types.

## Integration Points
- **Three.js**: Library depends on Three.js for geometry and rendering.
- **Monaco Editor**: Used in demo app for live SVG editing.
- **Angular**: Only for demo; library itself does not require Angular.

## Conventions & Tips
- **Library code**: All reusable logic is in `projects/three-svg-js/src/lib/`. Demo-specific code is in `src/app/`.
- **TypeScript**: Strict typing enforced; see `types.ts` for shared interfaces.
- **Testing**: Tests for library are in `projects/three-svg-js/src/` and use Jasmine/Karma.
- **Assets**: Demo assets (fonts, images) are in `src/assets/`.

## Example Usage
```typescript
const svgshape = new SVGShape()
svgshape.loadSVG('<svg ...>...</svg>')
svgshape.update()
scene.add(svgshape)
```

## References
- See `projects/three-svg-js/README.md` for advanced usage and limitations.
- See `svgshape.ts`, `svgparser.ts`, and `schema.ts` for core logic and data structures.

---

*Update this file as project structure or workflows change. For questions, see the main README or library README for details.*
