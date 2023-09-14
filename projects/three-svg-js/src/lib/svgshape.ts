import { Path, ShapePath, SRGBColorSpace } from "three";

export type Length = number | string;

export interface SVGShapeOptions {
  width?: number;
  height?: number;
  viewBox?: Array<number>;
}

export interface PresentationAttributes {
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}

export class RectParams implements PresentationAttributes {
  x?: Length;
  y?: Length;
  width?: Length;
  height?: Length;
  rx?: Length;
  ry?: Length;
  //pathLength?: number | "none";

  // presentation attributes
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}

export class CircleParams implements PresentationAttributes {
  cx?: Length;
  cy?: Length;
  r?: Length;
  //pathLength?: number | "none";

  // presentation attributes
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}

export class TextParams implements PresentationAttributes {
  x?: Length;
  y?: Length;
  dx?: Length;
  dy?: Length;
  rotate?: Array<number>;
  lengthAdjust?: "spacing" | "spacingAndGlpyhs";
  textLength?: Length;

  // style attributes
  // fontfamiliy?:string;
  fontSize?: number;
  // fontSizeAdjust?:number;
  // fontStretch?:number;
  // fontStyle?:string;
  // fontVariant?:string;
  // fontWeight?:string;

  // presentation attributes
  textAnchor?: string;
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}

// Units

const units = ["mm", "cm", "in", "pt", "pc", "px"];

// Conversion: [ fromUnit ][ toUnit ] (-1 means dpi dependent)
const unitConversion:any = {
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

export class SVGShape implements SVGShapeOptions {
  width: number;
  height: number;
  viewBox: Array<number>;

  paths: Array<ShapePath> = [];

  // Default dots per inch
  defaultDPI = 90;

  // Accepted units: 'mm', 'cm', 'in', 'pt', 'pc', 'px'
  defaultUnit = "px";

  constructor(options?: SVGShapeOptions) {
    this.width = options?.width || 1;
    this.height = options?.height || 1;
    this.viewBox = options?.viewBox || []; //TODO: default viewbox?
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

    this.applyPresentation(path, params);
    this.paths.push(path);
    return this;
  }

  circle(params: CircleParams): this {
    const x = this.parseFloatWithUnits(params.cx || 0);
    const y = this.parseFloatWithUnits(params.cy || 0);
    const r = this.parseFloatWithUnits(params.r || 0);

    const subpath = new Path();
    subpath.absarc(x, y, r, 0, Math.PI * 2,true);

    const path = new ShapePath();
    path.subPaths.push(subpath);

    this.applyPresentation(path, params);
    this.paths.push(path);
    return this;
  }

  text(text: string, params: TextParams): this {
    return this;
  }

  private parseFloatWithUnits(length: Length | undefined, size = 0): number {
    if (!length) return 0;

    let theUnit = "px";

    let value = length.toString();
    if (typeof length === "string") {
      if (length.endsWith("%")) {
        value = size.toString();
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

  private applyPresentation(path: ShapePath, style: PresentationAttributes) {
    if (style.fill !== undefined && style.fill !== "none") {
      path.color.setStyle(style.fill, SRGBColorSpace);
    }

    //transformPath( path, currentTransform );
  }
}
