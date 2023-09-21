import { BufferGeometry, CanvasTexture, DoubleSide, Material, MeshBasicMaterial, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace, Texture } from "three";
import { LinearGradient } from './types'
import { SVGShapeUtils } from "./shapeutils";
import { GroupShape } from "./groupshape";
import { ShapeSchema, ShapeTypes } from "./schema";
import { RectShape } from "./rectshape";
import { BaseShape } from "./baseshape";

export interface SVGShapeOptions {
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
  zfix = 0.01

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
    return new MeshBasicMaterial({ color: 0, side: DoubleSide });
  }

  private defaultFillMaterial(): Material {
    return new MeshBasicMaterial({ color: 0 });
  }

  private defaultCreateGeometry(shapes?: Shape | Shape[], curveSegments?: number): BufferGeometry {
    return new ShapeGeometry(shapes)
  }

  private pathids = new Map<string, Shape>([])
  addPathId(id: string, shape: Shape) {
    this.pathids.set(id, shape)
  }
  getPathById(id: string): Shape | undefined {
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
}


export class SVGShape extends GroupShape {

  constructor(options?: SVGShapeOptions) {
    super(new SVGOptions(options ?? {}), {})
  }

  private loadElements(group: GroupShape, elements: Array<ShapeTypes>) {
    elements.forEach(item => {
      if (item.rect) group.rect(item.rect)
      if (item.group) {
        let options = item.group.options ?? {}
        const group = this.group(options)
        this.loadElements(group, item.group.elements)
      }
    })
  }

  private saveElements(shapes: Array<BaseShape>): Array<ShapeTypes> {
    const elements: Array<ShapeTypes> = []
    shapes.forEach(shape => {
      switch (shape.shapetype) {
        case 'circle':
          break;
        case 'ellipse':
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
          break;
        case 'path':
          break;
        case 'polygon':
          break;
        case 'polyline':
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
          break;
      }
    })
    return elements
  }

  load(schema: ShapeSchema) {
    if (schema.options) this.svg = new SVGOptions(schema.options)
    this.loadElements(this, schema.elements)
  }

  save(): ShapeSchema {
    const s = this.svg as SVGShapeOptions
    const schema: ShapeSchema = {
      options: { width: s.width, height: s.height, viewBox: s.viewBox },
      elements: this.saveElements(this.shapes)
    }


    return schema
  }
}
