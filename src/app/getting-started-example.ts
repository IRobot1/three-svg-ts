import { AmbientLight, DoubleSide, Group, Mesh, MeshBasicMaterial, PointLight, Scene, ShapeGeometry  } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";

export class GettingStartedExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 4

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    //orbit.enableRotate = false;
    orbit.update();

    const ambient = new AmbientLight()
    ambient.intensity = 0.1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    const svgshape = new SVGShape({ width: 300, height: 200 })
      .rect({
        width: "100%",
        height: "100%",
        fill: "red"
      })
      .circle({ cx: 150, cy: 100, r: 80, fill: "green" })
      .text("SVG", {
        x: "150",
        y: "125",
        fontSize: 60,
        textAnchor: "middle",
        fill: "white"
      });

    console.warn(svgshape);

    // const loader = new SVGLoader();
    // const svg = loader.parse(`
    // <svg version="1.1"
    //      width="300" height="200"
    //      xmlns="http://www.w3.org/2000/svg">

    //   <rect width="100%" height="100%" fill="red" />

    //   <circle cx="150" cy="100" r="80" fill="green" />

    //   <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>

    // </svg>`);

    const paths = svgshape.paths;

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

    group.scale.setScalar(0.01);
    scene.add(group);


    this.dispose = () => {
      orbit.dispose()
    }
  }
}
