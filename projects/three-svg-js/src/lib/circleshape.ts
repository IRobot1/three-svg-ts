import { Mesh, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGOptions } from "./svgshape";
import { CircleParams } from "./types";
import { SVGShapeUtils } from "./shapeutils";
import { GroupShape } from "./groupshape";

export interface Circle {
  x: number,
  y: number,
  r: number,
}

export class CircleShape extends BaseShape implements Circle {
  constructor(svg: SVGOptions, parent: GroupShape, params: CircleParams) {
    super(svg, params)
    this.batch = true
    this.x = SVGShapeUtils.parseFloatWithUnits(params.cx || 0);
    this.y = -SVGShapeUtils.parseFloatWithUnits(params.cy || 0);
    this.r = SVGShapeUtils.parseFloatWithUnits(params.r || 0);
    this.batch = false

    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      const mesh = new Mesh()
      mesh.name = 'circle-stroke'
      mesh.material = strokematerial
      parent.addMesh(mesh);
      this.strokemesh = mesh
    }
    const material = this.getFillMaterial()
    if (material) {
      const mesh = new Mesh()
      mesh.name = 'circle-fill'
      mesh.material = material
      parent.addMesh(mesh);
      this.fillmesh = mesh
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

  private _r = 0
  get r(): number { return this._r }
  set r(newvalue: number) {
    if (newvalue != this._r) {
      this._r = newvalue
      if (!this.batch) this.update()
    }
  }

  override update() {
    const shape = new Shape();
    shape.absarc(this.x, this.y, this.r, 0, Math.PI * 2, true);

    if (this.strokemesh) this.strokemesh.geometry = this.renderStroke(shape)
    if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape)
  }
}
