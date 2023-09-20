import { AmbientLight, AxesHelper, Color, DoubleSide, LineCurve, Mesh, MeshBasicMaterial, PointLight, QuadraticBezierCurve, Scene, Shape, Vector2 } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { showSVG } from "./showsvg";
import { RectShape } from "../../projects/three-svg-js/src/lib/rectshape";

export class GroupExample {

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

      svgshape1.group({ fill: 'red' })
        .rect({ x: "0", y: "0", width: "10", height: "10" })
        .rect({ x: "20", y: "0", width: "10", height: "10" })

      .group({ fill: 'green' })
        .rect({ x: "40", y: "0", width: "10", height: "10" })
        .rect({ x: "60", y: "0", width: "10", height: "10" })

      svgshape1.update()
      svgshape1.scale.setScalar(0.01)
      svgshape1.position.set(-2, 0.5, 0)
      scene.add(svgshape1);
    })


//    const svg = new SVGLoader().parse(`
//<svg width="30" height="10"  xmlns="http://www.w3.org/2000/svg">
//  <g fill="red">
//    <rect  />
//    <rect x="20" y="0" width="10" height="10" />
//  </g>
//</svg>
//             `);
//    showSVG(scene, svg.paths)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}
