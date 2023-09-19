import { Mesh, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { EllipseParams } from "./types";
import { GroupShape } from "./groupshape";

export interface Ellipse {
  x: number,
  y: number,
  rx: number,
  ry: number,
}

export class EllipseShape extends BaseShape implements Ellipse {
  constructor(svg: SVGOptions, parent: GroupShape, params: EllipseParams) {
    super(svg, params)
    this.batch = true
    this.x = SVGShapeUtils.parseFloatWithUnits(params.cx || 0);
    this.y = -SVGShapeUtils.parseFloatWithUnits(params.cy || 0);
    this.rx = SVGShapeUtils.parseFloatWithUnits(params.rx || 0);
    this.ry = SVGShapeUtils.parseFloatWithUnits(params.ry || 0);
    this.batch = false

    let mesh = new Mesh()
    mesh.name = 'ellipse-stroke'
    mesh.material = this.svg.createStrokeMaterial()
    if (this.params.stroke)
      (<any>mesh.material).color.setStyle(this.params.stroke, SRGBColorSpace);
    parent.addMesh(mesh);
    this.strokemesh = mesh

    const material = this.getFillMaterial()
    if (material) {
      mesh = new Mesh()
      mesh.name = 'ellipse-fill'
      mesh.material = material
      parent.addMesh(mesh);
      this.fillmesh = mesh
    }
  }

  private fillmesh?: Mesh
  private strokemesh: Mesh

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

  override update() {
    const shape = new Shape();
    shape.absellipse(this.x, this.y, this.rx, this.ry, 0, Math.PI * 2, true);

    this.strokemesh.geometry = this.renderStroke(shape)
    if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape)
  }
}
