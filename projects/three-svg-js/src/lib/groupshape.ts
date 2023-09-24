import { Object3D} from "three";
import { CircleParams, EllipseParams, LineParams, LinearGradient, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RadialGradient, RectParams, TextParams } from "./types";
import { SVGOptions } from "./svgshape";
import { RectShape } from "./rectshape";
import { CircleShape } from "./circleshape";
import { EllipseShape } from "./ellipseshape";
import { TextShape } from "./textshape";
import { LineShape } from "./lineshape";
import { PolylineShape } from "./polylineshape";
import { PolygonShape } from "./polygonshape";
import { PathShape } from "./pathshape";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";

export class GroupShape extends BaseShape  {

  constructor(svg: SVGOptions, params: PresentationAttributes) {
    super('group', svg, params)

    if (this.params.transform) SVGShapeUtils.processTransform(this, this.params.transform)
  }

  shapes: Array<BaseShape> = [];

  addShape(shape: BaseShape) {
    this.shapes.push(shape)
  }

  addMesh(mesh: Object3D) {
    this.add(mesh)
  }


  update() {
    this.shapes.forEach(shape => shape.update())
  }

  inheritParams(params: PresentationAttributes) {
    if (!params.fill) params.fill = this.params.fill
    if (!params.opacity) params.opacity = this.params.opacity
    if (!params.fillOpacity) params.fillOpacity = this.params.fillOpacity
    if (!params.stroke) params.stroke = this.params.stroke
    if (!params.strokeOpacity) params.strokeOpacity = this.params.strokeOpacity
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth
    if (!params.strokeLineCap) params.strokeLineCap = this.params.strokeLineCap
    if (!params.strokeLineJoin) params.strokeLineJoin = this.params.strokeLineJoin

  }
  group(params: PresentationAttributes): GroupShape {
    this.inheritParams(params)

    const group = new GroupShape(this.svg, params)
    this.addShape(group)
    this.addMesh(group)
    return group
  }

  rect(params: RectParams): this {
    this.inheritParams(params)
    
    const shape = new RectShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  circle(params: CircleParams): this {
    this.inheritParams(params)

    const shape = new CircleShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  ellipse(params: EllipseParams): this {
    this.inheritParams(params)
    if (!params.rx || !params.ry) {
      console.warn('ellipse radius zero!')
    }
    else {
      const shape = new EllipseShape(this.svg, this, params)
      this.addShape(shape)
    }
    return this
  }

  text(params: TextParams): this {
    this.inheritParams(params)
    if (!params.textAnchor) params.textAnchor = 'start'

    const shape = new TextShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  line(params: LineParams):this {
    this.inheritParams(params)

    const shape = new LineShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  polyline(params: PolylineParams) {
    this.inheritParams(params)

    const shape = new PolylineShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  polygon(params: PolygonParams) {
    this.inheritParams(params)

    const shape = new PolygonShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  path(params: PathParams): this {
    this.inheritParams(params)

    const shape = new PathShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  linearGradient(params: LinearGradient): this {
    this.svg.linearGradient(params)
    return this
  }

  radialGradient(params: RadialGradient): this {
    this.svg.radialGradient(params)
    return this
  }
}
