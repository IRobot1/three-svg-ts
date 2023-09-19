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
    super(svg, params)
    this.batch = true
    if (params.points) this.points = params.points
    this.batch = false

    let mesh = new Mesh()
    mesh.name = 'polyline-stroke'
    mesh.material = this.svg.createStrokeMaterial()
    if (this.params.stroke)
      (<any>mesh.material).color.setStyle(this.params.stroke, SRGBColorSpace);
    parent.addMesh(mesh);
    this.strokemesh = mesh
  }
  private strokemesh: Mesh

  private _points = ''
  get points(): string { return this._points }
  set points(newvalue: string) {
    if (newvalue != this._points) {
      this._points = newvalue
      if (!this.batch) this.update()
    }
  }


  override update() {
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

    this.strokemesh.geometry = this.renderStroke(shape)
  }
}
