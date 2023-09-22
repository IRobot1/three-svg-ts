import { Mesh, SRGBColorSpace, Shape } from "three";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { Length, PolygonParams } from "./types";
import { GroupShape } from "./groupshape";

export interface Polygon {
  points: string
}

export class PolygonShape extends BaseShape implements Polygon {
  constructor(svg: SVGOptions, parent: GroupShape, params: PolygonParams) {
    super('polygon',svg, params)
    this.batch = true
    if (params.points) this.points = params.points
    this.batch = false

    const strokematerial = this.getStrokeMaterial()
    if (strokematerial) {
      const mesh = new Mesh()
      mesh.name = 'polygon-stroke'
      mesh.material = strokematerial
      parent.addMesh(mesh);
      this.strokemesh = mesh
      if (this.params.transform) SVGShapeUtils.processTransform(mesh, this.params.transform)
    }
  }
  private strokemesh?: Mesh

  private _points = ''
  get points(): string { return this._points }
  set points(newvalue: string) {
    if (newvalue != this._points) {
      this._points = newvalue
      if (!this.batch) this.update()
    }
  }


  override update() {
    if (!this.strokemesh) return

    let index = 0;

    const iterator = (match: string, a: Length, b: Length): string => {

      const x = SVGShapeUtils.parseFloatWithUnits(a);
      const y = -SVGShapeUtils.parseFloatWithUnits(b);

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

    shape.autoClose = true

    this.strokemesh.geometry = this.renderStroke(shape)
  }
}
