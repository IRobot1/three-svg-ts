import { AmbientLight, AxesHelper, Color, DoubleSide, Mesh, MeshBasicMaterial, PointLight, Scene, Shape } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { showSVG } from "./showsvg";

export class GradientsExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    scene.background = new Color().setStyle('#666')
    app.scene = scene

    app.camera.position.z = 200

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

    // textures applied to shape appear to use work space, not local space
    // shapes must be scaled to 1x1 when created
    // then scaled to needed size
    // then positioned by offset

    // shape must be created at origin, 1x1, then scaled and moved, just like plane

    const svgshape1 = new SVGShape({ width: 120, height: 240 })
    svgshape1.linearGradient({
        id: 'Gradient1', stops: [
          { offset: "0%", stopColor: "red" },
          { offset: "50%", stopColor: "white" },
          { offset: "100%", stopColor: "blue" },
        ]
      })
    svgshape1.linearGradient({
        id: 'Gradient2', x1:0, x2:0, y1:0, y2:1, stops: [
          { offset: "0%", stopColor: "red" },
          { offset: "50%", stopColor: "white" },
          { offset: "100%", stopColor: "blue" },
        ]
      })

    svgshape1.rect({ x: "10", y: "0", rx: "15", ry: "15", width: "100", height: "100", fill: "url(#Gradient1)" })
      //.rect({ x: "10", y: "0", rx: "0", ry: "0", width: "100", height: "100", fill: "url(#Gradient1)" })
    svgshape1.rect({ x: "10", y: "120", rx: "15", ry: "15", width: "150", height: "150", fill: "url(#Gradient1)" })

    svgshape1.update()
    svgshape1.position.set(0, 1, 0)
    scene.add(svgshape1);


    //        const loader = new SVGLoader();
    //        const svg = loader.parse(`
    //    <svg width="120" height="240" version="1.1" xmlns="http://www.w3.org/2000/svg">

    //    <linearGradient id="Gradient1">
    //      <stop offset="0%" stop-color="red" />
    //      <stop offset="50%" stop-color="black" stop-opacity="0"/>
    //      <stop offset="100%" stop-color="blue"/>
    //    </linearGradient>
    //    <linearGradient id="Gradient2" x1="0" x2="0" y1="0" y2="1">
    //      <stop offset="0%" stop-color="red" />
    //      <stop offset="50%" stop-color="black" stop-opacity="0" />
    //      <stop offset="100%" stop-color="blue" />
    //    </linearGradient>


    //  <rect id="rect1" x="10" y="10" rx="15" ry="15" width="100" height="100" fill="url(#Gradient1)" />
    //  <rect
    //    x="10"
    //    y="120"
    //    rx="15"
    //    ry="15"
    //    width="100"
    //    height="100"
    //    fill="url(#Gradient2)" />
    //</svg>

    //             `);
    //        showSVG(scene, svg.paths)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}
