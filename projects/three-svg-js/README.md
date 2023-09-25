# three-svg-js

threejs classes to display SVG as geometry, parsing SVG and building geometry with SVG like methods. Its similar to [SVGLoader](https://threejs.org/docs/index.html?q=svgload#examples/en/loaders/SVGLoader) but with more features and programmatic control

SVGLoader is mostly a black box that takes an SVG file and outputs an array of ShapePaths.  Unfortunately, none of the structure of the original SVG file is accessible to dynamically build or modify the shapes.  Classes in this library give you that access and control

The SVGShape class can load an SVG document for adding to the scene

```ts
const svgshape = new SVGShape()
svgshape.loadSVG(`<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="red" />
  <circle cx="150" cy="100" r="80" fill="green" />
  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
</svg>`)
svgshape.update() // generate the geometry
scene.add(svgshape)
```

[Codesandbox Example](https://codesandbox.io/s/three-svg-js-starter-gkjf79)

The SVGShape class has methods that mimic an SVG document to allow programmatic building shapes and geometry

```ts
const svgshape = new SVGShape({ width: 300, height: 200 })
.rect({
  width: "100%",
  height: "100%",
  fill: "red"
})
.circle({ cx: 150, cy: 100, r: 80, fill: "green" })
.text({
  content: 'SVG',
  x: "150",
  y: "125",
  fontSize: 60,
  textAnchor: "middle",
  fill: "white"
})
```

This is equivalent to the original SVG
```svg
<svg version="1.1" width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="red" />
  <circle cx="150" cy="100" r="80" fill="green" />
  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
</svg>
```
<svg version="1.1" width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="red" />
  <circle cx="150" cy="100" r="80" fill="green" />
  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
</svg>

SVGShape extends Mesh, so can be added to the scene and be positioned and scaled like any other Object3D
```ts
svgshape.update() // generate the geometry
scene.add(svgshape)
```

## SVGParser

SVGParser converts an SVG file to equivalent JSON format for loading into SVGShape.  This is equivalent to SVGLoader parse method adapted to just create an equivalent data representation.  It has no dependencies on threejs so can be used as a standalone component.

```ts
const svg = `<svg version="1.1" width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="red" />
  <circle cx="150" cy="100" r="80" fill="green" />
  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
</svg>`

const parser = new SVGParser()
const schema = parser.parse(svg)
```

Here's the JSON data structure
```ts
export interface SVGSchema {
  options?: SVGShapeOptions
  gradients?: Array<LinearGradient | RadialGradient>
  elements: Array<ShapeTypes>
}

export interface ShapeTypes {
  circle?: CircleParams
  ellipse?: EllipseParams
  group?: GroupShapeType
  line?: LineParams
  path?: PathParams
  polygon?: PolygonParams
  polyline?: PolylineParams
  rect?: RectParams
  text?: TextParams
}

export interface GroupShapeType {
  options?: PresentationAttributes,
  elements: Array<ShapeTypes>
}
```

SVGShape provides the `load` method to convert this data structure into equivalent shapes
```ts
const svgshape = new SVGShape(schema.options)
svgshape.load(schema)
svgshape.update() // generate the geometry
scene.add(svgshape)
```

SVGShape provides the `save` method to convert the current shape definition into equivalent data structure
```ts
const svgshape = new SVGShape(schema.options)
.rect({
  width: "100%",
  height: "100%",
  fill: "red"
})
const schema = svgshape.save()
```


# Reference

## SVGShape
SVGShape mesh for threejs. It supports
* parsing SVG into JSON format for storage or programmatic manipulation
* loading JSON format to define mesh and geometry for adding to the scene
* uses SVGLoader undocumented pointsToStroke method to support SVG stroke style
* supports basic linear and radial gradient texture as fill style






## SVGShapePath

Used by SVGShape to generate the shape paths.  Improves on [ShapePath](https://threejs.org/docs/index.html?q=shape#api/en/extras/core/ShapePath) in the following ways
* adds missing arc, absarc, ellipse, absellipse and closePath methods
* adds support for processing SVG path commands


Shape classes are provided for each type of SVG element
* CircleShape - equivalent to SVG circle 
* EllipseShape - equivalent to SVG ellipse
* GroupShape - equivalent to SVG group
* LineShape - equivalent to SVG line
* PathShape - equivalent to SVG path
* PolygonShape - equivalent to SVG polygon
* PolylineShape - equivalent to SVG polyline
* RectShape - equivalent to SVG rect
* SVGShape - equivalent to SVG element
* TextShape - equivalent to SVG text
* BaseShape - base class for all shapes
 
BaseShape includes methods for creating stroke and fill materials and converting each shape or stroke to geometry

# Developer Notes

The library has been checked against a wide range of SVG content including
* [W3C SVG files](https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/)
* [Simple Icons Repo](https://github.com/simple-icons/simple-icons/tree/develop/icons)
* [Circle Flags Repo](https://github.com/HatScripts/circle-flags/tree/gh-pages/flags)
* [SVG Repo](https://www.svgrepo.com/)
* [SVG Viewer](https://www.svgviewer.dev/)
