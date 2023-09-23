import { ShapePath, Vector2 } from "three";
import { PathCommand } from "./shapeutils";

export class ShapePathEx extends ShapePath {

  arc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): this {

    this.currentPath?.arc(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise);

    return this;

  }

  absarc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean) {

    this.currentPath?.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);

    return this;

  }

  ellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation: number) {

    this.currentPath?.ellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;

  }

  absellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation: number) {

    this.currentPath?.absellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;
  }

  closePath() {
    if (this.currentPath && this.currentPath.curves.length > 0)
      this.currentPath.closePath()
  }
}


export class SVGShapePath extends ShapePathEx {

  generate(pathcommands: Array<PathCommand>) {
    const point = new Vector2();
    const control = new Vector2();

    const firstPoint = new Vector2();
    let isFirstPoint = true;
    let doSetFirstPoint = false;

    pathcommands.forEach(command => {
      if (isFirstPoint === true) {

        doSetFirstPoint = true;
        isFirstPoint = false;

      }

      let numbers = command.values

      switch (command.type) {

        case 'M':

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x = numbers[j + 0];
            point.y = numbers[j + 1];
            control.x = point.x;
            control.y = point.y;

            if (j === 0) {

              this.moveTo(point.x, point.y);

            } else {

              this.lineTo(point.x, point.y);

            }

            if (j === 0) firstPoint.copy(point);

          }

          break;

        case 'H':

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.x = numbers[j];
            control.x = point.x;
            control.y = point.y;
            this.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'V':

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.y = numbers[j];
            control.x = point.x;
            control.y = point.y;
            this.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'L':

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x = numbers[j + 0];
            point.y = numbers[j + 1];
            control.x = point.x;
            control.y = point.y;
            this.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'C':

          for (let j = 0, jl = numbers.length; j < jl; j += 6) {

            this.bezierCurveTo(
              numbers[j + 0],
              numbers[j + 1],
              numbers[j + 2],
              numbers[j + 3],
              numbers[j + 4],
              numbers[j + 5]
            );
            control.x = numbers[j + 2];
            control.y = numbers[j + 3];
            point.x = numbers[j + 4];
            point.y = numbers[j + 5];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'S':

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            this.bezierCurveTo(
              this.getReflection(point.x, control.x),
              this.getReflection(point.y, control.y),
              numbers[j + 0],
              numbers[j + 1],
              numbers[j + 2],
              numbers[j + 3]
            );
            control.x = numbers[j + 0];
            control.y = numbers[j + 1];
            point.x = numbers[j + 2];
            point.y = numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'Q':

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            this.quadraticCurveTo(
              numbers[j + 0],
              numbers[j + 1],
              numbers[j + 2],
              numbers[j + 3]
            );
            control.x = numbers[j + 0];
            control.y = numbers[j + 1];
            point.x = numbers[j + 2];
            point.y = numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'T':

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            const rx = this.getReflection(point.x, control.x);
            const ry = this.getReflection(point.y, control.y);
            this.quadraticCurveTo(
              rx,
              ry,
              numbers[j + 0],
              numbers[j + 1]
            );
            control.x = rx;
            control.y = ry;
            point.x = numbers[j + 0];
            point.y = numbers[j + 1];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'A':

          for (let j = 0, jl = numbers.length; j < jl; j += 7) {

            // skip command if start point == end point
            if (numbers[j + 5] == point.x && numbers[j + 6] == point.y) continue;

            const start = point.clone();
            point.x = numbers[j + 5];
            point.y = numbers[j + 6];
            control.x = point.x;
            control.y = point.y;
            this.parseArcCommand(
              numbers[j], numbers[j + 1], numbers[j + 2], numbers[j + 3], numbers[j + 4], start, point
            );

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'm':

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x += numbers[j + 0];
            point.y += numbers[j + 1];
            control.x = point.x;
            control.y = point.y;

            if (j === 0) {

              this.moveTo(point.x, point.y);

            } else {

              this.lineTo(point.x, point.y);

            }

            if (j === 0) firstPoint.copy(point);

          }

          break;

        case 'h':

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.x += numbers[j];
            control.x = point.x;
            control.y = point.y;
            this.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'v':

          for (let j = 0, jl = numbers.length; j < jl; j++) {

            point.y += numbers[j];
            control.x = point.x;
            control.y = point.y;
            this.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'l':

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            point.x += numbers[j + 0];
            point.y += numbers[j + 1];
            control.x = point.x;
            control.y = point.y;
            this.lineTo(point.x, point.y);

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'c':

          for (let j = 0, jl = numbers.length; j < jl; j += 6) {

            this.bezierCurveTo(
              point.x + numbers[j + 0],
              point.y + numbers[j + 1],
              point.x + numbers[j + 2],
              point.y + numbers[j + 3],
              point.x + numbers[j + 4],
              point.y + numbers[j + 5]
            );
            control.x = point.x + numbers[j + 2];
            control.y = point.y + numbers[j + 3];
            point.x += numbers[j + 4];
            point.y += numbers[j + 5];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 's':

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            this.bezierCurveTo(
              this.getReflection(point.x, control.x),
              this.getReflection(point.y, control.y),
              point.x + numbers[j + 0],
              point.y + numbers[j + 1],
              point.x + numbers[j + 2],
              point.y + numbers[j + 3]
            );
            control.x = point.x + numbers[j + 0];
            control.y = point.y + numbers[j + 1];
            point.x += numbers[j + 2];
            point.y += numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'q':

          for (let j = 0, jl = numbers.length; j < jl; j += 4) {

            this.quadraticCurveTo(
              point.x + numbers[j + 0],
              point.y + numbers[j + 1],
              point.x + numbers[j + 2],
              point.y + numbers[j + 3]
            );
            control.x = point.x + numbers[j + 0];
            control.y = point.y + numbers[j + 1];
            point.x += numbers[j + 2];
            point.y += numbers[j + 3];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 't':

          for (let j = 0, jl = numbers.length; j < jl; j += 2) {

            const rx = this.getReflection(point.x, control.x);
            const ry = this.getReflection(point.y, control.y);
            this.quadraticCurveTo(
              rx,
              ry,
              point.x + numbers[j + 0],
              point.y + numbers[j + 1]
            );
            control.x = rx;
            control.y = ry;
            point.x = point.x + numbers[j + 0];
            point.y = point.y + numbers[j + 1];

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'a':

          for (let j = 0, jl = numbers.length; j < jl; j += 7) {

            // skip command if no displacement
            if (numbers[j + 5] == 0 && numbers[j + 6] == 0) continue;

            const start = point.clone();
            point.x += numbers[j + 5];
            point.y += numbers[j + 6];
            control.x = point.x;
            control.y = point.y;
            this.parseArcCommand(
              numbers[j], numbers[j + 1], numbers[j + 2], numbers[j + 3], numbers[j + 4], start, point
            );

            if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);

          }

          break;

        case 'Z':
        case 'z':
          this.closePath()

          if (this.subPaths.length > 0) {

            // Reset point to beginning of Path
            point.copy(firstPoint);
            isFirstPoint = true;

          }

          break;

        default:
          console.warn(command);
          break

      }

      doSetFirstPoint = false;

    })
  }

  private getReflection(a: number, b: number) {

    // http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes
    return a - (b - a);

  }

  private svgAngle(ux: number, uy: number, vx: number, vy: number) {

    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    let ang = Math.acos(Math.max(- 1, Math.min(1, dot / len))); // floating point precision, slightly over values appear
    if ((ux * vy - uy * vx) < 0) ang = - ang;
    return ang;

  }

  private parseArcCommand(rx: number, ry: number, x_axis_rotation: number, large_arc_flag: number, sweep_flag: number, start: Vector2, end: Vector2) {

    if (rx == 0 || ry == 0) {

      // draw a line if either of the radii == 0
      this.lineTo(end.x, end.y);
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

    this.absellipse(cx, cy, rx, ry, theta, theta + delta, sweep_flag === 0, x_axis_rotation);

  }


}
