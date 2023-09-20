import { AmbientLight, AxesHelper, Color, DoubleSide, Mesh, MeshBasicMaterial, PointLight, Scene, Shape } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { showSVG } from "./showsvg";

export class StrokesExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    scene.background = new Color().setStyle('#666')
    app.scene = scene

    app.camera.position.z = 2

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

    //scene.add(new AxesHelper())

    const svgshape1 = new SVGShape({ width: 100, height: 100 })
      .line({ x1: "40", x2: "120", y1: "20", y2: "20", stroke: "black", strokeWidth: "20", strokeLineCap: "butt" })
      .line({ x1: "40", x2: "120", y1: "60", y2: "60", stroke: "black", strokeWidth: "20", strokeLineCap: "square" })
      .line({ x1: "40", x2: "120", y1: "100", y2: "100", stroke: "black", strokeWidth: "20", strokeLineCap: "round" })
      svgshape1.update()
    svgshape1.scale.setScalar(0.01)
    svgshape1.position.set(-2, 0.5, 0)
    scene.add(svgshape1);

    const svgshape2 = new SVGShape({ width: 100, height: 100 })
      .polyline({ points: "40 60 80 20 120 60", stroke: "black", strokeWidth: "20", strokeLineCap: "butt", strokeLineJoin: "miter" })
      .polyline({ points: "40 140 80 100 120 140", stroke: "black", strokeWidth: "20", strokeLineCap: "round", strokeLineJoin: "round" })
      .polyline({ points: "40 220 80 180 120 220", stroke: "black", strokeWidth: "20", strokeLineCap: "square", strokeLineJoin: "bevel" })
      svgshape2.update()
    svgshape2.scale.setScalar(0.01)
    svgshape2.position.set(0, 1.2, 0)
    scene.add(svgshape2);

    //    const loader = new SVGLoader();
    //    const svg = loader.parse(`
    //<svg width: "160", height: "140", xmlns: "http://www.w3.org/2000/svg", version: "1.1">
    //  <line x1: "40", x2: "120", y1: "20", y2: "20", stroke: "black", stroke-width: "20", stroke-linecap: "butt"/>
    //  <line x1: "40", x2: "120", y1: "60", y2: "60", stroke: "black", stroke-width: "20", stroke-linecap: "square"/>
    //  <line x1: "40", x2: "120", y1: "100", y2: "100", stroke: "black", stroke-width: "20", stroke-linecap: "round"/>
    //</svg>
    //         `);
    //    showSVG(scene, svg.paths)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}
