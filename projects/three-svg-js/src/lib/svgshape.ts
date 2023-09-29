import { Box3, BufferGeometry, CanvasTexture, DoubleSide, Material, MeshBasicMaterial, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace, Texture, Vector2, Vector3 } from "three";
import { LinearGradient, PresentationAttributes, RadialGradient } from './types'
import { SVGShapeUtils } from "./shapeutils";
import { GroupShape } from "./groupshape";
import { SVGSchema, ShapeTypes } from "./schema";
import { RectShape } from "./rectshape";
import { BaseShape } from "./baseshape";
import { TextShape } from "./textshape";
import { PolylineShape } from "./polylineshape";
import { PolygonShape } from "./polygonshape";
import { PathShape } from "./pathshape";
import { LineShape } from "./lineshape";
import { EllipseShape } from "./ellipseshape";
import { CircleShape } from "./circleshape";
import { ShapePathEx } from "./shapepathex";
import { SVGParser } from "./svgparser";

export interface SVGShapeOptions extends PresentationAttributes {
  width?: number;
  height?: number;
  viewBox?: Array<number>;
  zfix?: number;

  createStrokeMaterial?: () => Material;
  createFillMaterial?: () => Material;
  createGeometry?: (shapes?: Shape | Shape[], curveSegments?: number) => BufferGeometry;
}

export class SVGOptions implements SVGShapeOptions {
  private _width = 400
  get width() { return this._width }
  set width(newvalue: number) {
    if (newvalue != this._width) {
      this._width = newvalue
      this.viewBox = [this.viewBox[0], this.viewBox[1], newvalue, this.viewBox[3]]
    }
  }

  private _height = 300
  get height() { return this._height }
  set height(newvalue: number) {
    if (newvalue != this._height) {
      this._height = newvalue;
      this.viewBox = [this.viewBox[0], this.viewBox[1], this.viewBox[2], newvalue]
    }
  }
  viewBox: Array<number> = [0, 0, 400, 300]
  zfix = -0.1

  createStrokeMaterial: () => Material;
  createFillMaterial: () => Material;
  createGeometry: (shapes?: Shape | Shape[], curveSegments?: number) => BufferGeometry;

  constructor(options: SVGShapeOptions) {
    this.createGeometry = this.defaultCreateGeometry
    this.createStrokeMaterial = this.defaultStrokeMaterial
    this.createFillMaterial = this.defaultFillMaterial

    if (options.width !== undefined) this.width = options.width
    if (options.height !== undefined) this.height = options.height
    if (options.viewBox !== undefined) this.viewBox = options.viewBox
    if (options.zfix !== undefined) this.zfix = options.zfix
    if (options.createGeometry !== undefined) this.createGeometry = options.createGeometry
    if (options.createStrokeMaterial !== undefined) this.createStrokeMaterial = options.createStrokeMaterial
    if (options.createFillMaterial !== undefined) this.createFillMaterial = options.createFillMaterial
  }

  private defaultStrokeMaterial(): Material {
    return new MeshBasicMaterial({ color: 0, depthTest: true });
  }

  private defaultFillMaterial(): Material {
    return new MeshBasicMaterial({ color: 0, depthWrite: false });
  }

  private defaultCreateGeometry(shapes?: Shape | Shape[], curveSegments?: number): BufferGeometry {
    return new ShapeGeometry(shapes, curveSegments)
  }

  private pathids = new Map<string, ShapePathEx>([])
  addPathId(id: string, shape: ShapePathEx) {
    this.pathids.set(id, shape)
  }
  getPathById(id: string): ShapePathEx | undefined {
    return this.pathids.get(id)
  }

  private gradients = new Map<string, Texture>([]);
  addGradientId(id: string, texture: Texture) {
    this.gradients.set(id, texture)
  }
  getGradientById(id: string): Texture | undefined {
    return this.gradients.get(id)
  }

  linearGradient(params: LinearGradient): this {
    if (params.gradientTransform) {
      console.warn('gradientTransform not implemented');
    }
    const CANVAS_SIZE = 100
    const x1 = SVGShapeUtils.parseFloatWithUnits(params.x1 || 0);
    const y1 = SVGShapeUtils.parseFloatWithUnits(params.y1 || 0);
    const x2 = params.x2 !== undefined ? SVGShapeUtils.parseFloatWithUnits(params.x2) * CANVAS_SIZE : CANVAS_SIZE;
    const y2 = params.y2 !== undefined ? SVGShapeUtils.parseFloatWithUnits(params.y2) * CANVAS_SIZE : 0;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    const options: CanvasRenderingContext2DSettings = { alpha: true }
    const context = canvas.getContext('2d', options);
    if (!context) return this;

    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    //console.warn(x1, y1, x2, y2)
    params.stops.forEach(stop => {
      let offset = 0
      if (typeof stop.offset === 'string')
        offset = parseFloat(stop.offset) / 100
      else
        offset = <number>stop.offset
      let color = 'black'
      if (stop.stopColor) color = stop.stopColor
      gradient.addColorStop(offset, color);
      //console.warn(offset, color)
    })

    context.fillStyle = gradient;
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping

    this.gradients.set(params.id, texture)
    return this;
  }

  radialGradient(params: RadialGradient): this {
    if (params.gradientUnits == 'userSpaceOnUse') {
      console.warn('radial gradient userSpaceOnUse not supported')
      return this
    }
    if (params.gradientTransform) {
      console.warn('gradientTransform not implemented');
    }

    const CANVAS_SIZE = 100
    const cx = SVGShapeUtils.parseFloatWithUnits(params.cx || 0.5, 1)
    const cy = SVGShapeUtils.parseFloatWithUnits(params.cy || 0.5, 1)
    const r = SVGShapeUtils.parseFloatWithUnits(params.r || 0.5, 1)
    //const fx = SVGShapeUtils.parseFloatWithUnits(params.fx, 1) || cx
    //const fy = SVGShapeUtils.parseFloatWithUnits(params.fy, 1) || cy
    //console.warn(params, cx, cy, r)

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    const options: CanvasRenderingContext2DSettings = { alpha: true }
    const context = canvas.getContext('2d', options);
    if (!context) return this;

    // createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number)
    // Inner circle x0, y0, r0
    // Outer circle x1, y1, r1
    const gradient = context.createRadialGradient(CANVAS_SIZE * cx, CANVAS_SIZE * (1 - cy), 0, CANVAS_SIZE * cx, CANVAS_SIZE * (1 - cy), CANVAS_SIZE * r);
    params.stops.forEach(stop => {
      let offset = 0
      if (typeof stop.offset === 'string')
        offset = SVGShapeUtils.parseFloatWithUnits(stop.offset, 1)
      else
        offset = <number>stop.offset
      let color = 'black'
      if (stop.stopColor) color = stop.stopColor
      gradient.addColorStop(offset, color);
      //console.warn(offset, color)
    })

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace;
    //texture.wrapS = texture.wrapT = RepeatWrapping

    this.gradients.set(params.id, texture)
    return this;
  }
}

export class SVGShape extends GroupShape {

  constructor(options?: SVGShapeOptions) {
    if (!options) options = {}
    super(new SVGOptions(options), options)
  }

  loadSVG(text: string): SVGSchema {
    const parser = new SVGParser()
    const schema = parser.parse(text)
    this.loadSchema(schema)
    return schema
  }

  center(): Box3 {
    const box = new Box3()
    box.setFromObject(this)

    const center = new Vector3()
    box.getCenter(center)

    this.translateX(-center.x)
    this.translateY(-center.y)

    box.getSize(center)
    return box
  }

  private loadElements(group: GroupShape, elements: Array<ShapeTypes>) {
    elements.forEach(item => {
      if (item.rect) group.rect(item.rect)
      if (item.circle) group.circle(item.circle)
      if (item.ellipse) group.ellipse(item.ellipse)
      if (item.line) group.line(item.line)
      if (item.path) group.path(item.path)
      if (item.polygon) group.polygon(item.polygon)
      if (item.polyline) group.polyline(item.polyline)
      if (item.text) group.text(item.text)

      if (item.group) {
        let options = item.group.options
        if (!options) options = {}
        const newgroup = group.group(options)
        this.loadElements(newgroup, item.group.elements)
      }
    })
  }

  private saveElements(shapes: Array<BaseShape>): Array<ShapeTypes> {
    const elements: Array<ShapeTypes> = []
    shapes.forEach(shape => {
      switch (shape.shapetype) {
        case 'circle':
          const circle = shape as CircleShape
          elements.push({
            circle: {
              cx: circle.cx, cy: circle.cy, r: circle.r, ...circle.params
            }
          })
          break;
        case 'ellipse':
          const ellipse = shape as EllipseShape
          elements.push({
            ellipse: {
              cx: ellipse.cx, cy: ellipse.cy, rx: ellipse.rx, ry: ellipse.ry, ...ellipse.params
            }
          })
          break;
        case 'group': {
          const group = shape as GroupShape
          elements.push({
            group: {
              options: group.params,
              elements: this.saveElements(group.shapes)
            }
          })
        }
          break;
        case 'line':
          const line = shape as LineShape
          elements.push({
            line: {
              x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, ...line.params
            }
          })
          break;
        case 'path':
          const path = shape as PathShape
          elements.push({
            path: {
              id: path.pathid, d: path.d, ...path.params
            }
          })
          break;
        case 'polygon':
          const polygon = shape as PolygonShape
          elements.push({
            polygon: {
              points: polygon.points, ...polygon.params
            }
          })
          break;
        case 'polyline':
          const polyline = shape as PolylineShape
          elements.push({
            polyline: {
              points: polyline.points, ...polyline.params
            }
          })
          break;
        case 'rect': {
          const rect = shape as RectShape
          elements.push({
            rect: {
              x: rect.x, y: rect.y, rx: rect.rx, ry: rect.ry, width: rect.w, height: rect.h, ...rect.params
            }
          })
        }
          break;
        case 'text':
          const text = shape as TextShape
          elements.push({
            text: {
              x: text.x, y: text.y, dx: text.dx, dy: text.dy, ...text.params
            }
          })
          break;
      }
    })
    return elements
  }

  loadSchema(schema: SVGSchema) {
    if (schema.options) this.svg = new SVGOptions(schema.options)
    if (schema.gradients) {
      schema.gradients.forEach(gradient => {
        if (gradient.type == 'linear')
          this.svg.linearGradient(gradient)
        else if (gradient.type == 'radial')
          this.svg.radialGradient(gradient)
      })
    }
    this.loadElements(this, schema.elements)
  }

  saveSchema(): SVGSchema {
    const s = this.svg as SVGShapeOptions
    const schema: SVGSchema = {
      options: { width: s.width, height: s.height, viewBox: s.viewBox },
      elements: this.saveElements(this.shapes)
    }

    return schema
  }
}
