import { BufferGeometry, Color, Material, Mesh, MeshBasicMaterial, Object3D, Shape, ShapeGeometry, ShapePath, SRGBColorSpace, Vector3 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import { CircleParams, EllipseParams, Length, LineParams, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RectParams, TextParams } from './types'
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { SVGShapeUtils } from "./shapeutils";

export interface SVGShapeOptions {
  width?: number;
  height?: number;
  viewBox?: Array<number>;
  zfix?: number;

  createMaterial?: (color: Color) => Material;
  createGeometry?: (shapes?: Shape | Shape[], curveSegments?: number) => BufferGeometry;
}


export class SVGShape extends Object3D implements SVGShapeOptions {
  width = 400
  height = 300
  viewBox = [0, 0, 400, 300]
  zfix = 0.01

  createMaterial = this.defaultCreateMaterial
  createGeometry = this.defaultCreateGeometry

  paths: Array<ShapePath> = [];


  constructor(private options: SVGShapeOptions) {
    super()
    if (options.width) this.width = options.width
    if (options.height) this.height = options.height
    if (options.viewBox) this.viewBox = options.viewBox
    if (options.zfix) this.zfix = options.zfix
    if (options.createGeometry) this.createGeometry = options.createGeometry
    if (options.createMaterial) this.createMaterial = options.createMaterial
  }

  private defaultCreateMaterial(color: Color): Material {
    return new MeshBasicMaterial({ color });
  }

  private defaultCreateGeometry(shapes?: Shape | Shape[], curveSegments?: number): BufferGeometry {
    return new ShapeGeometry(shapes)
  }

  private addMesh(mesh: Object3D) {
    mesh.position.z = this.children.length * this.zfix
    this.add(mesh)
  }

  private renderStroke(shape: Shape, params: PresentationAttributes) {
    let strokeWidth = SVGShapeUtils.parseFloatWithUnits(params.strokeWidth || 0);
    if (!strokeWidth && params.fill == 'transparent') strokeWidth = 1

    if (strokeWidth) {
      const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)
      const geometry = SVGLoader.pointsToStroke(shape.getPoints(), style)

      const material = new MeshBasicMaterial()
      if (params.stroke)
        material.color.setStyle(params.stroke, SRGBColorSpace);

      const rect = new Mesh(geometry, material);
      this.addMesh(rect);
    }
  }

  private renderFill(shape: Shape, params: PresentationAttributes, divisions = 12) {
    if (params.fill === 'none') return;

    const geometry = new ShapeGeometry(shape, divisions)
    const material = new MeshBasicMaterial({ color: 0 })
    if (params.fill === 'transparent') {
      material.transparent = true;
      material.opacity = 0;
      if (params.fillOpacity) {
        material.opacity = params.fillOpacity;
      }
    }
    else if (params.fill) {
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
    this.renderFill(shape, params)

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
    this.renderFill(shape, params)

    return this;
  }

  text(text: string, font: Font, params: TextParams): this {
    const x = SVGShapeUtils.parseFloatWithUnits(params.x || 0);
    const y = -SVGShapeUtils.parseFloatWithUnits(params.y || 0);
    const fontSize = SVGShapeUtils.parseFloatWithUnits(params.fontSize || 0);

    const geometry = new TextGeometry(text, { font, height: 0, size: fontSize })
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

    const color = new Color()
    this.applyFill(color, params);

    const material = this.createMaterial(color)

    const mesh = new Mesh(geometry, material)
    mesh.position.set(x, y - size.y / 4, 0)
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
