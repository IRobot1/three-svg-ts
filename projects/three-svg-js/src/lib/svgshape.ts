import { AxesHelper, BufferAttribute, BufferGeometry, Color, DoubleSide, Line, LineBasicMaterial, Material, Mesh, MeshBasicMaterial, Object3D, Path, Shape, ShapeGeometry, ShapePath, SRGBColorSpace, Vector2, Vector3 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import { CircleParams, EllipseParams, Length, LineParams, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RectParams, TextParams } from './types'
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

  private addMesh(mesh: Object3D) {
    mesh.position.z = this.children.length * this.zfix
    this.add(mesh)
  }

  private addShape(path: ShapePath) {

    const material = this.createMaterial(path.color)

    const shapes = SVGLoader.createShapes(path);

    for (let j = 0; j < shapes.length; j++) {
      const shape = shapes[j];
      const geometry = this.createGeometry(shape);
      const mesh = new Mesh(geometry, material);
      this.addMesh(mesh);
    }
  }

  rect(params: RectParams): this {
    const x = this.parseFloatWithUnits(params.x || 0);
    const y = -this.parseFloatWithUnits(params.y || 0);
    const rx = this.parseFloatWithUnits(params.rx || params.ry || 0);
    const ry = this.parseFloatWithUnits(params.ry || params.rx || 0);
    const w = this.parseFloatWithUnits(params.width, this.width);
    const h = this.parseFloatWithUnits(params.height, this.height);
    const strokeWidth = this.parseFloatWithUnits(params.strokeWidth || 0);

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

    const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)
    const geometry = SVGLoader.pointsToStroke(shape.getPoints(), style)//, arcDivisions, minDistance)

    const color = new Color()
    if (params.stroke)
      color.setStyle(params.stroke, SRGBColorSpace);
    // TODO: handle fill

    const material = new MeshBasicMaterial({ color })

    const rect = new Mesh(geometry, material);
    this.addMesh(rect);

    return this;
  }

  circle(params: CircleParams): this {
    const x = this.parseFloatWithUnits(params.cx || 0);
    const y = -this.parseFloatWithUnits(params.cy || 0);
    const r = this.parseFloatWithUnits(params.r || 0);

    const strokeWidth = this.parseFloatWithUnits(params.strokeWidth || 0);

    const shape = new Shape();
    shape.absarc(x, y, r, 0, Math.PI * 2, true);

    const divisions = 32
    let geometry: BufferGeometry;
    if (strokeWidth) {
      const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)
      const points = shape.getPoints(divisions)
      geometry = SVGLoader.pointsToStroke(points, style, divisions)
    }
    else {
      geometry = new ShapeGeometry(shape, divisions)
    }

    const color = new Color()
    if (params.stroke)
      color.setStyle(params.stroke, SRGBColorSpace);
    else if (params.fill)
      color.setStyle(params.fill, SRGBColorSpace);

    const material = new MeshBasicMaterial({ color })

    const circle = new Mesh(geometry, material);
    this.addMesh(circle);
    return this;
  }

  ellipse(params: EllipseParams): this {
    const x = this.parseFloatWithUnits(params.cx || 0);
    const y = -this.parseFloatWithUnits(params.cy || 0);
    const rx = this.parseFloatWithUnits(params.rx || 0);
    const ry = this.parseFloatWithUnits(params.ry || 0);
    const strokeWidth = this.parseFloatWithUnits(params.strokeWidth || 0);

    const shape = new Shape();
    shape.absellipse(x, y, rx, ry, 0, Math.PI * 2, true);

    const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)
    const divisions = 32
    const points = shape.getPoints(divisions)
    const geometry = SVGLoader.pointsToStroke(points, style, divisions)

    const color = new Color()
    if (params.stroke)
      color.setStyle(params.stroke, SRGBColorSpace);
    // TODO: handle fill

    const material = new MeshBasicMaterial({ color })

    const ellipse = new Mesh(geometry, material);
    this.addMesh(ellipse);

    return this;
  }

  text(text: string, font: Font, params: TextParams): this {
    const x = this.parseFloatWithUnits(params.x || 0);
    const y = -this.parseFloatWithUnits(params.y || 0);
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
    this.applyFill(color, params);

    const material = this.createMaterial(color)

    const mesh = new Mesh(geometry, material)
    mesh.position.set(x, y - size.y / 4, 0)
    this.addMesh(mesh)

    return this;
  }

  line(params: LineParams) {
    const x1 = this.parseFloatWithUnits(params.x1 || 0);
    const y1 = -this.parseFloatWithUnits(params.y1 || 0);
    const x2 = this.parseFloatWithUnits(params.x2 || 0);
    const y2 = -this.parseFloatWithUnits(params.y2 || 0);
    const strokeWidth = this.parseFloatWithUnits(params.strokeWidth || 0);

    const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)
    const geometry = SVGLoader.pointsToStroke([new Vector2(x1, y1), new Vector2(x2, y2)], style)//, arcDivisions, minDistance)

    const color = new Color()
    if (params.stroke)
      color.setStyle(params.stroke, SRGBColorSpace);

    const material = new MeshBasicMaterial({ color })

    const line = new Mesh(geometry, material);
    this.addMesh(line);

    return this;
  }

  polyline(params: PolylineParams) {
    const strokeWidth = this.parseFloatWithUnits(params.strokeWidth || 0);

    const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)

    const color = new Color()
    if (params.stroke)
      color.setStyle(params.stroke, SRGBColorSpace);

    const material = new MeshBasicMaterial({ color })


    let index = 0;

    const iterator = (match: string, a: Length, b: Length): string => {

      const x = this.parseFloatWithUnits(a);
      const y = -this.parseFloatWithUnits(b);


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

    //shape.autoClose = false;

    const points = shape.getPoints();
    const geometry = SVGLoader.pointsToStroke(points, style)//, arcDivisions, minDistance)

    const polyline = new Mesh(geometry, material);
    this.addMesh(polyline);
    return this;
  }

  polygon(params: PolygonParams) {
    const strokeWidth = this.parseFloatWithUnits(params.strokeWidth || 0);

    const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)

    const color = new Color()
    if (params.stroke)
      color.setStyle(params.stroke, SRGBColorSpace);

    const material = new MeshBasicMaterial({ color })


    let index = 0;

    const iterator = (match: string, a: Length, b: Length): string => {

      const x = this.parseFloatWithUnits(a);
      const y = -this.parseFloatWithUnits(b);


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

    const points = shape.getPoints();
    const geometry = SVGLoader.pointsToStroke(points, style)

    const polyline = new Mesh(geometry, material);
    this.addMesh(polyline);
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

    const point = new Vector2();
    const control = new Vector2();

    const firstPoint = new Vector2();
    let isFirstPoint = true;
    let doSetFirstPoint = false;

    const d = params.d

    if (d === '' || d === 'none') return this;

    const commands = d.match(/[a-df-z][^a-df-z]*/ig);
    if (!commands) return this

    for (let i = 0, l = commands.length; i < l; i++) {

      const command = commands[i];

      const type = command.charAt(0);
      const data = command.slice(1).trim();

      if (isFirstPoint === true) {

        doSetFirstPoint = true;
        isFirstPoint = false;

      }

      let numbers;

      switch (type) {

        case 'M':
          numbers = this.parseFloats(data);
          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x = numbers[j + 0];
            point.y = -numbers[j + 1];
            control.x = point.x;
            control.y = point.y;

            if (j === 0) {

              shape.moveTo(point.x, point.y);

            } else {

              shape.lineTo(point.x, point.y);

            }

            if (j === 0) firstPoint.copy(point);

          }

          break;

        case 'H':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.x = numbers[j];
            control.x = point.x;
            control.y = point.y;
            shape.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'V':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.y = -numbers[j];
            control.x = point.x;
            control.y = point.y;
            shape.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'L':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x = numbers[j + 0];
            point.y = -numbers[j + 1];
            control.x = point.x;
            control.y = point.y;
            shape.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'C':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 6) {

            shape.bezierCurveTo(
              numbers[j + 0],
              -numbers[j + 1],
              numbers[j + 2],
              -numbers[j + 3],
              numbers[j + 4],
              -numbers[j + 5]
            );
            control.x = numbers[j + 2];
            control.y = numbers[j + 3];
            point.x = numbers[j + 4];
            point.y = -numbers[j + 5];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'S':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            shape.bezierCurveTo(
              this.getReflection(point.x, control.x),
              this.getReflection(point.y, control.y),
              numbers[j + 0],
              -numbers[j + 1],
              numbers[j + 2],
              -numbers[j + 3]
            );
            control.x = numbers[j + 0];
            control.y = numbers[j + 1];
            point.x = numbers[j + 2];
            point.y = -numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'Q':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            shape.quadraticCurveTo(
              numbers[j + 0],
              -numbers[j + 1],
              numbers[j + 2],
              -numbers[j + 3]
            );
            control.x = numbers[j + 0];
            control.y = -numbers[j + 1];
            point.x = numbers[j + 2];
            point.y = -numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'T':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            const rx = this.getReflection(point.x, control.x);
            const ry = this.getReflection(point.y, control.y);
            shape.quadraticCurveTo(
              rx,
              ry,
              numbers[j + 0],
              -numbers[j + 1]
            );
            control.x = rx;
            control.y = -ry;
            point.x = numbers[j + 0];
            point.y = -numbers[j + 1];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'A':
          numbers = this.parseFloats(data, [3, 4], 7);

          for (let j = 0, jl = numbers.length; j < jl; j += 7) {

            // skip command if start point == end point
            if (numbers[j + 5] == point.x && numbers[j + 6] == point.y) continue;

            const start = point.clone();
            point.x = numbers[j + 5];
            point.y = -numbers[j + 6];
            control.x = point.x;
            control.y = point.y;
            this.parseArcCommand(
              shape, numbers[j], -numbers[j + 1], -numbers[j + 2], numbers[j + 3], numbers[j + 4], start, point
            );

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'm':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x += numbers[j + 0];
            point.y += -numbers[j + 1];
            control.x = point.x;
            control.y = point.y;

            if (j === 0) {

              shape.moveTo(point.x, point.y);

            } else {

              shape.lineTo(point.x, point.y);

            }

            if (j === 0) firstPoint.copy(point);

          }

          break;

        case 'h':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.x += numbers[j];
            control.x = point.x;
            control.y = point.y;
            shape.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'v':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.y += -numbers[j];
            control.x = point.x;
            control.y = point.y;
            shape.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'l':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x += numbers[j + 0];
            point.y += -numbers[j + 1];
            control.x = point.x;
            control.y = point.y;
            shape.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'c':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 6) {

            shape.bezierCurveTo(
              point.x + numbers[j + 0],
              point.y - numbers[j + 1],
              point.x + numbers[j + 2],
              point.y - numbers[j + 3],
              point.x + numbers[j + 4],
              point.y - numbers[j + 5]
            );
            control.x = point.x + numbers[j + 2];
            control.y = point.y + numbers[j + 3];
            point.x += numbers[j + 4];
            point.y += -numbers[j + 5];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 's':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            shape.bezierCurveTo(
              this.getReflection(point.x, control.x),
              this.getReflection(point.y, control.y),
              point.x + numbers[j + 0],
              point.y - numbers[j + 1],
              point.x + numbers[j + 2],
              point.y - numbers[j + 3]
            );
            control.x = point.x + numbers[j + 0];
            control.y = point.y - numbers[j + 1];
            point.x += numbers[j + 2];
            point.y += -numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'q':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            shape.quadraticCurveTo(
              point.x + numbers[j + 0],
              point.y - numbers[j + 1],
              point.x + numbers[j + 2],
              point.y - numbers[j + 3]
            );
            control.x = point.x + numbers[j + 0];
            control.y = point.y - numbers[j + 1];
            point.x += numbers[j + 2];
            point.y += -numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 't':
          numbers = this.parseFloats(data);

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            const rx = this.getReflection(point.x, control.x);
            const ry = this.getReflection(point.y, control.y);
            shape.quadraticCurveTo(
              rx,
              ry,
              point.x + numbers[j + 0],
              point.y - numbers[j + 1]
            );
            control.x = rx;
            control.y = -ry;
            point.x = point.x + numbers[j + 0];
            point.y = point.y - numbers[j + 1];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'a':
          numbers = this.parseFloats(data, [3, 4], 7);

          for (let j = 0, jl = numbers.length; j < jl; j += 7) {

            // skip command if no displacement
            if (numbers[j + 5] == 0 && numbers[j + 6] == 0) continue;

            const start = point.clone();
            point.x += numbers[j + 5];
            point.y += -numbers[j + 6];
            control.x = point.x;
            control.y = point.y;
            this.parseArcCommand(
              shape, numbers[j], -numbers[j + 1], -numbers[j + 2], numbers[j + 3], numbers[j + 4], start, point
            );

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'Z':
        case 'z':
          shape.autoClose = true;

          if (shape.curves.length > 0) {

            // Reset point to beginning of Path
            point.copy(firstPoint);
            shape.currentPoint.copy(point);
            isFirstPoint = true;

          }


          break;

        default:
          console.warn(command);

      }

      // console.log( type, parseFloats( data ), parseFloats( data ).length  )

      doSetFirstPoint = false;

    }

    let strokeWidth = this.parseFloatWithUnits(params.strokeWidth || 0);
    if (!strokeWidth && params.fill == 'transparent') strokeWidth = 1

    const divisions = 32
    if (strokeWidth) {
      const style = SVGLoader.getStrokeStyle(strokeWidth, params.stroke, params.strokeLineJoin, params.strokeLineCap, params.strokeMiterLimit)
      const points = shape.getPoints(divisions);
      const geometry = SVGLoader.pointsToStroke(points, style, divisions)


      const material = new MeshBasicMaterial()
      if (params.stroke)
        material.color.setStyle(params.stroke, SRGBColorSpace);

      const polyline = new Mesh(geometry, material);
      this.addMesh(polyline);
    }

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
    const polyline = new Mesh(geometry, material);
    this.addMesh(polyline);

    return this;
  }

  createFatLine(start: Vector2, end: Vector2, width: number): BufferGeometry {
    const dir = new Vector2().subVectors(end, start).normalize();

    // Create perpendicular vector
    const perp = new Vector2(-dir.y, dir.x).normalize().multiplyScalar(width / 2);

    // Calculate the four corner points
    const shape = new Shape()
    const a = new Vector2().addVectors(start, perp);
    shape.moveTo(a.x, a.y)
    const c = new Vector2().addVectors(end, perp);
    shape.lineTo(c.x, c.y)
    const d = new Vector2().subVectors(end, perp);
    shape.lineTo(d.x, d.y)
    const b = new Vector2().subVectors(start, perp);
    shape.lineTo(b.x, b.y)

    return this.createGeometry(shape)
  }


  private parseFloatWithUnits(length: Length | undefined, size = 0): number {
    if (!length) return 0;

    let theUnit = "px";

    let value = length.toString();
    if (typeof length === "string") {
      if (length.endsWith("%")) {
        value = (size * parseFloat(length) / 100).toString();
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

  private parseFloats(input: string, flags?: any, stride?: any) {

    // Character groups
    const RE = {
      SEPARATOR: /[ \t\r\n\,.\-+]/,
      WHITESPACE: /[ \t\r\n]/,
      DIGIT: /[\d]/,
      SIGN: /[-+]/,
      POINT: /\./,
      COMMA: /,/,
      EXP: /e/i,
      FLAGS: /[01]/
    };

    // States
    const SEP = 0;
    const INT = 1;
    const FLOAT = 2;
    const EXP = 3;

    let state = SEP;
    let seenComma = true;
    let number = '', exponent = '';
    const result: Array<any> = [];

    function throwSyntaxError(current: string, i: number, partial: any) {

      const error = new SyntaxError('Unexpected character "' + current + '" at index ' + i + '.');
      //error.partial = partial;
      throw error;

    }

    function newNumber() {

      if (number !== '') {

        if (exponent === '') result.push(Number(number));
        else result.push(Number(number) * Math.pow(10, Number(exponent)));

      }

      number = '';
      exponent = '';

    }

    let current;
    const length = input.length;

    for (let i = 0; i < length; i++) {

      current = input[i];

      // check for flags
      if (Array.isArray(flags) && flags.includes(result.length % stride) && RE.FLAGS.test(current)) {

        state = INT;
        number = current;
        newNumber();
        continue;

      }

      // parse until next number
      if (state === SEP) {

        // eat whitespace
        if (RE.WHITESPACE.test(current)) {

          continue;

        }

        // start new number
        if (RE.DIGIT.test(current) || RE.SIGN.test(current)) {

          state = INT;
          number = current;
          continue;

        }

        if (RE.POINT.test(current)) {

          state = FLOAT;
          number = current;
          continue;

        }

        // throw on double commas (e.g. "1, , 2")
        if (RE.COMMA.test(current)) {

          if (seenComma) {

            throwSyntaxError(current, i, result);

          }

          seenComma = true;

        }

      }

      // parse integer part
      if (state === INT) {

        if (RE.DIGIT.test(current)) {

          number += current;
          continue;

        }

        if (RE.POINT.test(current)) {

          number += current;
          state = FLOAT;
          continue;

        }

        if (RE.EXP.test(current)) {

          state = EXP;
          continue;

        }

        // throw on double signs ("-+1"), but not on sign as separator ("-1-2")
        if (RE.SIGN.test(current)
          && number.length === 1
          && RE.SIGN.test(number[0])) {

          throwSyntaxError(current, i, result);

        }

      }

      // parse decimal part
      if (state === FLOAT) {

        if (RE.DIGIT.test(current)) {

          number += current;
          continue;

        }

        if (RE.EXP.test(current)) {

          state = EXP;
          continue;

        }

        // throw on double decimal points (e.g. "1..2")
        if (RE.POINT.test(current) && number[number.length - 1] === '.') {

          throwSyntaxError(current, i, result);

        }

      }

      // parse exponent part
      if (state === EXP) {

        if (RE.DIGIT.test(current)) {

          exponent += current;
          continue;

        }

        if (RE.SIGN.test(current)) {

          if (exponent === '') {

            exponent += current;
            continue;

          }

          if (exponent.length === 1 && RE.SIGN.test(exponent)) {

            throwSyntaxError(current, i, result);

          }

        }

      }


      // end of number
      if (RE.WHITESPACE.test(current)) {

        newNumber();
        state = SEP;
        seenComma = false;

      } else if (RE.COMMA.test(current)) {

        newNumber();
        state = SEP;
        seenComma = true;

      } else if (RE.SIGN.test(current)) {

        newNumber();
        state = INT;
        number = current;

      } else if (RE.POINT.test(current)) {

        newNumber();
        state = FLOAT;
        number = current;

      } else {

        throwSyntaxError(current, i, result);

      }

    }

    // add the last number found (if any)
    newNumber();

    return result;

  }

  // http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes

  getReflection(a: number, b: number) {

    return a - (b - a);

  }

  svgAngle(ux: number, uy: number, vx: number, vy: number) {

    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    let ang = Math.acos(Math.max(- 1, Math.min(1, dot / len))); // floating point precision, slightly over values appear
    if ((ux * vy - uy * vx) < 0) ang = - ang;
    return ang;

  }
  parseArcCommand(path: Shape, rx: number, ry: number, x_axis_rotation: number, large_arc_flag: number, sweep_flag: number, start: Vector2, end: Vector2) {

    if (rx == 0 || ry == 0) {

      // draw a line if either of the radii == 0
      path.lineTo(end.x, end.y);
      return;

    }

    x_axis_rotation = x_axis_rotation * Math.PI / 180;

    // Ensure radii are positive
    rx = Math.abs(rx);
    ry = Math.abs(ry);

    // Compute (x1', y1')
    const dx2 = (start.x - end.x) / 2.0;
    const dy2 = (start.y - end.y) / 2.0;
    const x1p = Math.cos(x_axis_rotation) * dx2 + Math.sin(x_axis_rotation) * dy2;
    const y1p = - Math.sin(x_axis_rotation) * dx2 + Math.cos(x_axis_rotation) * dy2;

    // Compute (cx', cy')
    let rxs = rx * rx;
    let rys = ry * ry;
    const x1ps = x1p * x1p;
    const y1ps = y1p * y1p;

    // Ensure radii are large enough
    const cr = x1ps / rxs + y1ps / rys;

    if (cr > 1) {

      // scale up rx,ry equally so cr == 1
      const s = Math.sqrt(cr);
      rx = s * rx;
      ry = s * ry;
      rxs = rx * rx;
      rys = ry * ry;

    }

    const dq = (rxs * y1ps + rys * x1ps);
    const pq = (rxs * rys - dq) / dq;
    let q = Math.sqrt(Math.max(0, pq));
    if (large_arc_flag === sweep_flag) q = - q;
    const cxp = q * rx * y1p / ry;
    const cyp = - q * ry * x1p / rx;

    // Step 3: Compute (cx, cy) from (cx', cy')
    const cx = Math.cos(x_axis_rotation) * cxp - Math.sin(x_axis_rotation) * cyp + (start.x + end.x) / 2;
    const cy = Math.sin(x_axis_rotation) * cxp + Math.cos(x_axis_rotation) * cyp + (start.y + end.y) / 2;

    // Step 4: Compute θ1 and Δθ
    const theta = this.svgAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    const delta = this.svgAngle((x1p - cxp) / rx, (y1p - cyp) / ry, (- x1p - cxp) / rx, (- y1p - cyp) / ry) % (Math.PI * 2);

    path.absellipse(cx, cy, rx, ry, theta, theta + delta, sweep_flag !== 0, x_axis_rotation);

  }
}
