import { ShapePath } from "three";

export class ShapePathEx extends ShapePath {

  arc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): this {

    this.currentPath?.arc(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise);

    return this;

  }

  absarc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean) {

    this.currentPath?.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);

    return this;

  }

  ellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation:number) {

    this.currentPath?.ellipse(aX , aY , xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;

  }

  absellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation: number) {

    this.currentPath?.absellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;
  }

  closePath() {
    this.currentPath?.closePath()
  }
}
