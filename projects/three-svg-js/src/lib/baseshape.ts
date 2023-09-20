import { Box3, BufferAttribute, BufferGeometry, Float32BufferAttribute, Material, MeshBasicMaterial, Object3D, SRGBColorSpace, Shape, ShapeGeometry, Vector3 } from "three";
import { PresentationAttributes } from "./types";
import { SVGShapeUtils } from "./shapeutils";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { SVGOptions } from "./svgshape";

export abstract class BaseShape extends Object3D {
  constructor(protected svg: SVGOptions, protected params: PresentationAttributes) {
    super()
  }

  protected batch = false
  startChanges() { this.batch = true }
  endChanges() { this.update(); this.batch = false }

  abstract update(): void

  protected FixShapeUV(geometry: BufferGeometry) {
    let pos = geometry.attributes['position'] as BufferAttribute;
    let b3 = new Box3().setFromBufferAttribute(pos);
    let b3size = new Vector3();
    b3.getSize(b3size);
    let uv = [];
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let u = (x - b3.min.x) / b3size.x;
      let v = (y - b3.min.y) / b3size.y;
      uv.push(u, v);
    }
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  }

  protected getStrokeMaterial(): Material | undefined {
    if (!this.params.stroke) return undefined
    const material = this.svg.createStrokeMaterial() as MeshBasicMaterial
    material.color.setStyle(this.params.stroke, SRGBColorSpace);
    return material
  }

  protected getFillMaterial(): Material | undefined {
    if (this.params.fill === 'none') return undefined;

    const material = this.svg.createFillMaterial() as MeshBasicMaterial
    if (this.params.fill === 'transparent') {
      material.transparent = true;
      material.opacity = 0;
      if (this.params.fillOpacity) {
        material.opacity = this.params.fillOpacity;
      }
    }
    else if (this.params.fill) {
      if (this.params.fill.startsWith('url(#')) {
        const id = this.params.fill.substring(5).replace(')', '');
        material.color.setStyle('white', SRGBColorSpace);
        const texture = this.svg.gradients.get(id)
        if (texture) material.map = texture
      }
      else
        material.color.setStyle(this.params.fill, SRGBColorSpace);

      if (this.params.fillOpacity) {
        material.transparent = true;
        material.opacity = this.params.fillOpacity;
      }
    }
    return material
  }

  protected renderStroke(shape: Shape, divisions = 12): BufferGeometry {
    let strokeWidth = SVGShapeUtils.parseFloatWithUnits(this.params.strokeWidth || 0);
    if (!strokeWidth && this.params.fill == 'transparent') strokeWidth = 1

    if (strokeWidth) {
      const style = SVGLoader.getStrokeStyle(strokeWidth, this.params.stroke, this.params.strokeLineJoin, this.params.strokeLineCap, this.params.strokeMiterLimit)
      if (this.params.strokeLineCap == 'round') divisions *= 2;
      return SVGLoader.pointsToStroke(shape.getPoints(divisions), style, divisions)
    }
    else
      return new BufferGeometry()

  }

  protected renderFill(shape: Shape, divisions = 12): BufferGeometry {
    const geometry = new ShapeGeometry(shape, divisions)
    this.FixShapeUV(geometry)
    return geometry
  }
}
