import { AmbientLight, AxesHelper, Color, DoubleSide, LineCurve, Mesh, MeshBasicMaterial, PointLight, QuadraticBezierCurve, Scene, Shape, Vector2 } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { showSVG } from "./showsvg";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

export class TextExample {

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

    const loader = new FontLoader();
    loader.load('assets/helvetiker_regular.typeface.json', (font: Font) => {
      const svgshape1 = new SVGShape({ width: 200, height: 100 })
        .path({ id: 'my_path', d: "M 20, 20 C 80, 60 100, 40 120, 20" })
        .text("A curve.", font, {
          fontSize: 18,
          textPath: '#my_path',
          textSpacing: 4,
        })

      svgshape1.scale.setScalar(0.01)
      svgshape1.position.set(-2, 0.5, 0)
      scene.add(svgshape1);
    })


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
