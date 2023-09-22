import { SVGShapeOptions } from "./svgshape";
import { CircleParams, EllipseParams, LineParams, LinearGradient, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RectParams, TextParams } from "./types";

export interface GroupShapeType {
  options?: PresentationAttributes,
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
export interface ShapeSchema {
  options?: SVGShapeOptions
  gradients?: Array<LinearGradient>
  elements: Array<ShapeTypes>
}


