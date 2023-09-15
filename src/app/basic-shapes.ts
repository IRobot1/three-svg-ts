import { AmbientLight, AxesHelper, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, PointLight, Scene, ShapeGeometry } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { showSVG } from "./showsvg";

export class BasicShapesExample {

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

    const svgshape = new SVGShape({ width: 200, height: 250 })
      .rect({ x: 10, y: 10, width: 30, height: 30, stroke: 'black', fill: 'transparent', strokeWidth: 5 })
      .rect({ x: 60, y: 10, rx: 10, ry: 10, width: 30, height: 30, stroke: 'black', fill: 'transparent', strokeWidth: 5 })
      .circle({ cx: 25, cy: 75, r: 20, stroke: 'red', fill: 'transparent', strokeWidth: 5 })
      .ellipse({ cx: 75, cy: 75, rx: 20, ry: 5, stroke: 'red', fill: 'transparent', strokeWidth: 5 })
      .line({ x1: 10, x2: 50, y1: 110, y2: 150, stroke: 'orange', strokeWidth: 5 })
      .polyline({ points: "60 110 65 120 70 115 75 130 80 125 85 140 90 135 95 150 100 145", stroke: "orange", fill: "transparent", strokeWidth: "5" })
      .polygon({ points: "50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180", stroke: "green", fill: "transparent", strokeWidth: "5" })
      .path({ d: "M20,230 Q40,205 50,230 T90,230", fill: "none", stroke: "blue", strokeWidth: "5" })
    svgshape.scale.setScalar(0.01)
    svgshape.position.y = 1.3
    scene.add(svgshape);

    //     const loader = new SVGLoader();
    //     const svg = loader.parse(`
    //<svg width="200" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg">

    //  <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
    //  <rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>

    //  <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
    //  <ellipse cx="75" cy="75" rx="20" ry="5" stroke="red" fill="transparent" stroke-width="5"/>

    //  <line x1="10" x2="50" y1="110" y2="150" stroke="orange" stroke-width="5"/>
    //  <polyline points="60 110 65 120 70 115 75 130 80 125 85 140 90 135 95 150 100 145"
    //      stroke="orange" fill="transparent" stroke-width="5"/>

    //  <polygon points="50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180"
    //      stroke="green" fill="transparent" stroke-width="5"/>

    //  <path d="M20,230 Q40,205 50,230 T90,230" fill="none" stroke="blue" stroke-width="5"/>
    //</svg>
    //     `);
    //     showSVG(scene, svg.paths)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}
