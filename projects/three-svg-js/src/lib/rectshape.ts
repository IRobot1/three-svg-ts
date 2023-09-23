import { Mesh, Object3D, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGOptions, SVGShape, SVGShapeOptions } from "./svgshape";
import { RectParams } from "./types";
import { SVGShapeUtils } from "./shapeutils";
import { GroupShape } from "./groupshape";

export interface Rect {
  x: number,
  y: number,
  rx: number,
  ry: number,
  w: number,
  h: number
}
export class RectShape extends BaseShape implements Rect {
  constructor(svg: SVGOptions, parent: GroupShape, params: RectParams) {
    super('rect',svg, params)
    this.batch = true
    this.x = SVGShapeUtils.parseFloatWithUnits(params.x || 0);
    this.y = SVGShapeUtils.parseFloatWithUnits(params.y || 0);
    this.rx = SVGShapeUtils.parseFloatWithUnits(params.rx || params.ry || 0);
    this.ry = SVGShapeUtils.parseFloatWithUnits(params.ry || params.rx || 0);
    this.w = SVGShapeUtils.parseFloatWithUnits(params.width, svg.width);
    this.h = SVGShapeUtils.parseFloatWithUnits(params.height, svg.height);
    this.batch = false

    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      const mesh = new Mesh()
      mesh.name = 'rect-stroke'
      mesh.material = strokematerial
      parent.addMesh(mesh);
      this.strokemesh = mesh
      if (this.params.transform) SVGShapeUtils.processTransform(mesh, this.params.transform)
    }

    const fillmaterial = this.getFillMaterial()
    if (fillmaterial) {
      const mesh = new Mesh()
      mesh.name = 'rect-fill'
      mesh.material = fillmaterial
      parent.addMesh(mesh);
      this.fillmesh = mesh
      if (this.params.transform) SVGShapeUtils.processTransform(mesh, this.params.transform)
    }
  }

  private fillmesh?: Mesh
  private strokemesh?: Mesh

  private _x = 0
  get x(): number { return this._x }
  set x(newvalue: number) {
    if (newvalue != this._x) {
      this._x = newvalue
      if (!this.batch) this.update()
    }
  }
  private _y = 0
  get y(): number { return this._y }
  set y(newvalue: number) {
    if (newvalue != this._y) {
      this._y = newvalue
      if (!this.batch) this.update()
    }
  }
  private _rx = 0
  get rx(): number { return this._rx }
  set rx(newvalue: number) {
    if (newvalue != this._rx) {
      this._rx = newvalue
      if (!this.batch) this.update()
    }
  }
  private _ry = 0
  get ry(): number { return this._ry }
  set ry(newvalue: number) {
    if (newvalue != this._ry) {
      this._ry = newvalue
      if (!this.batch) this.update()
    }
  }
  private _w = 0
  get w(): number { return this._w }
  set w(newvalue: number) {
    if (newvalue != this._w) {
      this._w = newvalue
      if (!this.batch) this.update()
    }
  }
  private _h = 0
  get h(): number { return this._h }
  set h(newvalue: number) {
    if (newvalue != this._h) {
      this._h = newvalue
      if (!this.batch) this.update()
    }
  }

  override update() {
    const x = this.x
    const y = this.y
    const rx = this.rx
    const ry = this.ry
    const w = this.w
    const h = this.h
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
        y + ry * bci,
        x + w,
        y + ry
      );
    }

    // bottom right
    shape.lineTo(x + w, y + h - ry);
    if (rx !== 0 || ry !== 0) {
      shape.bezierCurveTo(
        x + w,
        y + h - ry * bci,
        x + w - rx * bci,
        y + h,
        x + w - rx,
        y + h
      );
    }

    // bottom left
    shape.lineTo(x + rx, y + h);
    if (rx !== 0 || ry !== 0) {
      shape.bezierCurveTo(
        x + rx * bci,
        y + h,
        x,
        y + h - ry * bci,
        x,
        y + h - ry
      );
    }

    // back to top left
    shape.lineTo(x, y + ry);
    if (rx !== 0 || ry !== 0) {
      shape.bezierCurveTo(
        x,
        y + ry * bci,
        x + rx * bci,
        y,
        x + rx,
        y
      );
    }

    if (this.strokemesh) this.strokemesh.geometry = this.renderStroke(shape)
    if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape)
  }



}
