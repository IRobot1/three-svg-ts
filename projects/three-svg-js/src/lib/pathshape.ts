import { BufferGeometry, Mesh } from "three";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { PathParams } from "./types";
import { GroupShape } from "./groupshape";
import { ShapePathEx } from "./shapepathex";

export interface Path {
  d: string
}

export class PathShape extends BaseShape implements Path {
  constructor(svg: SVGOptions, parent: GroupShape, params: PathParams) {
    super('path', svg, params)
    this.batch = true
    if (params.d) this.d = params.d
    this.batch = false

    this.pathid = params.id
    if (this.pathid) return


    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      const mesh = new Mesh()
      mesh.name = 'path-stroke'
      mesh.material = strokematerial
      parent.addMesh(mesh);
      this.strokemesh = mesh
      if (this.params.transform) SVGShapeUtils.processTransform(mesh, this.params.transform)
    }

    const material = this.getFillMaterial()
    if (material) {
      const mesh = new Mesh()
      mesh.name = 'path-fill'
      mesh.material = material
      parent.addMesh(mesh);
      this.fillmesh = mesh
      if (this.params.transform) SVGShapeUtils.processTransform(mesh, this.params.transform)
    }
  }

  private fillmesh?: Mesh
  private strokemesh?: Mesh

  private _pathid: string | undefined
  get pathid(): string | undefined { return this._pathid }
  set pathid(newvalue: string | undefined) {
    if (newvalue != this._pathid) {
      this._pathid = newvalue
      if (!this.batch) this.update()
    }
  }

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

    if (this.pathid) {
      if (!this.svg.getPathById(this.pathid)) {
        const shape = new ShapePathEx();
        SVGShapeUtils.parsePath(this.d, shape)
        this.svg.addPathId(this.pathid, shape)
      }
    }
    else {
      const shape = new ShapePathEx();
      SVGShapeUtils.parsePath(this.d, shape)
      const shapes = shape.toShapes(true)
      const divisions = 32

      if (this.strokemesh) {
        const strokes: Array<BufferGeometry> = []
        shapes.forEach(shape => {
          strokes.push(this.renderStroke(shape, divisions))
        })
        this.strokemesh.geometry = mergeGeometries(strokes)
      }

      if (this.fillmesh) {
        const fills: Array<BufferGeometry> = []
        shapes.forEach(shape => {
          fills.push(this.renderFill(shape, divisions))
        })
        this.fillmesh.geometry = mergeGeometries(fills)
      }
    }
    return this;
  }
}
