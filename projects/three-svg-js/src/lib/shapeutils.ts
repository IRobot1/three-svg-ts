import { Object3D, Path, Vector2, Vector3 } from "three";

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


export class SVGShapeUtils {
  // Default dots per inch
  static defaultDPI = 90;

  // Accepted units: 'mm', 'cm', 'in', 'pt', 'pc', 'px'
  static defaultUnit = "px";

  static parseFloatWithUnits(length: string | number | undefined | null, size = 0): number {
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

  static parsePath(d: string, shape: Path) {
    const point = new Vector2();
    const control = new Vector2();

    const firstPoint = new Vector2();
    let isFirstPoint = true;
    let doSetFirstPoint = false;

    if (d === '' || d === 'none') return;

    const commands = d.match(/[a-df-z][^a-df-z]*/ig);
    if (!commands) return

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

  }

  static parseFloats(input: string, flags?: any, stride?: any) {

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

  private static getReflection(a: number, b: number) {

    // http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes
    return a - (b - a);

  }

  private static svgAngle(ux: number, uy: number, vx: number, vy: number) {

    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    let ang = Math.acos(Math.max(- 1, Math.min(1, dot / len))); // floating point precision, slightly over values appear
    if ((ux * vy - uy * vx) < 0) ang = - ang;
    return ang;

  }

  private static parseArcCommand(path: Path, rx: number, ry: number, x_axis_rotation: number, large_arc_flag: number, sweep_flag: number, start: Vector2, end: Vector2) {

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
    if (large_arc_flag !== sweep_flag) q = - q;
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

  static processTransform(object: Object3D, transformText: string) {
    //const transform = new Matrix3();
    //const currentTransform = tempTransform0;

    //if (node.nodeName === 'use' && (node.hasAttribute('x') || node.hasAttribute('y'))) {

    //  const tx = parseFloatWithUnits(node.getAttribute('x'));
    //  const ty = parseFloatWithUnits(node.getAttribute('y'));

    //  transform.translate(tx, ty);

    //}


    const transformsTexts = transformText.split(')');

    for (let tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex--) {

      const transformText = transformsTexts[tIndex].trim();

      if (transformText === '') continue;

      const openParPos = transformText.indexOf('(');
      const closeParPos = transformText.length;

      if (openParPos > 0 && openParPos < closeParPos) {

        const transformType = transformText.slice(0, openParPos);

        const array = this.parseFloats(transformText.slice(openParPos + 1));

        //currentTransform.identity();

        switch (transformType) {

          case 'translate':

            if (array.length >= 1) {

              const tx = array[0];
              object.translateX(tx)

              let ty = 0;
              if (array.length >= 2) {
                ty = array[1];
              }
              object.translateY(ty)
            }

            break;

          case 'rotate':
            if (array.length >= 1) {

              let angle = 0;
              let cx = 0;
              let cy = 0;

              // Angle
              angle = array[0] * Math.PI / 180;

              if (array.length >= 3) {

                // Center x, y
                cx = array[1];
                cy = array[2];

              }

              // Rotate around center (cx, cy)
              object.rotateOnAxis(new Vector3(cx, cy, 1), angle)
            }

            break;

          case 'scale':

            if (array.length >= 1) {

              const scaleX = array[0];
              let scaleY = scaleX;

              if (array.length >= 2) {

                scaleY = array[1];

              }

              //currentTransform.scale(scaleX, scaleY);
              object.scale.set(scaleX, scaleY, 1)

            }

            break;

          //case 'skewX':

          //  if (array.length === 1) {

          //    currentTransform.set(
          //      1, Math.tan(array[0] * Math.PI / 180), 0,
          //      0, 1, 0,
          //      0, 0, 1
          //    );

          //  }

          //  break;

          //case 'skewY':

          //  if (array.length === 1) {

          //    currentTransform.set(
          //      1, 0, 0,
          //      Math.tan(array[0] * Math.PI / 180), 1, 0,
          //      0, 0, 1
          //    );

          //  }

          //  break;

          //case 'matrix':

          //  if (array.length === 6) {

          //    currentTransform.set(
          //      array[0], array[2], array[4],
          //      array[1], array[3], array[5],
          //      0, 0, 1
          //    );

          //  }

          //  break;
          default:
            console.warn(`Transform ${transformType} not implemented`)
            break;
        }

      }

      //transform.premultiply(currentTransform);

    }


    //return transform;

  }
}
