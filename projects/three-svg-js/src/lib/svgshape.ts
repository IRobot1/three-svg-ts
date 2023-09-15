import { AxesHelper, BufferGeometry, Color, DoubleSide, Material, Mesh, MeshBasicMaterial, Object3D, Path, Shape, ShapeGeometry, ShapePath, SRGBColorSpace, Vector3 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import { CircleParams, Length, PresentationAttributes, RectParams, TextParams } from './types'
import { Font } from "three/examples/jsm/loaders/FontLoader";

export interface SVGShapeOptions {
  width?: number;
  height?: number;
  viewBox?: Array<number>;
  zfix?: number;

  createMaterial?: (color: Color) => Material;
  createGeometry?: (shapes?: Shape | Shape[], curveSegments?: number) => BufferGeometry;
}


// Units

const units = ["mm", "cm", "in", "pt", "pc", "px"];

// Conversion: [ fromUnit ][ toUnit ] (-1 means dpi dependent)
const unitConversion: any = {
  mm: {
    mm: 1,
    cm: 0.1,
    in: 1 / 25.4,
    pt: 72 / 25.4,
    pc: 6 / 25.4,
    px: -1
  },
  cm: {
    mm: 10,
    cm: 1,
    in: 1 / 2.54,
    pt: 72 / 2.54,
    pc: 6 / 2.54,
    px: -1
  },
  in: {
    mm: 25.4,
    cm: 2.54,
    in: 1,
    pt: 72,
    pc: 6,
    px: -1
  },
  pt: {
    mm: 25.4 / 72,
    cm: 2.54 / 72,
    in: 1 / 72,
    pt: 1,
    pc: 6 / 72,
    px: -1
  },
  pc: {
    mm: 25.4 / 6,
    cm: 2.54 / 6,
    in: 1 / 6,
    pt: 72 / 6,
    pc: 1,
    px: -1
  },
  px: {
    px: 1
  }
};

export class SVGShape extends Object3D implements SVGShapeOptions {
  width = 400
  height = 300
  viewBox = [0, 0, 400, 300]
  zfix = 0.01

  createMaterial = this.defaultCreateMaterial
  createGeometry = this.defaultCreateGeometry

  paths: Array<ShapePath> = [];

  // Default dots per inch
  defaultDPI = 90;

  // Accepted units: 'mm', 'cm', 'in', 'pt', 'pc', 'px'
  defaultUnit = "px";

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

  private addMesh(mesh: Mesh) {
    mesh.position.z = this.children.length * this.zfix
    this.add(mesh)
  }

  private addShape(path: ShapePath): this {

    const material = this.createMaterial(path.color)

    const shapes = SVGLoader.createShapes(path);

    for (let j = 0; j < shapes.length; j++) {
      const shape = shapes[j];
      const geometry = this.createGeometry(shape);
      const mesh = new Mesh(geometry, material);
      this.addMesh(mesh);
    }

    return this;
  }

  rect(params: RectParams): this {
    const x = this.parseFloatWithUnits(params.x || 0);
    const y = this.parseFloatWithUnits(params.y || 0);
    const rx = this.parseFloatWithUnits(params.rx || params.ry || 0);
    const ry = this.parseFloatWithUnits(params.ry || params.rx || 0);
    const w = this.parseFloatWithUnits(params.width, this.width);
    const h = this.parseFloatWithUnits(params.height, this.height);

    // Ellipse arc to Bezier approximation Coefficient (Inversed). See:
    // https://spencermortensen.com/articles/bezier-circle/
    const bci = 1 - 0.551915024494;

    const path = new ShapePath();

    // top left
    path.moveTo(x + rx, y);

    // top right
    path.lineTo(x + w - rx, y);
    if (rx !== 0 || ry !== 0) {
      path.bezierCurveTo(
        x + w - rx * bci,
        y,
        x + w,
        y + ry * bci,
        x + w,
        y + ry
      );
    }

    // bottom right
    path.lineTo(x + w, y + h - ry);
    if (rx !== 0 || ry !== 0) {
      path.bezierCurveTo(
        x + w,
        y + h - ry * bci,
        x + w - rx * bci,
        y + h,
        x + w - rx,
        y + h
      );
    }

    // bottom left
    path.lineTo(x + rx, y + h);
    if (rx !== 0 || ry !== 0) {
      path.bezierCurveTo(
        x + rx * bci,
        y + h,
        x,
        y + h - ry * bci,
        x,
        y + h - ry
      );
    }

    // back to top left
    path.lineTo(x, y + ry);
    if (rx !== 0 || ry !== 0) {
      path.bezierCurveTo(x, y + ry * bci, x + rx * bci, y, x + rx, y);
    }

    this.applyFill(path.color, params.fill);
    this.addShape(path)

    return this;
  }

  circle(params: CircleParams): this {
    const x = this.parseFloatWithUnits(params.cx || 0);
    const y = this.parseFloatWithUnits(params.cy || 0);
    const r = this.parseFloatWithUnits(params.r || 0);

    const subpath = new Path();
    subpath.absarc(x, y, r, 0, Math.PI * 2, true);

    const path = new ShapePath();
    path.subPaths.push(subpath);

    this.applyFill(path.color, params.fill);
    this.addShape(path)
    return this;
  }

  text(text: string, font: Font, params: TextParams): this {
    const x = this.parseFloatWithUnits(params.x || 0);
    const y = this.parseFloatWithUnits(params.y || 0);
    const fontSize = this.parseFloatWithUnits(params.fontSize || 0);

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
    this.applyFill(color, params.fill);

    const material = this.createMaterial(color)

    const mesh = new Mesh(geometry, material)
    mesh.position.set(x, y - size.y / 4, 0)
    this.addMesh(mesh)

    return this;
  }

  private parseFloatWithUnits(length: Length | undefined, size = 0): number {
    if (!length) return 0;

    let theUnit = "px";

    let value = length.toString();
    if (typeof length === "string") {
      if (length.endsWith("%")) {
        console.warn(size, parseFloat(length))
        value = (size * parseFloat(length) / 100 ).toString();
      } else {
        for (let i = 0, n = units.length; i < n; i++) {
          const u = units[i];

          if (length.endsWith(u)) {
            theUnit = u;
            value = length.substring(0, length.length - u.length);
            break;
          }
        }
      }
    }

    let scale = undefined;

    if (theUnit === "px" && this.defaultUnit !== "px") {
      // Conversion scale from  pixels to inches, then to default units

      scale = unitConversion["in"][this.defaultUnit] / this.defaultDPI;
    } else {
      scale = unitConversion[theUnit][this.defaultUnit];

      if (scale < 0) {
        // Conversion scale to pixels

        scale = unitConversion[theUnit]["in"] * this.defaultDPI;
      }
    }

    return scale * parseFloat(value);
  }

  private applyFill(color: Color, fill?: string) {
    if (fill !== undefined && fill !== "none") {
      color.setStyle(fill, SRGBColorSpace);
    }

    //transformPath( path, currentTransform );
  }
}
