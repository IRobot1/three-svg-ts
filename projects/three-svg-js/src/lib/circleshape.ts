import { Mesh, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGOptions } from "./svgshape";
import { CircleParams } from "./types";
import { SVGShapeUtils } from "./shapeutils";
import { GroupShape } from "./groupshape";

export interface Circle {
  cx: number,
  cy: number,
  r: number,
}

export class CircleShape extends BaseShape implements Circle {
  constructor(svg: SVGOptions, parent: GroupShape, params: CircleParams) {
    super('circle', svg, params)
    this.batch = true
    this.cx = SVGShapeUtils.parseFloatWithUnits(params.cx || 0);
    this.cy = -SVGShapeUtils.parseFloatWithUnits(params.cy || 0);
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
    shape.absarc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);

    if (this.strokemesh) this.strokemesh.geometry = this.renderStroke(shape)
    if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape)
  }
}
