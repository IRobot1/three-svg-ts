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
    super(svg, params)
    this.batch = true
    if (params.d) this.d = params.d
    this.id = params.id
    this.batch = false

    if (this.id) return

    let mesh = new Mesh()
    mesh.name = 'path-stroke'
    mesh.material = this.svg.createStrokeMaterial()
    if (this.params.stroke)
      (<any>mesh.material).color.setStyle(this.params.stroke, SRGBColorSpace);
    parent.addMesh(mesh);
    this.strokemesh = mesh

    const material = this.getFillMaterial()
    if (material) {
      mesh = new Mesh()
      mesh.name = 'path-fill'
      mesh.material = material
      parent.addMesh(mesh);
      this.fillmesh = mesh
    }
  }

  private fillmesh?: Mesh
  private strokemesh?: Mesh

  private id: string | undefined

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
    if (this.id) {
      this.svg.pathids.set(this.id, shape)
    }
    else {
      const divisions = 32
      if (this.strokemesh) this.strokemesh.geometry = this.renderStroke(shape, divisions)
      if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape, divisions)
    }
    return this;
  }
}
