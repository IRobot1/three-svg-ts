import { Mesh, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { PathParams } from "./types";
import { GroupShape } from "./groupshape";

export interface Path {
  d: string
}

export class PathShape extends BaseShape implements Path {
  constructor(svg: SVGOptions, parent: GroupShape, params: PathParams) {
    super('path',svg, params)
    this.batch = true
    if (params.d) this.d = params.d
    this.pathid = params.id
    this.batch = false

    if (this.pathid) return

    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      const mesh = new Mesh()
      mesh.name = 'path-stroke'
      mesh.material = strokematerial
      parent.addMesh(mesh);
      this.strokemesh = mesh
    }

    const material = this.getFillMaterial()
    if (material) {
      const mesh = new Mesh()
      mesh.name = 'path-fill'
      mesh.material = material
      parent.addMesh(mesh);
      this.fillmesh = mesh
    }
  }

  private fillmesh?: Mesh
  private strokemesh?: Mesh

  private pathid: string | undefined

  private _d = ''
  get d(): string { return this._d }
  set d(newvalue: string) {
    if (newvalue != this._d) {
      this._d = newvalue
      if (!this.batch) this.update()
    }
  }


  override update() {
    if (!this.d) return this
    const shape = new Shape();

    SVGShapeUtils.parsePath(this.d, shape)
    if (this.pathid) {
      this.svg.addPathId(this.pathid, shape)
    }
    else {
      const divisions = 32
      if (this.strokemesh) this.strokemesh.geometry = this.renderStroke(shape, divisions)
      if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape, divisions)
    }
    return this;
  }
}
