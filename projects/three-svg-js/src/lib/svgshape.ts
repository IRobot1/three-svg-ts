import { BoxHelper, BufferGeometry, CanvasTexture, ClampToEdgeWrapping, Color, DoubleSide, Material, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, RepeatWrapping, Shape, ShapeGeometry, ShapePath, SRGBColorSpace, Texture, Vector2, Vector3 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

import { CircleParams, EllipseParams, Length, LinearGradient, LineParams, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RectParams, TextParams } from './types'
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { SVGShapeUtils } from "./shapeutils";

export interface SVGShapeOptions {
  width?: number;
  height?: number;
  viewBox?: Array<number>;
  zfix?: number;

  createStrokeMaterial?: () => Material;
  createFillMaterial?: () => Material;
  createGeometry?: (shapes?: Shape | Shape[], curveSegments?: number) => BufferGeometry;
}


export class SVGShape extends Object3D implements SVGShapeOptions {
  width = 400
  height = 300
  viewBox = [0, 0, 400, 300]
  zfix = 0.01

  createFillMaterial = this.defaultFillMaterial
  createStrokeMaterial = this.defaultStrokeMaterial
  createGeometry = this.defaultCreateGeometry

  paths: Array<ShapePath> = [];


  constructor(private options: SVGShapeOptions) {
    super()
    if (options.width) this.width = options.width
    if (options.height) this.height = options.height
    if (options.viewBox) this.viewBox = options.viewBox
    if (options.zfix) this.zfix = options.zfix
    if (options.createGeometry) this.createGeometry = options.createGeometry
    if (options.createStrokeMaterial) this.createStrokeMaterial = options.createStrokeMaterial
    if (options.createFillMaterial) this.createFillMaterial = options.createFillMaterial
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

  private addMesh(mesh: Object3D) {
    mesh.position.z = this.children.length * this.zfix
    this.add(mesh)
  }

  private renderStroke(shape: Shape, params: PresentationAttributes, divisions = 12) {
    let strokeWidth = SVGShapeUtils.parseFloatWithUnits(params.strokeWidth || 0);
    if (!strokeWidth && params.fill == 'transparent') strokeWidth = 1

    if (strokeWidth) {
      const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)
      if (params.strokeLineCap == 'round') divisions *= 2;
      const geometry = SVGLoader.pointsToStroke(shape.getPoints(divisions), style, divisions)

      const material = this.createStrokeMaterial()
      if (params.stroke)
        (<any>material).color.setStyle(params.stroke, SRGBColorSpace);

      const rect = new Mesh(geometry, material);
      this.addMesh(rect);
    }
  }

  private renderFill(shape: Shape, params: PresentationAttributes, divisions = 12) {
    if (params.fill === 'none') return;

    const geometry = new ShapeGeometry(shape, divisions)
    let box = geometry.boundingBox!
    if (!box) {
      geometry.computeBoundingBox()
      box = geometry.boundingBox!
    }
    const size = new Vector3()
    box.getSize(size)

    const material = this.createFillMaterial() as MeshBasicMaterial
    if (params.fill === 'transparent') {
      material.transparent = true;
      material.opacity = 0;
      if (params.fillOpacity) {
        material.opacity = params.fillOpacity;
      }
    }
    else if (params.fill) {
      if (params.fill.startsWith('url(#')) {
        const id = params.fill.substring(5).replace(')', '');
        material.color.setStyle('white', SRGBColorSpace);
        const texture = this.gradients.get(id)
        if (texture) {
          material.map = texture
          texture.repeat.set(1/size.x, 1/size.y)
          //texture.offset.set(0.9, 1.2)
        }
      }
      else
        material.color.setStyle(params.fill, SRGBColorSpace);

      if (params.fillOpacity) {
        material.transparent = true;
        material.opacity = params.fillOpacity;
      }
    }
    const mesh = new Mesh(geometry, material);
    this.addMesh(mesh);
  }

  rect(params: RectParams): this {
    const x = SVGShapeUtils.parseFloatWithUnits(params.x || 0);
    const y = -SVGShapeUtils.parseFloatWithUnits(params.y || 0);
    const rx = SVGShapeUtils.parseFloatWithUnits(params.rx || params.ry || 0);
    const ry = SVGShapeUtils.parseFloatWithUnits(params.ry || params.rx || 0);
    const w = SVGShapeUtils.parseFloatWithUnits(params.width, this.width);
    const h = SVGShapeUtils.parseFloatWithUnits(params.height, this.height);

    // Ellipse arc to Bezier approximation Coefficient (Inversed). See:
    // https://spencermortensen.com/articles/bezier-circle/
    const bci = 1 - 0.551915024494;

    const shape = new Shape();

    // top left
    shape.moveTo(x + rx, y);

    // top right
    shape.lineTo(x + w - rx, y);
    if (rx !== 0 || ry !== 0) {
      shape.bezierCurveTo(
        x + w - rx * bci,
        y,
        x + w,
        y - ry * bci,
        x + w,
        y - ry
      );
    }

    // bottom right
    shape.lineTo(x + w, y - h + ry);
    if (rx !== 0 || ry !== 0) {
      shape.bezierCurveTo(
        x + w,
        y - h + ry * bci,
        x + w - rx * bci,
        y - h,
        x + w - rx,
        y - h
      );
    }

    // bottom left
    shape.lineTo(x + rx, y - h);
    if (rx !== 0 || ry !== 0) {
      shape.bezierCurveTo(
        x + rx * bci,
        y - h,
        x,
        y - h + ry * bci,
        x,
        y - h + ry
      );
    }

    // back to top left
    shape.lineTo(x, y - ry);
    if (rx !== 0 || ry !== 0) {
      shape.bezierCurveTo(
        x,
        y - ry * bci,
        x + rx * bci,
        y,
        x + rx,
        y
      );
    }

    this.renderStroke(shape, params)
    this.renderFill(shape, params)
    return this;
  }

  circle(params: CircleParams): this {
    const x = SVGShapeUtils.parseFloatWithUnits(params.cx || 0);
    const y = -SVGShapeUtils.parseFloatWithUnits(params.cy || 0);
    const r = SVGShapeUtils.parseFloatWithUnits(params.r || 0);


    const shape = new Shape();
    shape.absarc(x, y, r, 0, Math.PI * 2, true);

    this.renderStroke(shape, params)
    this.renderFill(shape, params, 32)

    return this;
  }

  ellipse(params: EllipseParams): this {
    const x = SVGShapeUtils.parseFloatWithUnits(params.cx || 0);
    const y = -SVGShapeUtils.parseFloatWithUnits(params.cy || 0);
    const rx = SVGShapeUtils.parseFloatWithUnits(params.rx || 0);
    const ry = SVGShapeUtils.parseFloatWithUnits(params.ry || 0);

    const shape = new Shape();
    shape.absellipse(x, y, rx, ry, 0, Math.PI * 2, true);

    this.renderStroke(shape, params)
    this.renderFill(shape, params, 32)

    return this;
  }

  text(text: string, font: Font, params: TextParams): this {
    const x = SVGShapeUtils.parseFloatWithUnits(params.x || 0);
    const y = -SVGShapeUtils.parseFloatWithUnits(params.y || 0);
    const fontSize = SVGShapeUtils.parseFloatWithUnits(params.fontSize || 0);

    const geometry = new TextGeometry(text, { font, height: 0, size: fontSize * 0.8 })
    geometry.center()

    const size = new Vector3()
    if (!geometry.boundingBox) geometry.computeBoundingBox()
    if (geometry.boundingBox) geometry.boundingBox.getSize(size)

    if (params.textAnchor) {
      switch (params.textAnchor) {
        case 'start':
          geometry.translate(size.x / 2, 0, 0)
          break;
        case 'middle':
          // already centered
          break;
        case 'end':
          geometry.translate(-size.x / 2, 0, 0)
          break;
      }
    }


    const material = this.createFillMaterial()
    this.applyFill((<any>material).color, params);

    const mesh = new Mesh(geometry, material)
    mesh.position.set(x, y + size.y / 2, 0)
    this.addMesh(mesh)

    return this;
  }

  line(params: LineParams) {
    const x1 = SVGShapeUtils.parseFloatWithUnits(params.x1 || 0);
    const y1 = -SVGShapeUtils.parseFloatWithUnits(params.y1 || 0);
    const x2 = SVGShapeUtils.parseFloatWithUnits(params.x2 || 0);
    const y2 = -SVGShapeUtils.parseFloatWithUnits(params.y2 || 0);

    const shape = new Shape()
    shape.moveTo(x1, y1)
    shape.lineTo(x2, y2)

    this.renderStroke(shape, params)

    return this;
  }

  polyline(params: PolylineParams) {
    let index = 0;

    const iterator = (match: string, a: Length, b: Length): string => {

      const x = SVGShapeUtils.parseFloatWithUnits(a);
      const y = -SVGShapeUtils.parseFloatWithUnits(b);

      if (index === 0) {

        shape.moveTo(x, y);

      } else {

        shape.lineTo(x, y);

      }

      index++;
      return match
    }

    const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;

    const shape = new Shape();

    params.points?.replace(regex, iterator);

    this.renderStroke(shape, params)
    return this;
  }

  polygon(params: PolygonParams) {
    let index = 0;

    const iterator = (match: string, a: Length, b: Length): string => {

      const x = SVGShapeUtils.parseFloatWithUnits(a);
      const y = -SVGShapeUtils.parseFloatWithUnits(b);

      if (index === 0) {

        shape.moveTo(x, y);

      } else {

        shape.lineTo(x, y);

      }

      index++;
      return match
    }

    const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;

    const shape = new Shape();

    params.points?.replace(regex, iterator);

    shape.autoClose = true;

    this.renderStroke(shape, params)
    this.renderFill(shape, params)

    return this;
  }

  group(): SVGShape {
    const svg = new SVGShape(this.options)
    this.add(svg)
    return svg;
  }

  path(params: PathParams): this {
    if (!params.d) return this

    const shape = new Shape();

    SVGShapeUtils.parsePath(params.d, shape)


    const divisions = 32
    this.renderStroke(shape, params)
    this.renderFill(shape, params, divisions)

    return this;
  }

  private gradients = new Map<string, Texture>([]);

  linearGradient(params: LinearGradient): this {
    const CANVAS_SIZE = 100
    const x1 = SVGShapeUtils.parseFloatWithUnits(params.x1 || 0);
    const y1 = SVGShapeUtils.parseFloatWithUnits(params.y1 || 0);
    const x2 = params.x2 !== undefined ? SVGShapeUtils.parseFloatWithUnits(params.x2) * CANVAS_SIZE : CANVAS_SIZE;
    const y2 = params.y2 !== undefined ? SVGShapeUtils.parseFloatWithUnits(params.y2)*CANVAS_SIZE : 0;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    const options: CanvasRenderingContext2DSettings = { alpha: true }
    const context = canvas.getContext('2d', options);
    if (!context) return this;

    const gradient = context.createLinearGradient(x1, y1, x2 , y2);
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
    texture.wrapS = texture.wrapT= RepeatWrapping

    this.gradients.set(params.id, texture)
    return this;
  }

  private applyFill(color: Color, params: PresentationAttributes) {
    if (params.fill === 'none') return
    if (!params.fill || params.fill === 'transparent') {
      if (params.stroke)
        color.setStyle(params.stroke, SRGBColorSpace);
    }
    else if (params.fill)
      color.setStyle(params.fill, SRGBColorSpace);

    //transformPath( path, currentTransform );
  }

}
