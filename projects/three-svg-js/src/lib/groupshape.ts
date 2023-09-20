import { Object3D} from "three";
import { CircleParams, EllipseParams, LineParams, LinearGradient, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RectParams, TextParams } from "./types";
import { SVGOptions } from "./svgshape";
import { RectShape } from "./rectshape";
import { CircleShape } from "./circleshape";
import { EllipseShape } from "./ellipseshape";
import { TextShape } from "./textshape";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { LineShape } from "./lineshape";
import { PolylineShape } from "./polylineshape";
import { PolygonShape } from "./polygonshape";
import { PathShape } from "./pathshape";
import { BaseShape } from "./baseshape";

export class GroupShape extends BaseShape  {

  constructor(svg: SVGOptions, params: PresentationAttributes) {
    super(svg, params)
  }

  shapes: Array<BaseShape> = [];

  addShape(shape: BaseShape) {
    this.shapes.push(shape)
  }

  addMesh(mesh: Object3D) {
    mesh.position.z = this.children.length * this.svg.zfix!
    this.add(mesh)
  }


  update() {
    this.shapes.forEach(shape => shape.update())
  }

  group(params: PresentationAttributes): GroupShape {
    if (!params.fill) params.fill = this.params.fill
    if (!params.stroke) params.stroke = this.params.stroke
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const group = new GroupShape(this.svg, params)
    this.addShape(group)
    this.add(group)
    return group
  }

  rect(params: RectParams): this {
    if (!params.fill) params.fill = this.params.fill
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new RectShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  circle(params: CircleParams): this {
    if (!params.fill) params.fill = this.params.fill
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new CircleShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  ellipse(params: EllipseParams): this {
    if (!params.fill) params.fill = this.params.fill
    if (!params.stroke) params.stroke = this.params.stroke
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new EllipseShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  text(text: string, font: Font, params: TextParams): this {
    if (!params.fill) params.fill = this.params.fill
    //if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new TextShape(this.svg, this, text, font, params)
    this.addShape(shape)
    return this
  }

  line(params: LineParams):this {
    if (!params.stroke) params.stroke = this.params.stroke
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new LineShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  polyline(params: PolylineParams) {
    if (!params.stroke) params.stroke = this.params.stroke
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new PolylineShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  polygon(params: PolygonParams) {
    if (!params.stroke) params.stroke = this.params.stroke
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new PolygonShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  path(params: PathParams): this {
    if (!params.fill) params.fill = this.params.fill
    if (!params.stroke) params.stroke = this.params.stroke
    if (!params.strokeWidth) params.strokeWidth = this.params.strokeWidth

    const shape = new PathShape(this.svg, this, params)
    this.addShape(shape)
    return this
  }

  linearGradient(params: LinearGradient): this {
    this.svg.linearGradient(params)
    return this
  }
}
