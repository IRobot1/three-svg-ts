import { Mesh, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { EllipseParams } from "./types";
import { GroupShape } from "./groupshape";

export interface Ellipse {
  cx: number,
  cy: number,
  rx: number,
  ry: number,
}

export class EllipseShape extends BaseShape implements Ellipse {
  constructor(svg: SVGOptions, parent: GroupShape, params: EllipseParams) {
    super('ellipse',svg, params)
    this.batch = true
    this.cx = SVGShapeUtils.parseFloatWithUnits(params.cx || 0);
    this.cy = -SVGShapeUtils.parseFloatWithUnits(params.cy || 0);
    this.rx = SVGShapeUtils.parseFloatWithUnits(params.rx || 0);
    this.ry = SVGShapeUtils.parseFloatWithUnits(params.ry || 0);
    this.batch = false

    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      const mesh = new Mesh()
      mesh.name = 'ellipse-stroke'
      mesh.material = strokematerial
      parent.addMesh(mesh);
      this.strokemesh = mesh
    }

    const material = this.getFillMaterial()
    if (material) {
      const mesh = new Mesh()
      mesh.name = 'ellipse-fill'
      mesh.material = material
      parent.addMesh(mesh);
      this.fillmesh = mesh
    }
  }

  private fillmesh?: Mesh
  private strokemesh?: Mesh

  private _cx = 0
  get cx(): number { return this._cx }
  set cx(newvalue: number) {
    if (newvalue != this._cx) {
      this._cx = newvalue
      if (!this.batch) this.update()
    }
  }


  private _cy = 0
  get cy(): number { return this._cy }
  set cy(newvalue: number) {
    if (newvalue != this._cy) {
      this._cy = newvalue
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
    shape.absellipse(this.cx, this.cy, this.rx, this.ry, 0, Math.PI * 2, true);

    if (this.strokemesh) this.strokemesh.geometry = this.renderStroke(shape)
    if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape)
  }
}
