import { DoubleSide, Group, Mesh, MeshBasicMaterial, Scene, ShapeGeometry, ShapePath } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

export function showSVG(scene: Scene, paths: Array<ShapePath>) {
  const group = new Group();

  for (let i = 0; i < paths.length; i++) {

    const path = paths[i];

    const material = new MeshBasicMaterial({
      color: path.color,
      side: DoubleSide,
      depthWrite: false
    });

    const shapes = SVGLoader.createShapes(path);

    for (let j = 0; j < shapes.length; j++) {

      const shape = shapes[j];
      const geometry = new ShapeGeometry(shape);
      const mesh = new Mesh(geometry, material);
      group.add(mesh);

    }

  }

  scene.add(group);
}
