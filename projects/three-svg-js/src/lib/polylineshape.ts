import { Mesh, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { Length, PolylineParams } from "./types";
import { GroupShape } from "./groupshape";

export interface Polyline {
  points: string
}

export class PolylineShape extends BaseShape implements Polyline {
  constructor(svg: SVGOptions, parent: GroupShape, params: PolylineParams) {
    super('polyline', svg, params)
    this.batch = true
    if (params.points) this.points = params.points
    this.batch = false

    this.name = 'polyline-stroke'

    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      this.material = strokematerial
      parent.addMesh(this);
      if (this.params.transform) SVGShapeUtils.processTransform(this, this.params.transform)
    }

    const material = this.getFillMaterial()
    if (material) {
      const mesh = new Mesh()
      mesh.name = 'polygon-fill'
      mesh.material = material
      mesh.position.z = this.svg.zfix
      parent.addMesh(mesh);
      this.fillmesh = mesh
      if (this.params.transform) SVGShapeUtils.processTransform(mesh, this.params.transform)
    }
  }
  private fillmesh?: Mesh

  private _points = ''
  get points(): string { return this._points }
  set points(newvalue: string) {
    if (newvalue != this._points) {
      this._points = newvalue
      if (!this.batch) this.update()
    }
  }


  override update() {
    //if (!this.strokemesh) return

    let index = 0;

    const iterator = (match: string, a: Length, b: Length): string => {

      const x = SVGShapeUtils.parseFloatWithUnits(a) || 0;
      const y = SVGShapeUtils.parseFloatWithUnits(b) || 0;

      if (index === 0) {

        shape.moveTo(x, y);

      } else {

        shape.lineTo(x, y);

      }

      index++;
      return match
    }

    const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;

    const shape = new Shape();

    this.points.replace(regex, iterator);

    this.geometry = this.renderStroke(shape)
    if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape)
  }
}
