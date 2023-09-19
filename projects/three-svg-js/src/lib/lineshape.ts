import { Mesh, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { LineParams } from "./types";
import { GroupShape } from "./groupshape";

export interface Line {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

export class LineShape extends BaseShape implements Line {
  constructor(svg: SVGOptions, parent:GroupShape, params: LineParams) {
    super(svg, params)
    this.batch = true
    this.x1 = SVGShapeUtils.parseFloatWithUnits(params.x1 || 0);
    this.y1 = -SVGShapeUtils.parseFloatWithUnits(params.y1 || 0);
    this.x2 = SVGShapeUtils.parseFloatWithUnits(params.x2 || 0);
    this.y2 = -SVGShapeUtils.parseFloatWithUnits(params.y2 || 0);
    this.batch = false

    let mesh = new Mesh()
    mesh.name = 'line-stroke'
    mesh.material = this.svg.createStrokeMaterial()
    if (this.params.stroke)
      (<any>mesh.material).color.setStyle(this.params.stroke, SRGBColorSpace);
    parent.addMesh(mesh);
    this.strokemesh = mesh
  }

  private strokemesh: Mesh

  private _x1 = 0
  get x1(): number { return this._x1 }
  set x1(newvalue: number) {
    if (newvalue != this._x1) {
      this._x1 = newvalue
      if (!this.batch) this.update()
    }
  }

  private _y1 = 0
  get y1(): number { return this._y1 }
  set y1(newvalue: number) {
    if (newvalue != this._y1) {
      this._y1 = newvalue
      if (!this.batch) this.update()
    }
  }

  private _x2 = 0
  get x2(): number { return this._x2 }
  set x2(newvalue: number) {
    if (newvalue != this._x2) {
      this._x2 = newvalue
      if (!this.batch) this.update()
    }
  }

  private _y2 = 0
  get y2(): number { return this._y2 }
  set y2(newvalue: number) {
    if (newvalue != this._y2) {
      this._y2 = newvalue
      if (!this.batch) this.update()
    }
  }

  override update() {
    const shape = new Shape()
    shape.moveTo(this.x1, this.y1)
    shape.lineTo(this.x2, this.y2)

    this.strokemesh.geometry = this.renderStroke(shape)
  }
}
