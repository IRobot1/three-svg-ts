import { BufferGeometry, Mesh } from "three";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { PathParams } from "./types";
import { GroupShape } from "./groupshape";
import { SVGShapePath } from "./shapepathex";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

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
    this.name = 'path-stroke'

    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      this.material = strokematerial
      parent.addMesh(this);
      if (this.params.transform) SVGShapeUtils.processTransform(this, this.params.transform)
    }

    const material = this.getFillMaterial()
    if (material) {
      const mesh = new Mesh()
      mesh.name = 'path-fill'
      mesh.material = material
      mesh.position.z = this.svg.zfix
      parent.addMesh(mesh);
      this.fillmesh = mesh
      if (this.params.transform) SVGShapeUtils.processTransform(mesh, this.params.transform)
    }
  }

  private fillmesh?: Mesh

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

    const shape = new SVGShapePath();
    const pathcommands = SVGShapeUtils.parsePath(this.d)
    shape.generate(pathcommands)

    if (this.pathid && !this.svg.getPathById(this.pathid)) {
      this.svg.addPathId(this.pathid, shape)
    }

    const shapes = SVGLoader.createShapes(shape)
    const divisions = 32

    const strokes: Array<BufferGeometry> = []
    shapes.forEach(shape => {
      strokes.push(this.renderStroke(shape, divisions))
    })
    if (strokes.length > 0)
      this.geometry = mergeGeometries(strokes)


    if (this.fillmesh) {
      const fills: Array<BufferGeometry> = []
      shapes.forEach(shape => {
        fills.push(this.renderFill(shape, divisions))
      })
      if (fills.length > 0)
        this.fillmesh.geometry = mergeGeometries(fills)
    }
    return this;
  }
}
